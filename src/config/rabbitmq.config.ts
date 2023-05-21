import { RabbitMQConfig } from '@golevelup/nestjs-rabbitmq/lib/rabbitmq.interfaces'
import { registerAs } from '@nestjs/config'

export const RABBITMQ_CONFIG_NAME = 'rabbitmq'

export const rabbitMQConfig = registerAs(
  RABBITMQ_CONFIG_NAME,
  (): RabbitMQConfig => ({
    uri: String(process.env.RABBITMQ_URI || 'amqp://guest:guest@localhost:5672'),
  }),
)
