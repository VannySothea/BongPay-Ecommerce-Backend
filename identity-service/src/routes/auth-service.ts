import express, { Request, Response } from "express"
import { registerUser } from "../controllers/registerController"
import { verifyAccount } from "../controllers/verifyAccountController"
import { loginUser } from "../controllers/loginController"
import { refreshTokenUser } from "../controllers/refreshTokenController"
import { logoutUser } from "../controllers/logoutController"
import { forgotPasswordUser } from "../controllers/forgotPasswordController"
import { verifyResetPassword } from "../controllers/verifyResetPasswordController"
import { resetPasswordUser } from "../controllers/resetPasswordController"
import { verificationCodeResend } from "../controllers/verificationCodeResendController"
import { verificationResetPasswordResend } from "../controllers/verificationResetPasswordResendController"
import {
	authenticateRequest,
	authorizeRoles,
} from "../middleware/authMiddleware"

const router = express.Router()

router.get("/ping", (req, res) => {
	res.status(200).json({ message: "PONG" })
})

router.get(
	"/check-auth",
	authenticateRequest,
	authorizeRoles("ADMIN", "SUPERADMIN"),
	(req: Request, res: Response) => {
		return res.status(200).json({
			success: true,
			message: "Authenticated",
			user: req.user,
		})
	}
)
router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/verify-account", verifyAccount)
router.post("/verify-account/resend-code", verificationCodeResend)
router.post("/forgot-password", forgotPasswordUser)
router.post("/verify-reset-password", verifyResetPassword)
router.post(
	"/verify-reset-password/resend-code",
	verificationResetPasswordResend
)
router.post("/refresh-token", refreshTokenUser)
router.post("/logout", authenticateRequest, logoutUser)
router.put("/reset-password", resetPasswordUser)

export default router
