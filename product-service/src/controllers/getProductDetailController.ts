import { Request, Response } from "express"
import logger from "../utils/logger"
import prisma from "../prismaClient"


export const getProductDetail = async (req: Request, res: Response) => {
	const productId = Number(req.params.id)
	logger.info("Fetching product details", { productId })

	if (isNaN(productId)) {
		return res
			.status(400)
			.json({ success: false, message: "Invalid product ID" })
	}

	try {
		const product = await prisma.product.findUnique({
			where: { id: productId },
			include: {
				variants: true,
				properties: true,
				discount: true,
			}
		})

		if (!product) {
			return res
				.status(404)
				.json({ success: false, message: "Product not found" })
		}

		res.status(200).json({ success: true, product })
	} catch (error) {
		logger.error("Error fetching product details", { error })
		res.status(500).json({ success: false, message: "Internal Server Error" })
	}
}