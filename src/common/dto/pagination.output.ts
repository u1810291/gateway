export class PaginationOutput<T> {
  data: T;
  page: number;
  limit: number;
  totalDocs: number;

  constructor(data: T, page: number, limit: number, totalDocs: number) {
    this.data = data;
    this.page = page;
    this.limit = limit;
    this.totalDocs = totalDocs;
  }
}