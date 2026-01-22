-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "upc" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "product_type" TEXT,
    "set_name" TEXT,
    "release_date" TIMESTAMP(3),
    "msrp" DECIMAL(10,2),
    "image_url" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "condition" TEXT NOT NULL DEFAULT 'Sealed',
    "grade_info" TEXT,
    "location" TEXT,
    "purchase_date" TIMESTAMP(3) NOT NULL,
    "purchase_price" DECIMAL(10,2) NOT NULL,
    "purchase_platform" TEXT,
    "shipping_cost" DECIMAL(10,2) DEFAULT 0,
    "other_fees" DECIMAL(10,2) DEFAULT 0,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'In Stock',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" SERIAL NOT NULL,
    "inventory_item_id" INTEGER NOT NULL,
    "sale_date" TIMESTAMP(3) NOT NULL,
    "sale_price" DECIMAL(10,2) NOT NULL,
    "quantity_sold" INTEGER NOT NULL DEFAULT 1,
    "platform" TEXT,
    "buyer_info" TEXT,
    "shipping_cost" DECIMAL(10,2) DEFAULT 0,
    "platform_fees" DECIMAL(10,2) DEFAULT 0,
    "payment_processing_fees" DECIMAL(10,2) DEFAULT 0,
    "other_fees" DECIMAL(10,2) DEFAULT 0,
    "tracking_number" TEXT,
    "gross_profit" DECIMAL(10,2),
    "net_profit" DECIMAL(10,2),
    "profit_margin" DECIMAL(5,2),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_price_history" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "price_type" TEXT NOT NULL DEFAULT 'Market',
    "source" TEXT,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_price_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_upc_key" ON "products"("upc");

-- CreateIndex
CREATE INDEX "products_upc_idx" ON "products"("upc");

-- CreateIndex
CREATE INDEX "products_set_name_idx" ON "products"("set_name");

-- CreateIndex
CREATE INDEX "inventory_items_product_id_idx" ON "inventory_items"("product_id");

-- CreateIndex
CREATE INDEX "inventory_items_status_idx" ON "inventory_items"("status");

-- CreateIndex
CREATE INDEX "inventory_items_purchase_date_idx" ON "inventory_items"("purchase_date");

-- CreateIndex
CREATE INDEX "sales_inventory_item_id_idx" ON "sales"("inventory_item_id");

-- CreateIndex
CREATE INDEX "sales_sale_date_idx" ON "sales"("sale_date");

-- CreateIndex
CREATE INDEX "sales_platform_idx" ON "sales"("platform");

-- CreateIndex
CREATE INDEX "product_price_history_product_id_idx" ON "product_price_history"("product_id");

-- CreateIndex
CREATE INDEX "product_price_history_recorded_at_idx" ON "product_price_history"("recorded_at");

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_price_history" ADD CONSTRAINT "product_price_history_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
