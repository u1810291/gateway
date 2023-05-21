import { Controller, Get } from '@nestjs/common'
import { Unprotected } from 'nest-keycloak-connect'

@Unprotected()
@Controller('health')
export class HealthController {
  @Get('check')
  check() {
    return { status: 'OK' }
  }
}
