/*
  Warnings:

  - A unique constraint covering the columns `[mainImageId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[imageId]` on the table `Variant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Product_mainImageId_key" ON "product"."Product"("mainImageId");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_imageId_key" ON "product"."Variant"("imageId");
