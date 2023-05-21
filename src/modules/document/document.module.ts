import { Module } from '@nestjs/common'
import { DocumentActService } from './document.act.service'
import { DocumentActController } from './document.act.controller'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { RabbitmqModuleConfig } from '../../config/rabbitmq-module.config'

@Module({
  controllers: [DocumentActController],
  providers: [DocumentActService],
  imports: [RabbitMQModule.forRootAsync(RabbitMQModule, RabbitmqModuleConfig)],
  exports: [],
})
export class DocumentActModule {}
