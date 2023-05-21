import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { getDataTypes, getMultiplyDataTypes } from '../../helpers/db.helper'
import { CompanyStorageService } from './company-storage.service'
import { CellType, OrderDeliveryStatus, RouteStatus, StorageType } from '@prisma/client'
import { convert } from '../../helpers/object.helper'
import { WMS } from '@slp/shared'
import { GEOClient } from '../../clients/geo.client'
import { paginate } from '../../helpers/pagination'

@Injectable()
export class CompanyDcService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: CompanyStorageService,
    private readonly geoClient: GEOClient,
  ) {}

  async storages(companyId: string) {
    const data = await this.prisma.storage.findMany({
      where: { companyId },
    })
    return {
      data: data.map((storage) => convert(storage)),
      fields: await getMultiplyDataTypes({ prisma: this.prisma, tableName: 'storage', excludes: [], relation: [] }),
    }
  }

  async orders(dcId: string, page: number, perPage: number) {
    const count: number = await this.prisma.order.count({
      where: {
        storageId: dcId,
        selfDelivery: true,
      },
    })

    const paginationResult = await paginate(count, page, perPage)
    const orders = await this.prisma.order.findMany({
      where: {
        storageId: dcId,
        selfDelivery: true,
      },
      include: {
        dimension: true,
      },
      orderBy: { number: 'desc' },
      skip: paginationResult.offset,
      take: paginationResult.perPage,
    })

    return {
      data: orders.map((order) => convert(order)),
      fields: await getMultiplyDataTypes({
        prisma: this.prisma,
        tableName: 'order',
        excludes: ['cell_code'],
        relation: [
          {
            prisma: this.prisma,
            tableName: 'sender',
            excludes: ['working_days'],
            relation: [],
          },
          {
            prisma: this.prisma,
            tableName: 'recipient',
            excludes: [],
            relation: [],
          },
          {
            prisma: this.prisma,
            tableName: 'pool',
            excludes: ['id', 'company_id', 'code', 'from', 'to', 'status', 'storage_id', 'created_at', 'updated_at'],
            relation: [],
          },
        ],
      }),
      ...paginationResult,
    }
  }

  async storageWorkers(dcId: string, page: number, perPage: number) {
    const count: number = await this.prisma.storageWorker.count({ where: { storageId: dcId } })
    const paginationResult = await paginate(count, page, perPage)
    const data = await this.prisma.storageWorker.findMany({
      where: {
        storageId: dcId,
      },
      select: {
        user: {
          select: {
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            status: true,
          },
        },
      },
      skip: paginationResult.offset,
      take: paginationResult.perPage,
    })

    return {
      data: data.map((worker) => convert(worker)),
      fields: await getMultiplyDataTypes({
        prisma: this.prisma,
        tableName: 'storage_worker',
        excludes: ['storage_id', 'user_id', 'id', 'created_at', 'updated_at'],
        relation: [
          {
            prisma: this.prisma,
            tableName: 'user',
            excludes: ['id', 'profile', 'created_at', 'updated_at', 'push_token', 'role_id'],
            relation: [],
          },
        ],
      }),
      ...paginationResult,
    }
  }

  async getRoutes(page: number, perPage: number) {
    const count: number = await this.prisma.route.count()
    const paginationResult = await paginate(count, page, perPage)
    const data = await this.prisma.route.findMany({
      skip: paginationResult.offset,
      take: paginationResult.perPage,
    })

    return {
      data: data,
      fields: await getDataTypes(this.prisma, 'route'),
      ...paginationResult,
    }
  }

  async getOrdersByRouteId(routeId: string, dcId: string) {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
      select: {
        vehicle: {
          select: {
            driverId: true,
          },
        },
        orderDeliveries: {
          where: { routeId },
          include: { order: { include: { sender: true, recipient: true } }, from: true, to: true },
        },
      },
    })

    const data = route.orderDeliveries.filter(({ order }) => {
      return order.storageId === dcId
    })

    const courier = await this.prisma.driver.findUnique({
      where: { id: route.vehicle.driverId },
      select: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
          },
        },
        vehicle: {
          select: {
            vehicleModel: true,
            plateNumber: true,
            vehicleProducer: true,
          },
        },
      },
    })

    return {
      data: data.map((orderDelivery) => convert(orderDelivery, '', ['working_days', 'from', 'to', 'dimensions'])),
      courier: courier,
      fields: await getMultiplyDataTypes({
        prisma: this.prisma,
        tableName: 'order_delivery',
        excludes: [],
        relation: [
          {
            prisma: this.prisma,
            tableName: 'order',
            excludes: [],
            relation: [
              { prisma: this.prisma, tableName: 'sender', excludes: ['working_days'], relation: [] },
              { prisma: this.prisma, tableName: 'recipient', excludes: [], relation: [] },
            ],
          },
        ],
      }),
    }
  }

  async getRoutesByDcId(dcId: string, page?: number, perPage?: number) {
    const count: number = await this.prisma.route.count({ where: { dcId } })
    const paginationResult = await paginate(count, page, perPage)
    const data = await this.prisma.route.findMany({
      where: { dcId },
      skip: paginationResult.offset,
      take: paginationResult.perPage,
    })

    return {
      data: data,
      fields: await getDataTypes(this.prisma, 'route'),
      ...paginationResult,
    }
  }

  async getRoutesByTake(dcId: string, page: number, perPage: number) {
    const count: number = await this.prisma.route.count({
      where: {
        orderDeliveries: {
          some: {
            NOT: {
              status: OrderDeliveryStatus.DELIVERED,
            },
            to: {
              sourceId: dcId,
            },
          },
        },
      },
    })

    const paginationResult = await paginate(count, page, perPage)
    const data = await this.prisma.route.findMany({
      where: {
        orderDeliveries: {
          some: {
            NOT: {
              status: OrderDeliveryStatus.DELIVERED,
            },
            to: {
              sourceId: dcId,
            },
          },
        },
      },
      orderBy: {
        number: 'desc',
      },
      skip: paginationResult.offset,
      take: paginationResult.perPage,
    })
    return {
      data: data,
      fields: await getDataTypes(this.prisma, 'route'),
      ...paginationResult,
    }
  }

  async getRoutesByGive(dcId: string) {
    const [total, data] = await this.prisma.$transaction([
      this.prisma.route.count({
        where: {
          dcId,
          fromStorageId: dcId,
          NOT: {
            status: RouteStatus.DELIVERED,
          },
        },
      }),
      this.prisma.route.findMany({
        where: {
          dcId,
          fromStorageId: dcId,
          NOT: {
            status: RouteStatus.DELIVERED,
          },
        },
      }),
    ])
    return {
      data: data,
      fields: await getDataTypes(this.prisma, 'route'),
      totalDocs: total,
      page: 1,
    }
  }

  async getOneStorageById(id: string) {
    const data = await this.prisma.storage.findUnique({
      where: { id },
    })

    return {
      data: data,
      fields: await getDataTypes(this.prisma, 'storage'),
    }
  }

  async getByIdWithChildren(id: string) {
    const data = await this.prisma.cell.findUnique({
      where: { id },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true,
              },
            },
          },
        },
      },
    })

    return {
      data,
      fields: await getDataTypes(this.prisma, 'cell'),
    }
  }

  async getBoxedOrders(storageId: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        storageId: storageId,
        parentId: {
          not: null,
        },
      },
      include: { children: true },
    })

    return {
      data: orders.map((order) => convert(order, '', ['dimensions'])),
      fields: await getMultiplyDataTypes({
        prisma: this.prisma,
        tableName: 'order',
        excludes: [],
        relation: [],
      }),
    }
  }

  async getBoxOrderDetail(id: string, storageId: string) {
    const response = []
    const order = await this.prisma.order.findFirst({
      where: { id, storageId },
      include: {
        children: {
          include: {
            sender: true,
            recipient: true,
          },
        },
        recipient: true,
        sender: true,
      },
    })

    if (!order) {
      throw new NotFoundException('Box not found!')
    }

    if (order.children.length !== 0) {
      for (const childOrder of order.children) {
        response.push(childOrder)
      }
      delete order.children
    }
    response.push(order)

    return {
      data: response.map((order) => convert(order, '', ['dimensions'])),
      fields: await getMultiplyDataTypes({
        prisma: this.prisma,
        tableName: 'order',
        excludes: [],
        relation: [
          { prisma: this.prisma, tableName: 'sender', excludes: ['working_days'], relation: [] },
          { prisma: this.prisma, tableName: 'recipient', excludes: [], relation: [] },
        ],
      }),
    }
  }

  async getOrderByNumber(data: { number: number; companyId: string; userId: string; page: number; perPage: number }) {
    const storage = await this.storageService.getStorageByUserId(data.userId)
    const order = await this.prisma.order.findFirst({
      where: { number: data.number, companyId: data.companyId },
    })

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    const cell = await this.prisma.cell.findFirst({
      where: {
        storage: {
          id: storage.id,
        },
        code: order.cellCode,
      },
    })

    if (!cell) {
      throw new NotFoundException('Cell does not found')
    }

    const count: number = await this.prisma.cellOrder.count({
      where: {
        cellId: cell.id,
        nextCellId: null,
      },
    })

    const paginationResult = await paginate(count, data.page, data.perPage)
    const cellOrder = await this.prisma.cellOrder.findMany({
      where: {
        cellId: cell.id,
        nextCellId: null,
      },
      include: {
        order: true,
      },
      skip: paginationResult.offset,
      take: paginationResult.perPage,
    })

    return {
      data: cellOrder.map((order) => convert(order, '', ['dimensions'])),
      fields: await getMultiplyDataTypes({
        prisma: this.prisma,
        tableName: 'cell_order',
        excludes: [],
        relation: [{ prisma: this.prisma, tableName: 'order', excludes: [], relation: [] }],
      }),
      ...paginationResult,
    }
  }

  async getEquipmentOrders(userId: string, code: string, page: number, perPage: number) {
    const storage = await this.storageService.getStorageByUserId(userId)

    const cell = await this.prisma.cell.findFirst({
      where: {
        storage: {
          id: storage.id,
        },
        code: code,
      },
    })

    if (!cell) {
      throw new NotFoundException('Cell does not found')
    }

    const count: number = await this.prisma.cellOrder.count({
      where: {
        cellId: cell.id,
        nextCellId: null,
        order: {
          cellCode: code,
        },
      },
    })

    const paginationResult = await paginate(count, page, perPage)
    const data = await this.prisma.cellOrder.findMany({
      where: {
        cellId: cell.id,
        nextCellId: null,
        order: {
          cellCode: code,
        },
      },
      include: {
        order: true,
      },
      orderBy: {
        order: {
          number: 'desc',
        },
      },
      skip: paginationResult.offset,
      take: paginationResult.perPage,
    })

    return {
      data: data.map((order) => convert(order, '', ['dimensions'])),
      fields: await getMultiplyDataTypes({
        prisma: this.prisma,
        tableName: 'cell_order',
        excludes: [],
        relation: [{ prisma: this.prisma, tableName: 'order', excludes: [], relation: [] }],
      }),
      ...paginationResult,
    }
  }

  async getOrdersInStorage(dcId: string) {
    const storage = await this.prisma.storage.findUnique({
      where: { id: dcId },
      include: { cellOrders: { include: { order: true } } },
    })

    return {
      data: storage.cellOrders.map((order) => convert(order, '', ['dimensions'])),
      fields: await getMultiplyDataTypes({
        prisma: this.prisma,
        tableName: 'cell_order',
        excludes: [],
        relation: [{ prisma: this.prisma, tableName: 'order', excludes: [], relation: [] }],
      }),
      totalDocs: storage.cellOrders.length,
    }
  }

  async getEquipmentZones(dcId: string, page: number, perPage: number) {
    const count: number = await this.prisma.cell.count({
      where: {
        storage: { id: dcId },
        type: {
          in: Object.values(CellType).filter((el) => el.toString().toLowerCase().includes('zone')),
        },
      },
    })

    const paginationResult = await paginate(count, page, perPage)

    const data = await this.prisma.cell.findMany({
      where: {
        storage: { id: dcId },
        type: {
          in: Object.values(CellType).filter((el) => el.toString().toLowerCase().includes('zone')),
        },
      },
      skip: paginationResult.offset,
      take: paginationResult.perPage,
    })

    return {
      data,
      fields: await getDataTypes(this.prisma, 'cell'),
      ...paginationResult,
    }
  }

  async checkCreatable(data: WMS.Storage.CreateRequest): Promise<boolean> {
    const zone = await this.prisma.zone.findUniqueOrThrow({ where: { id: data.zoneId } })

    const inZone = await this.geoClient.pointInZone({
      geo_id: zone.geoId,
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
    })

    if (!inZone.data.inZone) {
      return false
    }

    if (data.type === StorageType.PUP) {
      await this.prisma.storage.findFirstOrThrow({
        where: { zoneId: zone.id, type: StorageType.DC },
      })
    }

    return true
  }

  async getStockTakes(storageId: string) {
    return await this.prisma.stockTake.findMany({
      where: { storageId },
    })
  }

  async getStockById(stockTakeId: string) {
    const stockTake = await this.prisma.stockTake.findUniqueOrThrow({
      where: {
        id: stockTakeId,
      },
      include: {
        stockTakedOrder: true,
        storage: true,
      },
    })

    return {
      data: stockTake,
      fields: await getMultiplyDataTypes({
        prisma: this.prisma,
        tableName: 'stock_take',
        excludes: [],
        relation: [
          {
            prisma: this.prisma,
            tableName: 'stock_take_order',
            excludes: [],
            relation: [],
          },
        ],
      }),
    }
  }

  async getStorageDebits(dcId: string) {
    return await this.prisma.storageDebit.findMany({
      where: { storageId: dcId },
    })
  }

  async getStorageDebit(storageDebitId: string) {
    return await this.prisma.storageDebit.findUniqueOrThrow({
      where: { id: storageDebitId },
    })
  }
}
