/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `Sealed` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Sealed_url_key";

-- CreateIndex
CREATE UNIQUE INDEX "Sealed_title_key" ON "Sealed"("title");
