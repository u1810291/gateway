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
  Query,
  UseInterceptors,
} from '@nestjs/common'
import { Roles } from 'nest-keycloak-connect'
import { getDataOrThrow } from '../../helpers/rpc.helper'
import { TMSClient } from '../../clients/tms.client'
import { ROLE } from '../../common/enums/role.enum'
import { RoleMatchingMode } from 'nest-keycloak-connect/constants'
import { CompanyService } from '../services/company.service'
import { I18n, I18nContext } from 'nestjs-i18n'
import { UMS } from '@slp/shared'
import { ListResponseInterceptor } from '../../interceptors/list-response.interceptor'
import { UMSClient } from '../../clients/ums.client'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger'
import { CompanyCreateExample, CompanyGroupCreateExample, CompanyUpdateExample } from '../../helpers/swagger'

@ApiBearerAuth()
@ApiTags('Company')
@Controller({ path: 'companies', version: '1' })
export class CompanyController {
  constructor(
    private readonly tmsClient: TMSClient,
    private readonly service: CompanyService,
    private readonly umsClient: UMSClient,
  ) {}
  @ApiOperation({ summary: 'Get Companies' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get()
  @UseInterceptors(ListResponseInterceptor)
  @Roles({
    roles: [ROLE.COMPANY_READ, ROLE.COMPANY_MANAGEMENT],
    mode: RoleMatchingMode.ANY,
  })
  async getCompanies(@Query('page') page: number, @Query('perPage') perPage: number, @I18n() i18n: I18nContext) {
    return this.service.getCompanies(page, perPage)
  }

  @ApiOperation({ summary: 'Create Company' })
  @ApiBody(CompanyCreateExample)
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles({
    roles: [ROLE.COMPANY_CREATE, ROLE.COMPANY_MANAGEMENT],
    mode: RoleMatchingMode.ANY,
  })
  async create(@Body() data: UMS.Group.CreateCompany) {
    return getDataOrThrow(this.umsClient.companyCreate(data))
  }

  @ApiOperation({ summary: 'Update Company' })
  @ApiBody(CompanyUpdateExample)
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles({
    roles: [ROLE.COMPANY_UPDATE, ROLE.COMPANY_MANAGEMENT],
    mode: RoleMatchingMode.ANY,
  })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() data) {
    return getDataOrThrow(this.tmsClient.companyUpdate({ id, ...data }))
  }

  @ApiOperation({ summary: 'Get Company Groups' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('/:id/groups')
  @UseInterceptors(ListResponseInterceptor)
  @Roles({
    roles: [ROLE.COMPANY_UPDATE, ROLE.COMPANY_MANAGEMENT],
    mode: RoleMatchingMode.ANY,
  })
  async getAllGroups(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('isPrimary') isPrimary: string,
    @Query('role') role: string,
  ) {
    return this.umsClient.groupList({ id: id, isPrimary: isPrimary == 'true', role: role })
  }

  @ApiOperation({ summary: 'Create Company Group' })
  @ApiBody(CompanyGroupCreateExample)
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Post('/:id/groups/create')
  @Roles({
    roles: [ROLE.COMPANY_UPDATE, ROLE.COMPANY_MANAGEMENT],
    mode: RoleMatchingMode.ANY,
  })
  async createGroup(@Param('id', ParseUUIDPipe) id: string, @Body() data: UMS.Group.CreateRequest) {
    return getDataOrThrow(this.umsClient.groupCreate({ ...data, id }))
  }

  @ApiOperation({ summary: 'Get One Company Group' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('/:id/groups/:groupId')
  @UseInterceptors(ListResponseInterceptor)
  @Roles({
    roles: [ROLE.COMPANY_UPDATE, ROLE.COMPANY_MANAGEMENT],
    mode: RoleMatchingMode.ANY,
  })
  async findOneGroupByID(@Param('id', ParseUUIDPipe) id: string, @Param('groupId', ParseUUIDPipe) groupId: string) {
    return getDataOrThrow(this.umsClient.groupFindOne({ id, groupId }))
  }

  @ApiOperation({ summary: 'Update Company Group' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Patch('/:id/groups')
  @Roles({
    roles: [ROLE.COMPANY_UPDATE, ROLE.COMPANY_MANAGEMENT],
    mode: RoleMatchingMode.ANY,
  })
  async updateGroup(@Body() dto: UMS.Group.UpdateRequest) {
    return getDataOrThrow(this.umsClient.groupUpdate(dto))
  }

  @ApiOperation({ summary: 'Delete Company Group' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Delete('/:id/groups/:groupId')
  @Roles({
    roles: [ROLE.COMPANY_UPDATE, ROLE.COMPANY_MANAGEMENT],
    mode: RoleMatchingMode.ANY,
  })
  async deleteGroupById(@Param('id', ParseUUIDPipe) id: string, @Param('companyId', ParseUUIDPipe) companyId: string) {
    return getDataOrThrow(this.umsClient.groupDelete({ groupId: id, companyId }))
  }

  @ApiOperation({ summary: 'Get Company Group Role list' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('/roles')
  @Roles({
    roles: [ROLE.COMPANY_UPDATE, ROLE.COMPANY_MANAGEMENT],
    mode: RoleMatchingMode.ANY,
  })
  @UseInterceptors(ListResponseInterceptor)
  async getAllRoles() {
    return this.umsClient.groupRolesList()
  }

  @Post('/:id/groups/:groupId/roles')
  @Roles({
    roles: [ROLE.COMPANY_UPDATE, ROLE.COMPANY_MANAGEMENT],
    mode: RoleMatchingMode.ANY,
  })
  async addRoleToGroup(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Body() data: Pick<UMS.Group.AddRoleRequest, 'roleId'>,
  ) {
    return getDataOrThrow(this.umsClient.groupAddRole({ companyId: id, roleId: data.roleId, groupId }))
  }

  @Delete('/:id/groups/:groupId/roles')
  @Roles({
    roles: [ROLE.COMPANY_UPDATE, ROLE.COMPANY_MANAGEMENT],
    mode: RoleMatchingMode.ANY,
  })
  async deleteRoleFromGroup(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Body() data: UMS.Group.DeleteRoleRequest,
  ) {
    return getDataOrThrow(this.umsClient.groupDeleteRole({ roleId: data.roleId, companyId: id, groupId }))
  }
}
