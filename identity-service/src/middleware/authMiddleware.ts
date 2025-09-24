import { NextFunction, Request, Response } from "express"
import { UserPayload } from "../types/types"

export const authenticateRequest = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const userIdHeader = req.headers["x-user-id"]
	const roleHeader = req.headers["x-user-role"]
	if (
		!userIdHeader ||
		Array.isArray(userIdHeader) ||
		!roleHeader ||
		Array.isArray(roleHeader)
	) {
		return res
			.status(401)
			.json({ message: "Authentication required! Please login to continue." })
	}

	const userId = parseInt(userIdHeader, 10)
	const role = roleHeader
	if (isNaN(userId)) {
		return res.status(400).json({ message: "Access attempted without user ID" })
	}

	req.user = { userId, role } as UserPayload
	next()
}

export const authorizeRoles = (...allowedRoles: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			return res.status(401).json({
				message: "Unauthorized. No user found.",
			})
		}

		const user = req.user as { userId: number; role: string }

		if (!allowedRoles.includes(user.role)) {
			return res.status(403).json({
				message: "Forbidden: You don't have access to this resource",
			})
		}
		next()
	}
}
