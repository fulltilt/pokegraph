-- CreateTable
CREATE TABLE "Sealed" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sealed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SealedPriceEntry" (
    "id" TEXT NOT NULL,
    "sealedId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "soldAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SealedPriceEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sealed_url_key" ON "Sealed"("url");

-- CreateIndex
CREATE INDEX "SealedPriceEntry_sealedId_idx" ON "SealedPriceEntry"("sealedId");

-- AddForeignKey
ALTER TABLE "SealedPriceEntry" ADD CONSTRAINT "SealedPriceEntry_sealedId_fkey" FOREIGN KEY ("sealedId") REFERENCES "Sealed"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
