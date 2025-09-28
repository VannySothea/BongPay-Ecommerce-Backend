import { Request, Response } from "express";
import logger from "../utils/logger";
import prisma from "../prismaClient";

export const getAllMedias = async (req: Request, res: Response) => {
    logger.info("Get all medias endpoint hit");
    try {
        const result = await prisma.media.findMany({});
        return res.status(200).json({
            success: true,
            medias: result
        });
    } catch (error) {
        logger.error("Error fetching all medias", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}