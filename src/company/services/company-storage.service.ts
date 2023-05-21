import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { getDataTypes } from '../../helpers/db.helper'
import { OrderStatus, StorageType } from '@prisma/client'
import { BoxSuggestion } from '../dto/box-suggestion'
import { CodeSuggestion, OrderDto } from '../dto/code-suggestion'
import { paginate } from '../../helpers/pagination'

@Injectable()
export class CompanyStorageService {
  constructor(private readonly prisma: PrismaService) {}

  async getStoragesByCompanyId(companyId: string, page: number, perPage: number) {
    const count: number = await this.prisma.storage.count({ where: { companyId } })
    const paginationResult = await paginate(count, page, perPage)
    const data = await this.prisma.storage.findMany({
      where: {
        companyId,
      },
      skip: paginationResult.offset,
      take: paginationResult.perPage,
    })

    const res = data.map(({ latitude, longitude, ...rest }) => ({
      ...rest,
      coordinate: {
        longitude: longitude,
        latitude: latitude,
      },
    }))

    return {
      data: res,
      fields: await getDataTypes(this.prisma, 'storage'),
      ...paginationResult,
    }
  }

  async getStorageByUserId(userId: string) {
    const storage = await this.prisma.storageWorker.findFirst({
      select: { storage: true },
      where: { userId },
    })

    if (!storage) {
      throw new NotFoundException('Storage not found')
    }

    return storage.storage
  }

  async checkOrderCancel(storageId: string, orderId: string) {
    let pup

    try {
      pup = await this.prisma.storage.findFirstOrThrow({ where: { id: storageId, type: StorageType.PUP } })
    } catch (error) {
      throw new BadRequestException('Pup with id:' + storageId + ' does not exist ')
    }

    try {
      await this.prisma.order.findFirstOrThrow({ where: { storageId: pup.id, id: orderId } })
    } catch (error) {
      throw new BadRequestException('Order with id:' + orderId + ' does not exist in pup: ' + storageId)
    }
  }

  async boxSuggestion(storageId: string) {
    const dc = await this.prisma.storage.findFirstOrThrow({
      where: {
        id: storageId,
        type: StorageType.DC,
      },
    })
    const groups = await this.prisma.orderGroup.findMany({
      where: {
        orders: {
          every: {
            storageId: dc.id,
            status: OrderStatus.RECEIVED,
          },
        },
      },
    })

    const boxSuggestions: BoxSuggestion[] = []
    if (groups.length > 0) {
      let groupOrders
      let orders = []
      for (const group of groups) {
        groupOrders = await this.prisma.order.findMany({
          where: {
            orderGroupId: group.id,
          },
          include: { recipient: true },
        })
        if (groupOrders.length > 0) {
          groupOrders.forEach((order) => {
            orders.push({
              id: order.id,
              code: order.code,
              externalNumber: order.externalNumber,
              name: order.name,
              images: order.images,
            })
          })
          boxSuggestions.push({
            groupId: group.id,
            recipient: {
              phone: groupOrders[0].recipient.phones,
              name: groupOrders[0].recipient.name,
              address: groupOrders[0].recipient.street,
            },
            orders: orders,
          })
        }
        orders = []
      }
    }
    return boxSuggestions
  }

  async codeSuggestion(storageId: string, code: string): Promise<CodeSuggestion> {
    const dc = await this.prisma.storage.findFirstOrThrow({
      where: {
        id: storageId,
        type: StorageType.DC,
      },
    })
    const order = await this.prisma.order.findFirstOrThrow({
      where: {
        storageId: dc.id,
        code,
        status: OrderStatus.RECEIVED,
      },
    })

    const orders = await this.prisma.order.findMany({
      where: {
        orderGroupId: order.orderGroupId,
        status: OrderStatus.RECEIVED,
      },
    })

    const orderDto: OrderDto[] = []
    orders.forEach((order) => {
      orderDto.push({
        code: order.code,
        id: order.id,
      })
    })

    return {
      groupId: order.orderGroupId,
      orders: orderDto,
    }
  }
}
