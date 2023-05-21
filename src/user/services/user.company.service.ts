import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { getDataTypes, getMultiplyDataTypes } from '../../helpers/db.helper'
import { convert } from '../../helpers/object.helper'

@Injectable()
export class UserCompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async users() {
    const [count, data] = await this.prisma.$transaction([this.prisma.user.count(), this.prisma.user.findMany()])

    return {
      data: data.map((user) => convert(user)),
      fields: await getMultiplyDataTypes({ prisma: this.prisma, tableName: 'users', excludes: [], relation: [] }),
      totalDoc: count,
    }
  }

  async getCompanies(userId: string) {
    const [total, data] = await this.prisma.$transaction([
      this.prisma.userCompany.count({
        where: { userId },
      }),
      this.prisma.userCompany.findMany({
        where: { userId },
      }),
    ])

    return {
      data: data,
      fields: await getDataTypes(this.prisma, 'company'),
      totalDocs: total,
      page: 1,
    }
  }
}
