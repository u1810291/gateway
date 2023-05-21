import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class SearchQueryPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): string {
    if (value === undefined) {
      value = '*';
    }

    return `${value}`;
  }
}