import { Controller, Get, Param, ParseUUIDPipe, UseInterceptors } from '@nestjs/common'
import { UserCompanyService } from '../services/user.company.service'
import { ListResponseInterceptor } from '../../interceptors/list-response.interceptor'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiBearerAuth()
@ApiTags('User-company')
@Controller({ path: 'users/:userId/companies', version: '1' })
export class UserCompanyController {
  constructor(private readonly userService: UserCompanyService) {}

  @Get()
  @ApiOperation({ summary: 'Get user companies' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseInterceptors(ListResponseInterceptor)
  async getCompanies(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.userService.getCompanies(userId)
  }
}
