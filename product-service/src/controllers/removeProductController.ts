// import { Request, Response } from "express"
// import logger from "../utils/logger"
// import prisma from "../prismaClient"

// export const removeProduct = async (req: Request, res: Response) => {
// 	logger.info("Remove product endpoint hit")
// 	const id = Number(req.params.productId)
// 	if (!id) {
// 		return res
// 			.status(400)
// 			.json({ success: false, message: "Product ID is required" })
// 	}

// 	try {
// 		const existingProduct = await prisma.product.findUnique({
// 			where: { id },
// 		})
// 	} catch (error) {
// 		logger.error("Error removing product", { error })
// 		return res.status(500).json({ success: false, message: "Internal server error" })
// 	}
// }
