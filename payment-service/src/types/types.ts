export interface UserPayload {
	userId: number
	role: string
}

export interface orderCheckoutEvent {
	orderId: number
	userId: number
	method: PaymentMethod
	provider: PaymentProvider
	amount: number
	currency: Currency
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