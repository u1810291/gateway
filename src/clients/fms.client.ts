import { Injectable } from '@nestjs/common'
import { FMSClient as Client } from '@slp/shared'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'

@Injectable()
export class FMSClient extends Client {
  constructor(amqp: AmqpConnection) {
    super(amqp)
  }
}
