import { Request, Response } from "express"
import logger from "../utils/logger"
import prisma from "../prismaClient"

export const getPaymentByTransactionId = async (req: Request, res: Response) => {
    logger.info("Get payment by transaction ID endpoint hit")
    try {
        const { transactionId } = req.params 
        const payment = await prisma.payment.findUnique({
            where: { transactionId: transactionId },
        })

        if (!payment) {
            logger.error(`Payment with Transaction ID ${transactionId} not found`)
            return res
                .status(404)
                .json({ success: false, message: "Payment not found" })
        }

        return res.json({ success: true, data: payment })
    } catch (error) {
        logger.error("Error getting payment by transaction ID", { error })
        return res
            .status(500)
            .json({ success: false, message: "Internal Server Error" })
    }
}