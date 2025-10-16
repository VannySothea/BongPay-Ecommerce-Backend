import logger from "../utils/logger";
import { transporter, sender } from "../config/mailConfig";
import { PAYMENT_SUCCESS_TEMPLATE } from "../templates/product-service/emailTemplates";

export const sendPaymentSuccessEmail = async (email: string, order: any, payment: any) => {
    const recipient = email;

    // Generate the item list HTML
    const itemsHtml = order.items.map((item: any) => `
        <li>${item.quantity} x ${item.productName} - $${item.productPrice}</li>
    `).join("");

    // Replace template placeholders
    const htmlContent = PAYMENT_SUCCESS_TEMPLATE
        .replace("{orderId}", order.id)
        .replace("{items}", itemsHtml)
        .replace("{totalAmount}", order.totalAmount)
        .replace("{paymentMethod}", payment.method)
        .replace("{paymentStatus}", payment.status)
        .replace("{street}", order.shippingAddress.street)
        .replace("{city}", order.shippingAddress.city)
        .replace("{postalCode}", order.shippingAddress.postalCode)
        .replace("{country}", order.shippingAddress.country)
        .replace("{phone}", order.shippingAddress.phone)
        .replace("{email}", order.shippingAddress.email);

    try {
        const response = await transporter.sendMail({
            from: sender,
            to: recipient,
            subject: `Your Payment for Order #${order.id} is Successful`,
            html: htmlContent,
        });
        logger.info("Payment success email sent successfully", response);
    } catch (error) {
        logger.error("Error sending payment success email", error);
        throw new Error(`Error sending payment success email: ${error}`);
    }
};
