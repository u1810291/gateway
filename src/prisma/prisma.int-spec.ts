import { Test, TestingModule } from '@nestjs/testing'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma.module'
import { PrismaService } from './prisma.service'
import { databaseConfig } from '@/config/database.config'

describe('PrismaModule', () => {
  let module: TestingModule
  let service: PrismaService

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [databaseConfig],
          cache: false,
          isGlobal: true,
          ignoreEnvFile: true,
        }),
        PrismaModule,
      ],
    }).compile()

    service = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(module).toBeDefined()
    expect(service).toBeInstanceOf(PrismaService)
  })
})
