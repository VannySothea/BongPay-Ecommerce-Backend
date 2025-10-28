import Joi from "joi"
import { CartItem } from "../types/types"

export const validateAddToCart = (data: CartItem) => {
	const schema = Joi.object({
		quantity: Joi.number().integer().min(1).required(),
	})

	return schema.validate(data)
}

export const validateUpdateCartItem = (data: CartItem) => {
	const schema = Joi.object({
		quantity: Joi.number().integer().min(1).required(),
	})
	return schema.validate(data)
}