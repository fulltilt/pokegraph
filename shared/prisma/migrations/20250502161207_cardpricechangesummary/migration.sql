-- CreateTable
CREATE TABLE "CardPriceChangeSummary" (
    "id" SERIAL NOT NULL,
    "setId" TEXT,
    "series" TEXT,
    "timeframe" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "changePct" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardPriceChangeSummary_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CardPriceChangeSummary" ADD CONSTRAINT "CardPriceChangeSummary_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
