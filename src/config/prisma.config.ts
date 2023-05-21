import { PrismaService } from '../prisma/prisma.service'
import { NestExpressApplication } from '@nestjs/platform-express'

export const prismaInit = (app: NestExpressApplication) => {
  const prisma = app.get<PrismaService>(PrismaService)
  prisma.enableShutdownHooks(app)
}
