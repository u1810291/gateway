interface PaginationResult {
  page: number
  perPage: number
  totalPages: number
  totalDocs: number
  offset: number
}

export async function paginate(count: number, page: number, perPage: number): Promise<PaginationResult> {
  const normalizedPage = Math.max(Number.isNaN(page) ? 1 : page ?? 1, 1)
  const normalizedPerPage = Math.max(Number.isNaN(perPage) ? 10 : perPage ?? 10, 1)
  const totalPages = Math.ceil(count / normalizedPerPage)
  const offset = (normalizedPage - 1) * normalizedPerPage
  return {
    page: normalizedPage,
    perPage: normalizedPerPage,
    totalPages,
    totalDocs: count,
    offset,
  }
}
