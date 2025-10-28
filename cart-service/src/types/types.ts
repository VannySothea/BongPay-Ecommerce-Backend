export interface UserPayload {
	userId: number
	role: string
}

export interface CartItem {
  quantity: number
}

export interface CartEvent {
  userId: number
}

export interface CartItemEvent {
  productId: number
}