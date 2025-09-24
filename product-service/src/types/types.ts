export interface UserPayload {
	userId: number
	role: string
}

export interface User {
	id: number
	firstName: string
	lastName?: string
	role: "USER" | "ADMIN"
	email: string
	password: string
	isVerified: boolean
}

export interface Tokens {
	accessToken: string
	refreshToken: string
}

export interface Product {
	id: number
	name: string
	shortDesc: string
	fullDesc?: string | null
	img: string
	rate: number
	originalPrice: number
	stockQuantity: number
	isFeatured: boolean
	discount?: Discount | null
	properties: ProductProperty[]
	variants: Variant[]
	createdAt: Date
	updatedAt: Date
}

export interface Discount {
	id: number
	percentage: number
	discountPrice: number
	productId: number
}

export interface ProductProperty {
	id: number
	propertyName: string
	propertyValues: string[]
	productId: number
}

export interface Variant {
	id: number
	name: string
	img?: string | null
	propertyValues: string[]
	productId: number
}

export interface CreateProductData {
	name: string
	shortDesc: string
	fullDesc?: string | null
	img: string
	originalPrice: number
	stockQuantity: number
	isFeatured: boolean
	discount?: Discount | null
	properties?: ProductProperty[]
	variants?: Variant[]
}

export interface VariantInput {
	id?: number
	name: string
	propertyValues: string[]
	img?: string | null
}