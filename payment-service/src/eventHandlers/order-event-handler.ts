import { PaymentStatus } from "@prisma/client";
import prisma from "../prismaClient";
import { orderCheckoutEvent } from "../types/types";
import logger from "../utils/logger";
import { v4 as uuidv4 } from "uuid";
import { publishEvent } from "../utils/rabbitmq";

export const handleOrderCheckout = async(event: orderCheckoutEvent) => {
    logger.info("Order checkout event received", event);
    try {
        let status: PaymentStatus;
        logger.info(`Processing payment for Order ID: ${event.orderId}`);
        if (event.method === "COD") {
            status = PaymentStatus.UNPAID;
        } else {
            status = PaymentStatus.PAID;
        }

        const payment = await prisma.payment.create({
            data: {
                orderId: event.orderId,
                userId: event.userId,
                method: event.method,
                provider: event.provider,
                amount: event.amount,
                currency: event.currency,
                status: status,
                transactionId: uuidv4(),
            },
        });
        
        await publishEvent("payment_events", "payment.processed", {
            orderId: event.orderId,
            transactionId: payment.transactionId,
            paid: event.method === "COD" ? false : true,
        })

        logger.info(`Payment created with TransactionID: ${payment.transactionId}`)
    } catch (error) {
        logger.error("Error processing payment", { error });
    }
}