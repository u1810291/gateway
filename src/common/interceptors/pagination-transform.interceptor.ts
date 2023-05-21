import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { PaginationOutput } from '../dto/pagination.output'
import { PaginationResponse } from '../interfaces/pagination-response.interface'

@Injectable()
export class PaginationTransformInterceptor<T> implements NestInterceptor<T, PaginationResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<PaginationResponse<T>> {
    return next.handle().pipe(
      map((model: PaginationOutput<T[]>) => {
        const totalPages = Math.ceil(model.totalDocs / model.limit)
        let prevPage = model.page - 1

        if (prevPage < 1) {
          prevPage = 1
        }

        if (model.page > totalPages) {
          prevPage = totalPages
        }

        return {
          data: model.data,
          fields: [],
          sortable_fields: [],
          total_docs: model.totalDocs,
          limit: model.limit,
          total_pages: totalPages,
          page: model.page,
          paging_counter: model.data.length,
          has_prev_page: model.page <= totalPages + 1 && model.page > 1,
          has_next_page: model.page >= 1 && model.page < totalPages,
          prev_page: prevPage,
          next_page: totalPages > model.page ? model.page + 1 : totalPages,
        }
      }),
    )
  }
}
