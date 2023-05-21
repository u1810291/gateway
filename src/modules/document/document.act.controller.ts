import { Controller, Get, Param, ParseUUIDPipe, UseInterceptors } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'
import { DocumentActService } from './document.act.service'
import { ListResponseInterceptor } from '../../interceptors/list-response.interceptor'
import { Unprotected } from 'nest-keycloak-connect'

@Unprotected()
@Controller({ path: 'docs/act/', version: '1' })
export class DocumentActController {
  constructor(private documentActService: DocumentActService) {}
  @ApiOperation({ summary: 'Get DocumentAct By Id' })
  @UseInterceptors(ListResponseInterceptor)
  @Get('/:actId')
  async getDocumentActById(@Param('actId', ParseUUIDPipe) actId: string) {
    return this.documentActService.getDocumentActById(actId)
  }
}
