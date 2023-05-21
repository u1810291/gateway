import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, UseInterceptors } from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { TMSClient } from '../../clients/tms.client';
import { TMS } from '@slp/shared';
import { ROLE } from '../../common/enums/role.enum';
import { RoleMatchingMode } from 'nest-keycloak-connect/constants';
import { getDataOrThrow } from '../../helpers/rpc.helper';
import { CompanySettingsService } from '../services/company-settings.service';
import { ListResponseInterceptor } from 'src/interceptors/list-response.interceptor';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

@ApiTags('Company-settings')
@Controller({ path: 'companies/:companyId/settings', version: '1' })
export class CompanySettingController {
  constructor(private readonly tmsClient: TMSClient, private readonly companySettings: CompanySettingsService) {
  }

  @ApiOperation({ summary: 'update company settings' })
  @Patch()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles({
    roles: [ROLE.COMPANY_CREATE, ROLE.COMPANY_MANAGEMENT],
    mode: RoleMatchingMode.ANY,
  })
  async updateSettings(
    @Body() data: TMS.CompanySetting.UpdateRequest,
    @Param('companyId', ParseUUIDPipe) companyId: string,
  ) {
    return getDataOrThrow(this.tmsClient.companySettingUpdate({ ...data, companyId: companyId }));
  }

  @ApiOperation({ summary: 'companySettings by companyId' })
  @ApiOkResponse({ description: 'Ok' })
  @ApiNotFoundResponse({ description: 'CompanySettings does not found' })
  @Get()
  @UseInterceptors(ListResponseInterceptor)
  async getCompanySettings(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.companySettings.getCompanySettings(companyId)
  }
}
