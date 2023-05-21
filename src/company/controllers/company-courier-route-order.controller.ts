import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common'
import { TMSClient } from '../../clients/tms.client'
import { getDataOrThrow } from '../../helpers/rpc.helper'
import { TMS } from '@slp/shared'

@Controller({ version: '1', path: '/companies/:companyId/couriers/:courierId/routes-orders' })
export class CompanyCourierRouteOrderController {
  constructor(private readonly tmsClient: TMSClient) {}

  @HttpCode(HttpStatus.OK)
  @Post(':orderDeliveryId/qr-code')
  async courierTook(@Param('orderDeliveryId', ParseUUIDPipe) orderDeliveryId: string, @Body() data) {
    return getDataOrThrow(this.tmsClient.orderDeliveryCourierTook({ id: orderDeliveryId, ...data }))
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('courier-on-point')
  async courierOnPoint(@Body() data: TMS.OrderDelivery.CourierOnPointEvent) {
    return getDataOrThrow(this.tmsClient.orderDeliveryCourierOnPoint({ ids: data.ids }))
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('delivered')
  async orderDelivered(@Body() data: TMS.OrderDelivery.DeliveredRequest): Promise<void> {
    return getDataOrThrow(this.tmsClient.orderDeliveryDelivered(data))
  }
}
