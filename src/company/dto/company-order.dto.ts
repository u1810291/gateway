import { OMS, WMS } from '@slp/shared'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { DeliveryAddressType, OrderRecipientNotAvailable } from '@prisma/client'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CompanyOrderDto {
  enum OrderPayerType {
    CASH = 'CASH',
    CARD = 'CARD',
  }

  enum OrderPaymentType {
    SENDER = 'SENDER',
    RECIPIENT = 'RECIPIENT',
  }

  class OrderChargeItemInput {
    @ApiPropertyOptional({ type: Boolean, description: 'Charge payer sender and paid false!', required: true })
    paid: boolean

    @ApiProperty({ type: Number, required: true, minimum: 0 })
    charge: number

    @ApiProperty({ enum: OrderPayerType })
    type: OrderPayerType

    @ApiProperty({ enum: OrderPaymentType })
    payer: OrderPaymentType
  }

  enum PointType {
    COORDINATE = 'COORDINATE',
    PUP = 'PUP',
    DC = 'DC',
    POSTAMAT = 'POSTAMAT',
  }

  class OrderGroupInput {
    @ApiProperty({ type: String, required: true })
    id: string

    @ApiProperty({ type: Number, minimum: 0 })
    deliveryPrice: number

    @ApiProperty({ type: Boolean, required: true })
    isTogether: boolean

    @ApiProperty({ type: [String], required: true, minLength: 1 })
    orderIds: string[]
  }

  class OrderDimensionsInput {
    @ApiProperty({ type: Number, minimum: 1 })
    weight: number

    @ApiProperty({ type: Number, minimum: 1 })
    width: number

    @ApiProperty({ type: Number, minimum: 1 })
    length: number

    @ApiProperty({ type: Number, minimum: 1 })
    height: number
  }

  class Hours {
    from: Date
    to: Date
  }

  class WorkingDaysInput {
    @ApiProperty({ type: Date })
    date: Date

    @ApiProperty({ type: () => Hours, isArray: true })
    hours: Hours[]
  }

  class OrderCoordinateInput {
    @ApiProperty()
    latitude: number

    @ApiProperty()
    longitude: number
  }

  class OrderRecipientInput implements OMS.Order.CreateRecipientRequest {
    @ApiProperty()
    name: string

    @ApiProperty({ enum: DeliveryAddressType })
    addressType: DeliveryAddressType

    @ApiProperty({ enum: PointType })
    pointType: PointType

    @ApiProperty({ type: String, nullable: true })
    // @ValidateIf((o: OrderRecipientInput) => o.pointType !== PointType.COORDINATE)
    pointId: string | undefined

    @ApiProperty({ type: () => OrderCoordinateInput, nullable: true })
    // @ValidateIf((o: OrderRecipientInput) => o.pointType === PointType.COORDINATE)
    coordinate: OrderCoordinateInput | undefined

    @ApiProperty({ type: [String] })
    phones: string[]

    @ApiPropertyOptional({ type: String, description: 'email can be string or undefined' })
    email: string | undefined

    @ApiPropertyOptional({ type: String, description: 'apartment can be string or undefined' })
    apartment: string | undefined

    @ApiPropertyOptional({ type: String, description: 'street can be string or undefined' })
    street: string | undefined

    @ApiPropertyOptional({ type: String, description: 'landmark can be string or undefined' })
    landmark: string | undefined
  }

  class OrderSenderInput {
    @ApiProperty()
    name: string

    @ApiProperty({ enum: DeliveryAddressType })
    addressType: DeliveryAddressType

    @ApiProperty({ enum: PointType })
    pointType: PointType

    @ApiPropertyOptional({ type: String, description: 'pointId can be UUID or undefined' })
    pointId: string | undefined

    @ApiProperty({ type: () => OrderCoordinateInput })
    coordinate: OrderCoordinateInput | undefined

    @ApiProperty({ type: [String] })
    phones: string[]

    email: string | undefined

    @ApiPropertyOptional({ type: String, description: 'apartment can be string or undefined' })
    apartment: string

    @ApiPropertyOptional({ type: String, description: 'street can be string or undefined' })
    street: string | undefined

    @ApiPropertyOptional({ type: String, description: 'landmark can be string or undefined' })
    landmark: string | undefined

    @ApiProperty({ type: () => WorkingDaysInput, isArray: true })
    workingDays: WorkingDaysInput[]
  }

  export class OrderDto implements Omit<OMS.Order.CreateRequest, 'groupId'> {
    @ApiProperty()
    deliveryPrice: any

    @ApiProperty()
    orders: any

    @ApiProperty()
    companyId: string

    @ApiProperty()
    externalId: string

    @ApiProperty()
    externalNumber?: string

    @ApiProperty({ type: () => OrderSenderInput })
    sender: OrderSenderInput

    @ApiProperty({ type: () => OrderRecipientInput })
    recipient: OrderRecipientInput

    @ApiProperty({ type: Date })
    deliveryStartAt: Date

    @ApiProperty()
    groupId: string

    @ApiProperty({ type: () => OrderDimensionsInput })
    dimensions: OrderDimensionsInput

    @ApiProperty({ type: () => OrderChargeItemInput, isArray: true })
    // @ValidateNested({ each: true })
    // @Type(() => OrderChargeItemInput)
    chargeItems: OrderChargeItemInput[]

    @ApiPropertyOptional({ type: () => OrderGroupInput, description: 'Order id is not in orders ids' })
    // @IsObject()
    // @ValidateGroup('externalId', { message: 'Order id is not in orders ids' })
    group: OrderGroupInput

    @ApiProperty({ enum: OrderRecipientNotAvailable })
    recipientNotAvailable: OrderRecipientNotAvailable

    @ApiProperty({ type: Boolean })
    fragile: boolean

    @ApiPropertyOptional({ type: [String], description: 'images can be string or undefined' })
    images: string[]

    @ApiPropertyOptional({ type: [String], description: 'note can be string or undefined' })
    note: string

    @ApiProperty()
    name: string

    @ApiProperty({ type: Number, maximum: 2 })
    factor: number

    @ApiProperty()
    price: number

    @ApiProperty()
    secretCode: string

    @ApiPropertyOptional()
    properties?: string
  }

  export class ChargeItems {
    @ApiProperty({ enum: OrderPayerType })
    type: OrderPayerType

    @ApiProperty()
    charge: number
  }

  export class GiveOrder implements Omit<WMS.Order.GiveOrderRequest, 'userId' | 'dcId' | 'orderId'> {
    @ApiProperty()
    secretCode: string

    @ApiProperty()
    cash: number
  }

  export class ChangeDimension implements Omit<OMS.Order.DimensionChangeRequest, 'orderId'> {
    @ApiProperty()
    height: number

    @ApiProperty()
    length: number

    @ApiProperty()
    weight: number

    @ApiProperty()
    width: number
  }

  export class OrderSetCode implements Omit<WMS.Order.SetCodeRequest, 'orderId' | 'storageId' | 'userId'> {
    @ApiProperty()
    code: string
  }
}
