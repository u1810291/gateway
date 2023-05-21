import { ApiProperty } from '@nestjs/swagger'
import { TMS } from '@slp/shared'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace RouteMoveDto {

  export class MoveToRoute implements Omit<TMS.Pool.MoveToRoute, 'poolId'> {
    @ApiProperty({type: String, required: true})
    orderDeliveryId: string

    @ApiProperty({type: String, required: true})
    routeId: string

  }

  export class MoveToPool implements Omit<TMS.Route.MoveToActivePool, 'routeId'> {
    @ApiProperty({type: String, required: true})
    orderDeliveryId: string

    @ApiProperty({type: String, required: true})
    poolId: string
  }

}
