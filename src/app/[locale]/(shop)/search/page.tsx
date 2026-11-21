import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/PageHeader';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'SearchPage' });

  return { title: t('title') };
}

export default async function SearchPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'SearchPage' });

  return (
    <>
      <PageHeader title={t('title')} />
      <p className="px-4 text-body-lg text-text-secondary">{t('placeholder_text')}</p>
    </>
  );
}
