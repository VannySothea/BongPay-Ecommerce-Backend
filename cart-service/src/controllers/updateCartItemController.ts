import { Request, Response } from "express"
import logger from "../utils/logger"
import prisma from "../prismaClient"
import { validateUpdateCartItem } from "../utils/validation"

export const updateCartItem = async (req: Request, res: Response) => {
    logger.info("Update cart item endpoint hit")
    const { userId } = req.user as { userId: number }
    const { error, value } = validateUpdateCartItem(req.body)
    if (error) {
        logger.error(`Validation error: ${error.details[0].message}`)
        return res.status(400).json({ message: error.details[0].message })
    }

    try {
        let cart = await prisma.cart.findUnique({
            where: { userId },
        })
        if (!cart) {
            logger.info(`Creating new cart for user ${userId}`)
            cart = await prisma.cart.create({
                data: { userId },
            })
        }

        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId: value.productId,
            },
        })

        if (!existingItem) {
            logger.error(`Product with ID ${value.productId} not found in cart`)
            return res.status(404).json({ message: "Product not found in cart" })
        }

        const product = await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: value.quantity }, 
            })

        logger.info(`Product ${value.productId} updated in cart successfully`)
        return res
            .status(200)
            .json({ success: true, message: "Product updated in cart", product })
    } catch (error) {
        logger.error("Error updating product in cart", error)
        return res
            .status(500)
            .json({ success: false, message: "Internal Server Error" })
    }
}
