'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { db } from '@/libs/DB';
import { ensureShopSessionId } from '@/libs/ShopSession';
import { cartItemSchema, favoriteSchema, productSchema } from '@/models/Schema';

const productIdSchema = z.number().int().positive();
const quantitySchema = z.object({
  productId: productIdSchema,
  quantity: z.number().int().max(99),
});

const assertProductExists = async (productId: number) => {
  const [product] = await db
    .select({ id: productSchema.id })
    .from(productSchema)
    .where(eq(productSchema.id, productId))
    .limit(1);
  if (!product) {
    throw new Error('Product not found');
  }
};

/**
 * Adds a product to the cart with quantity 1, keeping the quantity when already present.
 * @param productId The product id.
 * @returns The resulting quantity.
 */
export const addToCart = async (productId: number) => {
  const id = productIdSchema.parse(productId);
  const sessionId = await ensureShopSessionId();
  await assertProductExists(id);

  await db
    .insert(cartItemSchema)
    .values({ sessionId, productId: id, quantity: 1 })
    .onConflictDoNothing();
  const [item] = await db
    .select({ quantity: cartItemSchema.quantity })
    .from(cartItemSchema)
    .where(and(eq(cartItemSchema.sessionId, sessionId), eq(cartItemSchema.productId, id)));

  revalidatePath('/', 'layout');
  return item?.quantity ?? 0;
};

/**
 * Sets a cart line quantity; a quantity of 0 or less removes the line.
 * @param props The product id and the new quantity.
 * @returns The resulting quantity, 0 when removed.
 */
export const updateCartQuantity = async (props: { productId: number; quantity: number }) => {
  const input = quantitySchema.parse(props);
  const sessionId = await ensureShopSessionId();
  await assertProductExists(input.productId);

  if (input.quantity <= 0) {
    await db
      .delete(cartItemSchema)
      .where(
        and(eq(cartItemSchema.sessionId, sessionId), eq(cartItemSchema.productId, input.productId)),
      );
    revalidatePath('/', 'layout');
    return 0;
  }

  await db
    .insert(cartItemSchema)
    .values({ sessionId, productId: input.productId, quantity: input.quantity })
    .onConflictDoUpdate({
      target: [cartItemSchema.sessionId, cartItemSchema.productId],
      set: { quantity: input.quantity },
    });

  revalidatePath('/', 'layout');
  return input.quantity;
};

/**
 * Toggles a product in the favorites of the current session.
 * @param productId The product id.
 * @returns Whether the product is now a favorite.
 */
export const toggleFavorite = async (productId: number) => {
  const id = productIdSchema.parse(productId);
  const sessionId = await ensureShopSessionId();
  await assertProductExists(id);

  const removed = await db
    .delete(favoriteSchema)
    .where(and(eq(favoriteSchema.sessionId, sessionId), eq(favoriteSchema.productId, id)))
    .returning({ id: favoriteSchema.id });
  const isFavorite = removed.length === 0;
  if (isFavorite) {
    await db.insert(favoriteSchema).values({ sessionId, productId: id }).onConflictDoNothing();
  }

  revalidatePath('/', 'layout');
  return isFavorite;
};
