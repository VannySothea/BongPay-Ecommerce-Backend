import { Request, Response } from "express"
import prisma from "../prismaClient"
import logger from "../utils/logger"


export const getAllProduct = async (req: Request, res: Response) => {
	logger.info("Fetching all products")
	try {
		const products = await prisma.product.findMany({
			select: {
				id: true,
				name: true,
				shortDesc: true,
				originalPrice: true,
				discount: true,
				mainImageId: true,
			}
		})
		res.status(200).json({ success: true, products })
	} catch (error) {
		logger.error("Error fetching products", { error })
		res.status(500).json({ success: false, message: "Internal Server Error" })
	}
}