/*
  Warnings:

  - Added the required column `lastName` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `Admin` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "lastName" TEXT NOT NULL,
ALTER COLUMN "name" SET NOT NULL;
