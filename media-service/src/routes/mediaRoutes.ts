import express, { response } from "express"
import {
	authenticateRequest,
	authorizeRoles,
} from "../middleware/authMiddleware"
import { uploadMedia } from "../controllers/uploadMediaController"
import { uploadMiddleware } from "../middleware/upload"
import { getAllMedias } from "../controllers/getAllMedias"

const router = express.Router()

router.get("/ping", (req, res) => {
	res.status(200).json({ message: "PONG" })
})

router.post(
	"/upload",
	authenticateRequest,
	authorizeRoles("ADMIN"),
	uploadMiddleware,
	uploadMedia
)

router.get("/get", getAllMedias)

export default router
