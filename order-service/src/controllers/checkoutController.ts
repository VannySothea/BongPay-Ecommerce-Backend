import { Request, Response } from "express"
import logger from "../utils/logger"
import prisma from "../prismaClient"
import axios from "axios"
import { publishEvent } from "../utils/rabbitmq"
import { validateCheckout } from "../utils/validation"

export const checkout = async (req: Request, res: Response) => {
	logger.info("Create order endpoint hit")
	const { userId } = req.user as { userId: number }
	const { error, value } = validateCheckout(req.body)
	if (error) {
		logger.error("Invalid checkout data", { error })
		return res.status(400).json({ success: false, message: "Invalid checkout data", error })
	}
	try {
		const cartRes = await axios.get(
			`${process.env.CART_SERVICE_URL}/cart/${userId}`,
			{
				headers: {
					"x-internal-secret": process.env.INTERNAL_SECRET,
				},
			}
		)

		const cart = cartRes.data.cart
		if (!cart || cart.items.length === 0) {
			logger.error(`Cart with ID ${cart.id} not found or empty`)
			return res
				.status(404)
				.json({ success: false, message: "Cart not found or empty" })
		}

		const totalAmount = cart.items.reduce(
			(acc: number, item: any) => acc + item.productPrice * item.quantity,
			0
		)

		const order = await prisma.order.create({
			data: {
				userId,
				totalAmount,
				items: {
					create: cart.items.map((item: any) => ({
						productId: item.productId,
						productName: item.productName,
						productShortDesc: item.productShortDesc,
						productMainImageId: item.productMainImageId,
						productPrice: item.productPrice,
						quantity: item.quantity,
						properties: item.properties?.length
							? {
									create: item.properties.map((prop: any) => ({
										propertyName: prop.propertyName,
										propertyValues: prop.propertyValues,
									})),
							  }
							: undefined,
					})),
				},
				shippingAddress: {
					create: {
						phone: value.shippingAddress.phone,
						street: value.shippingAddress.street,
						city: value.shippingAddress.city,
						postalCode: value.shippingAddress.postalCode,
						country: value.shippingAddress.country
					}
				}
			},
			include: {
				items: {
					include: {
						properties: true,
					},
				},
				shippingAddress: true,
			},
		})

		await publishEvent("cart_events", "cart.empty.requested", {
			cartId: cart.id,
		})
		await publishEvent("order_events", "order.checkout", { 
			orderId: order.id,
			userId: order.userId,
			method: value.method,
			provider: value.provider,
			amount: order.totalAmount,
			currency: value.currency,
		 })

		logger.info(`Order created successfully with ID ${order.id}`)

		return res.status(201).json({
			success: true,
			data: order,
		})
	} catch (error) {
		logger.error("Error creating order", { error })
		return res
			.status(500)
			.json({ success: false, message: "Internal Server Error" })
	}
}
