import { setRequestLocale } from 'next-intl/server';
import { Poppins } from 'next/font/google';
import { BottomNav } from '@/components/BottomNav';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-poppins',
});

export default async function ShopLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className={`${poppins.variable} min-h-screen bg-shop-page font-sans`}>
      <main className="mx-auto w-full max-w-103.5 pb-28">{props.children}</main>
      <BottomNav />
    </div>
  );
}
