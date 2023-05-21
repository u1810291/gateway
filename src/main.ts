import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { RequestMethod, ValidationPipe, VERSION_NEUTRAL, VersioningType } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppConfig } from './config/configuration'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AllExceptionFilter } from './common/filters/all-exception.filter'
import { winstonLogger } from './config/winston.config'
import { sentryInit } from './config/sentry.config'
import { swaggerInit } from './config/swagger.config'
import { prismaInit } from './config/prisma.config'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: process.env.NODE_ENV === 'development' ? undefined : winstonLogger,
  })

  const configService = app.get(ConfigService)
  const appConfig = configService.get<AppConfig>('app')

  app.disable('etag')
  app.disable('x-powered-by')

  app.setGlobalPrefix('api', {
    exclude: [{ path: 'health/check', method: RequestMethod.GET }],
  })

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: [VERSION_NEUTRAL, ''],
  })

  app.enableCors({
    origin: appConfig.corsOrigin,
  })

  app.useGlobalFilters(new AllExceptionFilter())
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  )

  prismaInit(app)
  sentryInit(configService)
  swaggerInit(app)

  await app.listen(appConfig.port, appConfig.hostname)
}

setImmediate(bootstrap)
