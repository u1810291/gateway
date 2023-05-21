import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { OMS } from '@slp/shared'
import { PrismaService } from '../../prisma/prisma.service'
import { MileType, OrderDeliveryStatus, PointType, RouteStatus } from '@prisma/client'
import { PointsOrdersResponse } from '../interfaces/Response.interface'
import { getDataTypes } from '../../helpers/db.helper'

@Injectable()
export class CompanyCourierService {
  constructor(private readonly prisma: PrismaService) {}

  async getCourierRoutesOrders(courierId: string, filterQuery: string) {
    const vehicle = await this.prisma.vehicle.findUniqueOrThrow({
      where: { driverId: courierId },
    })

    const driver = await this.prisma.driver.findUnique({
      where: {
        id: courierId,
      },
    })
    if (!driver) {
      throw new BadRequestException('Courier not found')
    }

    let inActiveStatuses = []

    if (filterQuery) inActiveStatuses = filterQuery.split(',')

    const routes = await this.prisma.route.findMany({
      select: {
        id: true,
        number: true,
        status: true,
        pool: {
          select: {
            from: true,
            to: true,
          },
        },
        orderDeliveries: {
          select: {
            id: true,
            status: true,
            order: {
              select: {
                id: true,
                number: true,
                images: true,
                sender: {
                  select: {
                    name: true,
                    street: true,
                    coordinate: true,
                  },
                },
                recipient: {
                  select: {
                    name: true,
                    street: true,
                    coordinate: true,
                  },
                },
              },
            },
          },
        },
      },
      where: {
        vehicleId: vehicle.id,
        status: {
          notIn: inActiveStatuses,
        },
      },
      orderBy: { number: 'desc' },
    })
    const orderDeliveryCount = routes.reduce((acc, order) => acc + order.orderDeliveries?.length, 0)

    const response = routes.map((item) => ({
      ...item,
      shiftDate: driver.updatedAt,
      pool: {
        from: item.pool.from.getTime(),
        to: item.pool.to.getTime(),
      },
      totalOrders: item.orderDeliveries.filter((el) => el).length,
      deliveredOrders: item.orderDeliveries.filter((el) => el.status === 'DELIVERED').length,
    }))

    return {
      data: {
        routes: response,
        totalDocks: routes.length,
        page: 1,
        totalOrdersCount: orderDeliveryCount,
      },
    }
  }

