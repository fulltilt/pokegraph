/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `SealedPriceEntry` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SealedPriceEntry_url_key" ON "SealedPriceEntry"("url");
