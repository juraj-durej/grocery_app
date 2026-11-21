import { asc, eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { categorySchema, productSchema } from '@/models/Schema';

/** Shared column selection mapping joined rows to `ProductSummary`. */
export const productSummaryColumns = {
  id: productSchema.id,
  slug: productSchema.slug,
  name: productSchema.name,
  priceCents: productSchema.priceCents,
  unit: productSchema.unit,
  imageUrl: productSchema.imageUrl,
  color: productSchema.color,
  isNew: productSchema.isNew,
  discountPercent: productSchema.discountPercent,
  categorySlug: categorySchema.slug,
  categoryIconUrl: categorySchema.iconUrl,
};

const categoryColumns = {
  id: categorySchema.id,
  slug: categorySchema.slug,
  name: categorySchema.name,
  iconUrl: categorySchema.iconUrl,
  color: categorySchema.color,
};

const selectProducts = () =>
  db
    .select(productSummaryColumns)
    .from(productSchema)
    .innerJoin(categorySchema, eq(productSchema.categoryId, categorySchema.id));

/**
 * Lists all categories ordered by sort order.
 * @returns The categories.
 */
export const getCategories = () =>
  db.select(categoryColumns).from(categorySchema).orderBy(asc(categorySchema.sortOrder));

/**
 * Finds a category by its slug.
 * @param slug The category slug.
 * @returns The category, if any.
 */
export const getCategoryBySlug = async (slug: string) => {
  const [category] = await db
    .select(categoryColumns)
    .from(categorySchema)
    .where(eq(categorySchema.slug, slug))
    .limit(1);
  return category;
};

/**
 * Lists featured products ordered by their featured position.
 * @returns The products.
 */
export const getFeaturedProducts = () =>
  selectProducts()
    .where(eq(productSchema.isFeatured, true))
    .orderBy(asc(productSchema.featuredOrder));

/**
 * Lists the products of a category ordered by name.
 * @param slug The category slug.
 * @returns The products.
 */
export const getProductsByCategorySlug = (slug: string) =>
  selectProducts().where(eq(categorySchema.slug, slug)).orderBy(asc(productSchema.name));

/**
 * Finds a product by its slug.
 * @param slug The product slug.
 * @returns The product, if any.
 */
export const getProductBySlug = async (slug: string) => {
  const [product] = await selectProducts().where(eq(productSchema.slug, slug)).limit(1);
  return product;
};
