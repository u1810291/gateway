import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common'
import { ListResponseInterceptor } from '../../interceptors/list-response.interceptor'
import { CompanyPoolService } from '../services/company-pool.service'
import { TMSClient } from '../../clients/tms.client'
import { TMS } from '@slp/shared'
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { RouteMoveDto } from '../dto/route-move.dto'
import { poolFilterDto } from '../dto/pool-filter.dto'
import { getDataOrThrow } from '../../helpers/rpc.helper'

@Controller({
  path: 'companies/:companyId/pools',
  version: '1',
})
export class CompanyPoolController {
  constructor(private readonly tmsClient: TMSClient, private readonly poolService: CompanyPoolService) {}

  @Get()
  @UseInterceptors(ListResponseInterceptor)
  getPools(@Param('companyId', ParseUUIDPipe) companyId: string, @Query() query: poolFilterDto) {
    return this.poolService.getPools(companyId, query)
  }

  @Get('/:poolId/orders')
  @UseInterceptors(ListResponseInterceptor)
  getOrdersByPoolId(
    @Param('companyId') companyId: string,
    @Param('poolId') poolId: string,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ) {
    return this.poolService.getOrdersByPoolId(companyId, poolId, page ?? 1, perPage ?? 10)
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put('/:poolId/orders/:orderDeliveryId')
  movePool(
    @Param('poolId') poolId: string,
    @Param('orderDeliveryId') orderDeliveryId: string,
    @Body() data: { poolId: string },
  ) {
    return getDataOrThrow(
      this.tmsClient.orderDeliveryUpdatePoolId({
        oldPoolId: poolId,
        deliveryOrderId: orderDeliveryId,
        newPoolId: data.poolId,
      }),
    )
  }

  @ApiOperation({ summary: 'Move order to route' })
  @ApiBody({ type: RouteMoveDto.MoveToRoute })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @Put('/:poolId/move')
  @HttpCode(HttpStatus.NO_CONTENT)
  async moveToRoute(
    @Param('poolId', ParseUUIDPipe) poolId: string,
    @Body() data: Omit<TMS.Pool.MoveToRoute, 'poolId'>,
  ) {
    return this.tmsClient.moveFromPool({ ...data, poolId })
  }
}
