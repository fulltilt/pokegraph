/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `SealedPriceEntry` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "SealedPriceEntry_url_key";

-- CreateIndex
CREATE UNIQUE INDEX "SealedPriceEntry_title_key" ON "SealedPriceEntry"("title");
