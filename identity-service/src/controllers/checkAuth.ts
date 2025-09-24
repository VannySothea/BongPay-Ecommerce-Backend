import logger from "../utils/logger"
import { Request, Response } from "express"
import { UserPayload } from "../types/types"

export const checkAuth = async (req: Request, res: Response) => {
	logger.info("Check auth endpoint hit")
	try {
		const user = req.user as UserPayload

		if (!user) {
			return res.status(401).json({
				success: false,
				message: "User not authenticated",
			})
		}

		return res.status(200).json({
			success: true,
			message: "User is authenticated",
			data: {
				userId: user.userId,
				role: user.role,
			},
		})
	} catch (err) {
		logger.error("Error checking auth", err)
		return res.status(500).json({
			success: false,
			message: err instanceof Error ? err.message : "Internal server error",
		})
	}
}
