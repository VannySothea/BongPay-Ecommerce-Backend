export interface UserPayload {
	userId: number
	role: string
}

export enum PaymentMethod {
  COD = "COD",
  CREDIT_CARD = "CREDIT_CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
  E_WALLET = "E_WALLET",
}

export enum PaymentStatus {
  UNPAID = "UNPAID",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
  FAILED = "FAILED",
}

export enum PaymentProvider {
  COD = "COD",
  ABA_PAY = "ABA_PAY",
  VISA = "VISA",
  MASTER = "MASTER",
  PAYPAL = "PAYPAL",
}

export enum Currency {
	USD = "USD",
	KHR = "KHR",
}

export interface paymentProcessedEvent {
	orderId: number,
	transactionId: string,
	paid: Boolean
}

export interface checkoutData {
	method: PaymentMethod,
	status: PaymentStatus,
	provider: PaymentProvider,
	totalAmount: number,
	currency: Currency,
	shippingAddress: {
		phone: string,
		street: string
		city: string
		postalCode: string
		country: string
	}
}