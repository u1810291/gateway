import { Module } from '@nestjs/common'
import { DriverController } from './controllers/driver.controller'
import { VehicleController } from './controllers/vehicle.controller'
import { VehicleService } from './service/vehicle.service'
import { DriverService } from './service/driver.service'
import { FMSClient } from '../clients/fms.client'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { RabbitmqModuleConfig } from '../config/rabbitmq-module.config'
import { UMSClient } from '../clients/ums.client'
import { AsyncStorageModule } from '../modules/async-storage/async-storage.module'

@Module({
  controllers: [DriverController, VehicleController],
  providers: [VehicleService, DriverService, FMSClient, UMSClient],
  imports: [RabbitMQModule.forRootAsync(RabbitMQModule, RabbitmqModuleConfig), AsyncStorageModule],
  exports: [],
})
export class FmsModule {}
