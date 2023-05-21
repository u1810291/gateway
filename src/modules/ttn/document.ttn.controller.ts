import { Controller, Get, Param, ParseUUIDPipe, UseInterceptors } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'
import { DocumentTtnService } from './document.ttn.service'
import { ListResponseInterceptor } from '../../interceptors/list-response.interceptor'
import { Unprotected } from 'nest-keycloak-connect'

@Unprotected()
@Controller({ path: 'docs/ttn/', version: '1' })
export class DocumentTtnController {
  constructor(private documentTtnService: DocumentTtnService) {}
  @ApiOperation({ summary: 'Get DocumentTTN By Id' })
  @UseInterceptors(ListResponseInterceptor)
  @Get('/:ttnId')
  async getDocumentActById(@Param('ttnId', ParseUUIDPipe) ttnId: string) {
    return this.documentTtnService.getDocumentTTNById(ttnId)
  }
}
