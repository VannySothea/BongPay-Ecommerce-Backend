import prisma from "../prismaClient"
import { CartEvent, CartItemEvent } from "../types/types"
import logger from "../utils/logger"


export const handleCartCreated = async(event: CartEvent) => {
    logger.info(`Cart created event received for`, event)
	try {
		const newCart = await prisma.cart.create({
            data: {
                userId: event.userId
            }
        })
        logger.info(`Cart created with ID: ${newCart.id}`)
	} catch (error) {
		logger.error("Error occurred while creating cart", { error })
	}
}

export const handleCartItemRemoved = async(event: CartItemEvent) => {
    logger.info(`Cart item deleted event received for`, event)
    try {
        const deletedItem = await prisma.cartItem.deleteMany({
            where: {
                productId: event.productId
            }
        })
        logger.info(`Cart items deleted: ${deletedItem.count}`)
    } catch (error) {
        logger.error("Error occurred while deleting cart item", { error })
    }
} 
