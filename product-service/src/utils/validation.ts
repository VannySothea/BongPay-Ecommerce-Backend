import Joi, { Schema } from "joi"
import { CreateProductData } from "../types/types"

export const validateAddProduct = (data: CreateProductData) => {
	const schema = Joi.object({
		name: Joi.string().required(),
		shortDesc: Joi.string().required(),
		fullDesc: Joi.string().optional(),
		originalPrice: Joi.number().required(),
		stockQuantity: Joi.number().integer().required(),
		isFeatured: Joi.boolean().required(),
		discount: Joi.object({
			percentage: Joi.number().min(0).max(100).required(),
			discountPrice: Joi.number().min(0).optional(),
		}).optional(),
		properties: Joi.array()
			.items(
				Joi.object({
					propertyName: Joi.string().required(),
					propertyValues: Joi.array().items(Joi.string()).required(),
				})
			)
			.optional(),
		variants: Joi.array()
			.items(
				Joi.object({
					name: Joi.string().required(),
					propertyValues: Joi.array().items(Joi.string()).required(),
					imageId: Joi.string().required(),
				})
			)
			.optional(),

		mainImageId: Joi.string().required(),
	})

	return schema.validate(data)
}

export const validateUpdateProduct = (data: CreateProductData) => {
	const schema = Joi.object({
		name: Joi.string().optional(),
		shortDesc: Joi.string().optional(),
		fullDesc: Joi.string().optional(),
		originalPrice: Joi.number().optional(),
		stockQuantity: Joi.number().integer().optional(),
		isFeatured: Joi.boolean().optional(),
		discount: Joi.object({
			percentage: Joi.number().min(0).max(100).optional(),
			discountPrice: Joi.number().min(0).optional(),
		})
			.allow(null)
			.optional(), // allow null to delete discount
		properties: Joi.array()
			.items(
				Joi.object({
					propertyName: Joi.string().optional(),
					propertyValues: Joi.array().items(Joi.string()).optional(),
				})
			)
			.allow(null) // allow null to delete all properties
			.optional(),
		variants: Joi.array()
			.items(
				Joi.object({
					name: Joi.string().optional(),
					propertyValues: Joi.array().items(Joi.string()).optional(),
					imageId: Joi.string().optional(),
				})
			)
			.allow(null) // allow null to delete all variants
			.optional(),
		mainImageId: Joi.string().optional(),
	})

	return schema.validate(data)
}
