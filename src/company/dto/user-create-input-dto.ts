import { UMS } from '@slp/shared'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class UserCreateInputDto implements UMS.User.CreateRequest {
  @ApiPropertyOptional()
  delayDate?: number

  @ApiProperty()
  companyId: string

  @ApiProperty()
  email: string

  @ApiProperty()
  firstName: string

  @ApiProperty()
  groupId: string

  @ApiProperty()
  groups: string[]

  @ApiProperty()
  lastName: string

  @ApiProperty()
  name: string

  @ApiProperty()
  password: string

  @ApiProperty()
  phone: string

  @ApiProperty()
  pushToken: string

  @ApiProperty()
  timezone: string

  @ApiProperty()
  username: string

  @ApiPropertyOptional()
  storageId?: string
}
