import { IsIn, IsNotEmpty } from 'class-validator';

export class CreateRouteInput {
  @IsNotEmpty()
  @IsIn(['first_mile', 'last_mile'])
  type: 'first_mile' | 'last_mile';
}