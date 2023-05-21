import { FMS } from '@slp/shared'
import {ApiProperty} from '@nestjs/swagger'
import { VehicleSource as Source, VehicleStatus } from '@prisma/client'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace VehicleDto {
  export class VehicleCreate implements FMS.Vehicle.CreateRequest {
    @ApiProperty()
    companyId: string
    @ApiProperty()
    plateNumber: string
    @ApiProperty()
    driverId: string
    @ApiProperty()
    licensePlate: string
    @ApiProperty()
    luggageDimensionId: number
    @ApiProperty()
    manufactureYear: number
    @ApiProperty({ enum: Source })
    source: Source
    @ApiProperty()
    vehicleBodyTypeId: number
    @ApiProperty()
    vehicleColourId: number
    @ApiProperty()
    vehicleModelId: number
    @ApiProperty()
    vehicleProducerId: number
    @ApiProperty()
    vehicleTypeId: number
  }
  export class VehicleUpdate implements FMS.Vehicle.UpdateRequest {
    @ApiProperty()
    companyId: string

    @ApiProperty()
    driverId: string

    @ApiProperty()

    licensePlate: string
    @ApiProperty()
    plateNumber: string

    @ApiProperty()
    manufactureYear: number

    @ApiProperty({ enum: Source })
    source: Source

    @ApiProperty()
    vehicleBodyTypeId: number

    @ApiProperty()
    vehicleColourId: number

    @ApiProperty()
    vehicleModelId: number

    @ApiProperty()
    vehicleProducerId: number

    @ApiProperty()
    id: string

    @ApiProperty()
    status: VehicleStatus

    @ApiProperty()
    vehicleTypeId: number
  }
  export class ProducerCreate implements FMS.Producer.CreateRequest {
    @ApiProperty()
    name: string
  }
  export class ProducerUpdate implements FMS.Producer.UpdateRequest {
    @ApiProperty()
    id: number
    @ApiProperty()
    name: string
  }
  export class MileageCreate implements FMS.Mileage.CreateRequest {
    @ApiProperty()
    currentDay: number
    @ApiProperty()
    lastDay: number
    @ApiProperty()
    mileageLimit: number
    @ApiProperty()
    total: number
    @ApiProperty()
    vehicleId: string
  }
  export class MileageUpdate implements FMS.Mileage.UpdateRequest {
    @ApiProperty()
    currentDay: number
    @ApiProperty()
    lastDay: number
    @ApiProperty()
    mileageLimit: number
    @ApiProperty()
    total: number
    @ApiProperty()
    vehicleId: string
  }
  export class ModelCreate implements FMS.Model.CreateRequest {
    @ApiProperty()
    name: string
  }
  export class ModelUpdate implements FMS.Model.UpdateRequest {
    @ApiProperty()
    name: string
    @ApiProperty()
    id: number
  }
  export class TypeCreate implements FMS.Type.CreateRequest {
    @ApiProperty()
    name: string
  }
  export class TypeUpdate implements FMS.Type.UpdateRequest {
    @ApiProperty()
    id: number
    @ApiProperty()
    name: string
  }
  export class BodyTypeCreate implements FMS.BodyType.CreateRequest {
    @ApiProperty()
    name: string
  }
  export class BodyTypeUpdate implements FMS.BodyType.UpdateRequest {
    @ApiProperty()
    id: number
    @ApiProperty()
    name: string
  }
  export class ColourCreate implements FMS.Colour.CreateRequest {
    @ApiProperty()
    name: string
  }
  export class ColourUpdate implements FMS.Colour.UpdateRequest {
    @ApiProperty()
    id: number
    @ApiProperty()
    name: string
  }
  export class LuggageCreate implements FMS.Luggage.CreateRequest {
    @ApiProperty()
    length: number

    @ApiProperty()
    width: number

    @ApiProperty()
    height: number
  }
  export class LuggageUpdate implements FMS.Luggage.UpdateRequest {
    @ApiProperty()
    id: number

    @ApiProperty()
    length: number

    @ApiProperty()
    width: number

    @ApiProperty()
    height: number
  }
}
