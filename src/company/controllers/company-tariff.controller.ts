import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query
} from '@nestjs/common'
import { CompanyTariffService } from '../services/company-tariff.service'
import { TMSClient } from '../../clients/tms.client'
import { getDataOrThrow } from '../../helpers/rpc.helper'

@Controller({ path: '/companies/:companyId/tariffs', version: '1' })
export class CompanyTariffController {
  constructor(private readonly tmsClient: TMSClient, private readonly service: CompanyTariffService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async create(@Param('companyId') companyId: string, @Body() data) {
    return getDataOrThrow(this.tmsClient.createTariff({ ...data, companyId }))
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() data) {
    return getDataOrThrow(this.tmsClient.updateTariff({ ...data, id }))
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return getDataOrThrow(this.tmsClient.deleteTariff({ id }))
  }

  @Get(':tariffId')
  @HttpCode(HttpStatus.OK)
  async tariff(@Param('tariffId', ParseUUIDPipe) tariffId: string) {
    return this.service.tariff(tariffId)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async tariffsByCompany(
      @Param('companyId', ParseUUIDPipe) companyId: string,
      @Query('page') page: number, @Query('perPage') perPage: number,
  ) {
    return this.service.tariffsByCompany(companyId, page, perPage)
  }
}
