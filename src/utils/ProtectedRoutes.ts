import { routing } from '@/libs/I18nRouting';

const PROTECTED_SEGMENTS = new Set(['dashboard', 'account']);

const localeOf = (pathname: string) => {
  const first = pathname.split('/').at(1) ?? '';

  return routing.locales.find((locale) => locale === first);
};

/**
 * Checks whether a pathname belongs to a route that requires authentication.
 * @param pathname - The request pathname, with an optional locale prefix.
 * @returns True for `/dashboard` and `/account` and their sub-paths.
 */
export function isProtectedPath(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const first = localeOf(pathname) ? segments.at(1) : segments.at(0);

  return first !== undefined && PROTECTED_SEGMENTS.has(first);
}

/**
 * Builds the sign-in path, keeping the locale prefix of the given pathname.
 * @param pathname - The request pathname, with an optional locale prefix.
 * @returns `/sign-in` or `/<locale>/sign-in`.
 */
export function signInPathFor(pathname: string) {
  const locale = localeOf(pathname);

  return locale ? `/${locale}/sign-in` : '/sign-in';
}
