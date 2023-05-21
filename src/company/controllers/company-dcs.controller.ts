import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common'
import { CompanyDcService } from '../services/company-dc.service'
import { ListResponseInterceptor } from '../../interceptors/list-response.interceptor'
import { WMSClient } from '../../clients/wms.client'
import { AuthenticatedUser, Roles } from 'nest-keycloak-connect'
import { ROLE } from '../../common/enums/role.enum'
import { RoleMatchingMode } from 'nest-keycloak-connect/constants'
import { TZEnum, WMS } from '@slp/shared'
import { getDataOrThrow } from '../../helpers/rpc.helper'
import { Timezone } from '../../decorators/timezone-param.decorator'
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { CompanyOrderDto } from '../dto/company-order.dto'
import { CloseRoute, CreateEquipmentDto, SetCode, UpdateEquipmentDto } from '../dto/company-dcs.dto'

@ApiTags('Dc')
@Controller({ version: '1', path: '/companies/:companyId/dcs' })
export class CompanyDcsController {
  constructor(private readonly wmsClient: WMSClient, private readonly dcService: CompanyDcService) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post()
  @Roles({ roles: [ROLE.DC_MANAGER], mode: RoleMatchingMode.ANY })
  public async create(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() data: Omit<WMS.Storage.CreateRequest, 'tz'>,
    @Timezone() tz: string,
  ) {
    const creatable = await this.dcService.checkCreatable({ ...data, tz: tz as TZEnum })

    if (!creatable) {
      throw new BadRequestException('Can not create ' + data.type)
    }

    return getDataOrThrow(this.wmsClient.storageCreate({ ...data, companyId, tz: tz as TZEnum }))
  }

  @Get(':dcId/orders')
  public async orders(
    @Param('dcId', ParseUUIDPipe) dcId: string,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ) {
    return this.dcService.orders(dcId, page, perPage)
  }

  @ApiOperation({ summary: 'Close route' })
  @ApiBody({ type: CloseRoute })
  @Put(':dcId/routes/close')
  public async closeRoute(
    @Body() data: Omit<WMS.Route.CloseRequest, 'storageId' | 'userId'>,
    @Param('dcId', ParseUUIDPipe) dcId: string,
    @AuthenticatedUser() user: any,
  ) {
    return getDataOrThrow(this.wmsClient.closeRouteRequest({ ...data, userId: user.sub, storageId: dcId }))
  }

  @ApiOperation({ summary: 'Set code to self delivered orders' })
  @ApiBody({ type: SetCode })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(':dcId/orders/:orderId')
  public async setCode(
    @Body() data: Pick<WMS.Order.SetCodeRequest, 'code'>,
    @Param('dcId') dcId: string,
    @Param('orderId') orderId: string,
    @AuthenticatedUser() user: any,
  ) {
    return getDataOrThrow(this.wmsClient.setCode({ ...data, orderId: orderId, storageId: dcId, userId: user.sub }))
  }

