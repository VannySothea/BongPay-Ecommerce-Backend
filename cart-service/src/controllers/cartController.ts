import { Request, Response } from "express";
import logger from "../utils/logger";
import prisma from "../prismaClient";

export const searchProductController = async (req: Request, res: Response) => {
    try {
        const { query } = req.query
        const results = await prisma.searchProduct.findMany({
            where: {
                name: {
                    contains: String(query),
                    mode: 'insensitive' // case-insensitive search
                }
            },
            take: 10 // limit results for performance
        })
        logger.info("Product search results", { query, results })
        return res.status(200).json({ success: true, products: results })
    } catch (error) {
        logger.error("Error searching products", { error })
        return res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}