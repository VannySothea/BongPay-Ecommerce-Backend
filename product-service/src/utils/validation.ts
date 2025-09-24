import Joi, { Schema } from "joi"
import { CreateProductData } from "../types/types"

export const validateAddProduct = (data: CreateProductData) => {
	const schema = Joi.object({
		name: Joi.string().required(),
		shortDesc: Joi.string().required(),
		fullDesc: Joi.string(),
		// img: Joi.string().required(),
		originalPrice: Joi.number().required(),
		stockQuantity: Joi.number().required(),
		isFeatured: Joi.boolean().required(),
		discount: Joi.string(),
		properties: Joi.string(),
		variants: Joi.string(),
	})

	return schema.validate(data)
}
