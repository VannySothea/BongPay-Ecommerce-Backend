import Joi from "joi"
import { CartItem } from "../types/types"

export const validateAddToCart = (data: CartItem) => {
	const schema = Joi.object({
		productId: Joi.number().integer().required(),
		quantity: Joi.number().integer().min(1).required(),
	})

	return schema.validate(data)
}

export const validateUpdateCartItem = (data: CartItem) => {
	const schema = Joi.object({
		productId: Joi.number().integer().required(),
		quantity: Joi.number().integer().min(1).required(),
	})
	return schema.validate(data)
}

export const validateRemoveCartItem = (data: { cartItemId: number }) => {
	const schema = Joi.object({
		cartItemId: Joi.number().integer().required(),
	})
	return schema.validate(data)
}
