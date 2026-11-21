import { describe, expect, it } from 'vitest';
import { getSlideIndex, isCarouselResting } from './Carousel';

describe(isCarouselResting, () => {
  it('returns true when aligned on a slide', () => {
    expect(isCarouselResting(800, 400)).toBeTruthy();
  });

  it('returns true within a pixel of a slide', () => {
    expect(isCarouselResting(400.5, 400)).toBeTruthy();
  });

  it('returns false mid-scroll', () => {
    expect(isCarouselResting(550, 400)).toBeFalsy();
  });
});

describe(getSlideIndex, () => {
  it('returns 0 at the start', () => {
    expect(getSlideIndex(0, 400)).toBe(0);
  });

  it('rounds a partial scroll to the nearest slide', () => {
    expect(getSlideIndex(620, 400)).toBe(2);
    expect(getSlideIndex(580, 400)).toBe(1);
  });

  it('returns 0 when the width is zero', () => {
    expect(getSlideIndex(100, 0)).toBe(0);
  });
});
