import { CircleUserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AuthScreen } from '@/components/AuthScreen';
import { Link } from '@/libs/I18nNavigation';
import { SLIDE_COUNT } from '@/utils/Slides';

/**
 * Renders the welcome screen: hero photo with title bar, and a bottom sheet with the sign-up and login actions.
 * @returns The page landmark.
 */
export function WelcomeScreen() {
  const t = useTranslations('WelcomePage');

  return (
    <AuthScreen
      photoSrc="/assets/images/auth/welcome-photo.jpg"
      photoClassName="top-0 -left-[9.9%] w-[231.21%]"
      backHref={`/?slide=${SLIDE_COUNT}`}
      backLabel={t('back_label')}
      titleBar={t('title_bar')}
      sheetClassName="min-h-89.5 pt-7.75"
    >
      <h1 className="text-heading-2 text-text-strong">{t('heading')}</h1>
      <p className="max-w-80 text-paragraph-1 text-text-secondary">{t('paragraph')}</p>
      <Link
        href="/sign-up"
        className="relative mx-auto mt-auto flex h-15 w-full max-w-95 items-center justify-center rounded-button bg-linear-to-r from-brand to-brand-dark text-title-sm text-white shadow-brand outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <CircleUserRound aria-hidden className="absolute left-7.5 size-6.5" />
        {t('create_account_button')}
      </Link>
      <p className="mt-5 text-center text-caption text-text-secondary">
        {t.rich('login_prompt', {
          login: (chunks) => (
            <Link
              href="/sign-in"
              className="rounded-button font-medium text-text-strong outline-none focus-visible:ring-3 focus-visible:ring-ring"
            >
              {chunks}
            </Link>
          ),
        })}
      </p>
    </AuthScreen>
  );
}
