import { IsEnum, IsOptional } from 'class-validator';

export class OrderStateDto {
  @IsEnum(['arrived', 'qr-set', 'delivered'])
  action: string;

  @IsOptional()
  data: any;
}
