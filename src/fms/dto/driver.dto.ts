import { UMS } from '@slp/shared'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'
import { Transform } from 'class-transformer'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace DriverDto {
  export class DriverCreate implements UMS.Driver.CreateRequest {
    @ApiProperty()
    id: string

    @ApiProperty()
    idCardExpireDate: Date

    @ApiProperty()
    idCardNumber: string

    @ApiProperty()
    licenseExpireDate: Date

    @ApiProperty()
    licenseNumber: string

    @ApiProperty()
    photo: string

    @ApiProperty({ enum: UMS.Driver.Status })
    status: UMS.Driver.Status

    @ApiProperty()
    vehicleId: string

    @ApiProperty()
    email: string

    @ApiProperty()
    firstName: string

    @ApiProperty()
    lastName: string

    @ApiProperty()
    phone: string

    @ApiProperty()
    password: string

    @ApiProperty()
    groupId: string

    @ApiProperty()
    username: string

    @ApiProperty()
    companyId: string

    @ApiPropertyOptional()
    dcId?: string

    @ApiProperty()
    callerId: string

    @ApiProperty()
    callerPassword: string
  }

  export class DriverUpdate implements UMS.Driver.UpdateRequest {
    @ApiProperty()
    id: string

    @ApiProperty()
    idCardExpireDate: Date

    @ApiProperty()
    idCardNumber: string

    @ApiProperty()
    licenseExpireDate: Date

    @ApiProperty()
    licenseNumber: string

    @ApiProperty()
    photo: string

    @ApiProperty({ enum: UMS.Driver.Status })
    status: UMS.Driver.Status

    @ApiProperty()
    vehicleId: string

    @ApiPropertyOptional()
    dcId?: string

    @ApiPropertyOptional()
    callerId?: string

    @ApiPropertyOptional()
    callerPassword?: string
  }

  export class DriverFilterDto {
    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => (parseInt(value) < 1 ? 1 : parseInt(value)))
    page?: number = 1

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => (parseInt(value) < 1 ? (parseInt(value) > 100 ? 10 : 10) : parseInt(value)))
    perPage?: number = 10
  }
}
