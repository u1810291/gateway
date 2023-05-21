import { UMS } from '@slp/shared'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace User {
  export class PushTokenDto implements Omit<UMS.User.PushTokenUpdate, 'id'> {
    @ApiProperty()
    pushToken: string
  }
}
