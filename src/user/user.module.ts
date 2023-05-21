import { Module } from '@nestjs/common'
import { UserController } from './controllers/user.controller'
import { AuthController } from './controllers/auth.controller'
import { UserCompanyController } from './controllers/user-company.controller'
import { UMSClient } from '../clients/ums.client'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { RabbitmqModuleConfig } from '../config/rabbitmq-module.config'
import { UserCompanyService } from './services/user.company.service'
import { WMSClient } from '../clients/wms.client'

@Module({
  imports: [RabbitMQModule.forRootAsync(RabbitMQModule, RabbitmqModuleConfig)],
  controllers: [UserController, AuthController, UserCompanyController],
  providers: [UMSClient, WMSClient, UserCompanyService],
})
export class UserModule {}
