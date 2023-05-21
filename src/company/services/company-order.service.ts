import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { getMultiplyDataTypes } from '../../helpers/db.helper'
import { convert } from '../../helpers/object.helper'
import { OMS } from '@slp/shared'
import { isNumber, isUUID } from 'class-validator'
import { OrderFilterDto } from '../dto/order-filter.dto'
import { paginate } from '../../helpers/pagination'

@Injectable()
export class CompanyOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async replaceStorageId(data: OMS.Order.CreateRequest) {
    if (isNumber(+data.recipient.pointId) && !isUUID(data.recipient.pointId)) {
      const recipientPoint = await this.prisma.selloPoint.findUnique({
        where: { id: +data.recipient.pointId },
        select: { storage: { select: { id: true } } },
      })

      if (!recipientPoint) {
        throw new NotFoundException('Storage not found')
      }
      data.recipient.pointId = recipientPoint.storage.id
    }

    for (const order of data.orders) {
      if (isNumber(+order.sender.pointId) && !isUUID(order.sender.pointId)) {
        const senderPoint = await this.prisma.selloPoint.findUnique({
          where: { id: +order.sender.pointId },
          select: { storage: { select: { id: true } } },
        })

        if (!senderPoint) {
          throw new NotFoundException('Storage not found')
        }
        order.sender.pointId = senderPoint.storage.id
      }
    }

    return data
  }

  async getOrders(companyId: string, dto: OrderFilterDto) {

    const count: number = await this.prisma.order.count({
      where: {
        companyId,
        status: dto.status,
        externalNumber: dto.externalNumber,
        number: dto.number ? Number(dto.number) : undefined,
        pool: {
          number: dto.poolNumber ? Number(dto.poolNumber) : undefined,
        },
        sender: {
          dcId: dto.senderDcId,
        },
        recipient: {
          dcId: dto.recipientDcId,
        },
        createdAt: {
          gte: dto.from,
          lte: dto.to,
        },
      }
    })

    const paginationResult = await paginate(count, dto.page, dto.perPage)

    const data = await this.prisma.order.findMany({
      where: {
        companyId,
        status: dto.status,
        externalNumber: dto.externalNumber,
        number: dto.number ? Number(dto.number) : undefined,
        pool: {
          number: dto.poolNumber ? Number(dto.poolNumber) : undefined,
        },
        sender: {
          dcId: dto.senderDcId,
        },
        recipient: {
          dcId: dto.recipientDcId,
        },
        createdAt: {
          gte: dto.from,
          lte: dto.to,
        },
      },
      include: {
        sender: true,
        recipient: true,
        pool: true,
        orderDeliveries: {
          select: {
            route: {
              select: {
                number: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: paginationResult.offset,
      take: paginationResult.perPage,
    })

    const fields = await getMultiplyDataTypes({
      prisma: this.prisma,
      tableName: 'order',
      excludes: ['cell_code'],
      relation: [
        {
          prisma: this.prisma,
          tableName: 'sender',
          excludes: ['working_days'],
          relation: [],
        },
        {
          prisma: this.prisma,
          tableName: 'recipient',
          excludes: [],
          relation: [],
        },
        {
          prisma: this.prisma,
          tableName: 'pool',
          excludes: ['id', 'company_id', 'code', 'from', 'to', 'status', 'storage_id', 'created_at', 'updated_at'],
          relation: [],
        },
      ],
    })

    fields.push({
      name: 'routeNumber',
      title: 'routeNumber',
      type: 'string',
      sort: true,
      facet: false,
      search: false,
      values: null,
    })

    return {
        data: data.map((order) => {
          order['routeNumber'] = order.orderDeliveries[order.orderDeliveries.length -1]?.route?.number
          return convert(order, '',  ['dimensions', 'deliveryStartAt', 'createdAt', 'updatedAt']);
        }),
        ...paginationResult,
        fields: fields,
      }
  }

  async getOrderDetail(orderId: string) {
    const data = await this.prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { sender: true, recipient: true, dimension: true },
    })

    const storage = await this.prisma.storage.findUniqueOrThrow({
      where: {
        id: data.recipient.dcId
      }
    })

    data['senderName']=`Sello ${storage.name}`

    return {
      data: data,
    }
  }

  async getOrderByCode(code: string) {
    const data = await this.prisma.order.findUniqueOrThrow({
      where: { code: code },
      select: {
        number: true,
        name: true,
        images: true,
        dimension: true,
      },
    })

    return { data }
  }

  async getOrderByExternalId(externalNumber: string) {
    return await this.prisma.order.findFirstOrThrow({
      where: {
        externalNumber: externalNumber,
      },
    })
  }

  async getOrderPropertiesByOrderId(orderId: string) {
    return await this.prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      select: { properties: true },
    })
  }
}
