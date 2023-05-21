export interface PaginationResponse<T> {
  data: T[];
  fields: string[];
  total_docs: number;
  limit: number;
  total_pages: number;
  page: number;
  paging_counter: number;
  has_prev_page: boolean;
  has_next_page: boolean;
  prev_page: number;
  next_page: number;
}