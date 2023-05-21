import { getMultiplyDataTypes } from '../../helpers/db.helper'
import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { OrderDelivery, MileType, PointType, RouteStatus } from '@prisma/client'
import { GeoService } from '../../common/geo/geo.service'
import { convert } from '../../helpers/object.helper'
import { routeFilterDto } from '../dto/route-filter.dto'
import { paginate } from '../../helpers/pagination'

@Injectable()
export class CompanyRouteService {
  constructor(private readonly prisma: PrismaService, private readonly geoService: GeoService) {}

  async getRoutes(companyId: string, dto: routeFilterDto) {
    const count: number = await this.prisma.route.count({
      where: {
        pool: { companyId: companyId },
        number: dto.number,
        status: dto.status,
        createdAt: {
          gte: dto.from,
          lte: dto.to,
        },
      },
    })

    const paginationResult = await paginate(count, dto.page, dto.perPage)
    let data = await this.prisma.route.findMany({
      where: {
        pool: { companyId: companyId },
        number: dto.number,
        status: dto.status,
        createdAt: {
          gte: dto.from,
          lte: dto.to,
        },
      },
      include: { pool: true, storage: true },
      orderBy: {
        createdAt: 'desc',
      },
      skip: paginationResult.offset,
      take: paginationResult.perPage,
    })

    if (dto.active) {
      data = await this.prisma.route.findMany({
        where: {
          pool: { companyId: companyId },
          status: {
            notIn: RouteStatus.DELIVERED,
          },
          number: dto.number,
          createdAt: {
            gte: dto.from,
            lte: dto.to,
          },
        },
        include: { pool: true, storage: true },
        orderBy: {
          createdAt: 'desc',
        },
      })
    }
    const fields = await getMultiplyDataTypes({
      prisma: this.prisma,
      tableName: 'route',
      excludes: ['updated_at'],
      relation: [
        {
          prisma: this.prisma,
          tableName: 'pool',
          relation: [],
          excludes: ['id', 'company_id', 'code', 'status', 'storage_id', 'created_at', 'updated_at'],
        },
      ],
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
      data: data.map((route) => {
        route['name'] = route.storage.name
        return convert(route, '', ['from', 'to', 'latitude', 'longitude', 'createdAt'])
      }),
      fields: fields,
      ...paginationResult,
    }
  }

  async listOrderDelivery(companyId: string, routeId: string, page: number, perPage: number) {
    const count: number = await this.prisma.orderDelivery.count({
      where: {
        routeId,
        route: { pool: { companyId } },
      },
    })

    const paginationResult = await paginate(count, page, perPage)

    const data = await this.prisma.orderDelivery.findMany({
      where: {
        routeId,
        route: {
          pool: {
            companyId,
          },
        },
      },
      include: {
        to: true,
        order: {
          include: {
            sender: true,
            recipient: true,
            documentTTN: {
              select: {
                id: true,
              },
            },
          },
        },
        route: {
          select: {
            number: true,
          },
        },
        from: true,
      },
      skip: paginationResult.offset,
      take: paginationResult.perPage,
    })

    for (const orderDelivery of data) {
      const documentTTN = await this.prisma.documentTTN.findFirst({
        where: {
          orderId: orderDelivery.order.id,
        },
        select: {
          id: true,
        },
      })
      orderDelivery['documentTTNId'] = documentTTN.id
      if (!orderDelivery.documentActId) {
        const documentAct = await this.prisma.documentAct.findFirst({
          where: { orderId: orderDelivery.order.id },
          select: { id: true },
        })
        orderDelivery.documentActId = documentAct.id
      }
    }

    const res = data.map((orderDelivery) => {
      orderDelivery['type'] = orderDelivery.from.type == PointType.DC ? 'GIVE' : 'TAKE'
      return convert(orderDelivery, '', ['to', 'from', 'dimensions', 'deliveryStartAt'])
    })

    const fields = await getMultiplyDataTypes({
      prisma: this.prisma,
      tableName: 'order_delivery',
      excludes: ['route_id'],
      relation: [
        {
          prisma: this.prisma,
          tableName: 'order',
          excludes: [
            'id',
            'pool_id',
            'external_id',
            'storage_id',
            'images',
            'company_id',
            'order_group_id',
            'sender_id',
            'recipient_id',
            'is_canceled',
            'box_id',
            'external_number',
            'updated_at',
            'created_at',
            'note',
            'fragile',
            'code',
            'cell_code',
          ],
          relation: [],
        },
      ],
    })
    fields.push({
      name: 'type',
      title: 'type',
      type: 'string',
      sort: true,
      facet: false,
      search: false,
      values: null,
    })
    fields.push({
      name: 'documentTTNId',
      title: 'documentTTNId',
      type: 'string',
      sort: true,
      facet: false,
      search: false,
      values: null,
    })
    return {
      data: res,
      fields: fields,
      ...paginationResult,
    }
  }

  async getOrdersByRouteId(companyId: string, routeId: string) {
    const data = await this.prisma.route.findFirst({
      select: {
        id: true,
        vehicle: {
          select: {
            driverId: true,
          },
        },
        pool: {
          select: {
            storageId: true,
          },
        },
      },
      where: {
        id: routeId,
        pool: { companyId },
      },
    })

    const driver = await this.prisma.driver.findUniqueOrThrow({
      where: {
        id: data.vehicle.driverId,
      },
      include: {
        user: true,
      },
    })

    if (!driver) {
      throw new NotFoundException('Driver not Found')
    }

    const plateNumber = await this.prisma.vehicle.findUnique({
      where: {
        driverId: driver.id,
      },
      select: {
        plateNumber: true,
      },
    })

    const orderDeliveries = await this.prisma.orderDelivery.findMany({
      select: {
        mileType: true,
        from: {
          select: {
            type: true,
            sourceId: true,
            latitude: true,
            longitude: true,
          },
        },
        order: {
          select: {
            dimension: {
              select: {
                width: true,
                height: true,
                weight: true,
                length: true,
              },
            },
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
      orderBy: {
        position: 'asc',
      },
      where: { routeId },
    })

    const response: any[] = []

    for (const orderDelivery of orderDeliveries) {
      const index = orderDeliveries.indexOf(orderDelivery)
      if (!response.length) {
        if (orderDelivery.from.type === PointType.DC) {
          response.push({
            from: orderDelivery.from,
            to: orderDelivery.to,
            order: orderDelivery.order,
          })
        } else {
          response.push({
            from: orderDelivery.to,
            to: orderDelivery.from,
            order: orderDelivery.order,
          })
        }
      } else {
        const prevItem = response[index - 1]

        if (orderDelivery.from.type === prevItem.to.type) {
          response.push({
            from: prevItem.to,
            to: orderDelivery.from,
            order: orderDelivery.order,
          })
        } else {
          response.push({
            from: prevItem.to,
            to: orderDelivery.to,
            order: orderDelivery.order,
          })
        }
      }

      if (index === orderDeliveries.length - 1) {
        response.push({
          from: response[index].to,
          to: response[0].from,
          order: null,
        })
      }
    }

    const dcData = await this.prisma.storage.findUniqueOrThrow({
      where: {
        id: data.pool.storageId,
      },
    })

    const coordinate = {
      coordinate: { latitude: dcData.latitude.toNumber(), longitude: dcData.longitude.toNumber() },
    }

    const isFirstMile = (orderDelivery: Pick<OrderDelivery, 'mileType'>) =>
      orderDelivery.mileType === MileType.FIRST_MILE

    const matrix = await this.geoService.fetchGeo(coordinate, orderDeliveries, isFirstMile)
    const companySettings = await this.prisma.companySettings.findUniqueOrThrow({ where: { companyId } })

    const totalServe = matrix.routes.reduce((acc, route) => acc + route.duration + companySettings.pointServeTime, 0)
    const totalWeight = orderDeliveries.reduce((acc, orderDelivery) => acc + orderDelivery.order.dimension.weight, 0)
    const totalVolume = orderDeliveries.reduce(
      (acc, orderDelivery) =>
        acc +
        orderDelivery.order.dimension.width *
          orderDelivery.order.dimension.height *
          orderDelivery.order.dimension.length,
      0,
    )
    const totalDistance = matrix.total_distance

    return {
      data: response.map((res) => convert(res, '', ['from', 'to', 'dimensions'])),
      courier: {
        ...driver.user,
        plateNumber: plateNumber?.plateNumber,
      },
      total: {
        weight: totalWeight,
        volume: totalVolume,
        dimensional_weight: totalVolume / companySettings.density,
        distance: totalDistance,
        serve: totalServe,
      },
      page: 1,
    }
  }
}
