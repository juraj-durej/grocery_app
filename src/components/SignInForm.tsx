'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useId } from 'react';
import { PasswordField } from '@/components/PasswordField';
import { Link } from '@/libs/I18nNavigation';

/**
 * Renders the login form: email, password, remember-me row, submit button and the sign-up prompt.
 * The remember-me toggle and "Forgot password" are UI-only placeholders until TASK-93 and TASK-95.
 * @returns The form.
 */
export function SignInForm() {
  const t = useTranslations('SignInPage');
  const emailId = useId();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
      className="mt-6.5"
    >
      <div className="relative">
        <label htmlFor={emailId} className="sr-only">
          {t('email_label')}
        </label>
        <Image
          src="/assets/images/auth/icons/mail.svg"
          alt=""
          width={23}
          height={18}
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-7 h-4.5 w-5.75 -translate-y-1/2"
        />
        <input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t('email_placeholder')}
          className="h-15 w-full rounded-button bg-white pr-4 pl-18 text-paragraph-1 text-text-strong outline-none placeholder:text-text-secondary focus-visible:ring-3 focus-visible:ring-ring"
        />
      </div>
      <div className="mt-1.25">
        <PasswordField />
      </div>
      <div className="mt-5.25 flex items-center justify-between pr-2.25 pl-2.5 text-paragraph-1">
        <div className="flex items-center gap-2.5 text-text-secondary">
          <Image
            src="/assets/images/auth/icons/toggle-off.svg"
            alt=""
            width={29}
            height={16}
            className="h-4 w-7.25"
            aria-hidden
          />
          <span>{t('remember_me')}</span>
        </div>
        <span className="text-link">{t('forgot_password')}</span>
      </div>
      <button
        type="submit"
        className="mt-4.25 h-15 w-full rounded-button bg-linear-to-r from-brand to-brand-dark text-title-sm text-white shadow-brand outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {t('login_button')}
      </button>
      <p className="mt-5 text-center text-caption text-text-secondary">
        {t.rich('sign_up_prompt', {
          signup: (chunks) => (
            <Link
              href="/sign-up"
              className="rounded-button font-medium text-text-strong outline-none focus-visible:ring-3 focus-visible:ring-ring"
            >
              {chunks}
            </Link>
          ),
        })}
      </p>
    </form>
  );
}
