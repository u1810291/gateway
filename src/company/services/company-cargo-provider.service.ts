import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { getDataTypes, getMultiplyDataTypes } from '../../helpers/db.helper'
import { paginate } from '../../helpers/pagination'

@Injectable()
export class CompanyCargoProviderService {
  constructor(private readonly prisma: PrismaService) {}

  async cargoProviders(companyId: string, page: number, perPage: number) {
    const count: number = await this.prisma.cargoProvider.count({
      where: { companyId: companyId }
    })
    const paginationResult = await paginate(count, page, perPage)
    const data = await this.prisma.cargoProvider.findMany({
      where: { companyId: companyId },
      skip: paginationResult.offset,
      take: paginationResult.perPage,
    })

    return {
      data,
      fields: await getDataTypes(this.prisma, 'cargo_provider'),
      ...paginationResult,
    }
  }

  async cargoProviderPoints(cargoProviderId: string, page: number, perPage: number) {
    const count: number = await this.prisma.cargoProviderPoint.count({ where: { cargoProviderId }})
    const paginationResult = await paginate(count, page, perPage)
    const data = await this.prisma.cargoProviderPoint.findMany({
      where: { cargoProviderId },
      include: { zone: true },
      skip: paginationResult.offset,
      take: paginationResult.perPage,
    })

    const result = data.map((cargoPoint) => {
      cargoPoint['name'] = cargoPoint.zone.name
      return cargoPoint
    })

    const fields = await getMultiplyDataTypes({
      prisma: this.prisma,
      tableName: 'cargo_provider_point',
      excludes: [],
      relation: [],
    })
    fields.push({
      name: 'name',
      title: 'name',
      type: 'string',
      sort: true,
      facet: false,
      search: false,
      values: null,
    })

    return {
      data: result,
      fields: fields,
      ...paginationResult,
    }
  }

  async cargoProviderHolidays(cargoProviderId: string, imRouteId: string, page: number, perPage: number) {
    const count: number = await this.prisma.cargoProviderHoliday.count({ where: { cargoProviderId, imRouteId }})
    const paginationResult = await paginate(count, page, perPage)
    const data = await this.prisma.cargoProviderHoliday.findMany({
      where: { cargoProviderId, imRouteId },
      skip: paginationResult.offset,
      take: paginationResult.perPage,
    })

    return {
      data: data,
      fields: getDataTypes(this.prisma, 'cargo_provider_holiday'),
      ...paginationResult,
    }
  }

  async cargoProviderHoliday(cargoProviderHolidayId: string) {
    const cargoProviderHoliday = await this.prisma.cargoProviderHoliday.findUnique({
      where: { id: cargoProviderHolidayId },
    })

    if (!cargoProviderHoliday) {
      throw new NotFoundException('CargoProviderHoliday  does not found')
    }

    return {
      data: cargoProviderHoliday,
    }
  }
}
