import { Request, Response } from "express"
import logger from "../utils/logger"
import prisma from "../prismaClient"

export const getUserPayment = async (req: Request, res: Response) => {
	logger.info("Get user payment endpoint hit")
	const { userId } = req.user as { userId: number }
	try {
		const payments = await prisma.payment.findMany({
			where: { userId: userId },
		})
		return res.status(200).json({ success: true, data: payments })
	} catch (error) {
		logger.error("Error fetching user payments", { error })
		return res
			.status(500)
			.json({ success: false, message: "Internal server error" })
	}
}
