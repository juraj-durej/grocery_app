CREATE TABLE "cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cart_items_session_product_unique" UNIQUE("session_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"icon_url" text NOT NULL,
	"color" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"product_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "favorites_session_product_unique" UNIQUE("session_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"category_id" integer NOT NULL,
	"name" text NOT NULL,
	"price_cents" integer NOT NULL,
	"unit" text NOT NULL,
	"image_url" text,
	"color" text NOT NULL,
	"is_new" boolean DEFAULT false NOT NULL,
	"discount_percent" integer,
	"is_featured" boolean DEFAULT false NOT NULL,
	"featured_order" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "products_category_id_idx" ON "products" USING btree ("category_id");