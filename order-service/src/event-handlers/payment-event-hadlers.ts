import prisma from "../prismaClient";
import { paymentProcessedEvent } from "../types/types";
import logger from "../utils/logger";

export const handlePaymentProcessed = async (event: paymentProcessedEvent) => {
    logger.info("Payment processed event received", event);
    try {
        const order = await prisma.order.update({
            where: { id: event.orderId },
            data: {
                transactionId: event.transactionId,
                paid: event.paid as boolean,
            }
        });
        logger.info(`Order ID: ${order.id} updated with payment status: ${event.paid}`);
    } catch (error) {
        logger.error("Error updating order with payment information", { error });
    }
}