import { setRequestLocale } from 'next-intl/server';
import { BottomNav } from '@/components/BottomNav';

export default async function ShopLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-shop-page">
      <main className="mx-auto w-full max-w-103.5 pb-28">{props.children}</main>
      <BottomNav />
    </div>
  );
}
