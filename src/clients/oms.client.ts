import { Injectable } from '@nestjs/common'
import { OMSClient as Client } from '@slp/shared'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'

@Injectable()
export class OMSClient extends Client {
  constructor(amqp: AmqpConnection) {
    super(amqp)
  }
}
