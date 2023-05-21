import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common'
import { TMS } from '@slp/shared'
import { TMSClient } from '../../clients/tms.client'
import { ListResponseInterceptor } from '../../interceptors/list-response.interceptor'
import { CompanyRouteService } from '../services/company-route.service'
import { getDataOrThrow } from '../../helpers/rpc.helper'
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { RouteMoveDto } from '../dto/route-move.dto'
import { routeFilterDto } from '../dto/route-filter.dto'

@Controller({
  path: 'companies/:companyId/routes',
  version: '1',
})
export class CompanyRouteController {
  constructor(private readonly tmsClient: TMSClient, private readonly routeService: CompanyRouteService) {}

  @Post('pool-id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async createByPoolId(@Body() data: TMS.Route.CreateRequest) {
    return getDataOrThrow(this.tmsClient.routeCreate(data))
  }

  @Get()
  @UseInterceptors(ListResponseInterceptor)
  @HttpCode(HttpStatus.OK)
  async list(@Param('companyId', ParseUUIDPipe) companyId: string, @Query() dto: routeFilterDto) {
    return this.routeService.getRoutes(companyId, dto)
  }

  @Get('/:routeId/order-deliveries')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ListResponseInterceptor)
  async listOrderDelivery(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('routeId', ParseUUIDPipe) routeId: string,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ) {
    return this.routeService.listOrderDelivery(companyId, routeId, page, perPage)
  }

  @Get('/:routeId/orders')
  @UseInterceptors(ListResponseInterceptor)
  @HttpCode(HttpStatus.OK)
  async getOrdersByRouteId(@Param('companyId') companyId: string, @Param('routeId') routeId: string) {
    return this.routeService.getOrdersByRouteId(companyId, routeId)
  }

  @ApiOperation({ summary: 'Move order to pool' })
  @ApiBody({ type: RouteMoveDto.MoveToPool })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @Put('/:routeId/move')
  @HttpCode(HttpStatus.NO_CONTENT)
  async moveToPool(
    @Param('routeId', ParseUUIDPipe) routeId: string,
    @Body() data: Omit<TMS.Route.MoveToActivePool, 'routeId'>,
  ) {
    return getDataOrThrow(this.tmsClient.moveFromRoute({ ...data, routeId }))
  }

  @ApiOperation({ summary: 'Get unpaid for route' })
  @Get('/:routeId/unpaid')
  async unpaid(@Param('routeId', ParseUUIDPipe) routeId: string): Promise<TMS.Route.UnpaidResponse> {
    return getDataOrThrow(this.tmsClient.getUnpaid({ routeId }))
  }
}
