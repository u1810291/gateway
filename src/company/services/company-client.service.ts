import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { getDataTypes } from '../../helpers/db.helper'
import { paginate } from '../../helpers/pagination'

@Injectable()
export class CompanyClientService {
  constructor(private readonly prisma: PrismaService) {}

  async clientFindAll(page: number, perPage: number) {
    const count: number = await this.prisma.companyClient.count()
    const paginationResult = await paginate(count, page, perPage)
    const data = await this.prisma.companyClient.findMany({
      skip: paginationResult.offset,
      take: paginationResult.perPage
    })

    return {
      data,
      fields: await getDataTypes(this.prisma, 'company_client'),
      ...paginationResult,
    }
  }

  async findOne(clientId: string) {
    const data = await this.prisma.companyClient.findUnique({
      select: {
        id: true,
        name: true,
        timezone: true,
        webhookUrl: true,
        companyId: true,
        createdAt: true,
      },
      where: { id: clientId },
    })

    return {
      data: data,
      fields: await getDataTypes(this.prisma, 'company_client'),
    }
  }
}
