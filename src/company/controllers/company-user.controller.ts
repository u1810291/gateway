import {
  Body,
  Controller,
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
import { CompanyUserService } from '../services/company-user.service'
import { ListResponseInterceptor } from '../../interceptors/list-response.interceptor'
import { UMSClient } from '../../clients/ums.client'
import { getDataOrThrow } from '../../helpers/rpc.helper'
import { Roles, Unprotected } from 'nest-keycloak-connect'
import { ROLE } from '../../common/enums/role.enum'
import { RoleMatchingMode } from 'nest-keycloak-connect/constants'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { User } from '../dto/user.dto'
import { UserCreateInputDto } from '../dto/user-create-input-dto'
import { UserUpdateDto } from '../dto/user-update.dto'

@ApiBearerAuth()
@ApiTags('Users')
@Controller({ path: 'companies/:companyId/users', version: '1' })
export class CompanyUserController {
  constructor(private readonly userService: CompanyUserService, private readonly userClient: UMSClient) {}

  @Unprotected()
  @ApiOperation({ summary: 'Create Company Client' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async createUser(@Param('companyId') companyId: string, @Body() data: UserCreateInputDto) {
    return getDataOrThrow(this.userClient.userCompanyCreate({ ...data, companyId }))
  }

  @Unprotected()
  @ApiOperation({ summary: 'Create Company Client' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Patch()
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateUser(@Param('companyId') companyId: string, @Body() data: UserUpdateDto) {
    return getDataOrThrow(this.userClient.userCompanyUpdate({ ...data, companyId }))
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ListResponseInterceptor)
  @Roles({
    roles: [ROLE.COMPANY_UPDATE, ROLE.COMPANY_MANAGEMENT],
    mode: RoleMatchingMode.ANY,
  })
  async getUsersByCompanyId(
    @Param('companyId') companyId: string,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ) {
    return this.userService.getUsersByCompanyId(companyId, page, perPage)
  }

  @ApiOperation({ summary: 'User table create' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/:userId/tables')
  @Roles({
    roles: [ROLE.COMPANY_UPDATE, ROLE.COMPANY_MANAGEMENT],
    mode: RoleMatchingMode.ANY,
  })
  create(@Param('userId') userId: string, @Body() data) {
    return getDataOrThrow(this.userClient.userTableCreate({ ...data, userId }))
  }

  @HttpCode(HttpStatus.OK)
  @Get('/:userId/tables')
  @UseInterceptors(ListResponseInterceptor)
  @Roles({
    roles: [ROLE.COMPANY_UPDATE, ROLE.COMPANY_MANAGEMENT],
    mode: RoleMatchingMode.ANY,
  })
  getByUserIdAndTable(@Param('userId') userId: string, @Query('name') name: string) {
    return this.userService.getByUserIdAndTable({ id: userId, name })
  }

  @ApiOperation({ summary: 'UserInfo by Id' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @HttpCode(HttpStatus.OK)
  @Get('/:userId')
  @UseInterceptors(ListResponseInterceptor)
  @Roles({
    roles: [ROLE.COMPANY_UPDATE, ROLE.COMPANY_MANAGEMENT],
    mode: RoleMatchingMode.ANY,
  })
  getUserInfoById(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.userService.getUserInfoById(userId)
  }

  @ApiOperation({ summary: 'Update user firebase token' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('/:userId/push-token')
  async firebaseTokenUpdate(@Param('userId', ParseUUIDPipe) userId: string, @Body() data: User.PushTokenDto) {
    return getDataOrThrow(this.userClient.pushTokenUpdate({ id: userId, pushToken: data.pushToken }))
  }

  // @HttpCode(HttpStatus.NO_CONTENT)
  // @Put('/:userId/tables/:tableId')
  // update(@Param('tableId') id, @Body() data) {
  //   return this.userClient.send({ cmd: Command.USER_TABLE_UPDATE }, { ...data, id });
  // }
}
