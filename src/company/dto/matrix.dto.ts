export interface MatrixDto {
  routes: {
    distance:number
    duration: number
    status: string
    source_id: number
    target_id: number
  }[]
  route_path: string
  total_distance: number
}