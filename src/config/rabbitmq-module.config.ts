import { ConfigModule, ConfigService } from '@nestjs/config'
import { RabbitMQConfig } from '@golevelup/nestjs-rabbitmq/lib/rabbitmq.interfaces'
import { RABBITMQ_CONFIG_NAME } from './rabbitmq.config'
import { EMS, GEO, OMS, TMS, WMS } from '@slp/shared'

export const RabbitmqModuleConfig = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const config = configService.getOrThrow<RabbitMQConfig>(RABBITMQ_CONFIG_NAME)

    return {
      exchanges: [
        { name: TMS.EXCHANGE, type: 'direct' },
        { name: EMS.EXCHANGE, type: 'topic' },
        { name: WMS.EXCHANGE, type: 'direct' },
        { name: OMS.EXCHANGE, type: 'direct' },
        { name: GEO.EXCHANGE, type: 'direct' },
      ],
      uri: config.uri,
    }
  },
}
