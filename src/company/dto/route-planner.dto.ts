import { ApiProperty } from '@nestjs/swagger';
import { TMS } from '@slp/shared';

export namespace RoutePlannerDto {
    export class CreteDto implements  Omit<TMS.RoutePlanner.CreateRequest, 'companyId'>{
        @ApiProperty({ type: Date, description: 'startTime is MilitaryTime example 04:00' })
        startTime: string
    }

    export class UpdateDto implements Omit<TMS.RoutePlanner.UpdateRequest, 'id'> {
        @ApiProperty({ type: Date, description: 'startTime is MilitaryTime example 04:00' })
        startTime: string
    }
}