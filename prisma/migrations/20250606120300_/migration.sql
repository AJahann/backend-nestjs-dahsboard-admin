/*
  Warnings:

  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.
  - Added the required column `brand` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gram` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `img` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wages` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GoldPrice" ALTER COLUMN "buyPrice" DROP DEFAULT,
ALTER COLUMN "sellPrice" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "price",
ADD COLUMN     "brand" TEXT NOT NULL,
ADD COLUMN     "gram" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "img" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "wages" TEXT NOT NULL;
