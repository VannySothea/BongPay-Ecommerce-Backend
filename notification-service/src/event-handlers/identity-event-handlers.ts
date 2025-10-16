import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail } from "../services/identityEmailService"
import { SendEmail, SendVerificationEmailEvent } from "../types/types"
import logger from "../utils/logger"

export const handleSendVerificationEmail = async (event: SendVerificationEmailEvent) => {
    logger.info("Send verification email event received", event)
    try {
        await sendVerificationEmail(event.email, event.code)
    }
    catch (error) {
        logger.error("Error handling send verification email event", error)
    }
}

export const handleSendPasswordResetEmail = async (event: SendVerificationEmailEvent) => {
    logger.info("Send password reset email event received", event)
    try {
        await sendPasswordResetEmail(event.email, event.code)
    }
    catch (error) {
        logger.error("Error handling send password reset email event", error)
    }
}

export const handleSendResetSuccessEmail = async (event: SendEmail) => {
    logger.info("Send password reset success email event received", event)
    try {
        await sendResetSuccessEmail(event.email)
    }
    catch (error) {
        logger.error("Error handling send password reset success email event", error)
    }
}