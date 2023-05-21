import { Injectable } from '@nestjs/common'
import { TMSClient as Client } from '@slp/shared'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'

@Injectable()
export class TMSClient extends Client {
  constructor(amqp: AmqpConnection) {
    super(amqp)
  }
}
