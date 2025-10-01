import { Request, Response } from "express"
import prisma from "../prismaClient"
import logger from "../utils/logger"
import { validateAddProduct } from "../utils/validation"
import { publishEvent } from "../utils/rabbitmq"

export const addProduct = async (req: Request, res: Response) => {
	logger.info("Adding a new product endpoint hit")
	const { error, value } = validateAddProduct(req.body)

	if (error) {
		logger.error("Add product validation error", error.details)
		return res
			.status(400)
			.json({ success: false, message: error.details[0].message })
	}
	try {
		const {
			name,
			shortDesc,
			fullDesc,
			originalPrice,
			stockQuantity,
			isFeatured,
			discount,
			properties,
			variants,
			mainImageId,
		} = value

		const newProduct = await prisma.product.create({
			data: {
				name,
				shortDesc,
				fullDesc,
				originalPrice,
				stockQuantity,
				isFeatured,
				mainImageId,
				discount: discount
					? {
							create: {
								percentage: discount.percentage,
								discountPrice:
									discount.discountPrice ??
									parseFloat(
										((discount.percentage * originalPrice) / 100).toFixed(2)
									),
							},
					  }
					: undefined,
				properties: properties
					? {
							create: properties.map((prop: any) => ({
								propertyName: prop.propertyName,
								propertyValues: prop.propertyValues,
							})),
					  }
					: undefined,

				variants: variants
					? {
							create: variants.map((variant: any) => ({
								name: variant.name,
								propertyValues: variant.propertyValues,
								imageId: variant.imageId,
							})),
					  }
					: undefined,
			},
			include: {
				discount: true,
				properties: true,
				variants: true,
			},
		})

		await publishEvent("product_events", "product.added", {
			productId: newProduct.id,
			name: newProduct.name,
			shortDesc: newProduct.shortDesc,
		})

		logger.info("Product added successfully", { productId: newProduct.id })
		return res.status(201).json({ success: true, product: newProduct })
	} catch (error) {
		logger.error("Error adding product", error)
		return res
			.status(500)
			.json({ success: false, message: "Internal Server Error" })
	}
}
