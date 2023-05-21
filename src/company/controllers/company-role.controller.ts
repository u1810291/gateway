import { Controller } from '@nestjs/common'

@Controller({ path: 'companies/:companyId/roles', version: '1' })
export class CompanyRoleController {
  constructor() {}

  // @Get()
  // @UseInterceptors(ListTransformInterceptor)
  // async getAllRoles() {
  //   return this.user.send({ cmd: Command.COMPANY_GROUP_GET_ALL_ROLES }, {  });
  // }
}
