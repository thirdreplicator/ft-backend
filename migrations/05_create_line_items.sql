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

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer NOT NULL,
    status public.order_status,
    created_at bigint DEFAULT EXTRACT(epoch FROM now()) NOT NULL
);

-- AddForeignKey on orders
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_pkey";
ALTER TABLE "orders" ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_user_id_fkey";
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE public."line_items" (
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

CREATE UNIQUE INDEX "line_items_unique_key" ON "line_items"("user_id", "product_id", "option_ids", "status");

-- CreateIndex on line_items
CREATE INDEX "line_items_user_id_idx" ON "line_items"("user_id");

-- AddForeignKey
ALTER TABLE "line_items" ADD CONSTRAINT "line_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "line_items" ADD CONSTRAINT "line_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "line_items" ADD CONSTRAINT "line_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
