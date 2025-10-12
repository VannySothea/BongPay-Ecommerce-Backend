import express from "express"
import { authenticateRequest, authorizeRoles } from "../middleware/authMiddleware"
import { getUserPayment } from "../controllers/getUserPaymentController"
import { getAllPayment } from "../controllers/getAllPaymentController"

const router = express.Router()

router.get("/ping", (req, res) => {
	res.status(200).json({ message: "PONG" })
})

router.get("/", authenticateRequest, getUserPayment)
router.get("/all", authenticateRequest, authorizeRoles("ADMIN"), getAllPayment)

export default router
