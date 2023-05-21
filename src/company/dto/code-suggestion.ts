export class CodeSuggestion {
  groupId: string
  orders: OrderDto[]

}

export class OrderDto {
  id: string
  code: string
}