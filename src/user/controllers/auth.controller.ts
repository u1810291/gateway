import { Body, Controller, Post } from '@nestjs/common'
import { Unprotected } from 'nest-keycloak-connect'
import { UMSClient } from '../../clients/ums.client'
import { getDataOrThrow } from '../../helpers/rpc.helper'
import { AccessTokenInput } from '../dto/access-token.input'
import { ApiResponse } from '@nestjs/swagger'

@Unprotected()
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly umsClient: UMSClient) {}

  @ApiResponse({ status: 200, description: 'Success' })
  @Post('access-token')
  getAccessToken(@Body() data: AccessTokenInput) {
    return getDataOrThrow(this.umsClient.authLogin(data))
  }

  @Post('refresh-token')
  getRefreshToken(@Body() data) {
    return getDataOrThrow(this.umsClient.authRefreshToken(data))
  }

  @Post('reset')
  async userResetPassword(@Body() data) {
    return getDataOrThrow(this.umsClient.userResetPassword(data))
  }
}
