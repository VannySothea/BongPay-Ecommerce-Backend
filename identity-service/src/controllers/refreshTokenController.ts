import logger from "../utils/logger"
import prisma from "../prismaClient"
import {
	validateRefreshToken,
} from "../utils/validation"
import { Request, Response } from "express"
import {
	generateTokens,
} from "../utils/generateToken"
import { User } from "../types/types"

export const refreshTokenUser = async (req: Request, res: Response) => {
	logger.info("Refresh token endpoint hit")
	try {
		const refreshToken = req?.cookies.refreshToken

		const { error } = validateRefreshToken({
			token: refreshToken,
		})
		if (error) {
			logger.error("Refresh token validation error", error.details)
			return res
				.status(400)
				.json({ success: false, message: error.details[0].message })
		}

		if (!refreshToken) {
			logger.error("No refresh token found")
			return res
				.status(400)
				.json({ success: false, message: "No refresh token found" })
		}

		const storedToken = await prisma.refreshToken.findUnique({
			where: { token: refreshToken },
		})

		if (!storedToken || storedToken.expiresAt < new Date()) {
			logger.error("Invalid or expired token")
			return res
				.status(400)
				.json({ success: false, message: "Invalid or expired token" })
		}

		const user = await prisma.user.findUnique({
			where: { id: storedToken.userId, isVerified: true },
		})

		if (!user) {
			logger.error("User not found")
			return res.status(404).json({ success: false, message: "User not found" })
		}

		const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
			await generateTokens(res, user as User)

		// Delete the old refresh token
		await prisma.refreshToken.delete({ where: { token: refreshToken } })

		logger.info("User refresh token successfully", { userId: user.id })

		return res.status(200).json({
			success: true,
			message: "User refresh token successfully",
			accessToken: newAccessToken,
			refreshToken: newRefreshToken,
		})
	} catch (err) {
		logger.error("Error refreshing token", err)
		return res.status(500).json({
			success: false,
			message: err instanceof Error ? err.message : "Internal server error",
		})
	}
}
