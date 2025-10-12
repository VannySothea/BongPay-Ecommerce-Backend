import express from "express"
import { checkout } from "../controllers/checkoutController"
import { authenticateRequest, authorizeRoles } from "../middleware/authMiddleware"
import { getUserOrder } from "../controllers/getUserOrderController"
import { getAllOrder } from "../controllers/getAllOrderController"

const router = express.Router()

router.get("/ping", (req, res) => {
	res.status(200).json({ message: "PONG" })
})

router.get("/", authenticateRequest, getUserOrder)
router.get("/all", authenticateRequest, authorizeRoles("ADMIN"), getAllOrder)
router.post("/checkout", authenticateRequest, checkout)

export default router
