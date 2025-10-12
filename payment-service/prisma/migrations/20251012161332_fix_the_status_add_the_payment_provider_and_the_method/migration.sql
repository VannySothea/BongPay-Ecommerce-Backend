/*
  Warnings:

  - The values [APA_PAY,VISA,MASTER,PAYPAL] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('COD', 'ABA_PAY', 'VISA', 'MASTER', 'PAYPAL');

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('COD', 'CREDIT_CARD', 'BANK_TRANSFER', 'E_WALLET');
ALTER TABLE "Payment" ALTER COLUMN "method" TYPE "PaymentMethod_new" USING ("method"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "payment"."PaymentMethod_old";
COMMIT;

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'FAILED';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "provider" "PaymentProvider" NOT NULL DEFAULT 'COD',
ALTER COLUMN "method" SET DEFAULT 'COD';
