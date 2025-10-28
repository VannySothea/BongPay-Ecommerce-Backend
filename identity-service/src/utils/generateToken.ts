import jwt from "jsonwebtoken"
import crypto from "crypto"
import { Response } from "express"
import prisma from "../prismaClient"
import { User } from "../types/types"

export const generateTokens = async (res: Response, user: User) => {
	const userName = user.lastName
		? user.firstName + user.lastName
		: user.firstName
	const accessToken = jwt.sign(
		{
			userId: user.id,
			username: userName,
			email: user.email,
			role: user.role,
		},
		process.env.JWT_SECRET as string,
		{ expiresIn: "15m" }
	)

	const refreshToken = crypto.randomBytes(40).toString("hex")
	const expiresAt = new Date()
	expiresAt.setDate(expiresAt.getDate() + 18) // 18 days from now

	await prisma.refreshToken.create({
		data: {
			token: refreshToken,
			userId: user.id,
			expiresAt,
		},
	})

	res.cookie("refreshToken", refreshToken, {
		httpOnly: true, // Prevent JavaScript access
		secure: process.env.NODE_ENV === "production", // Use HTTPS in production
		sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // Prevent CSRF attacks
		expires: expiresAt,
	})

	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
		expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
	})

	return { accessToken, refreshToken }
}

export const generateVerificationToken = async (
	res: Response,
	userId: number,
	email: string
) => {
	const verificationToken = jwt.sign(
		{ userId, email },
		process.env.JWT_SECRET as string,
		{ expiresIn: "3m" }
	)

	res.cookie("verificationToken", verificationToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
		expires: new Date(Date.now() + 180000), // 3 minutes from now
	})

	return verificationToken
}

export const generateResetPasswordToken = async (res: Response, user: User) => {
	const userName = user.lastName
		? user.firstName + user.lastName
		: user.firstName
	const resetPasswordToken = jwt.sign(
		{
			userId: user.id,
			username: userName,
			email: user.email,
		},
		process.env.JWT_SECRET as string,
		{ expiresIn: "5m" }
	)
	const expiresAt = new Date()
	expiresAt.setMinutes(expiresAt.getMinutes() + 10) // 10 minutes from now

	res.cookie("resetPasswordToken", resetPasswordToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
		expires: new Date(Date.now() + 600000), // 10 minutes from now
	})

	return resetPasswordToken
}
