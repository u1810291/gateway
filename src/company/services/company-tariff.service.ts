import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { getDataTypes } from '../../helpers/db.helper'
import { paginate } from '../../helpers/pagination'

@Injectable()
export class CompanyTariffService {
  constructor(private readonly prisma: PrismaService) {}

  async tariff(tariffId: string) {
    const data = await this.prisma.tariff.findUnique({
      where: {
        id: tariffId,
      },
    })

    return {
      data: data,
      fields: await getDataTypes(this.prisma, 'tariff'),
    }
  }

  async tariffsByCompany(companyId: string, page: number, perPage: number) {
    const count: number = await this.prisma.tariff.count({ where: { companyId } })
    const paginationResult = await paginate(count, page, perPage)
    const data = await this.prisma.tariff.findMany({
      where: {
        companyId,
      },
      skip: paginationResult.offset,
      take: paginationResult.perPage,
    })

    return {
      data: data,
      fields: await getDataTypes(this.prisma, 'tariff'),
      ...paginationResult,
    }
  }
}
