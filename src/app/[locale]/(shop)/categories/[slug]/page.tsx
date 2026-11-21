import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { PageHeader } from '@/components/PageHeader';
import { ProductGrid } from '@/components/ProductGrid';
import { getCategoryBySlug, getProductsByCategorySlug } from '@/libs/Catalog';
import { getCartQuantities, getFavoriteProductIds } from '@/libs/ShopState';

type CategoryPageProps = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata(props: CategoryPageProps) {
  const { slug } = await props.params;
  await connection();
  const category = await getCategoryBySlug(slug);

  return { title: category?.name };
}

export default async function CategoryPage(props: CategoryPageProps) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale);
  await connection();

  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const [products, quantities, favoriteIds] = await Promise.all([
    getProductsByCategorySlug(slug),
    getCartQuantities(),
    getFavoriteProductIds(),
  ]);

  return (
    <>
      <PageHeader title={category.name} backHref="/categories" />
      <ProductGrid products={products} quantities={quantities} favoriteIds={favoriteIds} />
    </>
  );
}
