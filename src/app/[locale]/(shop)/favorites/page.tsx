import { getTranslations, setRequestLocale } from 'next-intl/server';
import { connection } from 'next/server';
import { PageHeader } from '@/components/PageHeader';
import { ProductGrid } from '@/components/ProductGrid';
import { getCartQuantities, getFavoriteProducts } from '@/libs/ShopState';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'FavoritesPage' });

  return { title: t('title') };
}

export default async function FavoritesPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  await connection();
  const t = await getTranslations({ locale, namespace: 'FavoritesPage' });

  const [products, quantities] = await Promise.all([getFavoriteProducts(), getCartQuantities()]);

  return (
    <>
      <PageHeader title={t('title')} />
      {products.length === 0 ? (
        <p className="px-4 text-body-lg text-text-secondary">{t('empty')}</p>
      ) : (
        <ProductGrid
          products={products}
          quantities={quantities}
          favoriteIds={products.map((product) => product.id)}
        />
      )}
    </>
  );
}
