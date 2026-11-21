import { describe, expect, it } from 'vitest';
import { routing } from '@/libs/I18nRouting';
import { formatPrice, getI18nPath } from './Helpers';

describe('Helpers', () => {
  describe('I18n path helper', () => {
    it('keeps path unchanged when locale is default', () => {
      const url = '/random-url';
      const locale = routing.defaultLocale;

      expect(getI18nPath(url, locale)).toBe(url);
    });

    it('prefixes path with locale when locale is not default', () => {
      const url = '/random-url';
      const locale = 'nb';

      expect(getI18nPath(url, locale)).toBe(`/nb${url}`);
    });
  });

  describe('price formatting', () => {
    it('formats whole dollars with two decimals', () => {
      expect(formatPrice(800)).toBe('$8.00');
    });

    it('formats cents with two decimals', () => {
      expect(formatPrice(209)).toBe('$2.09');
    });

    it('formats zero', () => {
      expect(formatPrice(0)).toBe('$0.00');
    });
  });
});
