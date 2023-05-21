import { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RMQClientConfig, RMQConfig } from '../../config/configuration';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

export const FMS_CLIENT = 'FMS_CLIENT';

export const FMSClientProvider: FactoryProvider = {
  provide: FMS_CLIENT,
  useFactory: async (configService: ConfigService) => {
    const { queue } = configService.get<RMQClientConfig>('fms');
    const rmqConfig = configService.get<RMQConfig>('rmq');

    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${rmqConfig.login}:${rmqConfig.password}@${rmqConfig.host}:${rmqConfig.port}`],
        queue,
        queueOptions: {
          durable: true,
        },
      },
    });
  },
  inject: [ConfigService],
};
