'use client';

import { EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useId, useState } from 'react';

/**
 * Renders the password input with a lock icon and a show/hide toggle.
 * @returns The field.
 */
export function PasswordField() {
  const t = useTranslations('SignInPage');
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {t('password_label')}
      </label>
      <Image
        src="/assets/images/auth/icons/lock.svg"
        alt=""
        width={18}
        height={23}
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-7 h-5.75 w-4.5 -translate-y-1/2"
      />
      <input
        id={id}
        name="password"
        type={visible ? 'text' : 'password'}
        autoComplete="current-password"
        placeholder={t('password_placeholder')}
        className="h-15 w-full rounded-button bg-white pr-16 pl-18 text-paragraph-1 text-text-strong outline-none placeholder:text-text-secondary focus-visible:ring-3 focus-visible:ring-ring"
      />
      <button
        type="button"
        aria-label={visible ? t('hide_password') : t('show_password')}
        aria-pressed={visible}
        aria-controls={id}
        onClick={() => {
          setVisible(!visible);
        }}
        className="absolute top-1/2 right-4.75 flex size-11 -translate-y-1/2 items-center justify-center rounded-button outline-none focus-visible:ring-3 focus-visible:ring-ring"
      >
        {visible ? (
          <EyeOff aria-hidden className="size-6 text-text-secondary" />
        ) : (
          <Image
            src="/assets/images/auth/icons/eye.svg"
            alt=""
            width={27}
            height={17}
            className="h-4.25 w-6.75"
            aria-hidden
          />
        )}
      </button>
    </div>
  );
}
