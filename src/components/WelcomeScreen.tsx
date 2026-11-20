import { ArrowLeft, CircleUserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/libs/I18nNavigation';
import { SLIDE_COUNT } from '@/utils/Slides';

/**
 * Renders the welcome screen: hero photo with title bar, and a bottom sheet with the sign-up and login actions.
 * @returns The page landmark.
 */
export function WelcomeScreen() {
  const t = useTranslations('WelcomePage');

  return (
    <main className="relative flex min-h-dvh flex-col bg-background">
      <section className="relative flex-1 overflow-hidden">
        {/* Crop box reproduces the Figma frame (414x896) with arbitrary percentages; from sm up the photo covers the hero. */}
        <div className="absolute top-0 -left-[9.9%] aspect-3/2 w-[231.21%] sm:inset-0 sm:aspect-auto sm:size-full">
          <Image
            src="/assets/images/auth/welcome-photo.jpg"
            alt=""
            fill
            sizes="(min-width: 640px) 100vw, 232vw"
            preload
            className="object-cover"
          />
        </div>
        <div className="absolute inset-x-0 top-0 h-32.75 bg-linear-to-b from-black to-transparent" />
        <header className="absolute inset-x-0 top-13.5 flex h-11 items-center justify-center">
          <Link
            href={`/?slide=${SLIDE_COUNT}`}
            aria-label={t('back_label')}
            className="absolute left-1.5 flex size-11 items-center justify-center rounded-button text-white outline-none focus-visible:ring-3 focus-visible:ring-ring"
          >
            <ArrowLeft aria-hidden className="size-6" />
          </Link>
          <p aria-hidden className="text-toolbar text-white">
            {t('title_bar')}
          </p>
        </header>
      </section>
      <section className="relative -mt-2.5 flex min-h-89.5 flex-col rounded-t-sheet bg-surface px-4 pt-7.75 pb-9.75">
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
      </section>
    </main>
  );
}
