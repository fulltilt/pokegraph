/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `setName` on the `Card` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cardId,date]` on the table `PriceEntry` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `data` to the `Card` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Card" DROP COLUMN "createdAt",
DROP COLUMN "image",
DROP COLUMN "name",
DROP COLUMN "setName",
ADD COLUMN     "data" JSONB NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PriceEntry_cardId_date_key" ON "PriceEntry"("cardId", "date");
