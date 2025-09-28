/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Media` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "media"."Media" DROP COLUMN "ownerId",
DROP COLUMN "type";
