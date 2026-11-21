import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { connection } from 'next/server';
import { CategoryRow } from '@/components/CategoryRow';
import { ProductGrid } from '@/components/ProductGrid';
import { PromoCarousel } from '@/components/PromoCarousel';
import { SearchBar } from '@/components/SearchBar';
import { SectionTitle } from '@/components/SectionTitle';
import { getCategories, getFeaturedProducts } from '@/libs/Catalog';
import { redirect } from '@/libs/I18nNavigation';
import { getCartQuantities, getFavoriteProductIds } from '@/libs/ShopState';
import { createSupabaseServerClient } from '@/libs/SupabaseServer';

type DashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: DashboardPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'HomePage' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function DashboardPage(props: DashboardPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  await connection();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: '/sign-in', locale });

    return null;
  }

  const t = await getTranslations({ locale, namespace: 'HomePage' });

  const [categories, products, quantities, favoriteIds] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getCartQuantities(),
    getFavoriteProductIds(),
  ]);

  return (
    <>
      <h1 className="sr-only">{t('heading')}</h1>
      <div className="px-4.25 pt-4">
        <SearchBar />
        <div className="mt-2.5">
          <PromoCarousel />
        </div>
      </div>
      <section className="mt-5">
        <SectionTitle href="/categories">{t('categories_title')}</SectionTitle>
        <div className="mt-4.25">
          <CategoryRow categories={categories} />
        </div>
      </section>
      <section className="mt-8">
        <SectionTitle href="/featured">{t('featured_title')}</SectionTitle>
        <div className="mt-5.25">
          <ProductGrid products={products} quantities={quantities} favoriteIds={favoriteIds} />
        </div>
      </section>
    </>
  );
}
