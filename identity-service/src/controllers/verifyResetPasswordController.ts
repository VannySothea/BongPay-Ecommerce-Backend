import logger from "../utils/logger"
import prisma from "../prismaClient"
import {
	validateTwoFactorCode,
} from "../utils/validation"
import { Request, Response } from "express"
import { generateResetPasswordToken } from "../utils/generateToken"
import { User } from "../types/types"
import { revokeVerificationToken } from "../middleware/authMiddleware"


export const verifyResetPassword = async (req: Request, res: Response) => {
	logger.info("Verify account endpoint hit")
	try {
		const { userId } = req.user as { userId: number }
		const { code } = req.body
		const { error: twoFactorError } = validateTwoFactorCode({ code: code })

		if (twoFactorError) {
			logger.error("Two-factor code validation error", twoFactorError.details)
			return res
				.status(400)
				.json({ success: false, message: twoFactorError.details[0].message })
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
		})

		if (!user) {
			logger.error("User not found")
			return res.status(404).json({ success: false, message: "User not found" })
		}

		if (!user.isVerified) {
			logger.error("User account is not verified")
			return res
				.status(400)
				.json({ success: false, message: "User not found" })
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

		await revokeVerificationToken(res)
		await generateResetPasswordToken(res, user as User)

		logger.info("Account verified successfully ready to reset password", { userId: user.id })
		return res
			.status(200)
			.json({ success: true, message: "Account verified successfully ready to reset password" })
	} catch (err) {
		logger.error("Error verifying account", err)
		return res.status(500).json({
			success: false,
			message: err instanceof Error ? err.message : "Internal server error",
		})
	}
}
