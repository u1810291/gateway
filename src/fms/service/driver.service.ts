import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { getDataTypes, getMultiplyDataTypes } from '../../helpers/db.helper'
import { convert } from '../../helpers/object.helper'
import { paginate } from '../../helpers/pagination'
import { DriverDto } from '../dto/driver.dto'

@Injectable()
export class DriverService {
  constructor(private readonly prisma: PrismaService) {}

  async drivers(query: DriverDto.DriverFilterDto) {
    const count: number = await this.prisma.driver.count({})
    const paginationResult = await paginate(count, query.page, query.perPage)
    const data = await this.prisma.driver.findMany({
      select: {
        id: true,
        licenseNumber: true,
        licenseExpireDate: true,
        idCardExpireDate: true,
        idCardNumber: true,
        photo: true,
        status: true,
        dcId: true,
        createdAt: true,
        updatedAt: true,
        callerId: true,
        callerPassword: true,
        vehicle: true,
        user: true,
      },
      skip: paginationResult.offset,
      take: paginationResult.perPage,
    })

    return {
      data: data.map((driver) => convert(driver, '', ['licenseExpireDate', 'idCardExpireDate', 'created'])),
      fields: await getMultiplyDataTypes({
        prisma: this.prisma,
        tableName: 'driver',
        excludes: [],
        relation: [
          { prisma: this.prisma, tableName: 'user', excludes: [], relation: [] },
          { prisma: this.prisma, tableName: 'vehicle', excludes: [], relation: [] },
          {
            prisma: this.prisma,
            tableName: 'storage',
            excludes: [
              'id',
              'code',
              'address',
              'latitude',
              'longitude',
              'type',
              'status',
              'tz',
              'company_id',
              'zone_id',
              'created_at',
              'updated_at',
            ],
            relation: [],
          },
        ],
      }),
      ...paginationResult,
    }
  }

  async driver(userId: string) {
    const data = await this.prisma.driver.findUniqueOrThrow({
      where: { id: userId },
    })

    return {
      data: data,
      fields: await getDataTypes(this.prisma, 'driver'),
    }
  }

  async availableDrivers() {
    return await this.prisma.driver.findMany({
      where: {
        vehicleId: null,
      },
    })
  }

  async checkDc(dcId: string) {
    const storage = await this.prisma.storage.findUniqueOrThrow({ where: { id: dcId }, select: { type: true } })
    if (storage.type === 'PUP') throw new NotFoundException('Storage is PUP')
  }
}
