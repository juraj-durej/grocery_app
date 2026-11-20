import { useTranslations } from 'next-intl';
import { AuthScreen } from '@/components/AuthScreen';

/**
 * Renders the login screen: hero photo with title bar, and a bottom sheet with the heading and subtitle.
 * @returns The page landmark.
 */
export function SignInScreen() {
  const t = useTranslations('SignInPage');

  return (
    <AuthScreen
      photoSrc="/assets/images/auth/sign-in-photo.jpg"
      photoClassName="-top-5.75 -left-[32.85%] w-[194.69%]"
      backHref="/welcome"
      backLabel={t('back_label')}
      titleBar={t('title_bar')}
      sheetClassName="min-h-112.5 pt-7.5"
    >
      <h1 className="text-heading-2 text-text-strong">{t('heading')}</h1>
      <p className="mt-0.5 text-paragraph-2 text-text-secondary">{t('paragraph')}</p>
    </AuthScreen>
  );
}
