import logger from "../utils/logger"
import prisma from "../prismaClient"
import { Request, Response } from "express"
import { generateVerificationToken } from "../utils/generateToken"
import { publishEvent } from "../utils/rabbitmq"

export const verifyAccountCodeResend = async (req: Request, res: Response) => {
	logger.info("Resend verification code request endpoint hit")
	try {
		const { userId } = req.user as { userId: number }
		const user = await prisma.user.findUnique({
			where: { id: userId },
		})

		if (!user) {
			logger.error("User not found")
			return res.status(404).json({ success: false, message: "User not found" })
		}
		if (user.isVerified) {
			logger.warn("User already verified", { userId: user.id })
			return res
				.status(400)
				.json({ success: false, message: "User already verified" })
		}

		// Generate new two-factor code

		const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString()

		await prisma.user.update({
			where: { id: user.id },
			data: {
				twoFactorCode,
				twoFactorExp: new Date(Date.now() + 3 * 60 * 1000), // 3 minutes from current
			},
		})

		await generateVerificationToken(res, user.id, user.email)
		await publishEvent("identity.service", "user.registered", {
			email: user.email,
			code: twoFactorCode,
		})

		logger.info("Resend verification code request successful", {
			userId: user.id,
		})

		return res.status(200).json({
			success: true,
			message: "Resend verification code request successful",
		})
	} catch (err) {
		logger.error("Error processing resend verification code request", err)
		return res.status(500).json({
			success: false,
			message: err instanceof Error ? err.message : "Internal server error",
		})
	}
}
