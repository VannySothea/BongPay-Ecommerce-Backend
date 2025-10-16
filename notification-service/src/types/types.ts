export interface UserPayload {
	userId: number
	role: string
}

export interface SendVerificationEmailEvent {
	email: string,
	code: string
}

export interface SendEmail {
	email: string
}

export interface SendPaymentSuccessEmailEvent {
	orderId: number
	transactionId: string,
}