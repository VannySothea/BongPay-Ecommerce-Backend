import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import logger from "../utils/logger"

// Only verifies and decodes the token, does not send any response
export const validationToken = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const token =
		req.cookies?.accessToken ||
		(req.headers["authorization"] && req.headers["authorization"].split(" ")[1])
	if (!token) {
		return next()
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
		req.user = decoded
	} catch (err) {
		logger.warn("Invalid or expired token!")
	}
	next()
}
