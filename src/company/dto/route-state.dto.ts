import { IsEnum } from 'class-validator';

export class RouteStateDto {
  @IsEnum(['accept', 'on_my_way', 'to_dc', 'on_dc', 'to_delivery'])
  action: string;
}
