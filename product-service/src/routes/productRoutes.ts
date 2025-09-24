import express from "express"
import { addProduct } from "../controllers/addProductController"
import upload from "../middleware/upload"
import { authenticateRequest, authorizeRoles } from "../middleware/authMiddleware"
import { getAllProduct } from "../controllers/getAllProductController"
import { getProductDetail } from "../controllers/getProductDetailController"
import { updateProduct } from "../controllers/updateProductController"

const router = express.Router()

router.get("/ping", (req, res) => {
	res.status(200).json({ message: "PONG" })
})

router.post(
	"/add",
	authenticateRequest,
	authorizeRoles("ADMIN"),
	upload.fields([
		{ name: "img", maxCount: 1},
		{ name: "variantImgs", maxCount: 10 }
	]),
	addProduct
)

router.patch(
	"/:productId",
	authenticateRequest,
	authorizeRoles("ADMIN"),
	upload.fields([
		{ name: "img", maxCount: 1},
		{ name: "variantImgs", maxCount: 10 }
	]),
	updateProduct
)

router.get("/all", getAllProduct)
router.get("/:id", getProductDetail)

export default router
