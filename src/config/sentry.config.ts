import { ConfigService } from '@nestjs/config'
import * as Sentry from '@sentry/node'
import { SentryConfig } from './configuration'

export const sentryInit = (configService: ConfigService) => {
  const sentryConfig = configService.get<SentryConfig>('sentry')

  Sentry.init({
    debug: sentryConfig.debug,
    dsn: sentryConfig.dsn,
    environment: sentryConfig.environment,
    release: sentryConfig.release,
    tracesSampleRate: 1,
  })
}
