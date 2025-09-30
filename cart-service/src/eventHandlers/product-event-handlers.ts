// import prisma from "../prismaClient"
// import { CartItemEvent } from "../types/types"
// import logger from "../utils/logger"


// export const handleProductUpdated = async(event: CartItemEvent) => {
// 	logger.info(`Product updated event received for`, event)
// 	try {
// 		const updatedSearchProduct = await prisma.searchProduct.update({
// 			where: {
// 				productId: event.productId
// 			},
// 			data: {
// 				name: event.name,
// 				shortDesc: event.shortDesc,
// 				updatedAt: event.updatedAt
// 			},
// 		})
// 		logger.info(`Search product updated with ID: ${updatedSearchProduct.id}`)
// 	} catch (error) {
// 		logger.error("Error occurred while updating search product", { error })
// 	}
// }

// export const handleProductRemoved = async(event: CartItemEvent) => {
// 	logger.info(`Product removed event received for`, event)
// 	try {
// 		await prisma.searchProduct.delete({
// 			where: {
// 				productId: event.productId
// 			}
// 		})
// 		logger.info(`Search product removed with ID: ${event.productId}`)
// 	} catch (error) {
// 		logger.error("Error occurred while removing search product", { error })
// 	}
// }