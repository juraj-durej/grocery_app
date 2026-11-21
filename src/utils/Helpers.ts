import { Env } from '@/libs/Env';
import { routing } from '@/libs/I18nRouting';

/**
 * Resolves the public base URL of the application.
 * @returns The configured public app URL, the Vercel deployment URL or the local development URL.
 */
export const getBaseUrl = () => {
  if (Env.NEXT_PUBLIC_APP_URL) {
    return Env.NEXT_PUBLIC_APP_URL;
  }

  if (
    Env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
    Env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
  ) {
    return `https://${Env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (Env.NEXT_PUBLIC_VERCEL_BRANCH_URL) {
    return `https://${Env.NEXT_PUBLIC_VERCEL_BRANCH_URL}`;
  }

  if (Env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${Env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  return 'http://localhost:3000';
};

/**
 * Builds a locale-aware path by prefixing non-default locales.
 * @param url The base application-relative path starting with a slash.
 * @param locale The active locale identifier.
 * @returns The localized path, prefixed when the locale is not the default locale.
 */
export const getI18nPath = (url: string, locale: string) => {
  if (locale === routing.defaultLocale) {
    return url;
  }

  return `/${locale}${url}`;
};

/**
 * Formats a price in cents as a dollar amount.
 * @param cents The price in cents.
 * @returns The price with a dollar sign and two decimals, e.g. `$8.00`.
 */
export const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;
