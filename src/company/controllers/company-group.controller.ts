import { Controller } from '@nestjs/common'

@Controller({ path: 'companies/:companyId/groups', version: '1' })
export class CompanyGroupController {
  constructor() {}

  // @Get()
  // @UseInterceptors(ListTransformInterceptor)
  // async getAllGroups(@Param('companyId', ParseUUIDPipe) companyId: string) {
  //   return this.user.send({ cmd: Command.COMPANY_GROUP_GET_ALL_GROUPS }, { companyId });
  // }
  //
  // @Unprotected()
  // @Post()
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async createGroup(@Param('companyId', ParseUUIDPipe) companyId: string, @Body() dto: any) {
  //   console.log(companyId, dto)
  //   return this.userClient.companyCreate({ ...dto, companyId })
  // }
  //
  // @Patch(':groupId')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async updateGroup(@Param('companyId', ParseUUIDPipe) companyId: string, @Param('groupId', ParseUUIDPipe) groupId: string, @Body() dto: any) {
  //   return this.user.send({ cmd: Command.COMPANY_GROUP_UPDATE_GROUP }, { ...dto, companyId, groupId });
  // }
  //
  // @Get(':groupId')
  // async findOneGroupById(@Param('companyId', ParseUUIDPipe) companyId: string, @Param('groupId', ParseUUIDPipe) groupId: string) {
  //   return this.user.send({ cmd: Command.COMPANY_GROUP_FIND_ONE_BY_ID }, { companyId, groupId });
  // }
  //
  // @Delete(':groupId')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async deleteGroupById(@Param('companyId', ParseUUIDPipe) companyId: string, @Param('groupId', ParseUUIDPipe) groupId: string) {
  //   return this.user.send({ cmd: Command.COMPANY_GROUP_DELETE_GROUP_BY_ID }, { companyId, groupId });
  // }
  //
  // @Post(':groupId/roles')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async addRoleToGroup(@Param('companyId', ParseUUIDPipe) companyId: string, @Param('groupId', ParseUUIDPipe) groupId: string, @Body() dto: any) {
  //   return this.user.send({ cmd: Command.COMPANY_GROUP_ADD_ROLE_TO_GROUP }, { ...dto, companyId, groupId });
  // }
  //
  // @Delete(':groupId/roles/:roleId')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async deleteRoleFromGroup(
  //   @Param('companyId', ParseUUIDPipe) companyId: string,
  //   @Param('groupId', ParseUUIDPipe) groupId: string,
  //   @Param('roleId', ParseUUIDPipe) roleId: string,
  //   @Body() dto: any,
  // ) {
  //   return this.user.send({ cmd: Command.COMPANY_GROUP_DELETE_ROLE_FROM_GROUP }, {
  //     ...dto,
  //     companyId,
  //     groupId,
  //     role_id: roleId,
  //   });
  // }
}
