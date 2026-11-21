'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { signUp } from '@/actions/AuthActions';
import { AuthField } from '@/components/AuthField';
import { PasswordField } from '@/components/PasswordField';
import { Button } from '@/components/ui/button';
import { Field, FieldError } from '@/components/ui/field';
import { Link, useRouter } from '@/libs/I18nNavigation';
import { useAppStore } from '@/stores/AppStore';
import type { SignUpInput } from '@/validations/SignUpValidation';
import { SignUpValidation } from '@/validations/SignUpValidation';

/**
 * Renders the create account form with validation, Supabase sign up and the login prompt.
 * @returns The form.
 */
export function SignUpForm() {
  const t = useTranslations('SignUpPage');
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const form = useForm<SignUpInput>({
    resolver: zodResolver(SignUpValidation),
    defaultValues: { email: '', phone: '', password: '' },
  });
  const { errors, isSubmitting } = form.formState;

  const messages: Record<string, string> = {
    error_email_invalid: t('error_email_invalid'),
    error_phone_invalid: t('error_phone_invalid'),
    error_password_too_short: t('error_password_too_short'),
    error_password_too_long: t('error_password_too_long'),
  };
  const translate = (message?: string) => (message ? messages[message] : undefined);

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    setConfirmationSent(false);

    const result = await signUp(values).catch(() => null);

    if (!result) {
      setFormError(t('error_signup_failed'));

      return;
    }

    if (result.status === 'invalid') {
      for (const field of ['email', 'phone', 'password'] as const) {
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

    if (result.status === 'confirmation_required') {
      setConfirmationSent(true);

      return;
    }

    setFormError(
      result.error === 'email_taken' ? t('error_email_taken') : t('error_signup_failed'),
    );
  });

  return (
    <form
      noValidate
      aria-label={t('form_label')}
      aria-busy={isSubmitting}
      onSubmit={onSubmit}
      className="mt-6.75 flex flex-1 flex-col gap-1.25"
    >
      <AuthField
        type="email"
        autoComplete="email"
        label={t('email_label')}
        placeholder={t('email_placeholder')}
        error={translate(errors.email?.message)}
        icon={
          <Image
            src="/assets/images/auth/icons/mail.svg"
            alt=""
            width={23}
            height={18}
            aria-hidden
            className="h-4.5 w-5.75"
          />
        }
        {...form.register('email')}
      />
      <AuthField
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        label={t('phone_label')}
        placeholder={t('phone_placeholder')}
        error={translate(errors.phone?.message)}
        icon={
          <Image
            src="/assets/images/auth/icons/phone.svg"
            alt=""
            width={23}
            height={23}
            aria-hidden
            className="size-5.75"
          />
        }
        {...form.register('phone')}
      />
      <Field className="mx-auto w-full max-w-95" data-invalid={errors.password ? true : undefined}>
        <PasswordField
          autoComplete="new-password"
          label={t('password_label')}
          placeholder={t('password_placeholder')}
          showLabel={t('show_password')}
          hideLabel={t('hide_password')}
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? 'password-error' : undefined}
          {...form.register('password')}
        />
        {errors.password && (
          <FieldError id="password-error">{translate(errors.password.message)}</FieldError>
        )}
      </Field>
      {formError && (
        <FieldError className="mx-auto w-full max-w-95 text-center">{formError}</FieldError>
      )}
      {confirmationSent && (
        <output className="mx-auto block w-full max-w-95 text-center text-paragraph-2 text-text-strong">
          {t('confirm_email_message')}
        </output>
      )}
      <Button type="submit" variant="brand" size="brand" className="mt-3" disabled={isSubmitting}>
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
  );
}
