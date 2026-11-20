import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'WelcomePage' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function WelcomePage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'WelcomePage' });

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <h1 className="text-heading-1 text-text-strong">{t('title')}</h1>
    </main>
  );
}
