import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post, Query,
  UseInterceptors,
} from '@nestjs/common'
import { TMS } from '@slp/shared'
import { AuthenticatedUser } from 'nest-keycloak-connect'
import { getDataOrThrow } from '../../helpers/rpc.helper'
import { TMSClient } from '../../clients/tms.client'
import { CompanyImRouteService } from '../services/company-im-route.service'
import { ListResponseInterceptor } from '../../interceptors/list-response.interceptor'
import { updateImRoute } from '../dto/im-route.dto'
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger'

@Controller({ version: '1', path: '/companies/:companyId/im-routes' })
export class CompanyImRouteController {
  constructor(private readonly tmsClient: TMSClient, private readonly imRouteService: CompanyImRouteService) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('many')
  async createMany(@AuthenticatedUser() user: any, @Body() data: TMS.ImRoute.CreateManyRequest) {
    return getDataOrThrow(this.tmsClient.imRouteCreateMany({ ...data, userId: user.sub }))
  }

  @HttpCode(HttpStatus.OK)
  @Patch('lock')
  async lock(
    @AuthenticatedUser() user: any,
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() data: TMS.ImRoute.LockRequest,
  ): Promise<TMS.ImRoute.LockResponse[]> {
    return getDataOrThrow(this.tmsClient.imRouteLock({ ...data, companyId, userId: user.sub }))
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('unlock')
  async unlock(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return getDataOrThrow(this.tmsClient.imRouteUnLock({ companyId }))
  }

  @Get()
  @UseInterceptors(ListResponseInterceptor)
  async list(
      @Param('companyId', ParseUUIDPipe) companyId: string,
      @Query('page') page: number,
      @Query('perPage') perPage: number,
  ) {
    return this.imRouteService.listImRoutes(companyId, page, perPage)
  }

  @Get(':id')
  @UseInterceptors(ListResponseInterceptor)
  async detailImRoute(@Param('id', ParseUUIDPipe) id: string) {
    return this.imRouteService.detailImRoute(id)
  }

  @ApiOperation({ summary: 'Update ImRoute' })
  @ApiOkResponse({ description: 'Updated Successfully' })
  @ApiBody({ type: updateImRoute })
  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() data: updateImRoute) {
    return getDataOrThrow(this.tmsClient.imRouteUpdate({ ...data, id }))
  }
}
