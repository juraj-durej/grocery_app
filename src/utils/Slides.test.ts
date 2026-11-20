import { describe, expect, it } from 'vitest';
import { getActiveSlideIndex } from './Slides';

describe('Slides', () => {
  describe('active slide index', () => {
    it('returns the first slide at offset zero', () => {
      expect(getActiveSlideIndex({ scrollLeft: 0, slideWidth: 400, count: 4 })).toBe(0);
    });

    it('rounds to the nearest slide mid-scroll', () => {
      expect(getActiveSlideIndex({ scrollLeft: 199, slideWidth: 400, count: 4 })).toBe(0);
      expect(getActiveSlideIndex({ scrollLeft: 201, slideWidth: 400, count: 4 })).toBe(1);
    });

    it('clamps to the last slide', () => {
      expect(getActiveSlideIndex({ scrollLeft: 5000, slideWidth: 400, count: 4 })).toBe(3);
    });

    it('rounds a fractional scroll position', () => {
      expect(getActiveSlideIndex({ scrollLeft: 1199.5, slideWidth: 400, count: 4 })).toBe(3);
    });

    it('returns the first slide for a single slide', () => {
      expect(getActiveSlideIndex({ scrollLeft: 800, slideWidth: 400, count: 1 })).toBe(0);
    });

    it('clamps negative offsets to the first slide', () => {
      expect(getActiveSlideIndex({ scrollLeft: -50, slideWidth: 400, count: 4 })).toBe(0);
    });

    it('returns the first slide when width is zero', () => {
      expect(getActiveSlideIndex({ scrollLeft: 100, slideWidth: 0, count: 4 })).toBe(0);
    });
  });
});
