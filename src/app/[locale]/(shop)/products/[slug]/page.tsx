import { setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { CartControls } from '@/components/CartControls';
import { FavoriteButton } from '@/components/FavoriteButton';
import { PageHeader } from '@/components/PageHeader';
import { getProductBySlug } from '@/libs/Catalog';
import { getCartQuantities, getFavoriteProductIds } from '@/libs/ShopState';
import { formatPrice } from '@/utils/Helpers';

type ProductPageProps = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata(props: ProductPageProps) {
  const { slug } = await props.params;
  await connection();
  const product = await getProductBySlug(slug);

  return { title: product?.name };
}

export default async function ProductPage(props: ProductPageProps) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale);
  await connection();

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [quantities, favoriteIds] = await Promise.all([
    getCartQuantities(),
    getFavoriteProductIds(),
  ]);

  return (
    <>
      <PageHeader title={product.name} backHref={`/categories/${product.categorySlug}`} />
      <div className="relative mx-4.25 bg-white pb-6 text-center">
        <FavoriteButton
          productId={product.id}
          isFavorite={favoriteIds.includes(product.id)}
          className="absolute top-2 right-2"
        />
        <div
          className="relative mx-auto mt-8 size-52 rounded-full"
          style={{ backgroundColor: product.color }}
        >
          <Image
            src={product.imageUrl ?? product.categoryIconUrl}
            alt=""
            width={240}
            height={160}
            className="absolute top-1/2 left-1/2 h-40 w-60 -translate-x-1/2 -translate-y-1/2 object-contain"
          />
        </div>
        <p className="mt-6 text-body-lg font-medium text-brand">
          {formatPrice(product.priceCents)}
        </p>
        <p className="mt-1 text-body-sm font-medium text-text-muted">{product.unit}</p>
        <div className="mx-auto mt-6 h-10.25 w-full max-w-60 border-t border-divider">
          <CartControls productId={product.id} quantity={quantities[product.id] ?? 0} />
        </div>
      </div>
    </>
  );
}
