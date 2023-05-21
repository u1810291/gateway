import { TMS } from '@slp/shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

export class UpdatePoolId implements Omit<TMS.OrderDelivery.UpdatePoolIdRequest, 'oldPoolId'> {
  @ApiProperty()
  @IsUUID()
  deliveryOrderId: string

  @ApiProperty()
  @IsUUID()
  newPoolId: string
}
