import multer from "multer"
import logger from "../utils/logger"
import { NextFunction, Request, Response } from "express"

const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 5 * 1024 * 1024, // 5 MB per file
	},
}).array("files", 10) // "files" is the field name, max 10 files

export const uploadMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	upload(req, res, (err) => {
		if (err instanceof multer.MulterError) {
			logger.error("Multer error while uploading: ", err)
			return res.status(400).json({
				message: "Multer error while uploading",
				error: err.message,
				stack: err.stack,
			})
		} else if (err) {
			logger.error("Unknown error while uploading: ", err)
			return res.status(500).json({
				message: "Unknown error while uploading",
				error: err.message,
				stack: err.stack,
			})
		}

		if (!req.files || (Array. isArray(req.files) && req.files.length === 0)) {
			logger.error("No file found")
			return res.status(400).json({
				message: "No file found",
			})
		}
		
		next()
	})
}
