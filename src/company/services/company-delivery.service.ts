import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { getDataTypes, getMultiplyDataTypes } from '../../helpers/db.helper'
import { format } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'
import { paginate } from '../../helpers/pagination'

@Injectable()
export class CompanyDeliveryService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrderDeliveriesByPoolId(poolId: string, page: number, perPage: number) {
    const count: number = await this.prisma.orderDelivery.count({ where: { poolId }})
    const paginationResult = await paginate(count, page, perPage)

    const data = await this.prisma.orderDelivery.findMany({
      where: {
        poolId,
      },
      skip: paginationResult.offset,
      take: paginationResult.perPage,
    })

    return {
      data: data,
      fields: await getDataTypes(this.prisma, 'order_delivery'),
      ...paginationResult,
    }
  }

  async timeOfDeliveries(companyId: string, tz: string, page: number, perPage: number) {
    const count: number = await this.prisma.timeOfDelivery.count({ where: { companyId } })
    const paginationResult = await paginate(count, page, perPage)
    const data = await this.prisma.timeOfDelivery.findMany({
      where: { companyId },
      skip: paginationResult.offset,
      take: paginationResult.perPage,
    })

    return {
      data: data.map((timeOfDelivery) => ({
        id: timeOfDelivery.id,
        from: format(utcToZonedTime(timeOfDelivery.from.setFullYear(2000), tz), 'HH:mm'),
        to: format(utcToZonedTime(timeOfDelivery.to.setFullYear(2000), tz), 'HH:mm'),
      })),
      fields: await getMultiplyDataTypes({
        prisma: this.prisma,
        tableName: 'time_of_delivery',
        excludes: ['company_id'],
        relation: [],
      }),
      ...paginationResult,
    }
  }

  async timeOfDelivery(id: string, tz: string) {
    const data = await this.prisma.timeOfDelivery.findUnique({
      where: { id: id },
    })

    return {
      data: {
        id: data.id,
        from: format(utcToZonedTime(data.from.setFullYear(2000), tz), 'HH:mm'),
        to: format(utcToZonedTime(data.from.setFullYear(2000), tz), 'HH:mm'),
      },
      fields: await getMultiplyDataTypes({
        prisma: this.prisma,
        tableName: 'time_of_delivery',
        excludes: ['company_id'],
        relation: [],
      }),
    }
  }
}
