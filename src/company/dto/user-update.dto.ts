import { UMS } from '@slp/shared'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class UserUpdateDto implements UMS.User.UpdateRequest {
  @ApiProperty()
  id: string

  @ApiPropertyOptional()
  email?: string

  @ApiPropertyOptional()
  firstName?: string

  @ApiPropertyOptional()
  groupId?: string

  @ApiPropertyOptional()
  groups?: string[]

  @ApiPropertyOptional()
  lastName?: string

  @ApiPropertyOptional()
  name?: string

  @ApiPropertyOptional()
  password?: string

  @ApiPropertyOptional()
  phone?: string

  @ApiPropertyOptional()
  pushToken?: string

  @ApiPropertyOptional()
  timezone?: string

  @ApiPropertyOptional()
  username?: string

  @ApiPropertyOptional()
  storageId?: string
}
