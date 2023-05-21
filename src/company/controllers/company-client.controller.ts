import { TMS, UMS } from '@slp/shared'

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
  UseInterceptors
} from "@nestjs/common";
import { ListTransformInterceptor } from '../../common/interceptors/list-transform.interceptor'
import { CompanyClientService } from '../services/company-client.service'
import { TMSClient } from '../../clients/tms.client'
import { ListResponseInterceptor } from '../../interceptors/list-response.interceptor'
import { UMSClient } from '../../clients/ums.client'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CompanyClientExample } from '../../helpers/swagger'
import { getDataOrThrow } from '../../helpers/rpc.helper'

@ApiBearerAuth()
@ApiTags('Clients')
@Controller({
  path: 'companies/:companyId/clients',
  version: '1',
})
export class CompanyClientController {
  constructor(
    private readonly tmsClient: TMSClient,
    private readonly service: CompanyClientService,
    private readonly umsClient: UMSClient,
  ) {}

  @ApiOperation({ summary: 'Get Company Clients' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ListResponseInterceptor)
  async clientFindAll(@Query('page') page: number, @Query('perPage') perPage: number) {
    return this.service.clientFindAll(page, perPage)
  }

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async create(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() body: Omit<UMS.User.CreateRequest, 'companyId'>,
  ): Promise<void> {
    return getDataOrThrow(this.umsClient.userCompanyCreate({ ...body, companyId }))
  }

  @ApiOperation({ summary: 'Get One Company Client' })
  @ApiBody(CompanyClientExample)
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get(':clientId')
  @UseInterceptors(ListTransformInterceptor)
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('clientId', ParseUUIDPipe) clientId: string) {
    return this.service.findOne(clientId)
  }

  @ApiOperation({ summary: 'Update Company Client' })
  @ApiBody(CompanyClientExample)
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Patch(':clientId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('clientId', ParseUUIDPipe) id: string,
    @Body() body: Omit<TMS.CompanyClientUpdate.Request, 'id' | 'companyId'>,
  ): Promise<void> {
    return getDataOrThrow(this.tmsClient.companyClientUpdate({ ...body, id }))
  }
}
