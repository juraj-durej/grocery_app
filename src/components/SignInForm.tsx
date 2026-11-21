'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useId, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { signIn } from '@/actions/AuthActions';
import { PasswordField } from '@/components/PasswordField';
import { FieldError } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { Link, useRouter } from '@/libs/I18nNavigation';
import { useAppStore } from '@/stores/AppStore';
import type { SignInInput } from '@/validations/SignInValidation';
import { SignInValidation } from '@/validations/SignInValidation';

/**
 * Renders the login form with validation, Supabase sign in, remember-me switch and the sign-up prompt.
 * @returns The form.
 */
export function SignInForm() {
  const t = useTranslations('SignInPage');
  const router = useRouter();
  const emailId = useId();
  const rememberId = useId();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<SignInInput>({
    resolver: zodResolver(SignInValidation),
    defaultValues: { email: '', password: '', rememberMe: false },
  });
  const { errors, isSubmitting } = form.formState;

  const messages: Record<string, string> = {
    error_email_required: t('error_email_required'),
    error_email_invalid: t('error_email_invalid'),
    error_password_required: t('error_password_required'),
  };
  const translate = (message?: string) => (message ? messages[message] : undefined);

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);

    const result = await signIn(values).catch(() => null);

    if (!result) {
      setFormError(t('error_login_failed'));

      return;
    }

    if (result.status === 'invalid') {
      for (const field of ['email', 'password'] as const) {
        const message = result.fieldErrors[field]?.[0];

        if (message) {
          form.setError(field, { message });
        }
      }

      return;
    }

    if (result.status === 'signed_in') {
      useAppStore.getState().setAuth({ user: result.user, session: result.session });
      router.push('/dashboard');

      return;
    }

    setFormError(
      result.error === 'invalid_credentials'
        ? t('error_invalid_credentials')
        : t('error_login_failed'),
    );
  });

  return (
    <form
      noValidate
      aria-label={t('form_label')}
      aria-busy={isSubmitting}
      onSubmit={onSubmit}
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
          type="email"
          autoComplete="email"
          placeholder={t('email_placeholder')}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? `${emailId}-error` : undefined}
          className="h-15 w-full rounded-button bg-white pr-4 pl-18 text-paragraph-1 text-text-strong outline-none placeholder:text-text-secondary focus-visible:ring-3 focus-visible:ring-ring aria-invalid:ring-3 aria-invalid:ring-destructive/20"
          {...form.register('email')}
        />
      </div>
      {errors.email && (
        <FieldError id={`${emailId}-error`} className="mt-1.25 px-2.5">
          {translate(errors.email.message)}
        </FieldError>
      )}
      <div className="mt-1.25">
        <PasswordField
          autoComplete="current-password"
          label={t('password_label')}
          placeholder={t('password_placeholder')}
          showLabel={t('show_password')}
          hideLabel={t('hide_password')}
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? `${emailId}-password-error` : undefined}
          {...form.register('password')}
        />
      </div>
      {errors.password && (
        <FieldError id={`${emailId}-password-error`} className="mt-1.25 px-2.5">
          {translate(errors.password.message)}
        </FieldError>
      )}
      <div className="mt-5.25 flex items-center justify-between pr-2.25 pl-2.5 text-paragraph-1">
        <div className="flex items-center gap-2.5 text-text-secondary">
          <Controller
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <Switch
                id={rememberId}
                name={field.name}
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                }}
                onBlur={() => {
                  field.onBlur();
                }}
                ref={field.ref}
              />
            )}
          />
          <label htmlFor={rememberId}>{t('remember_me')}</label>
        </div>
        <Link
          href="/forgot-password"
          className="rounded-button text-link outline-none focus-visible:ring-3 focus-visible:ring-ring"
        >
          {t('forgot_password')}
        </Link>
      </div>
      {formError && <FieldError className="mt-4.25 text-center">{formError}</FieldError>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4.25 h-15 w-full rounded-button bg-linear-to-r from-brand to-brand-dark text-title-sm text-white shadow-brand outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
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
