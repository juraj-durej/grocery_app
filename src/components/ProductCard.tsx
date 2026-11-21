import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { CartControls } from '@/components/CartControls';
import { FavoriteButton } from '@/components/FavoriteButton';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/libs/I18nNavigation';
import type { ProductSummary } from '@/types/Shop';
import { formatPrice } from '@/utils/Helpers';

const badgeClassName = 'absolute top-0 left-0 h-4.5 w-9.5 p-0 text-micro tracking-badge';

const ProductBadge = (props: { product: ProductSummary; newLabel: string }) => {
  if (props.product.discountPercent !== null) {
    return (
      <Badge variant="sale" className={badgeClassName}>
        {`-${props.product.discountPercent}%`}
      </Badge>
    );
  }

  return props.product.isNew ? (
    <Badge variant="new" className={badgeClassName}>
      {props.newLabel}
    </Badge>
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
        <span className="absolute inset-x-0 top-30.75 text-center text-body-sm font-medium text-brand-dark">
          {formatPrice(product.priceCents)}
        </span>
        <span className="absolute inset-x-0 top-35 px-2 text-center text-body-lg font-semibold text-text-strong">
          {product.name}
        </span>
        <span className="absolute inset-x-0 top-41 text-center text-body-sm font-medium text-text-secondary">
          {product.unit}
        </span>
      </Link>
      <ProductBadge product={product} newLabel={t('badge_new')} />
      <FavoriteButton
        productId={product.id}
        isFavorite={props.isFavorite}
        className="absolute -top-1.25 -right-1.25"
      />
      <div className="absolute inset-x-0 bottom-0 h-10.25 border-t border-border">
        <CartControls productId={product.id} quantity={props.quantity} />
      </div>
    </article>
  );
};
