-- CreateTable
CREATE TABLE "CardEmbedding" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'clip',
    "variant" TEXT,
    "embedding" vector NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardHash" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL DEFAULT 'phash',
    "hash" TEXT NOT NULL,
    "variant" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardHash_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CardEmbedding_cardId_idx" ON "CardEmbedding"("cardId");

-- CreateIndex
CREATE INDEX "CardEmbedding_source_idx" ON "CardEmbedding"("source");

-- CreateIndex
CREATE INDEX "CardHash_cardId_algorithm_idx" ON "CardHash"("cardId", "algorithm");

-- CreateIndex
CREATE INDEX "CardHash_algorithm_hash_idx" ON "CardHash"("algorithm", "hash");

-- AddForeignKey
ALTER TABLE "CardEmbedding" ADD CONSTRAINT "CardEmbedding_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardHash" ADD CONSTRAINT "CardHash_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
