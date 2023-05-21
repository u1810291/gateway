import { Injectable } from '@nestjs/common'
import { UMSClient as Client } from '@slp/shared'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'

@Injectable()
export class UMSClient extends Client {
  constructor(amqp: AmqpConnection) {
    super(amqp)
  }
}
