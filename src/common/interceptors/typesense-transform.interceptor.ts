import { map } from 'rxjs/operators';
import { Injectable, CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PaginationResponse } from '../interfaces/pagination-response.interface';
import { TypesenseResultInterface } from '../interfaces/typesense-result.interface';

@Injectable()
export class TypesenseTransformInterceptor<T> implements NestInterceptor<T, PaginationResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<PaginationResponse<T>> {
    return next.handle().pipe(
      map((model: TypesenseResultInterface<T> & { fields: string[]; sortable_fields: string[] }) => {
        const totalPages = Math.ceil(model.found / model.request_params.per_page);

        let prevPage = model.page <= 1 ? 1 : model.page - 1;

        if (model.page > totalPages) {
          prevPage = totalPages;
        }

        return {
          data: model.hits.map((item) => item.document),
          fields: model.fields,
          total_docs: model.found,
          limit: model.request_params.per_page,
          total_pages: totalPages,
          page: model.page,
          paging_counter: model.hits.length,
          has_prev_page: model.page <= totalPages + 1 && model.page > 1,
          has_next_page: model.page >= 1 && model.page < totalPages,
          prev_page: prevPage,
          next_page: totalPages > model.page ? model.page + 1 : totalPages,
        };
      }),
    );
  }
}
