import { Request, Response } from "express"
import prisma from "../prismaClient"
import logger from "../utils/logger"

export const getAllProduct = async (req: Request, res: Response) => {
	logger.info("Fetching all products")
	try {
		const page = parseInt(req.query.page as string) || 1
		const limit = parseInt(req.query.limit as string) || 10
		const offset = (page - 1) * limit

		const cacheKey = `products:${page}:${limit}`
		const cachedData = await req.redisClient.get(cacheKey)

		if (cachedData) {
			logger.info("Serving products from cache", { page, limit })
			return res
				.status(200)
				.json({ success: true, ...JSON.parse(cachedData) })
		}

		const products = await prisma.product.findMany({
			orderBy: { createdAt: "desc" },
			skip: offset,
			take: limit,
			select: {
				id: true,
				name: true,
				shortDesc: true,
				originalPrice: true,
				discount: true,
				mainImageId: true,
			},
		})

		const totalProducts = await prisma.product.count()
		const result = {
			products,
			currentPage: page,
			totalPages: Math.ceil(totalProducts / limit),
			totalProducts,
		}

		await req.redisClient.setex(
			cacheKey,
			300, // Cache for 5 minutes
			JSON.stringify({ result })
		)

		logger.info("Serving products from database", { page, limit })

		res.status(200).json({ success: true, result })
	} catch (error: any) {
		logger.error("Error fetching products", {
			message: error.message,
			stack: error.stack,
		})
		res.status(500).json({ success: false, message: "Internal Server Error" })
	}
}
