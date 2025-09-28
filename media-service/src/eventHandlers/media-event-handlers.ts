import prisma from "../prismaClient"
import { MediaEvent } from "../types/types"
import { deleteMediaFromCloudinary } from "../utils/cloudinary"
import logger from "../utils/logger"

export const handleMediaRemoved = async (event: MediaEvent) => {
	logger.info(`Media removed event received for`, event)

	const { mediaIds } = event

	try {
		const mediaToDelete = await prisma.media.findMany({
			where: {
				publicId: { in: mediaIds },
			},
		})

		for (const media of mediaToDelete) {
			await deleteMediaFromCloudinary(media.publicId)
			await prisma.media.delete({
				where: { id: media.id },
			})
			logger.info(`Deleted media ${media.id} from cloud storage and database`)
		}
        logger.info(`Processed deletion of ${mediaToDelete.length} media items successfully`)
	} catch (error) {
		logger.error("Error occurred while processing media deletion", { error })
	}
}
