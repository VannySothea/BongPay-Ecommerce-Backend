import { Request, Response } from "express"
import logger from "../utils/logger"
import { uploadMediaToCloudinary } from "../utils/cloudinary"
import prisma from "../prismaClient"

export const uploadMedia = async (req: Request, res: Response) => {
	logger.info("Upload media endpoint hit")
	try {
		const files = req.files as Express.Multer.File[]

		if (!files || files.length === 0) {
			logger.error("No files found")
			return res.status(400).json({
				success: false,
				message: "No files found, Please try adding files and try again",
			})
		}

		const uploadedMedias = []

		for (const file of files) {
			const { originalname, mimetype, buffer } = file
			logger.info(
				`Uploading file: ${originalname} (${mimetype}, ${buffer.length} bytes)`
			)
			const cloudinaryResult = await uploadMediaToCloudinary(file) // make sure your utility can handle buffer

			const mediaRecord = await prisma.media.create({
				data: {
					publicId: cloudinaryResult.public_id,
					originalName: originalname,
					mimeType: mimetype,
					url: cloudinaryResult.secure_url,
				},
			})

			uploadedMedias.push(mediaRecord)
			logger.info(
				`Uploaded ${originalname} successfully with ID ${mediaRecord.id}`
			)
		}

		return res.status(201).json({
			success: true,
			uploadedCount: uploadedMedias.length,
			medias: uploadedMedias,
			message: "Files uploaded successfully",
		})
	} catch (err) {
		logger.error("Error uploading media", err)
		return res.status(500).json({
			success: false,
			message: err instanceof Error ? err.message : "Internal server error",
		})
	}
}
