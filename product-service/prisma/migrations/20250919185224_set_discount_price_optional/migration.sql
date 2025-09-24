/*
  Warnings:

  - Made the column `img` on table `Variant` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "product"."Discount" ALTER COLUMN "discountPrice" DROP NOT NULL;

-- AlterTable
ALTER TABLE "product"."Variant" ALTER COLUMN "img" SET NOT NULL;
