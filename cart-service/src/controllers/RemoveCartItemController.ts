import { Request, Response } from "express"
import logger from "../utils/logger"
import prisma from "../prismaClient"
import { validateRemoveCartItem } from "../utils/validation"

export const removeCartItem = async (req: Request, res: Response) => {
	logger.info("Remove cart item endpoint hit")
	const { userId } = req.user as { userId: number }
	const { error, value } = validateRemoveCartItem(req.body)
	if (error) {
		logger.error(`Validation error: ${error.details[0].message}`)
		return res.status(400).json({ message: error.details[0].message })
	}

	try {
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
				id: value.cartItemId,
			},
		})

		if (!existingItem) {
			logger.error(`Product with ID ${value.productId} not found in cart`)
			return res.status(404).json({ message: "Product not found in cart" })
		}

		await prisma.cartItem.delete({
			where: { id: existingItem.id },
		})

		logger.info(`Product ${value.productId} removed from cart successfully`)
		return res
			.status(200)
			.json({ success: true, message: "Product removed from cart" })
	} catch (error) {
		logger.error("Error removing product from cart", error)
		return res
			.status(500)
			.json({ success: false, message: "Internal Server Error" })
	}
}
