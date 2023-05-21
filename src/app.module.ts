import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import configuration from './config/configuration'
import { APP_GUARD } from '@nestjs/core'
import { AuthGuard, KeycloakConnectModule, ResourceGuard, RoleGuard } from 'nest-keycloak-connect'
import { getKeycloakConfig } from './config/keycloak.config'
import { UserModule } from './user/user.module'
import { HealthController } from './health/health.controller'
import * as path from 'path'
import { AcceptLanguageResolver, I18nJsonLoader, I18nModule } from 'nestjs-i18n'
import { CompanyModule } from './company/company.module'
import { rabbitMQConfig } from './config/rabbitmq.config'
import { databaseConfig } from './config/database.config'
import { PrismaModule } from './prisma/prisma.module'
import { FmsModule } from './fms/fms.module'
import { DocumentActModule } from './modules/document/document.module'
import { AsyncStorageModule } from './modules/async-storage/async-storage.module'
import { LoggerMiddleware } from './middlewares/logger.middleware'
import { DocumentTtnModule } from './modules/ttn/document.ttn.module'
// import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
// import { RabbitmqModuleConfig } from './config/rabbitmq-module.config'
// import { TMSClient } from './clients/tms.client'
// import { GEOClient } from './clients/geo.client'
// import { OMSClient } from './clients/oms.client'
// import { WMSClient } from './clients/wms.client'
// import { UMSClient } from './clients/ums.client'
// import { CompanyCourierService } from './company/services/company-courier.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: false,
      load: [configuration, rabbitMQConfig, databaseConfig],
      isGlobal: true,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'ru',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [AcceptLanguageResolver],
    }),
    KeycloakConnectModule.registerAsync(getKeycloakConfig()),
    UserModule,
    CompanyModule,
    FmsModule,
    DocumentActModule,
    PrismaModule,
    AsyncStorageModule,
    DocumentTtnModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ResourceGuard,
    },
  ],
  exports: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
