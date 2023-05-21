import { map } from 'rxjs/operators'
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { PaginationResponse } from '../common/interfaces/pagination-response.interface'

@Injectable()
export class ListResponseInterceptor<T> implements NestInterceptor<T, PaginationResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Observable<PaginationResponse<T>>
    return next.handle().pipe(
      map(
        (model: {
          data: Record<string, string | number | boolean | object>[]
          fields: any
          totalDocs: number
          page: number
        }) => {
          /*const totalPages = Math.ceil(model.found / model.request_params.per_page);

        let prevPage = model.page <= 1 ? 1 : model.page - 1;

        if (model.page > totalPages) {
          prevPage = totalPages;
        }*/

          return {
            ...model,
            // limit: 10,
            // totalPages: 1,
            // page: 1,
            // pagingCounter: 1,
            // hasPrevPage: false,
            // hasNextPage: false,
            // prevPage: 1,
            // nextPage: 1,
          }

          /*return {
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
        };*/
        },
      ),
    )
  }
}