  @Get()
  public storages(@Param('companyId') companyId: string) {
    return this.dcService.storages(companyId)
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(':dcId/receive-order')
  public receiveOrder(
    @Body() data: Pick<WMS.Order.ReceiveOrderRequest, 'code'>,
    @AuthenticatedUser() user: any,
    @Param('dcId') storageId: string,
  ) {
    return getDataOrThrow(this.wmsClient.receiveOrder({ ...data, userId: user.sub, storageId }))
  }

  @UseInterceptors(ListResponseInterceptor)
  @HttpCode(HttpStatus.OK)
  @Get('route-list')
  public getRoutes(@Query('page') page: number, @Query('perPage') perPage: number) {
    return this.dcService.getRoutes(page, perPage)
  }

  @UseInterceptors(ListResponseInterceptor)
  @HttpCode(HttpStatus.OK)
  @Get(':dcId/route-list')
  public getRoutesByDcId(
    @Param('dcId', ParseUUIDPipe) dcId: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.dcService.getRoutesByDcId(dcId, page, perPage)
  }

  @UseInterceptors(ListResponseInterceptor)
  @HttpCode(HttpStatus.OK)
  @Get(':dcId/route-list/take')
  public getRoutesByTake(
    @Param('dcId', ParseUUIDPipe) dcId: string,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ) {
    return this.dcService.getRoutesByTake(dcId, page, perPage)
  }

  @UseInterceptors(ListResponseInterceptor)
  @HttpCode(HttpStatus.OK)
  @Get(':dcId/route-list/give')
  public getRoutesByGive(@Param('dcId', ParseUUIDPipe) dcId: string) {
    return this.dcService.getRoutesByGive(dcId)
  }

  @UseInterceptors(ListResponseInterceptor)
  @HttpCode(HttpStatus.OK)
  @Get(':dcId')
  public getOneStorageById(@Param('dcId', ParseUUIDPipe) dcId: string) {
    return this.dcService.getOneStorageById(dcId)
  }

  @UseInterceptors(ListResponseInterceptor)
  @HttpCode(HttpStatus.OK)
  @Get(':dcId/orders')
  public getOrdersInStorage(@Param('dcId') dcId: string) {
    return this.dcService.getOrdersInStorage(dcId)
  }

  @ApiOperation({ summary: 'Give order' })
  @ApiBody({ type: CompanyOrderDto.GiveOrder })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(':dcId/orders/:orderId/give')
  giveOrder(
    @Body() data: Omit<WMS.Order.GiveOrderRequest, 'userId' | 'orderId' | 'dcId'>,
    @Param('dcId', ParseUUIDPipe) dcId: string,
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @AuthenticatedUser() user: any,
  ) {
    return getDataOrThrow(this.wmsClient.giveOrder({ ...data, orderId, dcId, userId: user.sub }))
  }

  @ApiOperation({ summary: 'List of storage workers' })
  @ApiParam({
    name: 'dcId',
    type: 'string',
  })
  @Get(':dcId/storage-workers')
  public storageWorkers(
    @Param('dcId', ParseUUIDPipe) dcId: string,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ) {
    return this.dcService.storageWorkers(dcId, page, perPage)
  }

  // /**
  //  * Create schedule to storage
  //  * @param dto
  //  * @param user
  //  */
  // @HttpCode(HttpStatus.OK)
  // @Post('working-days/add')
  // public createSchedule(@Body() dto, @AuthenticatedUser() user: any) {
  //   return firstValueFrom(this.wms.send({ cmd: Command.WMS_CREATE_SCHEDULE }, { ...dto, user_id: user.sub }));
  // }
  //
  // /**
  //  * Get working days
  //  * @param dto
  //  * @param user
  //  */
  // @HttpCode(HttpStatus.OK)
  // @Post('working-days')
  // public getSchedulesStorage(@Body() dto, @AuthenticatedUser() user: any) {
  //   return firstValueFrom(this.wms.send({ cmd: Command.WMS_GET_SCHEDULE }, { ...dto, user_id: user.sub }));
  // }
  //
  // /**
  //  * Create holiday
  //  * @param dto
  //  * @param user
  //  */
  // @Post('holiday')
  // public createHoliday(@Body() dto, @AuthenticatedUser() user: any) {
  //   return firstValueFrom(this.wms.send({ cmd: Command.WMS_CREATE_HOLIDAY }, { ...dto, user_id: user.sub }));
  // }
  //
  // /**
  //  * Delete holiday from storage/company
  //  * @param id
  //  * @param user
  //  */
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @Delete('holiday/:id')
  // public deleteHoliday(@Param('id') id: string, @AuthenticatedUser() user: any) {
  //   return firstValueFrom(this.wms.send({ cmd: Command.WMS_DELETE_HOLIDAY }, { id, user_id: user.sub }));
  // }

  @ApiOperation({ summary: 'Boxing orders' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ordersCode: { type: 'string[]' },
      },
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(':dcId/box-orders')
  boxOrders(@Body() data: Pick<WMS.Box.BoxOrdersRequest, 'ordersCode'>, @AuthenticatedUser() user: any) {
    return getDataOrThrow(this.wmsClient.boxOrders({ ...data, userId: user.sub }))
  }

  @ApiOperation({ summary: 'Boxes list' })
  @HttpCode(HttpStatus.OK)
  @Get(':dcId/box-orders')
  boxOrdersList(@Param('dcId', ParseUUIDPipe) dcId: string) {
    return this.dcService.getBoxedOrders(dcId)
  }

  @ApiOperation({ summary: 'Get box detail' })
  @HttpCode(HttpStatus.OK)
  @Get(':dcId/box-orders/:orderId')
  boxOrderDetail(@Param('orderId', ParseUUIDPipe) orderId: string, @Param('dcId', ParseUUIDPipe) dcId: string) {
    return this.dcService.getBoxOrderDetail(orderId, dcId)
  }

  @ApiOperation({ summary: 'Update Unbox ORder' })
  @ApiOkResponse({ description: 'Updated Successfully' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':dcId/unbox-orders')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        orderCode: { type: 'string' },
      },
    },
  })
  unboxOrder(@Body() data: WMS.Order.UnboxOrderRequest) {
    return getDataOrThrow(this.wmsClient.unboxOrder(data))
  }

  @Get(':dcId/orders/:routeId')
  @UseInterceptors(ListResponseInterceptor)
  getOrdersByRouteId(@Param('routeId') routeId: string, @Param('dcId') dcId: string) {
    return this.dcService.getOrdersByRouteId(routeId, dcId)
  }

  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ListResponseInterceptor)
  @Get(':dcId/equipment/zones')
  async getEquipmentZones(@Param('dcId') dcId: string, @Query('page') page: number, @Query('perPage') perPage: number) {
    return await this.dcService.getEquipmentZones(dcId, page, perPage)
  }

  @Get(':dcId/equipment/:id')
  @UseInterceptors(ListResponseInterceptor)
  async getEquipmentById(@Param('id', ParseUUIDPipe) id: string) {
    return this.dcService.getByIdWithChildren(id)
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(':dcId/equipment')
  async createEquipment(@Body() dto: CreateEquipmentDto, @Param('dcId') dcId: string) {
    return getDataOrThrow(this.wmsClient.equipmentCreate({ ...dto, dcId }))
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':dcId/equipments/equipmentId')
  async updateEquipment(@Body() dto: UpdateEquipmentDto, @Param('/equipmentId') equipmentId: string) {
    return getDataOrThrow(this.wmsClient.equipmentUpdate({ ...dto, id: equipmentId }))
  }

  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ListResponseInterceptor)
  @Get(':dcId/equipment/:code/orders')
  async getCellOrders(
    @Param('code') code: string,
    @AuthenticatedUser() user: any,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ) {
    return this.dcService.getEquipmentOrders(user.sub, code, page, perPage)
  }

  @HttpCode(HttpStatus.OK)
  @Get(':dcId/equipment/:orderNumber/order')
  async getOrderDetail(
    @Param('orderNumber', ParseIntPipe) orderNumber: number,
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
    @AuthenticatedUser() user: any,
  ) {
    return this.dcService.getOrderByNumber({
      number: orderNumber,
      companyId: companyId,
      userId: user.sub,
      page,
      perPage,
    })
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(':dcId/stock-takes')
  async createStockTake(@Param('dcId', ParseUUIDPipe) dcId: string) {
    return getDataOrThrow(this.wmsClient.createStockTaking({ storageId: dcId }))
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(':dcId/stock-takes/:stockTakeId/stock-take-orders')
  async createStockTakeOrder(
    @Param('dcId') storageId: string,
    @Param('stockTakeId') stockTakeId: string,
    @Body() orderCode: string,
  ) {
    return getDataOrThrow(
      this.wmsClient.createStockTakingOrders({ storageId, stocktakingId: stockTakeId, orderCode: orderCode }),
    )
  }

  @HttpCode(HttpStatus.OK)
  @Get(':dcId/stock-takes')
  async getStockTakes(@Param('dcId') storageId: string) {
    return this.dcService.getStockTakes(storageId)
  }

  @HttpCode(HttpStatus.OK)
  @Get(':dcId/stock-takes/:stockTakeId')
  async getStockTake(@Param('stockTakeId') stockTakeId: string) {
    return this.dcService.getStockById(stockTakeId)
  }

  @ApiOperation({ summary: 'Get StorageDebits' })
  @UseInterceptors(ListResponseInterceptor)
  @HttpCode(HttpStatus.OK)
  @Get(':dcId/debits')
  async getStorageDebits(@Param('dcId', ParseUUIDPipe) dcId: string) {
    return this.dcService.getStorageDebits(dcId)
  }

  @ApiOperation({ summary: 'Get One StorageDebit' })
  @UseInterceptors(ListResponseInterceptor)
  @HttpCode(HttpStatus.OK)
  @Get(':dcId/debits/:storageDebitId')
  async getStorageDebit(@Param('storageDebitId', ParseUUIDPipe) storageDebitId: string) {
    return this.dcService.getStorageDebit(storageDebitId)
  }
}
