import { ApiPropertyOptional } from '@nestjs/swagger'
enum RouteStatus {
  ROUTE_PLANNED = 'ROUTE_PLANNED',
  ROUTED = 'ROUTED',
  DELIVERED = 'DELIVERED',
  COURIER_ACCEPTED = 'COURIER_ACCEPTED',
  COURIER_ON_WAY = 'COURIER_ON_WAY'
}

export class routeFilterDto {
  @ApiPropertyOptional()
  number?: number

  @ApiPropertyOptional()
  to?: Date

  @ApiPropertyOptional()
  from?: Date

  @ApiPropertyOptional({ enum: RouteStatus })
  status?: RouteStatus

  @ApiPropertyOptional()
  page?: number

  @ApiPropertyOptional()
  perPage?: number

  @ApiPropertyOptional()
  active?: boolean
}