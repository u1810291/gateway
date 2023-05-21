import { UMS } from '@slp/shared'
import { ApiProperty } from '@nestjs/swagger'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Driver {
  export class Update implements UMS.Driver.UpdateRequest {
    @ApiProperty({ type: String, description: 'companyId is UUID' })
    companyId: string

    @ApiProperty({ type: String, description: 'dcId is UUID' })
    dcId: string

    @ApiProperty({ type: String, description: 'id is UUID' })
    id: string

    @ApiProperty({ type: Date, description: 'id card expire date' })
    idCardExpireDate: Date

    @ApiProperty({ type: String, description: 'date' })
    idCardNumber: string

    @ApiProperty({ type: Date, description: 'license expire date' })
    licenseExpireDate: Date

    @ApiProperty({ type: String, description: 'license number' })
    licenseNumber: string

    @ApiProperty({ type: String, description: 'photo' })
    photo: string

    @ApiProperty({ type: String, description: 'push token' })
    pushToken: string

    @ApiProperty({ type: String, description: 'status' })
    status: UMS.Driver.Status.AVAILABLE | UMS.Driver.Status.UNAVAILABLE | UMS.Driver.Status.BUSY

    @ApiProperty({ type: String, description: 'vehicleId is UUID' })
    vehicleId: string
  }
}
