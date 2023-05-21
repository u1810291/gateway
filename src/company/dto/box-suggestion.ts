export class Order{
  id: string
  code: string
  externalNumber: string
  images: string[]
  name: string
}

export class BoxSuggestion {
  groupId: string
  recipient: Recipient
  orders: Order[]
}

export class Recipient {
  name: string
  phone: string[]
  address: string
}
