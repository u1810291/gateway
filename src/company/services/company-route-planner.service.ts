import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { getDataTypes } from '../../helpers/db.helper'
import { format } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'
import { paginate } from '../../helpers/pagination'

@Injectable()
export class CompanyRoutePlannerService {
  constructor(private readonly prisma: PrismaService) {}

  async routePlannerList(companyId: string, tz: string, page: number, perPage: number) {
    const count: number = await this.prisma.routePlanner.count({
      where: { companyId },
    })
    const paginationResult = await paginate(count, page, perPage)

    const data = await this.prisma.routePlanner.findMany({
      where: { companyId },
      skip: paginationResult.offset,
      take: paginationResult.perPage,
    })

    return {
      data: data.map((data) => ({
        id: data.id,
        companyId: data.companyId,
        startTime: format(utcToZonedTime(data.startTime.setFullYear(2000), tz), 'HH:mm'),
      })),
      fields: await getDataTypes(this.prisma, 'route_planner'),
      ...paginationResult,
    }
  }

  async routePlannerFindOne(id: string, tz: string) {
    const data = await this.prisma.routePlanner.findFirst({
      where: { id },
    })

    return {
      data: {
        id: data.id,
        companyId: data.companyId,
        startTime: format(utcToZonedTime(data.startTime.setFullYear(2000), tz), 'HH:mm'),
      },
      fields: await getDataTypes(this.prisma, 'route_planner'),
    }
  }
}
