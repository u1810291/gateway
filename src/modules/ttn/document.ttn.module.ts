import { Module } from '@nestjs/common'
import { DocumentTtnService } from './document.ttn.service'
import { DocumentTtnController } from './document.ttn.controller'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { RabbitmqModuleConfig } from '../../config/rabbitmq-module.config'

@Module({
  controllers: [DocumentTtnController],
  providers: [DocumentTtnService],
  imports: [RabbitMQModule.forRootAsync(RabbitMQModule, RabbitmqModuleConfig)],
  exports: [],
})
export class DocumentTtnModule {}
