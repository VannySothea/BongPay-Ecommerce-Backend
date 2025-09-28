import prisma from "../prismaClient"
import { ProductSearchEvent } from "../types/types"
import logger from "../utils/logger"

export const handleProductCreated = async(event: ProductSearchEvent) => {
	logger.info(`Product created event received for`, event)
	try {
		const newSearchProduct = await prisma.searchProduct.create({
			data: {
				productId: event.productId,
				name: event.name,
				shortDesc: event.shortDesc
			},
		})
		logger.info(`Search product created with ID: ${newSearchProduct.id}`)
	} catch (error) {
		logger.error("Error occurred while creating search product", { error })
	}
}

export const handleProductUpdated = async(event: ProductSearchEvent) => {
	logger.info(`Product updated event received for`, event)
	try {
		const updatedSearchProduct = await prisma.searchProduct.update({
			where: {
				productId: event.productId
			},
			data: {
				name: event.name,
				shortDesc: event.shortDesc,
				updatedAt: event.updatedAt
			},
		})
		logger.info(`Search product updated with ID: ${updatedSearchProduct.id}`)
	} catch (error) {
		logger.error("Error occurred while updating search product", { error })
	}
}

export const handleProductRemoved = async(event: ProductSearchEvent) => {
	logger.info(`Product removed event received for`, event)
	try {
		await prisma.searchProduct.delete({
			where: {
				productId: event.productId
			}
		})
		logger.info(`Search product removed with ID: ${event.productId}`)
	} catch (error) {
		logger.error("Error occurred while removing search product", { error })
	}
}