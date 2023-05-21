import { PrismaClient } from '@prisma/client'
import { ConfigService } from '@nestjs/config'
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { DATABASE_CONFIG, DatabaseConfig } from '../config/database.config'
import { NestExpressApplication } from '@nestjs/platform-express'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(config: ConfigService) {
    const dbConfig: DatabaseConfig = config.getOrThrow<DatabaseConfig>(DATABASE_CONFIG)

    super({
      datasources: {
        db: {
          url: dbConfig.url,
        },
      },
    })
  }

  onModuleInit(): Promise<void> {
    return this.$connect()
  }

  onModuleDestroy(): Promise<void> {
    return this.$disconnect()
  }

  enableShutdownHooks(app: NestExpressApplication): void {
    return this.$on('beforeExit', app.close)
  }
}
