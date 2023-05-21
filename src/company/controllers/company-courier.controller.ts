import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseInterceptors,
} from '@nestjs/common'
import { CompanyCourierService } from '../services/company-courier.service'
import { getDataOrThrow } from '../../helpers/rpc.helper'
import { TMSClient } from '../../clients/tms.client'
import { FMSClient } from '../../clients/fms.client'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { UMSClient } from '../../clients/ums.client'
import { ListResponseInterceptor } from '../../interceptors/list-response.interceptor'
import { Driver } from '../dto/driver-update.dto'

@ApiBearerAuth()
@ApiTags('Courier')
@Controller({ version: '1', path: '/companies/:companyId/couriers' })
export class CompanyCourierController {
  constructor(
    private readonly companyService: CompanyCourierService,
    private readonly tmsClient: TMSClient,
    private readonly fmsClient: FMSClient,
    private readonly umsClient: UMSClient,
  ) {}

  // TODO: Needs to be refactored /companies/:companyId/courier to singular not plural

  @ApiOperation({ summary: 'Courier update' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Patch('/:courierId')
  async updateCourier(@Param('courierId') courierId: string, @Body() data: Driver.Update) {
    return getDataOrThrow(this.umsClient.driverUpdate({ id: courierId, ...data }))
  }

  // @Get()
  // @UseInterceptors(ListResponseInterceptor)
  // getOrders(
  //   @Query(new ValidationPipe(TypesenseQueryConfig))
  //   searchParams: TypesenseInput,
  //   @I18n() i18n: I18nContext,
  // ) {
  //   return getAllByPagination(this.typesense, i18n, searchParams, this.COLLECTION_COURIER_ORDERS);
  // }

  @Get('/:courierId/routes-orders')
  async getRoutesOrders(@Param('courierId') courierId: string, @Query('filter') filter: string) {
    return this.companyService.getCourierRoutesOrders(courierId, filter)
  }

  @Get('/:courierId/routes-orders/:routeId')
  async pointOrders(@Param('routeId', ParseUUIDPipe) routeId: string) {
    return this.companyService.pointOrders(routeId)
  }

  @Get('/:courierId/routes-orders/:routeId/orders/:orderDeliveryId')
  async geOrderDetail(@Param('orderDeliveryId', ParseUUIDPipe) orderDeliveryId: string) {
    return this.companyService.courierOrderDetail(orderDeliveryId)
  }

  @ApiOperation({ summary: 'Get StoragesCoordinate' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('/get-storages')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ListResponseInterceptor)
  async getStoragesCoordinateByCompanyId(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.companyService.getStoragesCoordinateByCompanyId(companyId)
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('/:courierId/routes/:routeId/courier-on-way')
  async routeCourierOnWay(@Param('routeId', ParseUUIDPipe) routeId: string) {
    return getDataOrThrow(this.tmsClient.routeCourierOnWay({ id: routeId, status: 'COURIER_ON_WAY' }))
  }

  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ListResponseInterceptor)
  @Get('/:courierId/routes/:routeId/docs')
  async getDocumentsByRouteId(@Param('routeId', ParseUUIDPipe) routeId: string) {
    return this.companyService.getDocumentsByRouteId(routeId)
  }

  @Get('/:courierId/routes-orders/:routeId/points/:coordinate')
  async getPointByCoordinate(
    @Param('routeId', ParseUUIDPipe) routeId: string,
    @Param('coordinate') coordinate: string,
  ) {
    return this.companyService.getPointByCoordinate(routeId, coordinate)
  }
}
