import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { getDataTypes } from '../../helpers/db.helper'
import { paginate } from '../../helpers/pagination'
@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async getCompanies(page: number, perPage: number) {
    const count: number = await this.prisma.company.count()
    const paginationResult = await paginate(count, page, perPage)
    const data = await this.prisma.company.findMany({
      skip: paginationResult.offset,
      take: paginationResult.perPage
    })
    return {
      data: data,
      fields: await getDataTypes(this.prisma, 'company'),
      ...paginationResult,
    }
  }
}
