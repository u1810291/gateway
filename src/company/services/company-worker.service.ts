import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { getMultiplyDataTypes } from '../../helpers/db.helper'
import { CompanyStorageService } from './company-storage.service'
import { convert } from '../../helpers/object.helper'
import { TaskStatus } from '@prisma/client'
import { paginate } from '../../helpers/pagination'

@Injectable()
export class CompanyWorkerService {
  constructor(private readonly prisma: PrismaService, private readonly storageService: CompanyStorageService) {}

  async getOrdersInCell(cellCode: string, workerId: string, page: number, perPage: number) {
    const storage = await this.storageService.getStorageByUserId(workerId)
    const count: number = await this.prisma.order.count({
      where: {
        cellCode: cellCode,
        companyId: storage.companyId,
      },
    })

    const paginationResult = await paginate(count, page, perPage)
    const data = await this.prisma.order.findMany({
      where: {
        cellCode: cellCode,
        companyId: storage.companyId,
      },
      include: {
        sender: true,
        recipient: true,
      },
      skip: paginationResult.offset,
      take: paginationResult.perPage,
    })

    return {
      data: data.map((order) => convert(order)),
      fields: await getMultiplyDataTypes({
        prisma: this.prisma,
        tableName: 'order',
        excludes: [],
        relation: [
          { prisma: this.prisma, tableName: 'sender', relation: [], excludes: ['working_days'] },
          { prisma: this.prisma, tableName: 'recipient', relation: [], excludes: [] },
        ],
      }),
      ...paginationResult,
    }
  }

  async taskDetail(taskId: string) {
    const taskOrder = await this.prisma.taskOrder.findFirst({
      where: { taskId },
      include: {
        order: true,
      },
    })

    if (!taskOrder) {
      throw new NotFoundException('Task does not found')
    }

    return {
      order: convert(taskOrder.order, '', ['dimensions']),
    }
  }

  async tasks(workerId: string, page: number, perPage: number) {
    const count: number = await this.prisma.taskOrder.count({
      where: { task: { worker: { userId: workerId }, status: TaskStatus.CREATED } },
    })
    const paginationResult = await paginate(count, page, perPage)
    const data = await this.prisma.taskOrder.findMany({
      where: { task: { worker: { userId: workerId }, status: TaskStatus.CREATED } },
      include: { order: true, task: { include: { toZone: true } } },
      skip: paginationResult.offset,
      take: paginationResult.perPage,
    })

    return {
      data: data.map((task) => convert(task, '', ['dimensions'])),
      fields: await getMultiplyDataTypes({
        prisma: this.prisma,
        tableName: 'task_order',
        excludes: [],
        relation: [
          { prisma: this.prisma, tableName: 'order', excludes: [], relation: [] },
          {
            prisma: this.prisma,
            tableName: 'task',
            excludes: [],
            relation: [{ prisma: this.prisma, tableName: 'cell', excludes: [], relation: [] }],
          },
        ],
      }),
      ...paginationResult,
    }
  }
}
