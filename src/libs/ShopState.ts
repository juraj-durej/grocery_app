import { asc, eq } from 'drizzle-orm';
import { productSummaryColumns } from '@/libs/Catalog';
import { db } from '@/libs/DB';
import { getShopSessionId } from '@/libs/ShopSession';
import { cartItemSchema, categorySchema, favoriteSchema, productSchema } from '@/models/Schema';
import type { CartLine } from '@/types/Shop';

/**
 * Reads cart quantities keyed by product id for the current session.
 * @returns Quantities by product id.
 */
export const getCartQuantities = async (): Promise<Record<number, number>> => {
  const sessionId = await getShopSessionId();
  if (!sessionId) {
    return {};
  }

  const rows = await db
    .select({ productId: cartItemSchema.productId, quantity: cartItemSchema.quantity })
    .from(cartItemSchema)
    .where(eq(cartItemSchema.sessionId, sessionId));
  return Object.fromEntries(rows.map((row) => [row.productId, row.quantity]));
};

/**
 * Reads cart lines with their products for the current session.
 * @returns The cart lines.
 */
export const getCartLines = async (): Promise<CartLine[]> => {
  const sessionId = await getShopSessionId();
  if (!sessionId) {
    return [];
  }

  return await db
    .select({ product: productSummaryColumns, quantity: cartItemSchema.quantity })
    .from(cartItemSchema)
    .innerJoin(productSchema, eq(cartItemSchema.productId, productSchema.id))
    .innerJoin(categorySchema, eq(productSchema.categoryId, categorySchema.id))
    .where(eq(cartItemSchema.sessionId, sessionId))
    .orderBy(asc(cartItemSchema.createdAt), asc(cartItemSchema.id));
};

/**
 * Reads favorite product ids for the current session.
 * @returns The product ids.
 */
export const getFavoriteProductIds = async () => {
  const sessionId = await getShopSessionId();
  if (!sessionId) {
    return [];
  }

  const rows = await db
    .select({ productId: favoriteSchema.productId })
    .from(favoriteSchema)
    .where(eq(favoriteSchema.sessionId, sessionId));
  return rows.map((row) => row.productId);
};

/**
 * Reads favorite products for the current session.
 * @returns The favorite products.
 */
export const getFavoriteProducts = async () => {
  const sessionId = await getShopSessionId();
  if (!sessionId) {
    return [];
  }

  return await db
    .select(productSummaryColumns)
    .from(favoriteSchema)
    .innerJoin(productSchema, eq(favoriteSchema.productId, productSchema.id))
    .innerJoin(categorySchema, eq(productSchema.categoryId, categorySchema.id))
    .where(eq(favoriteSchema.sessionId, sessionId))
    .orderBy(asc(productSchema.name));
};
