import { Eye, LockKeyhole, Mail, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AuthField } from '@/components/AuthField';
import { AuthScreen } from '@/components/AuthScreen';
import { Button } from '@/components/ui/button';
import { Link } from '@/libs/I18nNavigation';

/**
 * Renders the create account screen: hero photo with title bar, and a bottom sheet with the heading, subtitle and account form.
 * @returns The page landmark.
 */
export function SignUpScreen() {
  const t = useTranslations('SignUpPage');

  return (
    <AuthScreen
      photoSrc="/assets/images/auth/sign-up-photo.jpg"
      photoClassName="-top-5.5 -left-[47.83%] w-[174.4%]"
      backHref="/welcome"
      backLabel={t('back_label')}
      titleBar={t('title_bar')}
      sheetClassName="min-h-116.5 pt-7.25"
    >
      <h1 className="text-heading-2 text-text-strong">{t('heading')}</h1>
      <p className="mt-0.5 text-paragraph-2 text-text-secondary">{t('paragraph')}</p>
      <form
        noValidate
        aria-label={t('form_label')}
        className="mt-6.75 flex flex-1 flex-col gap-1.25"
      >
        <AuthField
          name="email"
          type="email"
          autoComplete="email"
          label={t('email_label')}
          placeholder={t('email_placeholder')}
          icon={<Mail className="size-full" />}
        />
        <AuthField
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          label={t('phone_label')}
          placeholder={t('phone_placeholder')}
          icon={<Phone className="size-full" />}
        />
        <AuthField
          name="password"
          type="password"
          autoComplete="new-password"
          label={t('password_label')}
          placeholder={t('password_placeholder')}
          icon={<LockKeyhole className="size-full" />}
          trailing={<Eye className="size-full" />}
        />
        <Button type="button" variant="brand" size="brand" className="mt-3">
          {t('signup_button')}
        </Button>
        <p className="mt-auto pt-3.5 text-center text-caption text-text-secondary">
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
      </form>
    </AuthScreen>
  );
}
