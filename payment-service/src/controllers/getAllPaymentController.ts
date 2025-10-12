import { Request, Response } from "express"
import logger from "../utils/logger"
import prisma from "../prismaClient"

export const getAllPayment = async (req: Request, res: Response) => {
	logger.info("Get all payments endpoint hit")
	try {
		const payments = await prisma.payment.findMany()
		return res.status(200).json({ success: true, data: payments })
	} catch (error) {
		logger.error("Error fetching all payments", { error })
		return res
			.status(500)
			.json({ success: false, message: "Internal server error" })
	}
}
