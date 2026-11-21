'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { startTransition, useOptimistic } from 'react';
import { toggleFavorite } from '@/actions/ShopActions';

export const FavoriteButton = (props: {
  productId: number;
  isFavorite: boolean;
  className?: string;
}) => {
  const t = useTranslations('ProductCard');
  const [isFavorite, setFavorite] = useOptimistic(props.isFavorite);

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-label={isFavorite ? t('remove_from_favorites') : t('add_to_favorites')}
      onClick={() => {
        startTransition(async () => {
          setFavorite(!isFavorite);
          await toggleFavorite(props.productId);
        });
      }}
      className={`flex size-11 items-center justify-center ${props.className ?? ''}`}
    >
      {isFavorite ? (
        <Image src="/icons/heart-fill.svg" alt="" width={18} height={16} />
      ) : (
        <Image src="/icons/heart.svg" alt="" width={16} height={16} />
      )}
    </button>
  );
};
