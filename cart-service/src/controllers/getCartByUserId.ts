import { Request, Response } from "express"
import logger from "../utils/logger"
import prisma from "../prismaClient"

export const getCartByUserId = async (req: Request, res: Response) => {
	logger.info("Fetching cart by userID endpoint hit")
	const userId = parseInt(req.params.userId)

	try {
		const cart = await prisma.cart.findUnique({
			where: { userId },
			include: {
				items: {
                    include: {
                        properties: true
                    }
                },
			},
		})

		if (!cart) {
			return res.status(404).json({ success: false, message: "Cart not found" })
		}

		logger.info("Cart fetched successfully", { cart })

		return res.status(200).json({ success: true, cart })
	} catch (error) {
		logger.error("Error fetching cart", error)
		return res
			.status(500)
			.json({ success: false, message: "Internal Server Error" })
	}
}
