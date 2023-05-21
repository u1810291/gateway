import { GEO, SharedResponse, TMS } from '@slp/shared'
import {
  Get,
  Put,
  Body,
  Post,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Controller,
  ParseUUIDPipe,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common'
import { TMSClient } from '../../clients/tms.client'
import { CompanyZoneService } from '../services/company-zone.service'
import { ListResponseInterceptor } from '../../interceptors/list-response.interceptor'
import { getDataOrThrow } from '../../helpers/rpc.helper'
import { GEOClient } from '../../clients/geo.client'
import { AcceptLanguage } from '../../decorators/accept-language-param.decorator'

@Controller({
  path: 'companies/:companyId/zones',
  version: '1',
})
export class CompanyZoneController {
  constructor(
    private readonly tmsClient: TMSClient,
    private readonly geoClient: GEOClient,
    private readonly zoneService: CompanyZoneService,
  ) {}

  @Get()
  @UseInterceptors(ListResponseInterceptor)
  @HttpCode(HttpStatus.OK)
  async zoneList(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.zoneService.zoneList(companyId)
  }

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async zoneCreate(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() body: Omit<TMS.ZoneCreate.Request, 'company_id'>,
  ): Promise<void> {
    const { hasError, statusText } = await this.tmsClient.zoneCreate({ ...body, companyId })

    if (hasError) {
      throw new BadRequestException(statusText)
    }
  }

  @Get(':zoneId')
  @UseInterceptors(ListResponseInterceptor)
  @HttpCode(HttpStatus.OK)
  async zoneRead(@Param('companyId', ParseUUIDPipe) companyId: string, @Param('zoneId', ParseUUIDPipe) zoneId: string) {
    return this.zoneService.zoneRead(companyId, zoneId)
  }

  @Put(':zoneId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async zoneUpdate(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('zoneId', ParseUUIDPipe) id: string,
    @Body() data: Omit<TMS.Zone.UpdateRequest, 'id' | 'companyId'>,
  ): Promise<void> {
    return getDataOrThrow(this.tmsClient.zoneUpdate({ ...data, companyId, id }))
  }

  @Delete(':zoneId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async zoneDelete(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('zoneId', ParseUUIDPipe) id: string,
  ): Promise<void> {
    const deletable = await this.zoneService.checkZoneDeletable(companyId, id)
    if (!deletable) {
      throw new BadRequestException('Can not delete zone')
    }

    return getDataOrThrow(this.tmsClient.zoneDelete({ id, companyId }))
  }

  @Post('/check-point')
  @HttpCode(HttpStatus.OK)
  async zoneCheckPoint(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() data: Omit<TMS.Zone.CheckPointRequest, 'companyId'>,
  ): Promise<TMS.Zone.CheckPointResponse> {
    return getDataOrThrow(this.tmsClient.checkPoint({ ...data, companyId }))
  }

  @Post('/address-point')
  @HttpCode(HttpStatus.OK)
  async addressPoint(
    @Body() data: Omit<GEO.Place.PointAddressRequest, 'lang'>,
    @AcceptLanguage() lang: string,
  ): Promise<GEO.Place.PointAddressResponse> {
    const response = await this.geoClient.addressByPoint({ ...data, lang })
    return response.data
  }
}
