import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/PageHeader';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'AccountPage' });

  return { title: t('title') };
}

export default async function AccountPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'AccountPage' });

  return (
    <>
      <PageHeader title={t('title')} />
      <p className="px-4 text-body-lg text-text-muted">{t('placeholder_text')}</p>
    </>
  );
}
