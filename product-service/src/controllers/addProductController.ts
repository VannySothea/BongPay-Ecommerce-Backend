import { Request, Response } from "express"
import prisma from "../prismaClient"
import logger from "../utils/logger"
import { validateAddProduct } from "../utils/validation"

export const addProduct = async (req: Request, res: Response) => {
	logger.info("Adding a new product endpoint hit")
	const { error } = validateAddProduct(req.body)
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
		} = req.body

		let parsedProperties:
			| { propertyName: string; propertyValues: string[] }[]
			| undefined

		if (properties) {
			try {
				parsedProperties = JSON.parse(properties)
			} catch (err) {
				logger.error("Failed to parse properties", { err })
				return res.status(400).json({
					success: false,
					message: "Invalid properties format. Must be a JSON array.",
				})
			}
		}

		let parsedVariants: { name: string; propertyValues: string[] }[] | undefined

		if (variants) {
			try {
				parsedVariants = JSON.parse(variants)
			} catch (err) {
				logger.error("Failed to parse variants", { err })
				return res.status(400).json({
					success: false,
					message: "Invalid variants format. Must be a JSON array.",
				})
			}
		}

		let parsedDiscount:
			| { percentage: number; discountPrice: number }
			| undefined

		if (discount) {
			try {
				parsedDiscount = JSON.parse(discount)
				if (parsedDiscount?.percentage == null) {
					return res.status(400).json({
						success: false,
						message: "Percentage field is required.",
					})
				}
			} catch (err) {
				logger.error("Failed to parse discount", { err })
				return res.status(400).json({
					success: false,
					message: "Invalid discount format. Must be a JSON object.",
				})
			}
		}

		logger.info("Product details received", {
			name,
			shortDesc,
			fullDesc,
			originalPrice,
			stockQuantity,
			isFeatured,
			discount: parsedDiscount,
			properties: parsedProperties,
			variants: parsedVariants,
		})
		logger.info("File received", { file: req.files })

		// Cloudinary image URL
		const productImgUrl = (req.files as any)?.img?.[0]?.path

		if (!productImgUrl) {
			logger.warn("No image uploaded for product")
			return res
				.status(400)
				.json({ success: false, message: "Product image is required" })
		}

		const variantImgs = (req.files as any)?.variantImgs || []

		if (parsedVariants || variantImgs.length > 0) {
			// Check that both arrays exist and have the same length
			if (!parsedVariants || parsedVariants.length !== variantImgs.length) {
				return res.status(400).json({
					success: false,
					message: "Each variant must have both data and corresponding image.",
				})
			}

			// Check that each variant has both name/propertyValues and image
			for (let i = 0; i < parsedVariants.length; i++) {
				const variant = parsedVariants[i]
				const variantImg = variantImgs[i]?.path
				if (!variant.name || !variant.propertyValues?.length || !variantImg) {
					return res.status(400).json({
						success: false,
						message: `Variant at index ${i} is missing data or corresponding image.`,
					})
				}
			}
		}

		logger.info("Product image uploaded successfully", { productImgUrl })

		const product = await prisma.product.create({
			data: {
				name,
				shortDesc,
				fullDesc,
				img: productImgUrl,
				originalPrice: Number(originalPrice),
				stockQuantity: Number(stockQuantity),
				isFeatured: isFeatured === "true" || isFeatured === true,
				discount: parsedDiscount
					? {
							create: {
								percentage: Number(parsedDiscount.percentage),
								discountPrice: Number(parsedDiscount.discountPrice),
							},
					  }
					: undefined,
				properties: parsedProperties
					? {
							create: parsedProperties.map((prop: any) => ({
								propertyName: prop.propertyName,
								propertyValues: prop.propertyValues,
							})),
					  }
					: undefined,

				variants: parsedVariants
					? {
							create: parsedVariants.map((variant: any, index: number) => ({
								name: variant.name,
								propertyValues: variant.propertyValues,
								img: variantImgs[index]?.path || null,
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

		logger.info("Product added successfully", { productId: product.id })
		res.status(201).json({ success: true, product })
	} catch (error) {
		logger.error("Error adding product", { error })
		res.status(500).json({ success: false, message: "Internal Server Error" })
	}
}
