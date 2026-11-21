import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uuid,
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

export const userRoleEnum = pgEnum('user_role', ['customer', 'admin']);

// `id` is the Supabase `auth.users.id`; there is no FK because that schema is not in our Postgres.
export const usersSchema = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  role: userRoleEnum('role').notNull().default('customer'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}).enableRLS();

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
}).enableRLS();

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
).enableRLS();

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
).enableRLS();

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
).enableRLS();
