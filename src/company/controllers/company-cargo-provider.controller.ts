import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common'
import { TMS } from '@slp/shared'
import { TMSClient } from '../../clients/tms.client'
import { CompanyCargoProviderService } from '../services/company-cargo-provider.service'
import { getDataOrThrow } from '../../helpers/rpc.helper'
import { ListResponseInterceptor } from '../../interceptors/list-response.interceptor'
import { ApiBody, ApiOkResponse, ApiOperation, ApiUnprocessableEntityResponse } from '@nestjs/swagger'
import {
  CompanyCargoProvider,
  CompanyCargoProviderHoliday,
  CargoProviderPoint,
} from '../dto/company-cargo-provider.dto'

@Controller({ version: '1', path: '/companies/:companyId/cargo-providers' })
export class CompanyCargoProviderController {
  constructor(private readonly tmsClient: TMSClient, private readonly cargoProvider: CompanyCargoProviderService) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post()
  async create(@Param('companyId') companyId: string, @Body() data: TMS.CargoProvider.CreateRequest) {
    return getDataOrThrow(
      this.tmsClient.cargoProviderCreate({
        ...data,
        companyId: companyId,
      }),
    )
  }

  @Get()
  @UseInterceptors(ListResponseInterceptor)
  async cargoProviders(
    @Param('companyId') companyId: string,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ) {
    return this.cargoProvider.cargoProviders(companyId, page, perPage)
  }

  @Get(':cargoProviderId/points')
  @UseInterceptors(ListResponseInterceptor)
  async cargoProviderPoints(
    @Param('cargoProviderId') cargoProviderId: string,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ) {
    return this.cargoProvider.cargoProviderPoints(cargoProviderId, page, perPage)
  }

  @ApiOperation({ summary: 'Update CargoProvider' })
  @ApiOkResponse({ description: 'Updated Successfully' })
  @ApiBody({ type: CompanyCargoProvider.UpdateCargoProviderDto })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':cargoProviderId')
  async update(
    @Param('cargoProviderId') cargoProviderId: string,
    @Body() data: CompanyCargoProvider.UpdateCargoProviderDto,
  ) {
    return getDataOrThrow(
      this.tmsClient.cargoProviderUpdate({
        ...data,
        id: cargoProviderId,
      }),
    )
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':cargoProviderId')
  async delete(@Param('cargoProviderId') cargoProviderId: string) {
    return getDataOrThrow(this.tmsClient.cargoProviderDelete({ id: cargoProviderId }))
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(':cargoProviderId/points')
  async createPoint(
    @Body() data: TMS.CargoProvider.PointCreateRequest,
    @Param('cargoProviderId') cargoProviderId: string,
  ) {
    return getDataOrThrow(
      this.tmsClient.cargoProviderPointCreate({
        ...data,
        cargoProviderId,
      }),
    )
  }
  @ApiOperation({ summary: 'Create Holiday' })
  @ApiOkResponse({ description: 'Created Successfully' })
  @ApiBody({ type: CompanyCargoProviderHoliday.CreateDto })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(':cargoProviderId/im-route/:imRouteId/holiday')
  async createHoliday(
    @Body() data: TMS.CargoProviderHoliday.CreateRequest,
    @Param('cargoProviderId', ParseUUIDPipe) cargoProviderId: string,
    @Param('imRouteId', ParseUUIDPipe) imRouteId: string,
  ) {
    return getDataOrThrow(
      this.tmsClient.cargoProviderHolidayCreate({
        ...data,
        cargoProviderId,
        imRouteId,
      }),
    )
  }
  @ApiOperation({ summary: 'Update Holiday' })
  @ApiOkResponse({ description: 'Updated Successfully' })
  @ApiBody({ type: CompanyCargoProviderHoliday.UpdateDto })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':cargoProviderId/im-route/:imRouteId/holiday/:cargoProviderHolidayId')
  async updateHoliday(
    @Body() data: TMS.CargoProviderHoliday.UpdateRequest,
    @Param('cargoProviderId', ParseUUIDPipe) cargoProviderId: string,
    @Param('imRouteId', ParseUUIDPipe) imRouteId: string,
    @Param('cargoProviderHolidayId', ParseUUIDPipe) id: string,
  ) {
    return getDataOrThrow(
      this.tmsClient.cargoProviderHolidayUpdate({
        ...data,
        cargoProviderId,
        imRouteId,
        id,
      }),
    )
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':cargoProviderId/im-route/:imRouteId/holiday/:cargoProviderHolidayId')
  async deleteHoliday(
    @Param('cargoProviderId') cargoProviderId: string,
    @Param('imRouteId') imRouteId: string,
    @Param('cargoProviderHolidayId') id: string,
  ) {
    return this.tmsClient.cargoProviderHolidayDelete({ id })
  }

  @Get(':cargoProviderId/im-route/:imRouteId/holiday')
  @UseInterceptors(ListResponseInterceptor)
  async getHolidays(
    @Param('cargoProviderId', ParseUUIDPipe) cargoProviderId: string,
    @Param('imRouteId', ParseUUIDPipe) imRouteId: string,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ) {
    return this.cargoProvider.cargoProviderHolidays(cargoProviderId, imRouteId, page, perPage)
  }

  @Get(':cargoProviderId/im-route/imRouteId/holiday/:cargoProviderHolidayId')
  async getHoliday(@Param('cargoProviderHolidayId', ParseUUIDPipe) cargoProviderHolidayId: string) {
    return this.cargoProvider.cargoProviderHoliday(cargoProviderHolidayId)
  }

  @ApiOperation({ summary: 'Update CargoProviderPoint' })
  @ApiOkResponse({ description: 'Updated Successfully' })
  @ApiBody({ type: CargoProviderPoint.UpdateCargoProviderPoint })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':cargoProviderId/points/:pointId')
  async updateCargoProviderPoint(
    @Param('pointId', ParseUUIDPipe) id: string,
    @Body() data: CargoProviderPoint.UpdateCargoProviderPoint,
  ) {
    return getDataOrThrow(this.tmsClient.cargoProviderPointUpdate({ id, ...data }))
  }

  @ApiOperation({ summary: 'Delete CargoProviderPoint' })
  @ApiOkResponse({ description: 'Deleted Successfully' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':cargoProviderId/points/:pointId')
  async deleteCargoProviderPoint(@Param('pointId', ParseUUIDPipe) id: string) {
    return getDataOrThrow(this.tmsClient.cargoProviderPointDelete({ id }))
  }
}
