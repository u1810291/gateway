import { UMS } from '@slp/shared'
import { ApiProperty } from '@nestjs/swagger'

export class AccessTokenInput implements UMS.Auth.LoginRequest {
  @ApiProperty()
  username: string

  @ApiProperty()
  password: string
}
