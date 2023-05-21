import { registerAs } from '@nestjs/config'

export const DATABASE_CONFIG = 'database'

export interface DatabaseConfig {
  readonly url: string
}

export const databaseConfig = registerAs(
  DATABASE_CONFIG,
  (): DatabaseConfig => ({
    url: String(process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:5432/postgres'),
  }),
)
