import { Request, Response } from "express"
import logger from "../utils/logger"
import prisma from "../prismaClient"
import { VariantInput } from "../types/types"
import cloudinary from "../config/cloudinary"

export const updateProduct = async (req: Request, res: Response) => {
	logger.info("Updating product endpoint hit")

	const id = Number(req.params.productId)
	if (!id) {
		return res
			.status(400)
			.json({ success: false, message: "Product ID is required" })
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
		} = req.body

		let parsedProperties: any[] = []
		let parsedDiscount: any = null
		let parsedVariants: VariantInput[] = []

		// --- Parse JSON inputs ---
		if (properties) {
			try {
				parsedProperties = JSON.parse(properties)
			} catch {
				return res
					.status(400)
					.json({ success: false, message: "Invalid properties format." })
			}
		}
		if (variants !== undefined) {
			try {
				parsedVariants = JSON.parse(variants)
			} catch {
				return res
					.status(400)
					.json({ success: false, message: "Invalid variants format." })
			}
		}
		if (discount) {
			try {
				parsedDiscount = JSON.parse(discount)
			} catch {
				return res
					.status(400)
					.json({ success: false, message: "Invalid discount format." })
			}
		}

		const productImgUrl =
			(req.files as any)?.img?.[0]?.path || existingProduct.img
		const variantImgs = (req.files as any)?.variantImgs || []

		// --- Validate variants and images ---
		if (parsedVariants.length > 0 || variantImgs.length > 0) {
			if (parsedVariants.length !== variantImgs.length) {
				return res.status(400).json({
					success: false,
					message: "Each variant must have both data and corresponding image.",
				})
			}
			for (let i = 0; i < parsedVariants.length; i++) {
				const variant = parsedVariants[i]
				if (
					!variant.name ||
					!variant.propertyValues?.length ||
					!variantImgs[i]?.path
				) {
					return res.status(400).json({
						success: false,
						message: `Variant at index ${i} is missing data or corresponding image.`,
					})
				}
			}
		}

		// --- Delete old product image asynchronously (outside transaction) ---
		if (productImgUrl !== existingProduct.img && existingProduct.img) {
			const publicId = existingProduct.img.split("/").pop()?.split(".")[0]
			if (publicId) cloudinary.uploader.destroy(publicId)
		}

		// --- Handle variant image deletions asynchronously ---
		const oldVariantImgsToDelete = existingProduct.variants
			.filter((v) => !parsedVariants.some((pv) => pv.id === v.id) && v.img)
			.map((v) => v.img!)
		oldVariantImgsToDelete.forEach((img) => {
			const publicId = img.split("/").pop()?.split(".")[0]
			if (publicId) cloudinary.uploader.destroy(publicId)
		})

		// --- Run all DB operations in a transaction (fast, no Cloudinary calls inside) ---
		const updatedProduct = await prisma.$transaction(
			async (tx) => {
				// Update product, discount, and properties
				await tx.product.update({
					where: { id },
					data: {
						name: name ?? existingProduct.name,
						shortDesc: shortDesc ?? existingProduct.shortDesc,
						fullDesc: fullDesc ?? existingProduct.fullDesc,
						img: productImgUrl,
						originalPrice: originalPrice
							? Number(originalPrice)
							: existingProduct.originalPrice,
						stockQuantity: stockQuantity
							? Number(stockQuantity)
							: existingProduct.stockQuantity,
						isFeatured:
							isFeatured !== undefined
								? isFeatured === "true" || isFeatured === true
								: existingProduct.isFeatured,
						discount: parsedDiscount
							? {
									upsert: {
										update: {
											percentage: Number(parsedDiscount.percentage),
											discountPrice: Number(parsedDiscount.discountPrice),
										},
										create: {
											percentage: Number(parsedDiscount.percentage),
											discountPrice: Number(parsedDiscount.discountPrice),
										},
									},
							  }
							: { delete: true },
						properties:
							parsedProperties.length > 0
								? {
										deleteMany: {},
										create: parsedProperties.map((prop) => ({
											propertyName: prop.propertyName,
											propertyValues: prop.propertyValues,
										})),
								  }
								: { deleteMany: {} },
					},
					include: { discount: true, properties: true, variants: true },
				})

				//Delete removed variants
				const variantsToDeleteIds = existingProduct.variants
					.filter((v) => !parsedVariants.some((pv) => pv.id === v.id))
					.map((v) => v.id)
				if (variantsToDeleteIds.length > 0) {
					await tx.variant.deleteMany({
						where: { id: { in: variantsToDeleteIds } },
					})
				}

				// Create new variants in batch
				const newVariants = parsedVariants
					.filter((v) => !v.id)
					.map((v, i) => ({
						productId: id,
						name: v.name,
						propertyValues: v.propertyValues,
						img: variantImgs[i]?.path || null,
					}))
				if (newVariants.length > 0) {
					await tx.variant.createMany({ data: newVariants })
				}

				// Update existing variants in parallel
				const existingVariantsToUpdate = parsedVariants.filter((v) => v.id)
				await Promise.all(
					existingVariantsToUpdate.map((v, i) => {
						const existingVariant = existingProduct.variants.find(
							(ev) => ev.id === v.id
						)!
						const imgPath = variantImgs[i]?.path
						return tx.variant.update({
							where: { id: v.id },
							data: {
								name: v.name,
								propertyValues: v.propertyValues,
								img: imgPath ?? existingVariant.img,
							},
						})
					})
				)
				const product = await tx.product.findUnique({
					where: { id },
					include: { discount: true, properties: true, variants: true },
				})

				return product!
			},
			{ timeout: 600000 }
		) // timeout 60s just in case

		logger.info("Product updated successfully", {
			productId: updatedProduct.id,
		})
		res.status(200).json({ success: true, product: updatedProduct })
	} catch (error) {
		logger.error("Error updating product", { error })
		return res.status(500).json({ success: false, message: "Internal Server Error" })
	}
}
