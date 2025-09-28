import { Request, Response } from "express"
import logger from "../utils/logger"
import prisma from "../prismaClient"
import { validateUpdateProduct } from "../utils/validation"
import { publishEvent } from "../utils/rabbitmq"

export const updateProduct = async (req: Request, res: Response) => {
	logger.info("Updating product endpoint hit")
	const id = Number(req.params.productId)
	if (!id) {
		return res
			.status(400)
			.json({ success: false, message: "Product ID is required" })
	}
	const { error, value } = validateUpdateProduct(req.body)
	if (error) {
		logger.error("Update product validation error", error.details)
		return res
			.status(400)
			.json({ success: false, message: error.details[0].message })
	}

	try {
		const existingProduct = await prisma.product.findUnique({
			where: { id },
			include: { variants: true, properties: true, discount: true },
		})

		if (!existingProduct) {
			return res
				.status(404)
				.json({ success: false, message: "Product not found" })
		}

		const mediaIdsToDelete: string[] = []

		if ("mainImageId" in value) {
			if (value.mainImageId !== existingProduct.mainImageId) {
				if (existingProduct.mainImageId) {
					mediaIdsToDelete.push(existingProduct.mainImageId)
				}
			}
		}

		if ("variants" in value) {
			const existingVariantImageIds = existingProduct.variants.map(
				(v) => v.imageId
			)
			const newVariantImageIds = (value.variants ?? []).map(
				(v: any) => v.imageId
			)

			if (value.variants === null) {
				// Delete all variant images
				mediaIdsToDelete.push(...existingVariantImageIds.filter(Boolean))
			} else {
				// Delete only images no longer present
				const removedVariantImages = existingVariantImageIds.filter(
					(mid) => mid && !newVariantImageIds.includes(mid)
				)
				mediaIdsToDelete.push(...removedVariantImages)
			}
		}

		// Only compute mediaIdsToDelete if user explicitly provided mainImageId or variants
		if (mediaIdsToDelete.length > 0) {
			await publishEvent("media.removed", { mediaIds: mediaIdsToDelete })
		}

		// Update product
		const updateData: any = {}
		if (value.name !== undefined) updateData.name = value.name
		if (value.shortDesc !== undefined) updateData.shortDesc = value.shortDesc
		if (value.fullDesc !== undefined) updateData.fullDesc = value.fullDesc
		if (value.originalPrice !== undefined)
			updateData.originalPrice = value.originalPrice
		if (value.stockQuantity !== undefined)
			updateData.stockQuantity = value.stockQuantity
		if (value.isFeatured !== undefined) updateData.isFeatured = value.isFeatured
		if (value.mainImageId !== undefined)
			updateData.mainImageId = value.mainImageId

		// Discount handling
		if (value.discount !== undefined && value.discount !== null) {
			updateData.discount = {
				upsert: {
					create: {
						percentage: value.discount.percentage,
						discountPrice:
							value.discount.discountPrice ??
							parseFloat(
								(
									(value.discount.percentage *
										(value.originalPrice ?? existingProduct.originalPrice)) /
									100
								).toFixed(2)
							),
					},
					update: {
						percentage: value.discount.percentage,
						discountPrice:
							value.discount.discountPrice ??
							parseFloat(
								(
									(value.discount.percentage *
										(value.originalPrice ?? existingProduct.originalPrice)) /
									100
								).toFixed(2)
							),
					},
				},
			}
		} else if (value.discount === null) {
			// Explicitly null means delete discount
			updateData.discount = { delete: true }
		}

		// Properties
		if (value.properties !== undefined && value.properties !== null) {
			updateData.properties = {
				deleteMany: {},
				create: value.properties.map((p: any) => ({
					propertyName: p.propertyName,
					propertyValues: p.propertyValues,
				})),
			}
		} else if (value.properties === null) {
			// Explicitly null means delete all properties
			updateData.properties = { deleteMany: {} }
		}

		// Variants
		if (value.variants !== undefined && value.variants !== null) {
			updateData.variants = {
				deleteMany: {},
				create: value.variants.map((v: any) => ({
					name: v.name,
					propertyValues: v.propertyValues,
					imageId: v.imageId,
				})),
			}
		} else if (value.variants === null) {
			// Explicitly null means delete all variants
			updateData.variants = { deleteMany: {} }
		}

		const updatedProduct = await prisma.product.update({
			where: { id },
			data: updateData,
			include: { variants: true, properties: true, discount: true },
		})

		await publishEvent("product.updated", {
			productId: updatedProduct.id,
			name: updatedProduct.name,
			shortDesc: updatedProduct.shortDesc,
			updatedAt: updatedProduct.updatedAt,
		})

		logger.info("Product updated successfully", {
			productId: updatedProduct.id,
		})
		return res.status(200).json({ success: true, product: updatedProduct })
	} catch (error) {
		logger.error("Error updating product", { error })
		return res
			.status(500)
			.json({ success: false, message: "Internal Server Error" })
	}
}
