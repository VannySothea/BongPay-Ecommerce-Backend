/*
  Warnings:

  - You are about to drop the column `img` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `img` on the `Variant` table. All the data in the column will be lost.
  - Added the required column `mainImageId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageId` to the `Variant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "product"."Product" DROP COLUMN "img",
ADD COLUMN     "mainImageId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "product"."Variant" DROP COLUMN "img",
ADD COLUMN     "imageId" TEXT NOT NULL;
