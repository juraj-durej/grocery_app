import { describe, expect, it } from 'vitest';
import { isProtectedPath, signInPathFor } from './ProtectedRoutes';

describe('protected routes', () => {
  describe('path matching', () => {
    it.each(['/dashboard', '/nb/dashboard/x', '/account', '/nb/account', '/en/account/edit'])(
      'matches %s',
      (pathname) => {
        expect(isProtectedPath(pathname)).toBeTruthy();
      },
    );

    it.each(['/', '/accounts', '/sign-in', '/nb/sign-in', '/nb', '/shop/account'])(
      'skips %s',
      (pathname) => {
        expect(isProtectedPath(pathname)).toBeFalsy();
      },
    );
  });

  describe('sign-in path', () => {
    it('returns the bare sign-in path without a locale prefix', () => {
      expect(signInPathFor('/account')).toBe('/sign-in');
    });

    it('keeps the locale prefix', () => {
      expect(signInPathFor('/nb/account')).toBe('/nb/sign-in');
    });
  });
});
