import axios from "axios"
import { SendPaymentSuccessEmailEvent } from "../types/types"
import logger from "../utils/logger"
import { sendPaymentSuccessEmail } from "../services/paymentEmailService"

export const handleSendPaymentSuccessEmail = async (
	event: SendPaymentSuccessEmailEvent
) => {
	logger.info("Send payment success email event received", event)
	try {
		const order = await axios.get(
			`${process.env.ORDER_SERVICE_URL}/internal/${event.orderId}`,
			{
				headers: { "x-internal-secret": process.env.INTERNAL_SECRET },
			}
		)

		const payment = await axios.get(
			`${process.env.PAYMENT_SERVICE_URL}/internal/${event.transactionId}`,
			{
				headers: { "x-internal-secret": process.env.INTERNAL_SECRET },
			}
		)

		await sendPaymentSuccessEmail(
			order.data.data.shippingAddress.email,
			order.data.data,
			payment.data.data
		)
		
	} catch (error) {
		logger.error("Error handling send payment success email event", error)
	}
}
