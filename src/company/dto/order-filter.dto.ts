import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'
import { Transform } from 'class-transformer'

enum OrderStatus {
  UNASSIGNED = 'UNASSIGNED',
  SORTED = 'SORTED',
  ROUTED = 'ROUTED',
  COURIER_ACCEPTED = 'COURIER_ACCEPTED',
  ARRIVED = 'ARRIVED',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
  NEW = 'NEW',
  SHIPMENT_FROM = 'SHIPMENT_FROM',
  RECEIVED = 'RECEIVED',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
}
export class OrderFilterDto {
  @ApiPropertyOptional()
  externalNumber?: string

  @ApiPropertyOptional()
  number?: number

  @ApiPropertyOptional({ enum: OrderStatus })
  status?: OrderStatus

  @ApiPropertyOptional()
  poolNumber?: number

  @ApiPropertyOptional()
  senderDcId?: string

  @ApiPropertyOptional()
  recipientDcId?: string

  @ApiPropertyOptional()
  from?: Date

  @ApiPropertyOptional()
  to?: Date

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    let num = parseInt(value)

    if (num < 1) {
      num = 1
    }

    return num
  })
  page?: number = 1

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    let num = parseInt(value)

    if (num < 1) {
      num = 10
    } else if (num > 100) {
      num = 100
    }

    return num
  })
  perPage?: number = 10
}
