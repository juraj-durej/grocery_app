import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { CartControls } from '@/components/CartControls';
import { FavoriteButton } from '@/components/FavoriteButton';
import { Link } from '@/libs/I18nNavigation';
import type { ProductSummary } from '@/types/Shop';
import { formatPrice } from '@/utils/Helpers';

const Badge = (props: { product: ProductSummary; newLabel: string }) => {
  if (props.product.discountPercent !== null) {
    return (
      <span className="absolute top-0 left-0 flex h-4.5 w-9.5 items-center justify-center bg-badge-sale-bg text-caption font-medium tracking-badge text-badge-sale-text">
        {`-${props.product.discountPercent}%`}
      </span>
    );
  }

  return props.product.isNew ? (
    <span className="absolute top-0 left-0 flex h-4.5 w-9.5 items-center justify-center bg-badge-new-bg text-caption font-medium tracking-badge text-badge-new-text">
      {props.newLabel}
    </span>
  ) : null;
};

export const ProductCard = async (props: {
  product: ProductSummary;
  quantity: number;
  isFavorite: boolean;
}) => {
  const { product } = props;
  const t = await getTranslations('ProductCard');

  return (
    <article className="relative h-58.5 bg-white">
      <Link href={`/products/${product.slug}`} className="absolute inset-x-0 top-0 h-48.25">
        <span
          className="absolute top-5.25 left-1/2 size-21 -translate-x-1/2 rounded-full"
          style={{ backgroundColor: product.color }}
        />
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt=""
            width={130}
            height={84}
            className="absolute top-6.5 left-1/2 h-21 w-32.5 -translate-x-1/2 object-contain"
          />
        ) : (
          <Image
            src={product.categoryIconUrl}
            alt=""
            width={40}
            height={40}
            className="absolute top-12.5 left-1/2 size-10 -translate-x-1/2 object-contain"
          />
        )}
        <span className="absolute inset-x-0 top-30.75 text-center text-body-sm font-medium text-brand">
          {formatPrice(product.priceCents)}
        </span>
        <span className="absolute inset-x-0 top-35 px-2 text-center text-body-lg font-semibold text-black">
          {product.name}
        </span>
        <span className="absolute inset-x-0 top-41 text-center text-body-sm font-medium text-text-muted">
          {product.unit}
        </span>
      </Link>
      <Badge product={product} newLabel={t('badge_new')} />
      <FavoriteButton
        productId={product.id}
        isFavorite={props.isFavorite}
        className="absolute -top-1.25 -right-1.25"
      />
      <div className="absolute inset-x-0 bottom-0 h-10.25 border-t border-divider">
        <CartControls productId={product.id} quantity={props.quantity} />
      </div>
    </article>
  );
};
