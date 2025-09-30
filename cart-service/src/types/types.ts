export interface UserPayload {
	userId: number
	role: string
}

export interface CartItemEvent {
  productId: number
  name: string
  shortDesc: string
  updatedAt: Date
}