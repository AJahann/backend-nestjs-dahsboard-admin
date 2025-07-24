/*
  Warnings:

  - Added the required column `gram` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "gram" DOUBLE PRECISION NOT NULL;
