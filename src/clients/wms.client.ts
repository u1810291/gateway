import { Injectable } from '@nestjs/common'
import { WMSClient as Client } from '@slp/shared'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'

@Injectable()
export class WMSClient extends Client {
  constructor(amqp: AmqpConnection) {
    super(amqp)
  }
}
