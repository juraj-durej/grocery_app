import { getTranslations, setRequestLocale } from 'next-intl/server';
import { connection } from 'next/server';
import { PageHeader } from '@/components/PageHeader';
import { getCartLines } from '@/libs/ShopState';
import { formatPrice } from '@/utils/Helpers';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'CartPage' });

  return { title: t('title') };
}

export default async function CartPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  await connection();
  const t = await getTranslations({ locale, namespace: 'CartPage' });
  const lines = await getCartLines();

  return (
    <>
      <PageHeader title={t('title')} />
      {lines.length === 0 ? (
        <p className="px-4 text-body-lg text-text-secondary">{t('empty')}</p>
      ) : (
        <ul className="flex flex-col gap-3 px-4.25">
          {lines.map((line) => (
            <li
              key={line.product.id}
              data-testid="cart-line"
              className="flex items-center justify-between bg-white p-4"
            >
              <div>
                <p className="text-body-lg font-semibold text-text-strong">{line.product.name}</p>
                <p className="text-body-sm font-medium text-text-secondary">{line.product.unit}</p>
                <p className="text-body-sm font-medium text-brand-dark">
                  {formatPrice(line.product.priceCents)}
                </p>
              </div>
              <p className="text-body-lg font-medium text-text-strong">
                {t('quantity_prefix')}
                <span data-testid="cart-quantity">{line.quantity}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
