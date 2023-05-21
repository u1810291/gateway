import { Injectable } from '@nestjs/common'
import { GEOClient as Client } from '@slp/shared'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'

@Injectable()
export class GEOClient extends Client {
  constructor(amqp: AmqpConnection) {
    super(amqp)
  }
}
