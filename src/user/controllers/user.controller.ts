import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseInterceptors } from '@nestjs/common'
import { UMSClient } from '../../clients/ums.client'
import { Roles } from 'nest-keycloak-connect'
import { ROLE } from '../../common/enums/role.enum'
import { RoleMatchingMode } from 'nest-keycloak-connect/constants'
import { ListResponseInterceptor } from '../../interceptors/list-response.interceptor'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { WMSClient } from '../../clients/wms.client'
import { UserCompanyService } from '../services/user.company.service'

@ApiBearerAuth()
@ApiTags('User')
@Controller({ path: 'users', version: '1' })
export class UserController {
  constructor(
    private readonly userService: UserCompanyService,
    private readonly userClient: UMSClient,
    private readonly wmsClient: WMSClient,
  ) {}

  /**
   * TODO
   * This method is useless if we don't have companyId
   * because when we create a new user we need groupId
   * it's bad approach to pass the companyId in body
   * Or we can pass global company id and give global
   * access to all groups/companies
   */
  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Roles({
    roles: [ROLE.USER_CREATE, ROLE.USER_MANAGEMENT],
    mode: RoleMatchingMode.ANY,
  })
  async create(@Body() data) {
    return this.userClient.userCreate(data)
  }

  // @Post('storage-workers/add')
  // async addStorageWorker(@Body() data: WMS.StorageWorker.CreateRequest) {
  //   return this.wmsClient.createStorageWorker(data)
  // }

  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Patch(':id')
  @Roles({
    roles: [ROLE.USER_UPDATE, ROLE.USER_MANAGEMENT],
    mode: RoleMatchingMode.ANY,
  })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() data) {
    return this.userClient.userUpdate({ id, ...data })
  }

  @ApiOperation({ summary: 'Get List user' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get()
  @UseInterceptors(ListResponseInterceptor)
  async users() {
    return this.userService.users()
  }

  @ApiOperation({ summary: 'Group members user' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('/:id/groups')
  @Roles({
    roles: [ROLE.USER_CREATE, ROLE.USER_MANAGEMENT],
    mode: RoleMatchingMode.ANY,
  })
  @UseInterceptors(ListResponseInterceptor)
  async getAllGroupMembers(@Param('id', ParseUUIDPipe) id: string) {
    return this.userClient.groupMembersList(id)
  }

  @ApiOperation({ summary: 'User add to group user' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Post('/:id/groups')
  @Roles({
    roles: [ROLE.USER_CREATE, ROLE.USER_MANAGEMENT],
    mode: RoleMatchingMode.ANY,
  })
  async addToGroup(@Param('id', ParseUUIDPipe) id: string, @Body() { groupId }: { groupId: string }) {
    return this.userClient.userAddToGroup({ id, groupId })
  }

  @ApiOperation({ summary: 'User delete from group' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Delete('/:id/groups')
  @Roles({
    roles: [ROLE.USER_UPDATE, ROLE.USER_MANAGEMENT],
    mode: RoleMatchingMode.ANY,
  })
  async removeFromGroup(@Param('id', ParseUUIDPipe) id: string, @Body() { groupId }: { groupId: string }) {
    return this.userClient.userDeleteFromGroup({ id, groupId })
  }

  @ApiOperation({ summary: 'Add attribute to user' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Post('/:id/attribute')
  @Roles({
    roles: [ROLE.USER_UPDATE, ROLE.USER_MANAGEMENT],
    mode: RoleMatchingMode.ANY,
  })
  async addAttribute(@Param('id', ParseUUIDPipe) id: string, @Body() data: Record<string, any>) {
    return this.userClient.userAddAttributes({ id, attributes: data })
  }
}
