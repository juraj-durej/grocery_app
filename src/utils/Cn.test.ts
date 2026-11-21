import { describe, expect, it } from 'vitest';
import { cn } from './Cn';

describe(cn, () => {
  describe('custom font-size tokens', () => {
    it('replaces a default size with a custom size', () => {
      expect(cn('text-base', 'text-paragraph-1')).toBe('text-paragraph-1');
    });

    it('replaces a responsive default size with a responsive custom size', () => {
      expect(cn('md:text-sm', 'md:text-paragraph-1')).toBe('md:text-paragraph-1');
    });

    it('keeps a text color next to a custom size', () => {
      expect(cn('text-white', 'text-title-sm')).toBe('text-white text-title-sm');
    });

    it('keeps a custom text color next to a custom size', () => {
      expect(cn('text-text-secondary', 'text-caption')).toBe('text-text-secondary text-caption');
    });
  });

  describe('shop font-size tokens', () => {
    it('replaces a default size with a shop size', () => {
      expect(cn('text-base', 'text-body-lg')).toBe('text-body-lg');
    });

    it('keeps a text color next to a shop size', () => {
      expect(cn('text-text-strong', 'text-micro')).toBe('text-text-strong text-micro');
    });
  });

  describe('custom radius tokens', () => {
    it('replaces a default radius with a custom radius', () => {
      expect(cn('rounded-md', 'rounded-button')).toBe('rounded-button');
    });
  });

  describe('conditional inputs', () => {
    it('drops falsy values and keeps truthy ones', () => {
      expect(cn('p-2', false, null, undefined, 0, '', { hidden: false, flex: true })).toBe(
        'p-2 flex',
      );
    });
  });
});
