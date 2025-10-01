import { Request, Response } from "express"
import logger from "../utils/logger"
import prisma from "../prismaClient"
import { publishEvent } from "../utils/rabbitmq"

export const removeProduct = async (req: Request, res: Response) => {
	logger.info("Remove product endpoint hit")
	const id = Number(req.params.productId)
	if (!id) {
		return res
			.status(400)
			.json({ success: false, message: "Product ID is required" })
	}

	try {
		const existingProduct = await prisma.product.findUnique({
			where: { id },
			include: { variants: true },
		})

		if (!existingProduct) {
			return res
				.status(404)
				.json({ success: false, message: "Product not found" })
		}

		await prisma.product.delete({
			where: { id },
		})

		await publishEvent("product_events", "product.removed", {
			mediaIds: [
				existingProduct.mainImageId,
				...existingProduct.variants.map((v) => v.imageId),
			],
			productId: existingProduct.id,
		})

		logger.info("Product removed successfully", { productId: id })
		return res.status(200).json({ success: true, message: "Product removed" })
	} catch (error) {
		logger.error("Error removing product", { error })
		return res
			.status(500)
			.json({ success: false, message: "Internal server error" })
	}
}
