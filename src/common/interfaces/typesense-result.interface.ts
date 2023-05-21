export interface TypesenseResultInterface<T> {
  found: number;
  hits: { document: T }[];
  out_of: number;
  page: number;
  request_params: { per_page: number };
}