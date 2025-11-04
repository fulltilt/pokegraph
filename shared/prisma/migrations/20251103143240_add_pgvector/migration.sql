-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "embedding" vector(1536),
ADD COLUMN     "imageUrl" TEXT;
