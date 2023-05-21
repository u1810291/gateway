import { ApiPropertyOptional } from '@nestjs/swagger'

enum PoolStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class poolFilterDto {
  @ApiPropertyOptional({ enum: PoolStatus })
  status?: PoolStatus

  @ApiPropertyOptional()
  from?: Date

  @ApiPropertyOptional()
  to?: Date

  @ApiPropertyOptional()
  storageName?: string

  @ApiPropertyOptional()
  page?: number

  @ApiPropertyOptional()
  perPage?: number
}
