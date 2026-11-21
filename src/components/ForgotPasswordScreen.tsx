import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/libs/I18nNavigation';

/**
 * Renders the minimal password recovery screen: title bar with back link to login and the heading.
 * @returns The page landmark.
 */
export function ForgotPasswordScreen() {
  const t = useTranslations('ForgotPasswordPage');

  return (
    <main className="min-h-dvh bg-surface pt-13.5">
      <header className="relative flex h-11 items-center justify-center">
        <Link
          href="/sign-in"
          aria-label={t('back_label')}
          className="absolute left-1.5 flex size-11 items-center justify-center rounded-button text-text-strong outline-none focus-visible:ring-3 focus-visible:ring-ring"
        >
          <ArrowLeft aria-hidden className="size-6" />
        </Link>
        <p aria-hidden className="text-toolbar text-text-strong">
          {t('title_bar')}
        </p>
      </header>
      <h1 className="mt-19 px-4 text-center text-heading-2 text-text-strong">{t('heading')}</h1>
    </main>
  );
}
