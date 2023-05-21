import { Controller, Get, Param, ParseUUIDPipe, Post, Query, UseInterceptors } from '@nestjs/common'
import { CompanyStorageService } from '../services/company-storage.service'
import { ListResponseInterceptor } from '../../interceptors/list-response.interceptor'
import { WMSClient } from '../../clients/wms.client'
import { TMSClient } from '../../clients/tms.client'
import { getDataOrThrow } from '../../helpers/rpc.helper'

@Controller({ path: 'companies/:companyId/storages', version: '1' })
export class CompanyStorageController {
  constructor(
    private readonly storageService: CompanyStorageService,
    private readonly wmsClient: WMSClient,
    private readonly tmsClient: TMSClient,
  ) {}

  @Get('/list')
  @UseInterceptors(ListResponseInterceptor)
  getStoragesByCompanyId(
    @Param('companyId') companyId: string,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ) {
    return this.storageService.getStoragesByCompanyId(companyId, page, perPage)
  }

  @Post('/:storageId/order/:orderId/cancel')
  async orderCancel(
    @Param('storageId', ParseUUIDPipe) storageId: string,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ) {
    await this.storageService.checkOrderCancel(storageId, orderId)
    return getDataOrThrow(this.tmsClient.orderCancel({ id: orderId }))
  }

  @Get('/:storageId/box-suggestions')
  async boxSuggestion(@Param('storageId', ParseUUIDPipe) storageId: string) {
    return await this.storageService.boxSuggestion(storageId)
  }

  @Get('/:storageId/qr-suggestions/:code')
  async codeSuggestion(
    @Param('storageId', ParseUUIDPipe) storageId: string,
    @Param('code', ParseUUIDPipe) code: string,
  ) {
    return await this.storageService.codeSuggestion(storageId, code)
  }
}
