import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SignOutButton } from '@/components/SignOutButton';
import { redirect } from '@/libs/I18nNavigation';
import { createSupabaseServerClient } from '@/libs/SupabaseServer';

export default async function DashboardPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: '/sign-in', locale });

    return null;
  }

  const t = await getTranslations({ locale, namespace: 'DashboardPage' });

  return (
    <main className="mx-auto flex min-h-dvh max-w-95 flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-heading-2 text-text-strong">{t('heading')}</h1>
      <p className="text-paragraph-2 text-text-secondary">
        {t('signed_in_as', { email: user.email ?? '' })}
      </p>
      <SignOutButton label={t('sign_out_button')} />
    </main>
  );
}
