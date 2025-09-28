import express from "express"
import { addProduct } from "../controllers/addProductController"
import { authenticateRequest, authorizeRoles } from "../middleware/authMiddleware"
import { getAllProduct } from "../controllers/getAllProductController"
import { getProductDetail } from "../controllers/getProductDetailController"
import { updateProduct } from "../controllers/updateProductController"
import { removeProduct } from "../controllers/removeProductController"

const router = express.Router()

router.get("/ping", (req, res) => {
	res.status(200).json({ message: "PONG" })
})

router.post(
	"/add",
	authenticateRequest,
	authorizeRoles("ADMIN"),
	addProduct
)

router.patch(
	"/:productId",
	authenticateRequest,
	authorizeRoles("ADMIN"),
	updateProduct
)

router.delete(
	"/:productId",
	authenticateRequest,
	authorizeRoles("ADMIN"),
	removeProduct
)

router.get("/all", getAllProduct)
router.get("/:id", getProductDetail)

export default router
