import { Request, Response } from "express"
import logger from "../utils/logger"
import prisma from "../prismaClient"

export const getAllOrder = async (req: Request, res: Response) => {
	logger.info("Get all orders endpoint hit")
	try {
		const orders = await prisma.order.findMany({
			include: {
				items: {
					include: {
						properties: true,
					},
				},
				shippingAddress: true,
			},
		})
		return res.status(200).json({ success: true, data: orders })
	} catch (error) {
		logger.error("Error fetching all orders", { error })
		return res
			.status(500)
			.json({ success: false, message: "Internal server error" })
	}
}
