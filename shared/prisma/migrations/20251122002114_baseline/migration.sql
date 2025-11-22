-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "imageUrl" TEXT,
    "embedding" vector,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceEntry" (
    "id" SERIAL NOT NULL,
    "cardId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceEntry_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Sealed" (
    "id" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sealed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SealedPriceEntry" (
    "id" TEXT NOT NULL,
    "sealedId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "soldAt" TIMESTAMP(3) NOT NULL,
    "label" TEXT,
    "preprocessed" TEXT,

    CONSTRAINT "SealedPriceEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PriceEntry_cardId_date_key" ON "PriceEntry"("cardId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Sealed_product_key" ON "Sealed"("product");

-- CreateIndex
CREATE INDEX "SealedPriceEntry_sealedId_idx" ON "SealedPriceEntry"("sealedId");

-- CreateIndex
CREATE UNIQUE INDEX "SealedPriceEntry_title_soldAt_key" ON "SealedPriceEntry"("title", "soldAt");

-- AddForeignKey
ALTER TABLE "PriceEntry" ADD CONSTRAINT "PriceEntry_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardPriceChangeSummary" ADD CONSTRAINT "CardPriceChangeSummary_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SealedPriceEntry" ADD CONSTRAINT "SealedPriceEntry_sealedId_fkey" FOREIGN KEY ("sealedId") REFERENCES "Sealed"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
