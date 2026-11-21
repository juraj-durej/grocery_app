'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { startTransition, useOptimistic } from 'react';
import { addToCart, updateCartQuantity } from '@/actions/ShopActions';

export const CartControls = (props: { productId: number; quantity: number }) => {
  const t = useTranslations('ProductCard');
  const [quantity, setQuantity] = useOptimistic(props.quantity);

  const change = (next: number) => {
    startTransition(async () => {
      setQuantity(next);
      await (next === 1 && quantity === 0
        ? addToCart(props.productId)
        : updateCartQuantity({ productId: props.productId, quantity: next }));
    });
  };

  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={() => {
          change(1);
        }}
        className="flex size-full items-center justify-center gap-2.25 text-body-sm font-medium text-text-strong"
      >
        <Image src="/assets/icons/bag.svg" alt="" width={13} height={15} />
        {t('add_to_cart')}
      </button>
    );
  }

  return (
    <div className="relative size-full">
      <button
        type="button"
        aria-label={t('decrease_quantity')}
        onClick={() => {
          change(quantity - 1);
        }}
        className="absolute inset-y-0 left-1 flex w-11 items-center justify-center"
      >
        <Image src="/assets/icons/minus.svg" alt="" width={15} height={2} />
      </button>
      <span
        data-testid="cart-quantity"
        className="flex size-full items-center justify-center text-body-sm font-medium text-text-strong"
      >
        {quantity}
      </span>
      <button
        type="button"
        aria-label={t('increase_quantity')}
        onClick={() => {
          change(quantity + 1);
        }}
        className="absolute inset-y-0 right-1 flex w-11 items-center justify-center"
      >
        <Image src="/assets/icons/plus.svg" alt="" width={15} height={12} />
      </button>
    </div>
  );
};
