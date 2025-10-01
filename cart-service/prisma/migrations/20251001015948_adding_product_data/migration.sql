/*
  Warnings:

  - A unique constraint covering the columns `[productMainImageId]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productMainImageId` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productName` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productPrice` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productShortDesc` to the `CartItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cart"."CartItem" ADD COLUMN     "productMainImageId" TEXT NOT NULL,
ADD COLUMN     "productName" TEXT NOT NULL,
ADD COLUMN     "productPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "productShortDesc" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "cart"."ProductProperty" (
    "id" SERIAL NOT NULL,
    "propertyName" TEXT NOT NULL,
    "propertyValues" TEXT[],
    "cartItemId" INTEGER NOT NULL,

    CONSTRAINT "ProductProperty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_productMainImageId_key" ON "cart"."CartItem"("productMainImageId");

-- AddForeignKey
ALTER TABLE "cart"."ProductProperty" ADD CONSTRAINT "ProductProperty_cartItemId_fkey" FOREIGN KEY ("cartItemId") REFERENCES "cart"."CartItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
