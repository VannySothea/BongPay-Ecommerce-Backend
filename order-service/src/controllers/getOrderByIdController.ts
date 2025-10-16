import { Request, Response } from "express"
import logger from "../utils/logger"
import prisma from "../prismaClient"

export const getOrderById = async (req: Request, res: Response) => {
	logger.info("Get order by id endpoint hit")
	try {
        const { id } = req.params
		const order = await prisma.order.findUnique({
			where: { id: Number(id) },
			include: {
				items: {
					include: {
						properties: true,
					},
				},
                shippingAddress: true,
			},
		})

		if (!order) {
			logger.error(`Order with ID ${id} not found`)
			return res
				.status(404)
				.json({ success: false, message: "Order not found" })
		}

		return res.json({ success: true, data: order })
	} catch (error) {
		logger.error("Error getting order by id", { error })
		return res
			.status(500)
			.json({ success: false, message: "Internal Server Error" })
	}
}