  async pointOrders(id: string) {
    const route = await this.prisma.route.findUnique({
      where: { id },
      select: {
        storage: {
          select: {
            zoneId: true,
          },
        },
        status: true,
        pool: {
          select: {
            from: true,
            to: true,
          },
        },
        orderDeliveries: {
          select: {
            mileType: true,
            id: true,
            status: true,
            from: true,
            to: true,
            order: {
              select: {
                id: true,
                name: true,
                number: true,
                images: true,
                status: true,
                sender: {
                  select: {
                    name: true,
                    phones: true,
                    street: true,
                    coordinate: true,
                    workingDays: {
                      include: {
                        hours: true,
                      },
                    },
                  },
                },
                recipient: {
                  select: {
                    name: true,
                    street: true,
                    coordinate: true,
                    phones: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    const actionButtons: OMS.CourierOrderDetail.ActionButton[] = []

    if (
      route.status === RouteStatus.ROUTED &&
      route.orderDeliveries.some(
        (orderDelivery) =>
          orderDelivery.mileType === MileType.FIRST_MILE ||
          (orderDelivery.mileType === MileType.LAST_MILE &&
            orderDelivery.status === OrderDeliveryStatus.ROUTED &&
            RouteStatus.ROUTED),
      )
    ) {
      actionButtons.push({ action: 'COURIER_ROUTE_ACCEPTED', title: 'принять' })
    } else if (
      route.status === RouteStatus.COURIER_ACCEPTED &&
      route.orderDeliveries.some((el) => el.mileType === MileType.FIRST_MILE)
    ) {
      actionButtons.push({ action: 'COURIER_ON_WAY', title: 'курьер в пути' })
    }

    const getGroupEl = async (arr) => {
      const map = arr.reduce((r, i) => {
        const text = `${i.to.latitude}${i.to.longitude}${i.from.latitude}${i.from.longitude}`
        r[text] = r[text] || []
        r[text].push(i)
        return r
      }, {})

      const arr1: PointsOrdersResponse.Point[] = []
      const toDc = []
      const fromDc = []

      for (const key of route.orderDeliveries) {
        if (key.mileType === MileType.FIRST_MILE) {
          toDc.push(key)
        } else if (key.mileType === MileType.LAST_MILE) {
          fromDc.push(key)
        }
      }

      if (toDc.length) {
        const id = toDc.at(0).to.sourceId
        const storage = await this.prisma.storage.findUniqueOrThrow({ where: { id } })
        const result: PointsOrdersResponse.Point = {
          group: toDc,
          coordinateName: storage.address,
          coordinate: `${storage.latitude},${storage.longitude}`,
          name: storage.name,
          phone: storage?.phone,
          actionType: 'Give',
          count: toDc.length,
          countDelivered: toDc.filter((el) => el.status === OrderDeliveryStatus.DELIVERED).length,
          time: '09:00 до 18:00',
          status:
            toDc.length === toDc.filter((el) => el.status === OrderDeliveryStatus.COURIER_TOOK).length
              ? 'ACTIVE'
              : 'PENDING',
        }
        arr1.push(result)
      }
      if (fromDc.length) {
        const id2 = fromDc[0].from.sourceId
        const storage2 = await this.prisma.storage.findUniqueOrThrow({ where: { id: id2 } })
        const result2: PointsOrdersResponse.Point = {
          group: fromDc,
          coordinateName: storage2.address,
          coordinate: `${storage2.latitude},${storage2.longitude}`,
          name: storage2.name,
          phone: storage2?.phone,
          actionType: 'Take',
          count: fromDc.length,
          countDelivered: fromDc.filter((el) => el.status !== OrderDeliveryStatus.ROUTED).length,
          time: '09:00 до 18:00',
          status:
            fromDc.length === fromDc.filter((el) => el.status === OrderDeliveryStatus.ROUTED).length
              ? 'ACTIVE'
              : 'PENDING',
        }
        arr1.push(result2)
      }

      for (const key in map) {
        const group = map[key]
        const groupActionButtons = []
        if (
          (route.status === RouteStatus.COURIER_ON_WAY &&
            group.some((orderDelivery) => orderDelivery.status === OrderDeliveryStatus.ROUTED) &&
            group.some((orderDelivery) => orderDelivery.mileType === MileType.FIRST_MILE)) ||
          (group.some((orderDelivery) => orderDelivery.status === OrderDeliveryStatus.COURIER_TOOK) &&
            group.some((orderDelivery) => orderDelivery.mileType === MileType.LAST_MILE))
        ) {
          groupActionButtons.push({ action: 'COURIER_ON_POINT', title: 'прибыли' })
        }

        const res: PointsOrdersResponse.Point = {
          group,
          actionButton: groupActionButtons,
          time: '09:00 до 18:00',
          name: 'name',
          phone: group[0].order.sender.phones[0],
          actionType: 'Give',
          coordinate: `${group[0].order.sender.coordinate.latitude},${group[0].order.sender.coordinate.longitude}`,
          coordinateName: group.some((l) => l.mileType === MileType.FIRST_MILE)
            ? group.at(0).from.sourceId
            : group.at(0).to.sourceId,
          count: group.length,
          countDelivered: group.filter((f) => f.status === 'DELIVERED').length,
          status:
            group.filter((k) => k.status === OrderDeliveryStatus.COURIER_ON_POINT).length > 0 ? 'ACTIVE' : 'PENDING',
        }

        if (group.some((key) => key.mileType === MileType.FIRST_MILE)) {
          if (group.every((el) => el.from.type === PointType.CARGO)) {
            const id = group.at(0).from.sourceId
            const cargo = await this.prisma.cargoProviderPoint.findUniqueOrThrow({
              where: { id },
              include: { cargoProvider: { select: { phone: true } }, zone: { select: { name: true } } },
            })
            res.name = 'Cargo provider'
            res.actionType = 'Take'
            res.coordinateName = 'Cargo provider ' + cargo.zone.name
            res.phone = cargo.cargoProvider.phone
            res.coordinate = `${cargo.longitude},${cargo.latitude}`
            res.time = '09:00 до 18:00'
            res.status =
              group.filter((el) => el.status === OrderDeliveryStatus.ROUTED).length > 0 ? 'ACTIVE' : 'PENDING'
            res.count = group.length
            res.countDelivered = group.filter((el) => el.status === OrderDeliveryStatus.DELIVERED).length
          } else {
            const id: string = group.at(0).from.sourceId
            const sender = await this.prisma.sender.findUniqueOrThrow({ where: { id } })
            res.coordinate = sender.coordinate
            res.coordinateName = sender.street
            res.phone = sender?.phones?.join()
            res.name = sender.name
            res.time = ``
            res.actionType = 'Take'
            res.status =
              group.filter(
                (el) => el.status === OrderDeliveryStatus.ROUTED || el.status === OrderDeliveryStatus.COURIER_ON_POINT,
              ).length > 0
                ? 'ACTIVE'
                : 'PENDING'
            res.count = group.length
            res.countDelivered = group.filter(
              (el) => el.status === OrderDeliveryStatus.COURIER_TOOK || el.status === OrderDeliveryStatus.DELIVERED,
            ).length
          }
        } else if (group.some((el) => el.mileType === MileType.LAST_MILE)) {
          if (group.at(0).to.type === PointType.COORDINATE) {
            res.name = group[0].order.recipient.name
            res.actionType = 'Give'
            res.phone = group[0].order?.recipient?.phones?.join()
            res.coordinateName = group.at(0).order.recipient.street
            res.coordinate = `${group.at(0).order.recipient.coordinate}`
            res.time = '09:00 до 18:00'
            res.status =
              group.filter(
                (el) => el.status === OrderDeliveryStatus.ROUTED || el.status === OrderDeliveryStatus.DELIVERED,
              ).length === 0
                ? 'ACTIVE'
                : 'PENDING'
            res.count = group.length
            res.countDelivered = group.filter((el) => el.status === OrderDeliveryStatus.DELIVERED).length
          } else if (group.at(0).to.type === PointType.CARGO) {
            const id: string = group.at(0).to.sourceId
            const cargo = await this.prisma.cargoProviderPoint.findUniqueOrThrow({
              where: { id },
              include: { cargoProvider: { select: { phone: true } } },
            })
            res.name = 'Cargo provider'
            res.actionType = 'Give'
            res.coordinateName = `name`
            res.phone = cargo.cargoProvider.phone
            res.coordinate = `${cargo.latitude},${cargo.longitude}`
            res.time = '09:00 до 18:00'
            res.status =
              group.filter(
                (el) => el.status === OrderDeliveryStatus.ROUTED || el.status === OrderDeliveryStatus.DELIVERED,
              ).length === 0
                ? 'ACTIVE'
                : 'PENDING'
            res.count = group.length
            res.countDelivered = group.filter((el) => el.status === OrderDeliveryStatus.DELIVERED).length
          } else if (group.at(0).to.type === PointType.PUP) {
            const id = group.at(0).to.sourceId
            const storage = await this.prisma.storage.findUniqueOrThrow({ where: { id } })
            res.name = storage.name
            res.phone = storage.phone
            res.actionType = 'Give'
            res.coordinateName = storage.address
            res.coordinate = `${storage.latitude},${storage.longitude}`
            res.time = `09:00 до 18:00`
          }
        }
        arr1.push(res)
      }

      return { points: arr1, actions_buttons: actionButtons }
    }

    return { data: await getGroupEl(route.orderDeliveries) }
  }

  async courierOrderDetail(orderDeliveryId: string) {
    const orderDelivery = await this.prisma.orderDelivery.findUnique({
      select: {
        route: {
          select: {
            status: true,
            dcId: true,
          },
        },
        to: true,
        orderId: true,
        status: true,
        mileType: true,
        order: {
          select: {
            images: true,
            id: true,
            price: true,
            sender: true,
            recipient: true,
            properties: true,
          },
        },
      },
      where: { id: orderDeliveryId },
    })

    if (!orderDelivery) {
      throw new NotFoundException('Order delivery does not found')
    }

    const actionButtons: OMS.CourierOrderDetail.ActionButton[] = []

    if (
      (orderDelivery.to.type === PointType.CARGO || orderDelivery.to.type === PointType.COORDINATE) &&
      orderDelivery.status === OrderDeliveryStatus.COURIER_ON_POINT &&
      orderDelivery.mileType === MileType.LAST_MILE
    ) {
      actionButtons.push({ action: 'DELIVERED', title: 'Доставлен' })
    } else if (
      (orderDelivery.to.type !== PointType.PUP &&
        (orderDelivery.status === OrderDeliveryStatus.ROUTED ||
          orderDelivery.status === OrderDeliveryStatus.COURIER_ON_POINT) &&
        orderDelivery.mileType === MileType.LAST_MILE &&
        (orderDelivery.route.status === RouteStatus.COURIER_ACCEPTED ||
          orderDelivery.route.status === RouteStatus.COURIER_ON_WAY)) ||
      (orderDelivery.status === OrderDeliveryStatus.COURIER_ON_POINT &&
        orderDelivery.mileType === MileType.FIRST_MILE) ||
      (orderDelivery.status === OrderDeliveryStatus.ROUTED &&
        orderDelivery.mileType === MileType.LAST_MILE &&
        (orderDelivery.route.status === RouteStatus.COURIER_ACCEPTED ||
          orderDelivery.route.status === RouteStatus.COURIER_ON_WAY))
    ) {
      actionButtons.push({ action: 'QR_SCAN', title: 'QR скан' })
    }

    return {
      id: orderDelivery.order?.id,
      pointType: orderDelivery.to.type,
      sender: {
        name: orderDelivery?.order.sender.name,
        address: [
          orderDelivery?.order.sender.street,
          orderDelivery?.order.sender.apartment,
          orderDelivery?.order.sender.landmark,
        ].join(', '),
        coordinate: orderDelivery?.order.sender.coordinate,
        phones: orderDelivery?.order.sender.phones,
        email: orderDelivery?.order.sender.email,
      },
      price: orderDelivery?.order.price,
      recipient: {
        name: orderDelivery?.order.recipient.name,
        address: [
          orderDelivery?.order.recipient.street,
          orderDelivery?.order.recipient.apartment,
          orderDelivery?.order.recipient.landmark,
        ].join(', '),
        coordinate: orderDelivery?.order.recipient.coordinate,
        phones: orderDelivery?.order.recipient.phones,
        email: orderDelivery?.order.recipient.email,
        images: orderDelivery?.order.images,
      },
      properties: orderDelivery?.order?.properties,
      action_buttons: actionButtons,
    }
  }

  async getStoragesCoordinateByCompanyId(companyId: string) {
    const [total, data] = await this.prisma.$transaction([
      this.prisma.storage.count({
        where: {
          companyId,
        },
      }),

      this.prisma.storage.findMany({
        where: {
          companyId,
        },
      }),
    ])

    const res = data.map(({ latitude, longitude, ...rest }) => ({
      ...rest,
      coordinate: {
        longitude: longitude,
        latitude: latitude,
      },
    }))

    return {
      data: res,
      fields: await getDataTypes(this.prisma, 'storage'),
      totalDocs: total,
      page: 1,
    }
  }

  async getDocumentsByRouteId(routeId: string) {
    const data = await this.prisma.route.findUniqueOrThrow({
      where: { id: routeId },
      include: {
        orderDeliveries: {
          select: {
            status: true,
            mileType: true,
            order: {
              include: {
                documentAct: true,
                documentTTN: true,
                recipient: {
                  select: {
                    street: true,
                  },
                },
                sender: {
                  select: {
                    street: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    data['locationCounts'] = new Set(data.orderDeliveries.map((item) => item.order.orderGroupId)).size
    data['orderCount'] = `${data.orderDeliveries.length}/${
      data.orderDeliveries.filter((item) => item.status === 'DELIVERED').length
    }`
    data['take'] = `${data.orderDeliveries.filter((item) => item.mileType === 'FIRST_MILE').length}/${
      data.orderDeliveries.filter((item) => item.mileType === 'FIRST_MILE' && item.status === 'DELIVERED').length
    }`
    data['give'] = `${data.orderDeliveries.filter((item) => item.mileType === 'LAST_MILE').length}/${
      data.orderDeliveries.filter((item) => item.mileType === 'LAST_MILE' && item.status === 'DELIVERED').length
    }`
    data.orderDeliveries.forEach((item) => {
      if (item.mileType === 'FIRST_MILE') {
        item['address'] = item.order.sender.street
      }
      if (item.mileType === 'LAST_MILE') {
        item['address'] = item.order.recipient.street
      }
    })
    return { data }
  }

  async getPointByCoordinate(routeId, coordinate) {
    const data = await this.pointOrders(routeId)

    return data.data.points.find((point) => point.coordinate === coordinate)
  }
}
