export interface PaginatedResult<T> {
  data: T[]
  totalDocs: number
  page: number
  totalPages: number
  limit: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number
  nextPage: number
}

export type PaginateOptions = { page?: number | string; perPage?: number | string }
export type PaginateFunction = <T, K>(
  model: any,
  args?: K,
  transform?: (item: T) => any | undefined,
  options?: PaginateOptions,
) => Promise<PaginatedResult<T>>

export const createPaginator = (defaultOptions: PaginateOptions): PaginateFunction => {
  return async (model, args: any = { where: undefined }, transform = undefined, options) => {
    const page = Number(options?.page || defaultOptions?.page) || 1
    const perPage = Number(options?.perPage || defaultOptions?.perPage) || 10

    const skip = page > 0 ? perPage * (page - 1) : 0
    const [total, data] = await Promise.all([
      model.count({ where: args.where }),
      model.findMany({
        ...args,
        take: perPage,
        skip,
      }),
    ])

    const lastPage = Math.ceil(total / perPage)

    return {
      data: transform !== undefined ? data.map((el) => transform(el)) : data,
      totalDocs: total,
      page,
      totalPages: lastPage,
      limit: perPage,
      hasPrevPage: lastPage - (lastPage - page + 1) > 0,
      hasNextPage: lastPage - page > 0,
      prevPage: lastPage - (lastPage - page + 1),
      nextPage: lastPage - page,
    }
  }
}
