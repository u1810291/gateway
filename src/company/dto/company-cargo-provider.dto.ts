import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { TMS } from '@slp/shared'

export namespace CompanyCargoProviderHoliday {
  export class CreateDto implements TMS.CargoProviderHoliday.CreateRequest {
    @ApiProperty({ type: Boolean, required: true })
    isDayOff: boolean

    @ApiProperty({ type: String, description: 'cargoProviderId is UUID' })
    cargoProviderId: string

    @ApiProperty({ type: String, description: 'imRouteId is UUID' })
    imRouteId: string

    @ApiProperty({ type: Date, description: 'date' })
    date: Date

    @ApiProperty({ type: Date, description: 'deadline is maybe DateTime or string' })
    deadline: string
  }

  export class UpdateDto implements Omit<TMS.CargoProviderHoliday.UpdateRequest, 'id'> {
    @ApiPropertyOptional({ description: 'This is not required for update' })
    isDayOff?: boolean

    @ApiPropertyOptional({ description: 'This is not required for update' })
    cargoProviderId?: string

    @ApiPropertyOptional({ description: 'This is not required for update' })
    imRouteId?: string

    @ApiPropertyOptional({ description: 'This is not required for update' })
    date?: Date

    @ApiPropertyOptional({ description: 'This is not required for update' })
    deadline?: string
  }
}

export namespace CompanyCargoProvider {
  export class UpdateCargoProviderDto implements Omit<TMS.CargoProvider.UpdateRequest, 'id'> {
    @ApiPropertyOptional()
    companyId?: string

    @ApiPropertyOptional()
    delayHoliday?: number

    @ApiPropertyOptional()
    name?: string
  }
}

export namespace CargoProviderPoint {
  export class UpdateCargoProviderPoint implements Omit<TMS.CargoProvider.UpdatePointRequest, 'id'> {
    @ApiPropertyOptional()
    address?: string

    @ApiPropertyOptional()
    latitude?: number

    @ApiPropertyOptional()
    longitude?: number
  }
}
