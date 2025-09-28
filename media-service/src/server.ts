import dotenv from "dotenv"
dotenv.config()

import express from "express"
import helmet from "helmet"
import { RateLimiterRedis } from "rate-limiter-flexible"
import { Redis } from "ioredis"
import { rateLimit } from "express-rate-limit"
import { RedisReply, RedisStore } from "rate-limit-redis"
import cookieParser from "cookie-parser"
import logger from "./utils/logger"
import errorHandler from "./middleware/errorHandler"
import { connectDB } from "./prismaClient"
import router from "./routes/mediaRoutes"
import { consumeEvent } from "./utils/rabbitmq"
import { handleMediaRemoved } from "./eventHandlers/media-event-handlers"

const app = express()
const PORT = process.env.PORT || 3003

if (!process.env.REDIS_URL) {
	logger.error("REDIS_URL is not defined")
	process.exit(1)
}

const redisClient = new Redis(
	process.env.REDIS_URL,
	process.env.NODE_ENV === "production"
		? { tls: { rejectUnauthorized: false } }
		: {}
)

redisClient.on("connect", () => {
	logger.info("Connected to Redis")
})

redisClient.on("error", (err) => {
	logger.error("Redis error:", err)
})

app.set("trust proxy", 1)
app.use(helmet())
app.use(express.json())
app.use(cookieParser())

const getClientIp = (req: express.Request): string => {
	const xff = req.headers["x-forwarded-for"]
	if (xff) {
		const ipList = xff.toString().split(",")
		return ipList[0].trim()
	}
	return req.ip || "unknown"
}

const sensitiveEndpointsLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 Mins
	max: 100, //100 requests
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		logger.warn(
			`Sensitive endpoint rate limit exceeded for IP: ${getClientIp(req)}`
		)
		return res.status(429).json({
			success: false,
			message: "Too many requests",
		})
	},
	store: new RedisStore({
		sendCommand: (
			command: string,
			...args: (string | Buffer | number)[]
		): Promise<RedisReply> => {
			return redisClient.call(command, ...args) as Promise<RedisReply>
		},
	}),
})

const burstLimiter = new RateLimiterRedis({
	storeClient: redisClient,
	keyPrefix: "middleware",
	points: 10, // 10 requests
	duration: 1, // per second
})

app.use((req, res, next) => {
	burstLimiter
		.consume(getClientIp(req))
		.then(() => next())
		.catch(() => {
			logger.warn(`Burst rate limit exceeded for IP: ${getClientIp(req)}`)
			res.status(429).json({
				success: false,
				message: "Too many requests",
			})
		})
})

// Stricter rate limiting only for sensitive endpoints (register/login/etc.)

// Global per-IP rate limiting (short burst protection)
app.use("/api/media", router)
app.use(errorHandler)

async function startServer() {
	try {
		await connectDB()
		
		await consumeEvent("product.removed", handleMediaRemoved)
		app.listen(PORT, () => {
			logger.info(`Media service running on port ${PORT}`)
		})
	} catch (e) {
		logger.error("Failed to connect to server ", e)
		process.exit(1)
	}
}

startServer()

process.on("unhandledRejection", (reason, promise) => {
	logger.error("Unhandled Rejection at:", promise, "reason:", reason)
})
