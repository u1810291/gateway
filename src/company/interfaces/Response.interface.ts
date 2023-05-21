import { OrderDeliveryStatus, PointType, OrderStatus, Prisma } from '@prisma/client'
import { OMS } from '@slp/shared'
export namespace PointsOrdersResponse {
    export interface From {
        id: string
        zoneId: string
        sourceId: string
        type: PointType
        latitude: Prisma.Decimal
        longitude: Prisma.Decimal
    }

    export interface To {
        id: string
        zoneId: string
        sourceId: string
        type: PointType
        latitude: Prisma.Decimal
        longitude: Prisma.Decimal
    }

    export interface Hour {
        to: string
        from: string
    }

    export interface WorkingDay {
        date: Date
        hours: Hour[]
    }

    export interface Sender {
        name: string
        street: string
        coordinate: string
    }

    export interface Recipient {
        name: string
        street: string
        coordinate: string
    }

    export interface Order {
        id: string
        name: string
        number: number
        images: string[]
        status: OrderStatus
        sender: Sender
        recipient: Recipient
    }

    export interface Group {
        mileType: string
        id: string
        status: OrderDeliveryStatus
        from: From
        to: To
        order: Order
    }

    export interface Point {
        group: Group[]
        actionButton?: OMS.CourierOrderDetail.ActionButton[]
        time: string
        name: string
        status: 'ACTIVE' | 'PENDING'
        actionType: 'Take' | 'Give'
        coordinate: string
        coordinateName: string
        count: number
        countDelivered: number
        phone: string
    }
}
