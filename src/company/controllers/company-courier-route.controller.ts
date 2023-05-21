import { Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch } from '@nestjs/common'
import { getDataOrThrow } from '../../helpers/rpc.helper'
import { TMSClient } from '../../clients/tms.client'

@Controller({ version: '1', path: '/companies/:companyId/couriers/:courierId/routes' })
export class CompanyCourierRouteController {
  constructor(private readonly tmsClient: TMSClient) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':routeId/courier-accepted')
  async courierAccepted(@Param('routeId', ParseUUIDPipe) routeId: string) {
    return getDataOrThrow(this.tmsClient.routeCourierAccepted({ id: routeId }))
  }
}
