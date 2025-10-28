import { Request, Response } from "express"
import logger from "../utils/logger"
import prisma from "../prismaClient"

export const removeCartItem = async (req: Request, res: Response) => {
	logger.info("Remove cart item endpoint hit")
	const { userId } = req.user as { userId: number }
	const cartItemId = parseInt(req.params.cartItemId)
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

		const existingItem = await prisma.cartItem.findUnique({
			where: {
				id: cartItemId,
			},
		})

		if (!existingItem) {
			logger.error(`Product with ID ${cartItemId} not found in cart`)
			return res.status(404).json({ message: "Product not found in cart" })
		}

		await prisma.cartItem.delete({
			where: { id: existingItem.id },
		})

		logger.info(`Product ${cartItemId} removed from cart successfully`)
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
