/*
  Warnings:

  - A unique constraint covering the columns `[productId]` on the table `SearchProduct` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SearchProduct_productId_key" ON "search"."SearchProduct"("productId");
