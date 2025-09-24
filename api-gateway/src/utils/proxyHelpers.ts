import { Request } from "express"
import proxy from "express-http-proxy"
import { JwtPayload } from "jsonwebtoken"
import logger from "./logger"

export function createProxy(
	targetUrl: string,
	service: string = "service",
	opts: { type?: "json" | "multipart" } = { type: "json" }
) {
	return proxy(targetUrl, {
		proxyReqPathResolver: (req: Request) =>
			req.originalUrl.replace(/^\/v1/, "/api"),

		proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
			// Handle Content-Type
			if (opts?.type === "json") {
				proxyReqOpts.headers["Content-Type"] = "application/json"
			} else if (opts?.type === "multipart") {
				// Don’t override, let multipart pass through
				if (srcReq.headers["content-type"]) {
					proxyReqOpts.headers["Content-Type"] = srcReq.headers["content-type"]
				}
			}

			// Forward Authorization header
			if (srcReq.headers["authorization"]) {
				proxyReqOpts.headers["Authorization"] = srcReq.headers["authorization"]
			}

			// Forward custom user headers
			if (srcReq.user) {
				const user = srcReq.user as JwtPayload
				if (user.userId)
					proxyReqOpts.headers["x-user-id"] = user.userId.toString()
				if (user.role)
					proxyReqOpts.headers["x-user-role"] = user.role.toString()
			}

			// Forward client IP
			const existingXFF = srcReq.headers["x-forwarded-for"]
			const clientIp = srcReq.ip || "unknown"
			proxyReqOpts.headers["X-Forwarded-For"] = existingXFF ? `${existingXFF}, ${clientIp}` : clientIp

			return proxyReqOpts
		},

		// Only disable body parsing for multipart
		parseReqBody: opts?.type !== "multipart",

		proxyErrorHandler: (err, res) => {
			const failedUrl = res.locals.proxyUrl || "Unknown URL"
			logger.error(`Proxy error for ${failedUrl}: ${err.message}`)
			res.status(500).json({ message: "Internal server error" })
		},

		userResDecorator: (proxyRes, proxyResData) => {
			logger.info(
				`Response received from service ${service}: ${proxyRes.statusCode}`
			)
			return proxyResData
		},
	})
}
