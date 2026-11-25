import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/PageHeader';
import { SignOutRow } from '@/components/SignOutRow';
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
      {user && (
        <>
          <p className="px-4 pb-4 text-body-lg text-text-secondary">
            {t('signed_in_as', { email: user.email ?? '' })}
          </p>
          <ul aria-label={t('menu_label')}>
            <li>
              <SignOutRow label={t('sign_out')} />
            </li>
          </ul>
        </>
      )}
    </>
  );
}
