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
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common'
import { TMSClient } from '../../clients/tms.client'
import { TMS } from '@slp/shared'
import { ListResponseInterceptor } from '../../interceptors/list-response.interceptor'
import { CompanyDeliveryService } from '../services/company-delivery.service'
import { getDataOrThrow } from 'src/helpers/rpc.helper'
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger'
import { UpdatePoolId } from '../dto/order-delivery.dto'
import { TimeOfDelivery } from '../dto/delivery-times.dto'
import { Timezone } from '../../decorators/timezone-param.decorator'
import { transformMilitaryTimeToUTCMilitaryTime } from '../../helpers/date.helper'
import { Unprotected } from 'nest-keycloak-connect'

@ApiTags('Delivery')
@Controller({
  path: '/companies/:companyId/deliveries',
  version: '1',
})
export class CompanyDeliveryController {
  constructor(private readonly tmsClient: TMSClient, private readonly deliveryService: CompanyDeliveryService) {}

  @ApiOperation({ summary: 'Get  Time of  delivery' })
  @Get('times')
  @HttpCode(HttpStatus.OK)
  async timeOfDeliveries(
    @Param('companyId') companyId: string,
    @Timezone() tz: string,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ) {
    return this.deliveryService.timeOfDeliveries(companyId, tz, page, perPage)
  }

  @Post('times')
  @ApiBody({ type: TimeOfDelivery.CreateDto })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Create  time of  delivery' })
  async create(@Body() data: TimeOfDelivery.CreateDto, @Param('companyId') companyId: string, @Timezone() tz: string) {
    data.from = transformMilitaryTimeToUTCMilitaryTime(data.from, tz)
    data.to = transformMilitaryTimeToUTCMilitaryTime(data.to, tz)

    return getDataOrThrow(this.tmsClient.timeOfDeliveryCreate({ ...data, companyId }))
  }

  @Patch('times/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ type: TimeOfDelivery.UpdateDto })
  @ApiOperation({ summary: 'Update  Time of  delivery' })
  async update(@Param('id') id: string, @Body() data: TimeOfDelivery.UpdateDto, @Timezone() tz: string) {
    data.from = transformMilitaryTimeToUTCMilitaryTime(data.from, tz)
    data.to = transformMilitaryTimeToUTCMilitaryTime(data.to, tz)

    return getDataOrThrow(this.tmsClient.timeOfDeliveryUpdate({ ...data, id }))
  }

  @Delete('times/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete  Time of  delivery' })
  async delete(@Param('id') id: string) {
    return getDataOrThrow(this.tmsClient.timeOfDeliveryDelete({ id }))
  }

  @ApiOperation({ summary: 'Get one  Time of  delivery' })
  @Get('times/:id')
  @HttpCode(HttpStatus.OK)
  async getOneTimeOfDelivery(@Param('id', ParseUUIDPipe) id: string, @Timezone() tz: string) {
    return this.deliveryService.timeOfDelivery(id, tz)
  }

  @ApiOperation({ summary: 'Get time ranges' })
  @HttpCode(HttpStatus.OK)
  @Post('calculate-delivery-schedule')
  async timeRange(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() data: TMS.Delivery.GetTimeRangeRequest,
  ) {
    return getDataOrThrow(this.tmsClient.getTimeRanges({ companyId: companyId, ...data }))
  }

  @ApiOperation({ summary: 'Calculate by capacity' })
  @Post('calculate-price-by-capacity')
  @HttpCode(HttpStatus.OK)
  async calculateWithCapacity(
    @Param('companyId') companyId: string,
    @Body() data: TMS.Tariff.CalculateByCapacityRequest,
  ) {
    return getDataOrThrow(this.tmsClient.calculateByCapacity({ ...data, companyId }))
  }

  // @Post('calculate')
  // @HttpCode(HttpStatus.OK)
  // async calculateDeliveryPrice(@Param('companyId') companyId, @Body() data) {
  //   return this.client.send({ cmd: Command.TARIFF_CALCULATE }, { company_id: companyId, ...data });
  // }

  @Post('define-delivery-type-by-coordinates')
  @HttpCode(HttpStatus.OK)
  async defineDeliveryTypeByCoordinates(
    @Param('companyId') companyId,
    @Body() body,
  ): Promise<TMS.Delivery.DefineTypeByCoordinatesResponse> {
    return getDataOrThrow(this.tmsClient.defineDeliveryTypeByCoordinates({ ...body, companyId }))
  }

  @Get('/:poolId')
  @UseInterceptors(ListResponseInterceptor)
  async getOrderDeliveriesByPoolId(
    @Param('poolId', ParseUUIDPipe) poolId: string,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ) {
    return this.deliveryService.getOrderDeliveriesByPoolId(poolId, page, perPage)
  }

  @Unprotected()
  @ApiOperation({ summary: 'Update Pool ID' })
  @ApiOkResponse({ description: 'Updated Successfully' })
  @ApiBody({ type: UpdatePoolId })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put('/:poolId')
  async updatePoolId(
    @Param('poolId', ParseUUIDPipe) oldPoolId: string,
    @Body() data: Omit<TMS.OrderDelivery.UpdatePoolIdRequest, 'oldPoolId'>,
  ) {
    return getDataOrThrow(this.tmsClient.orderDeliveryUpdatePoolId({ ...data, oldPoolId }))
  }
}
