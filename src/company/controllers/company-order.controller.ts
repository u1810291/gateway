import { Header, Put, Query, UseInterceptors } from '@nestjs/common'
import { ListResponseInterceptor } from '../../interceptors/list-response.interceptor'
import { I18n, I18nContext } from 'nestjs-i18n'
import { CompanyOrderService } from '../services/company-order.service'
import { OMSClient } from '../../clients/oms.client'
import { TMSClient } from '../../clients/tms.client'
import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common'
import { Roles } from 'nest-keycloak-connect'
import { RoleMatchingMode } from 'nest-keycloak-connect/constants'
import { ROLE } from '../../common/enums/role.enum'
import { OMS, WMS } from '@slp/shared'
import { getDataOrThrow } from '../../helpers/rpc.helper'
import { zonedTimeToUtc } from 'date-fns-tz'
import { Timezone } from '../../decorators/timezone-param.decorator'
import { WMSClient } from '../../clients/wms.client'
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { CompanyOrderDto } from '../dto/company-order.dto'
import { OrderFilterDto } from '../dto/order-filter.dto'

@ApiTags('Order')
@Controller({ path: 'companies/:companyId/orders', version: '1' })
export class CompanyOrderController {
  constructor(
    private readonly omsClient: OMSClient,
    private readonly service: CompanyOrderService,
    private readonly wmsClient: WMSClient,
    private readonly tmsClient: TMSClient,
  ) {}

  @ApiOperation({ summary: 'Get Orders' })
  @ApiOkResponse({ description: 'Ok' })
  @Header('access-control-expose-headers', 'x-version')
  @Header('x-version', '1.0')
  @Get()
  @UseInterceptors(ListResponseInterceptor)
  async getOrdersByCompany(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query() query: OrderFilterDto,
    @I18n() i18n: I18nContext,
  ) {
    return this.service.getOrders(companyId, query)
  }

  @ApiOperation({ summary: 'Give order' })
  @ApiBody({ type: CompanyOrderDto.GiveOrder })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(':orderId/give')
  giveOrder(
    @Body() data: Omit<WMS.Order.GiveOrderRequest, 'orderId'>,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ) {
    return getDataOrThrow(this.wmsClient.giveOrder({ ...data, orderId }))
  }

  @ApiOperation({ summary: 'Create Order' })
  @ApiOkResponse({ description: 'Created Successfully' })
  @ApiBody({ type: CompanyOrderDto.OrderDto })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles({ mode: RoleMatchingMode.ANY, roles: [ROLE.ORDER_CREATE, ROLE.ORDER_MANAGEMENT] })
  async create(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Timezone() tz: string,
    @Body() data: OMS.Order.CreateRequest,
  ) {
    data.deliveryStartAt = zonedTimeToUtc(data.deliveryStartAt, tz)
    await this.service.replaceStorageId(data)

    return getDataOrThrow(this.omsClient.orderCreate({ ...data, companyId }))
  }

  // @Post(':orderId/images')
  // async pushImage(@Param('orderId') orderId: string, @Body() data: any) {
  //   return this.omsClient.send(
  //     {
  //       cmd: Command.ORDER_PUSH_IMAGE,
  //     },
  //     {
  //       ...data,
  //       order_id: orderId,
  //     },
  //   );
  // }

  @ApiOperation({ summary: 'Order by Id' })
  @ApiOkResponse({ description: 'Ok' })
  @ApiNotFoundResponse({ description: 'Order does not found' })
  @Get('/:orderId')
  @UseInterceptors(ListResponseInterceptor)
  async getOrderDetail(@Param('orderId') orderId: string) {
    return this.service.getOrderDetail(orderId)
  }

  @ApiOperation({ summary: 'Fetch order by ExternalId' })
  @ApiOkResponse({ description: 'Ok' })
  @ApiNotFoundResponse({ description: 'Order does not found' })
  @Get('/external/:orderNumber')
  @UseInterceptors(ListResponseInterceptor)
  async getOrder(@Param('orderNumber') orderNumber: string) {
    return this.service.getOrderByExternalId(orderNumber)
  }

  @ApiOperation({ summary: 'Set code to order' })
  @ApiBody({ type: CompanyOrderDto.OrderSetCode })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/:orderId/set-code')
  async setCode(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() data: Omit<WMS.Order.SetCodeRequest, 'orderId'>,
  ) {
    return getDataOrThrow(this.wmsClient.setCode({ ...data, orderId }))
  }

  @Post('/confirm')
  async confirmCode(@Body() data: OMS.ConfirmCode.ConfirmCodeRequest) {
    return getDataOrThrow(this.omsClient.confirmSecret(data))
  }

  @Post('/charge-info')
  async chargedItems(@Body() data: OMS.GetOrdersByIds.Request) {
    return getDataOrThrow(this.tmsClient.orderChargedInfo(data.ids[0]))
  }

  @Post('/:orderId/cancel')
  async orderCancel(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return getDataOrThrow(this.tmsClient.orderCancel({ id: orderId }))
  }

  @ApiOperation({ summary: 'Change Dimensions' })
  @ApiBody({ type: CompanyOrderDto.ChangeDimension })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put('/:orderId/dimensions')
  async changeDimension(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() data: Omit<OMS.Order.DimensionChangeRequest, 'orderId'>,
  ) {
    return getDataOrThrow(this.omsClient.dimensionChange({ ...data, orderId }))
  }

  @ApiOperation({ summary: 'Get Order by Code' })
  @ApiOkResponse({ description: 'Ok' })
  @ApiNotFoundResponse({ description: 'Order does not found' })
  @Get('/code/:code')
  @UseInterceptors(ListResponseInterceptor)
  async getOrderByCode(@Param('code') code: string) {
    return this.service.getOrderByCode(code)
  }

  @ApiOperation({ summary: 'Get Order SecretCode by orderId' })
  @ApiOkResponse({ description: 'Ok' })
  @ApiNotFoundResponse({ description: 'SecretCode does not found' })
  @Get('/:groupId/secretCode')
  @UseInterceptors(ListResponseInterceptor)
  async getSecretCodeByOrderId(
    @Param('groupId', ParseUUIDPipe) groupId: string,
  ): Promise<OMS.Order.SecretCodeResponse> {
    return getDataOrThrow(this.omsClient.secretCode({ id: groupId }))
  }

  @ApiOperation({ summary: 'Get Order Properties' })
  @ApiOkResponse({ description: 'OK' })
  @ApiNotFoundResponse({ description: 'Order Not Found' })
  @Get('/:orderId/properties')
  @UseInterceptors(ListResponseInterceptor)
  async getOrderPropertiesByOrderId(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.service.getOrderPropertiesByOrderId(orderId)
  }
}
