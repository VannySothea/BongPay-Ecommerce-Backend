import { PrismaClient } from "@prisma/client"
import logger from "./utils/logger";

const prisma = new PrismaClient()

export async function connectDB() {
    try {
        await prisma.$connect();
        logger.info("Database connected successfully")
    } catch (e) {
        logger.error("Failed to connect to the database:", e)
        process.exit(1)
    }
}

export default prisma;
