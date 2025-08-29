/*
  Warnings:

  - A unique constraint covering the columns `[title,soldAt]` on the table `SealedPriceEntry` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "SealedPriceEntry_title_key";

-- CreateIndex
CREATE UNIQUE INDEX "SealedPriceEntry_title_soldAt_key" ON "SealedPriceEntry"("title", "soldAt");
