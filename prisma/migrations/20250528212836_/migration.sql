-- CreateTable
CREATE TABLE "GoldPrice" (
    "id" TEXT NOT NULL,
    "buyPrice" DOUBLE PRECISION NOT NULL DEFAULT 6460822,
    "sellPrice" DOUBLE PRECISION NOT NULL DEFAULT 5801547,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT NOT NULL,

    CONSTRAINT "GoldPrice_pkey" PRIMARY KEY ("id")
);
