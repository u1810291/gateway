import { ApiProperty } from '@nestjs/swagger'
import { TMS } from '@slp/shared'

export namespace TimeOfDelivery {
  export class CreateDto implements TMS.TimeOfDelivery.CreateRequest {
    @ApiProperty({ type: String, description: 'companyId is UUID' })
    companyId: string

    @ApiProperty({ type: String, description: 'from is string' })
    from: string

    @ApiProperty({ type: String, description: 'to is string' })
    to: string
  }
  export class UpdateDto implements Omit<TMS.TimeOfDelivery.UpdateRequest, 'id'> {
    @ApiProperty({ type: String, description: 'from is string' })
    from?: string

    @ApiProperty({ type: String, description: 'to is string' })
    to?: string
  }
}
