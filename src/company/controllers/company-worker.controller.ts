import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common'
import { WMSClient } from '../../clients/wms.client'
import { WMS } from '@slp/shared'
import { getDataOrThrow } from '../../helpers/rpc.helper'
import { CompanyWorkerService } from '../services/company-worker.service'

@Controller({ version: '1', path: 'companies/:companyId/workers/:workerId' })
export class CompanyWorkerController {
  constructor(private readonly companyWorkerService: CompanyWorkerService, private readonly wmsClient: WMSClient) {}

  @Post('orders/cells/:cellCode')
  @HttpCode(HttpStatus.NO_CONTENT)
  moveOrder(
    @Body() data: WMS.Order.MoveOrdersRequest,
    @Param('cellCode') cellCode: string,
    @Param('workerId') workerId: string,
  ) {
    return getDataOrThrow(this.wmsClient.moveOrder({ ...data, cellCode, userId: workerId }))
  }

  @Get('orders/cells/:cellCode')
  @HttpCode(HttpStatus.OK)
  getOrdersInCell(
    @Param('cellCode') cellCode: string,
    @Param('workerId') workerId: string,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ) {
    return this.companyWorkerService.getOrdersInCell(cellCode, workerId, page, perPage)
  }

  @Get('tasks')
  @HttpCode(HttpStatus.OK)
  tasks(@Param('workerId') workerId: string, @Query('page') page: number, @Query('perPage') perPage: number) {
    return this.companyWorkerService.tasks(workerId, page, perPage)
  }

  @Get('tasks/:taskId')
  @HttpCode(HttpStatus.OK)
  taskDetail(@Param('taskId') taskId: string) {
    return this.companyWorkerService.taskDetail(taskId)
  }
}
