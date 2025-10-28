import Joi from "joi"
import { checkoutData } from "../types/types"

export const validateCheckout = (data: checkoutData) => {
	const schema = Joi.object({
		method: Joi.string().valid("COD", "CREDIT_CARD", "BANK_TRANSFER", "E_WALLET").required(),
		provider: Joi.string().valid("COD", "ABA_PAY", "VISA", "MASTER", "PAYPAL").required(),
		currency: Joi.string().valid("USD", "KHR").required(),
		shippingAddress: Joi.object({
			phone: Joi.string().min(7).max(15).required(),
			email: Joi.string().email().required(),
			street: Joi.string().min(2).max(100).required(),
			city: Joi.string().min(2).max(100).required(),
			postalCode: Joi.string().min(2).max(10).required(),
			country: Joi.string().min(2).max(100).required(),
		}).required(),
	})

	return schema.validate(data)
}