import { Module } from '@nestjs/common'
import { GeoService } from './geo.service'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MatrixConfig } from '../../config/configuration'

@Module({
  providers: [GeoService],
  exports: [GeoService],
  imports: [
    HttpModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const config = configService.get<MatrixConfig>('matrix')

        return {
          baseURL: config.url,
          validateStatus: (status: number) => status === 200,
        }
      },
    }),
  ],
})
export class GeoModule {}
