import express from "express"
import { checkout } from "../controllers/checkoutController"
import { authenticateRequest, authorizeRoles } from "../middleware/authMiddleware"
import { getUserOrder } from "../controllers/getUserOrderController"
import { getAllOrder } from "../controllers/getAllOrderController"
import { getOrderById } from "../controllers/getOrderByIdController"

const router = express.Router()

router.get("/ping", (req, res) => {
	res.status(200).json({ message: "PONG" })
})

router.get("/", authenticateRequest, getUserOrder)
router.get("/all", authenticateRequest, authorizeRoles("ADMIN"), getAllOrder)
router.post("/checkout", authenticateRequest, checkout)

// Internal routes
router.get("/internal/:id", authenticateRequest, getOrderById)

export default router
