import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { getDataTypes } from '../../helpers/db.helper'
import { convert } from '../../helpers/object.helper'
import { paginate } from '../../helpers/pagination'

@Injectable()
export class CompanyImRouteService {
  constructor(private readonly prisma: PrismaService) {}

  async listImRoutes(companyId: string, page: number, perPage: number) {
    const count: number = await this.prisma.imRoute.count({ where: { cargoProvider: { companyId } }})
    const paginationResult = await paginate(count, page, perPage)
    const data = await this.prisma.imRoute.findMany({
      where: { cargoProvider: { companyId } },
      include: {
        fromZone: {
          select: {
            name: true,
          },
        },
        toZone: {
          select: {
            name: true,
          },
        },
        cargoProvider: {
          select: {
            name: true,
          },
        },
        cargoProviderSchedules: true,
      },
      skip: paginationResult.offset,
      take: paginationResult.perPage
    })

    const fields = await getDataTypes(this.prisma, 'im_route', ['from_zone_id', 'to_zone_id', 'cargo_provider_id'])
    fields.push(
      {
        name: 'cargoProvider.name',
        title: 'cargoProvider.name',
        type: 'string',
        sort: true,
        facet: false,
        search: false,
        values: null,
      },
      {
        name: 'fromZone.name',
        title: 'fromZone.name',
        type: 'string',
        sort: true,
        facet: false,
        search: false,
        values: null,
      },
      {
        name: 'toZone.name',
        title: 'toZone.name',
        type: 'string',
        sort: true,
        facet: false,
        search: false,
        values: null,
      },
    )
    return {
      data: data.map((item) => convert(item, '')),
      fields: fields,
      ...paginationResult,
    }
  }

  async detailImRoute(id: string) {
    const data = await this.prisma.imRoute.findUnique({
      where: { id },
    })

    return {
      data: data,
      fields: await getDataTypes(this.prisma, 'im_route'),
    }
  }
}
