import { Request } from "express"
import logger from "./logger"


export async function invalidateProductCache(req: Request, input: any) {

    const cacheKey = `product:${input}`;
    await req.redisClient.del(cacheKey);
    logger.info("Invalidated product cache", { cacheKey });

	const keys = await req.redisClient.keys("products:*")
	if (keys.length > 0) {
		await req.redisClient.del(keys)
		logger.info("Invalidated product cache", { keys })
	}
}
