CREATE TYPE public.order_status AS ENUM (
    'in-cart',
    'submitted',
    'preparing',
    'ready-for-delivery',
    'on-route',
    'fulfilled',
    'cancelled',
    'cannot-fulfill'
);

CREATE TABLE public."Order" (
    id integer NOT NULL,
    user_id integer NOT NULL,
    status public.order_status,
    created_at bigint DEFAULT EXTRACT(epoch FROM now()) NOT NULL
);

-- AddForeignKey on Order
ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_pkey";
ALTER TABLE "Order" ADD CONSTRAINT "Order_pkey" PRIMARY KEY ("id");
ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_user_id_fkey";
ALTER TABLE "Order" ADD CONSTRAINT "Order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTableCREATE TABLE public."LineItem" (
    id integer NOT NULL,
    order_id integer,
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    option_ids text DEFAULT '[]'::text,
    status public.order_status,
    quantity integer NOT NULL,
    price integer NOT NULL,
    created_at bigint DEFAULT EXTRACT(epoch FROM now()) NOT NULL
);

CREATE UNIQUE INDEX "LineItem_unique_key" ON "LineItem"("user_id", "product_id", "option_ids", "status");

-- CreateIndex on LineItem
CREATE INDEX "LineItem_user_id_idx" ON "LineItem"("user_id");

-- AddForeignKey
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
