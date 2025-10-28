import logger from "../utils/logger"
import prisma from "../prismaClient"
import {
	validateTwoFactorCode,
} from "../utils/validation"
import { Request, Response } from "express"
import { publishEvent } from "../utils/rabbitmq"
import { revokeVerificationToken } from "../middleware/authMiddleware"

export const verifyAccount = async (req: Request, res: Response) => {
	logger.info("Verify account endpoint hit")
	try {
		const { code } = req.body
		const { userId } = req.user as { userId: number }
		const { error: twoFactorError } = validateTwoFactorCode({ code: code })
		if (twoFactorError) {
			logger.error("Two-factor code validation error", twoFactorError.details)
			return res
				.status(400)
				.json({ success: false, message: twoFactorError.details[0].message })
		}

		if (!userId) {
			logger.error("No user ID found")
			return res
				.status(400)
				.json({ success: false, message: "No user ID found" })
		}

		logger.info("User ID", { userId })

		const user = await prisma.user.findUnique({
			where: { 
				id: userId,
			},
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

		if (
			user.twoFactorCode !== code ||
			(user.twoFactorExp && user.twoFactorExp < new Date())
		) {
			logger.error("Invalid or expired verification code")
			return res
				.status(400)
				.json({ success: false, message: "Invalid or expired verification code" })
		}

		await prisma.user.update({
			where: { id: user.id },
			data: {
				isVerified: true,
				twoFactorCode: null,
				twoFactorExp: null,
			},
		})

		
		await publishEvent("identity.service", "user.verified", {
			userId: user.id
		})
		await revokeVerificationToken(res)
		
		logger.info("Account verified successfully", { userId: user.id })
		return res
			.status(200)
			.json({ success: true, message: "Account verified successfully" })

	} catch (err) {
		logger.error("Error verifying account", err)
		return res.status(500).json({
			success: false,
			message: err instanceof Error ? err.message : "Internal server error",
		})
	}
}
