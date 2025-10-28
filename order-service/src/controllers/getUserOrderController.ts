import { Request, Response } from "express"
import logger from "../utils/logger"
import prisma from "../prismaClient"

export const getUserOrder = async (req: Request, res: Response) => {
	logger.info("Get order endpoint hit")
	const { userId } = req.user as { userId: number }
	try {
		const order = await prisma.order.findMany({
			where: {
				userId,
			},
			include: {
				items: {
					include: {
						properties: true,
					},
				},
			},
		})

		if (!order) {
			logger.error(`Order with userID ${userId} not found`)
			return res
				.status(404)
				.json({ success: false, message: "Order not found" })
		}

		return res.json({ success: true, data: order })
	} catch (error) {
		logger.error("Error getting order", { error })
		return res
			.status(500)
			.json({ success: false, message: "Internal Server Error" })
	}
}
