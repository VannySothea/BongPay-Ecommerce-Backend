import express from "express"
import { authenticateRequest } from "../middleware/authMiddleware"
import { addToCart } from "../controllers/addToCartController"
import { getCart } from "../controllers/getCartController"
import { updateCartItem } from "../controllers/updateCartItemController"
import { removeCartItem } from "../controllers/RemoveCartItemController"

const router = express.Router()

router.get("/ping", (req, res) => {
	res.status(200).json({ message: "PONG" })
})

router.get("/", authenticateRequest, getCart)
router.post("/add", authenticateRequest, addToCart)
router.put("/update", authenticateRequest, updateCartItem)
router.delete("/remove", authenticateRequest, removeCartItem)

export default router
