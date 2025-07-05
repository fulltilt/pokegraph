/*
  Warnings:

  - You are about to drop the column `title` on the `Sealed` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Sealed` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[product]` on the table `Sealed` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `product` to the `Sealed` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `SealedPriceEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `SealedPriceEntry` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Sealed_title_key";

-- AlterTable
ALTER TABLE "Sealed" DROP COLUMN "title",
DROP COLUMN "url",
ADD COLUMN     "product" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SealedPriceEntry" ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Sealed_product_key" ON "Sealed"("product");
