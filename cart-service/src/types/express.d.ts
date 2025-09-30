import { JwtPayload } from "jsonwebtoken"

declare global {
	namespace Express {
		interface Request {
			user?: {
				userId: number
				role: string
			} & JwtPayload
		}
	}
}
