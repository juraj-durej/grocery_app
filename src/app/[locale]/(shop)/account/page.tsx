import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/PageHeader';
import { SignOutButton } from '@/components/SignOutButton';
import { createSupabaseServerClient } from '@/libs/SupabaseServer';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'AccountPage' });

  return { title: t('title') };
}

export default async function AccountPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'AccountPage' });

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <PageHeader title={t('title')} />
      <p className="px-4 text-body-lg text-text-secondary">{t('placeholder_text')}</p>
      {user && (
        <div className="flex flex-col items-start gap-4 px-4 pt-4">
          <p className="text-body-lg text-text-secondary">
            {t('signed_in_as', { email: user.email ?? '' })}
          </p>
          <SignOutButton label={t('sign_out_button')} />
        </div>
      )}
    </>
  );
}
