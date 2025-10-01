import { Request, Response } from "express"
import logger from "../utils/logger"
import prisma from "../prismaClient"
import { validateAddToCart } from "../utils/validation"
import axios from "axios"

export const addToCart = async (req: Request, res: Response) => {
	logger.info("Add to cart endpoint hit")
	const { userId } = req.user as { userId: number }
	const { error, value } = validateAddToCart(req.body)
	if (error) {
		logger.error(`Validation error: ${error.details[0].message}`)
		return res.status(400).json({ message: error.details[0].message })
	}

	try {
		const productRes = await axios.get(
			`${process.env.PRODUCT_SERVICE_URL}/product/${value.productId}`
		)

		if (!productRes.data.product) {
			logger.error(`Product with ID ${value.productId} not found`)
			return res.status(404).json({ message: "Product not found" })
		}

		const { name, shortDesc, mainImageId, originalPrice } = productRes.data.product
        let price = originalPrice

        if (productRes.data.product.discount) {
            price = originalPrice - productRes.data.product.discount.discountPrice
        }


		let cart = await prisma.cart.findUnique({
			where: { userId },
		})
		if (!cart) {
			logger.info(`Creating new cart for user ${userId}`)
			cart = await prisma.cart.create({
				data: { userId },
			})
		}

		const existingItem = await prisma.cartItem.findFirst({
			where: {
				cartId: cart.id,
				productId: value.productId,
			},
		})

		if (existingItem) {
			logger.info(
				`Updating quantity for product ${value.productId} in user ${userId}'s cart`
			)
			await prisma.cartItem.update({
				where: { id: existingItem.id },
				data: { quantity: existingItem.quantity + value.quantity },
			})
		} else {
			logger.info(`Adding product ${value.productId} to user ${userId}'s cart`)
			await prisma.cartItem.create({
				data: {
					cartId: cart.id,
					productId: value.productId,
					productName: name,
					productShortDesc: shortDesc,
					productMainImageId: mainImageId,
					productPrice: price,
					quantity: value.quantity,
                    properties: value.properties
					? {
							create: value.properties.map((prop: any) => ({
								propertyName: prop.propertyName,
								propertyValues: prop.propertyValues,
							})),
					  }
					: undefined,
				},
			})
		}

        logger.info(`Product ${value.productId} added/updated in cart successfully`)
		return res
			.status(200)
			.json({ success: true, message: "Product added to cart" })
	} catch (error) {
		logger.error("Error adding product to cart", error)
		return res
			.status(500)
			.json({ success: false, message: "Internal Server Error" })
	}
}
