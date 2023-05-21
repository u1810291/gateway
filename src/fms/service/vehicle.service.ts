import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { getDataTypes } from '../../helpers/db.helper'
import { paginate } from '../../helpers/pagination'

@Injectable()
export class VehicleService {
  constructor(private readonly prisma: PrismaService) {}

  async vehicles(companyId: string, page: number, perPage: number) {
    const count: number = await this.prisma.vehicle.count({ where: { companyId } })
    const paginationResult = await paginate(count, page, perPage)
    const data = await this.prisma.vehicle.findMany({
      where: { companyId },
      skip: paginationResult.offset,
      take: paginationResult.perPage
    })

    return {
      data: data,
      fields: await getDataTypes(this.prisma, 'vehicle'),
      ...paginationResult,
    }
  }

  async findAllLuggage() {
    const [total, data] = await this.prisma.$transaction([
      this.prisma.luggageDimension.count(),
      this.prisma.luggageDimension.findMany(),
    ])

    return {
      data: data,
      fields: await getDataTypes(this.prisma, 'vehicle'),
      totalDocs: total,
      page: 1,
    }
  }

  async findAllAllVehicleMileage() {
    const [total, data] = await this.prisma.$transaction([
      this.prisma.vehicleMileage.count(),
      this.prisma.vehicleMileage.findMany(),
    ])

    return {
      data: data,
      fields: await getDataTypes(this.prisma, 'vehicle_mileage'),
      totalDocs: total,
      page: 1,
    }
  }

  async listModel() {
    const [total, data] = await this.prisma.$transaction([
      this.prisma.vehicleModel.count(),
      this.prisma.vehicleModel.findMany(),
    ])
    return {
      data: data,
      fields: await getDataTypes(this.prisma, 'vehicle_model'),
      totalDocs: total,
      page: 1,
    }
  }

  async listType() {
    const [total, data] = await this.prisma.$transaction([
      this.prisma.vehicleType.count(),
      this.prisma.vehicleType.findMany(),
    ])
    return {
      data: data,
      fields: await getDataTypes(this.prisma, 'vehicle_type'),
      totalDocs: total,
      page: 1,
    }
  }
  async listBodyType() {
    const [total, data] = await this.prisma.$transaction([
      this.prisma.vehicleBodyType.count(),
      this.prisma.vehicleBodyType.findMany(),
    ])
    return {
      data: data,
      fields: await getDataTypes(this.prisma, 'vehicle_body_type'),
      totalDocs: total,
      page: 1,
    }
  }

  async listColour() {
    const [total, data] = await this.prisma.$transaction([
      this.prisma.vehicleColour.count(),
      this.prisma.vehicleColour.findMany(),
    ])
    return {
      data: data,
      fields: await getDataTypes(this.prisma, 'vehicle_colour'),
      totalDocs: total,
      page: 1,
    }
  }

  async listProducer() {
    const [total, data] = await this.prisma.$transaction([
      this.prisma.vehicleProducer.count(),
      this.prisma.vehicleProducer.findMany(),
    ])
    return {
      data,
      fields: await getDataTypes(this.prisma, 'vehicle_producer'),
      totalDocs: total,
      page: 1,
    }
  }
}
