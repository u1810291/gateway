import {Injectable} from '@nestjs/common'
import {PrismaService} from '../../prisma/prisma.service'
import {getDataTypes, getMultiplyDataTypes} from '../../helpers/db.helper'
import {convert} from '../../helpers/object.helper'
import { paginate } from '../../helpers/pagination'

@Injectable()
export class CompanyUserService {
  constructor(private readonly prisma: PrismaService) {}

  async getByUserIdAndTable({ id, name }: { id: string; name: string }) {
    const data = await this.prisma.userTable.findFirst({
      where: { userId: id, table: name },
    })

    return {
      data: data,
      fields: await getDataTypes(this.prisma, 'user_table'),
    }
  }

  async getUsersByCompanyId(companyId: string, page: number, perPage: number) {
    const count: number = await this.prisma.userCompany.count({ where: { companyId }})
    const paginationResult = await paginate(count, page, perPage)
    const data = await this.prisma.userCompany.findMany({
      where: { companyId },
      include: {
        user: true,
      },
      skip: paginationResult.offset,
      take: paginationResult.perPage,
    })

    return {
      data: data.map((data) => convert(data.user)),
      fields: await getMultiplyDataTypes({
        prisma: this.prisma,
        tableName: 'user',
        excludes: [],
        relation: [],
      }),
      ...paginationResult,
    }
  }

  async getUserInfoById(userId: string) {
    const userInfo = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        storageWorker: {
          select: {
            storage: {
              select: {
                code: true,
              },
            },
          },
        },
      },
    })
    let role
    if (userInfo.roleId){
    role = await this.prisma.companyRole.findFirst({
      where: {
        roleId: userInfo.roleId
      }
    })}
    return {
      data: {...userInfo, roleName: role? role.name: null},
    }
  }
}
