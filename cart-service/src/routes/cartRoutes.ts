import express from "express"
import { authenticateRequest } from "../middleware/authMiddleware"
import { addToCart } from "../controllers/addToCartController"
import { getCart } from "../controllers/getCartController"
import { updateCartItem } from "../controllers/updateCartItemController"
import { removeCartItem } from "../controllers/RemoveCartItemController"
import { getCartByUserId } from "../controllers/getCartByUserId"

const router = express.Router()

router.get("/ping", (req, res) => {
	res.status(200).json({ message: "PONG" })
})

router.get("/", authenticateRequest, getCart)
router.post("/add/:productId", authenticateRequest, addToCart)
router.put("/update/:cartItemId", authenticateRequest, updateCartItem)
router.delete("/remove/:cartItemId", authenticateRequest, removeCartItem)

// Internal routes
router.get("/internal/:userId", authenticateRequest, getCartByUserId)

export default router
