import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'IndexPage' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function IndexPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'IndexPage' });

  return (
    <main>
      <h1>{t('title')}</h1>
    </main>
  );
}
