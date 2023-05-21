import { WMS } from '@slp/shared'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export enum type {
  ACCEPTANCE_ZONE = 'ACCEPTANCE_ZONE',
  PICKING_ZONE = 'PICKING_ZONE',
  PACKAGING_ZONE = 'PACKAGING_ZONE',
  STORAGE_ZONE = 'STORAGE_ZONE',
  PALLET_STORAGE_ZONE = 'PALLET_STORAGE_ZONE',
  RETURN_ZONE = 'RETURN_ZONE',
  SHIPMENT_ZONE = 'SHIPMENT_ZONE',
  TRANSPORT_UNIT = 'TRANSPORT_UNIT',
  SECTION = 'SECTION',
  SHELF = 'SHELF',
  CELL = 'CELL',
}
export class CreateEquipmentDto implements Omit<WMS.Equipment.CreateRequest, 'dcId'> {
  @ApiProperty()
  name: string

  @ApiProperty()
  parentId: string

  @ApiPropertyOptional()
  count?: number

  @ApiProperty({ enum: type })
  type: type
}

export class CloseRoute implements Omit<WMS.Route.CloseRequest, 'storageId' | 'userId'> {
  @ApiProperty()
  routeNumber: number

  @ApiProperty()
  cash: number
}

export class SetCode implements Omit<WMS.Order.SetCodeRequest, 'userId' | 'storageId' | 'orderId'> {
  @ApiProperty()
  code: string
}

export class UpdateEquipmentDto implements Omit<WMS.Equipment.UpdateRequest, 'id'> {
  @ApiProperty()
  name: string

  @ApiPropertyOptional()
  count?: number

  @ApiProperty({ enum: type })
  type: type
}
