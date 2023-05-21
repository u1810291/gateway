import { applyDecorators } from '@nestjs/common'
import { RabbitSubscribe as BaseRabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { EMS } from '@slp/shared'

export function RabbitSubscribe(event: string) {
  return applyDecorators(
    BaseRabbitSubscribe({
      exchange: EMS.EXCHANGE,
      routingKey: event,
      queue: event,
      queueOptions: { autoDelete: false },
    }),
  )
}
