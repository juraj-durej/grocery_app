import { getTranslations, setRequestLocale } from 'next-intl/server';
import { connection } from 'next/server';
import { PageHeader } from '@/components/PageHeader';
import { ProductGrid } from '@/components/ProductGrid';
import { getFeaturedProducts } from '@/libs/Catalog';
import { getCartQuantities, getFavoriteProductIds } from '@/libs/ShopState';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'FeaturedPage' });

  return { title: t('title') };
}

export default async function FeaturedPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  await connection();
  const t = await getTranslations({ locale, namespace: 'FeaturedPage' });

  const [products, quantities, favoriteIds] = await Promise.all([
    getFeaturedProducts(),
    getCartQuantities(),
    getFavoriteProductIds(),
  ]);

  return (
    <>
      <PageHeader title={t('title')} />
      <ProductGrid products={products} quantities={quantities} favoriteIds={favoriteIds} />
    </>
  );
}
