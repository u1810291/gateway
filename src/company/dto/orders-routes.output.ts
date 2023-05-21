import { Expose } from 'class-transformer';

export class OrdersRoutesOutput {
  @Expose({ name: 'route_id', toPlainOnly: true })
  id: string;

  @Expose({ name: 'mile_type', toPlainOnly: true })
  mileType: string;

  @Expose()
  number: number;

  @Expose()
  orders: any[];
}
