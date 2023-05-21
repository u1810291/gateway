import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { getMultiplyDataTypes } from '../../helpers/db.helper'
import { MileType } from '@slp/shared'
import { Pool, OrderDelivery, PointType, Prisma } from '@prisma/client'
import { GeoService } from '../../common/geo/geo.service'
import { convert } from '../../helpers/object.helper'
import { poolFilterDto } from '../dto/pool-filter.dto'
import { paginate } from '../../helpers/pagination'

@Injectable()
export class CompanyPoolService {
  constructor(private readonly prisma: PrismaService, private readonly geoService: GeoService) {}

  async getPools(companyId: string, dto: poolFilterDto) {
    const count: number = await this.prisma.pool.count({
      where: {
        companyId: companyId,
        status: dto.status,
        storage: {
          name: dto.storageName,
        },
        createdAt: {
          gte: dto.from,
          lte: dto.to,
        }
      }
    })

    const paginationResult = await paginate(count, dto.page, dto.perPage)

    const data = await this.prisma.pool.findMany({
      include: { storage: true },
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        companyId: companyId,
        status: dto.status,
        storage: {
          name: dto.storageName,
        },
        createdAt: {
          gte: dto.from,
          lte: dto.to,
        },
      },
      skip: paginationResult.offset,
      take: paginationResult.perPage,
    })

    return {
      data: data.map((pool) => convert(pool, '', ['from', 'to', 'latitude', 'longitude', 'createdAt'])),
      fields: await getMultiplyDataTypes({
        prisma: this.prisma,
        tableName: 'pool',
        excludes: ['company_id', 'updated_at'],
        relation: [
          {
            prisma: this.prisma,
            tableName: 'storage',
            excludes: [
              'id',
              'company_id',
              'code',
              'address',
              'type',
              'status',
              'status',
              'tz',
              'latitude',
              'longitude',
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

  async getOrdersByPoolId(companyId: string, id: string, page: number, perPage: number) {
    const pool = await this.prisma.pool.findFirstOrThrow({
      where: { id, companyId },
      select: {
        storageId: true,
        orderDeliveries: {
          select: {
            orderDelivery: {
              select: {
                id: true,
                routeId: true,
                status: true,
                documentActId: true,
                order: {
                  select: {
                    dimension: true,
                    id: true,
                    name: true,
                    number: true,
                    deliveryStartAt: true,
                    recipientId: true,
                    recipient: {
                      select: {
                        name: true,
                        email: true,
                        street: true,
                        apartment: true,
                        coordinate: true,
                        addressType: true,
                        pointType: true,
                        pointId: true,
                        dcId: true,
                        zoneId: true,
                      },
                    },
                    senderId: true,
                    sender: {
                      select: {
                        name: true,
                        addressType: true,
                        pointType: true,
                        pointId: true,
                        coordinate: true,
                        landmark: true,
                        street: true,
                        email: true,
                        dcId: true,
                        zoneId: true,
                        workingDays: true,
                      },
                    },
                  },
                },
                orderId: true,
                mileType: true,
                route: {
                  select: {
                    number: true,
                  },
                },
                from: {
                  select: {
                    type: true,
                    sourceId: true,
                    latitude: true,
                    longitude: true,
                  },
                },
                to: {
                  select: {
                    type: true,
                    sourceId: true,
                    latitude: true,
                    longitude: true,
                  },
                },
              },
            },
          },
          where: {
            poolId: id,
          },
        },
      },
    })

    for (const poolOrderDelivery of pool.orderDeliveries) {
      if (!poolOrderDelivery.orderDelivery.documentActId) {
        const documentActId = await this.prisma.documentAct.findFirst({
          where: {
            orderId: poolOrderDelivery.orderDelivery.order.id,
          },
          select: { id: true },
        })
        poolOrderDelivery.orderDelivery.documentActId = documentActId.id
      }
    }

    const dcData = await this.prisma.storage.findUniqueOrThrow({
      where: { id: pool.storageId },
    })

    const coordinate = {
      coordinate: { latitude: dcData.latitude.toNumber(), longitude: dcData.longitude.toNumber() },
    }

    const isFirstMile = (orderDelivery: Pick<OrderDelivery, 'mileType'>) =>
      orderDelivery.mileType === MileType.FIRST_MILE

    const matrix = await this.geoService.fetchGeo(coordinate, pool.orderDeliveries, isFirstMile)
    const companySettings = await this.prisma.companySettings.findUniqueOrThrow({
      where: {
        companyId,
      },
    })

    const totalServe = matrix.routes.reduce((acc, route) => acc + route.duration + companySettings.pointServeTime, 0)
    const totalWeight = pool.orderDeliveries.reduce(
      (acc, poolOrderDelivery) => acc + poolOrderDelivery.orderDelivery.order.dimension.weight,
      0,
    )
    const totalVolume = pool.orderDeliveries.reduce(
      (acc, poolOrderDelivery) =>
        acc +
        poolOrderDelivery.orderDelivery.order.dimension.width *
          poolOrderDelivery.orderDelivery.order.dimension.height *
          poolOrderDelivery.orderDelivery.order.dimension.length,
      0,
    )
    const totalDistance = matrix.total_distance

    const fields = await getMultiplyDataTypes({
      prisma: this.prisma,
      tableName: 'order_delivery',
      excludes: ['route_id', 'pool_id', 'from_point_id', 'to_point_id'],
      relation: [
        {
          prisma: this.prisma,
          tableName: 'order',
          excludes: [
            'external_number',
            'external_id',
            'box_id',
            'is_canceled',
            'dimension_id',
            'price',
            'factor',
            'updated_at',
            'created_at',
            'note',
            'status',
            'fragile',
            'recipient_not_available',
            'company_id',
            'cell_code',
            'code',
            'storage_id',
            'order_group_id',
            'pool_id',
          ],
          relation: [],
        },
      ],
    })

    fields.push({
      name: 'actionType',
      title: 'actionType',
      type: 'string',
      sort: true,
      facet: true,
      search: false,
      values: null,
    })

    fields.push({
      name: 'order.recipient.street',
      title: 'order.recipient.street',
      type: 'string',
      sort: true,
      facet: true,
      search: false,
      values: null,
    })

    const data = pool.orderDeliveries.map((poolOrderDelivery) => {
      if (
        poolOrderDelivery.orderDelivery.to.type === PointType.DC ||
        poolOrderDelivery.orderDelivery.to.type === PointType.PUP
      ) {
        poolOrderDelivery.orderDelivery['actionType'] = 'GIVE'
      } else {
        poolOrderDelivery.orderDelivery['actionType'] = 'TAKE'
      }

      return convert(poolOrderDelivery.orderDelivery, '', ['to', 'from', 'dimensions', 'phones', 'deliveryStartAt'])
    })
    const totalDocs = data.length
    return {
      data: data.splice((page - 1) * perPage, perPage),
      total: {
        weight: totalWeight,
        volume: totalVolume,
        dimensional_weight: totalVolume / companySettings.density,
        distance: totalDistance,
        serve: totalServe,
      },
      fields: fields,
      totalDocs: totalDocs,
      totalPages: Math.ceil(totalDocs / perPage),
      page,
    }
  }
}
