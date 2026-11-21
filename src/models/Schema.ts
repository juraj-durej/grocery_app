import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// It automatically run the command `db-server:file`, which apply the migration before Next.js starts in development mode,
// Alternatively, if your database is running, you can run `npm run db:migrate` and there is no need to restart the server.

// Need a database for production? Check out https://get.neon.com/BMFYNtx
// Tested and compatible with Next.js Boilerplate

export const counterSchema = pgTable('counter', {
  id: serial('id').primaryKey(),
  count: integer('count').default(0),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const categorySchema = pgTable('categories', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  iconUrl: text('icon_url').notNull(),
  color: text('color').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const productSchema = pgTable(
  'products',
  {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    categoryId: integer('category_id')
      .notNull()
      .references(() => categorySchema.id, { onDelete: 'restrict' }),
    name: text('name').notNull(),
    priceCents: integer('price_cents').notNull(),
    unit: text('unit').notNull(),
    imageUrl: text('image_url'),
    color: text('color').notNull(),
    isNew: boolean('is_new').default(false).notNull(),
    discountPercent: integer('discount_percent'),
    isFeatured: boolean('is_featured').default(false).notNull(),
    featuredOrder: integer('featured_order'),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [index('products_category_id_idx').on(table.categoryId)],
);

export const cartItemSchema = pgTable(
  'cart_items',
  {
    id: serial('id').primaryKey(),
    sessionId: text('session_id').notNull(),
    productId: integer('product_id')
      .notNull()
      .references(() => productSchema.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [unique('cart_items_session_product_unique').on(table.sessionId, table.productId)],
);

export const favoriteSchema = pgTable(
  'favorites',
  {
    id: serial('id').primaryKey(),
    sessionId: text('session_id').notNull(),
    productId: integer('product_id')
      .notNull()
      .references(() => productSchema.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [unique('favorites_session_product_unique').on(table.sessionId, table.productId)],
);
