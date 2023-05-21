import { TMS } from '@slp/shared'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

class Schedule {
  @ApiProperty()
  id: string

  @ApiProperty()
  deadline: string

  @ApiProperty()
  takeFrom: string
}

export class updateImRoute implements Omit<TMS.ImRoute.UpdateRequest, 'id'> {
  @ApiPropertyOptional()
  delayDate?: number

  @ApiPropertyOptional()
  schedules?: Schedule[]
}
