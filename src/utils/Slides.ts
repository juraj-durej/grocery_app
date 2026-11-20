/**
 * Computes which slide is shown in a horizontal scroll-snap carousel.
 * @param options - Scroll offset, width of one slide and slide count.
 * @returns The zero-based slide index, clamped to the valid range.
 */
export function getActiveSlideIndex(options: {
  scrollLeft: number;
  slideWidth: number;
  count: number;
}) {
  if (options.slideWidth <= 0) {
    return 0;
  }

  const index = Math.round(options.scrollLeft / options.slideWidth);

  return Math.min(Math.max(index, 0), options.count - 1);
}

/** Number of onboarding slides on the index page; must equal the number of slides in `WelcomeSlides`. */
export const SLIDE_COUNT = 4;

/**
 * Parses the one-based `slide` query param into a zero-based slide index.
 * @param value - Raw search param value.
 * @param count - Number of slides.
 * @returns The zero-based index, clamped to the valid range; 0 when missing or invalid.
 */
export function parseSlideParam(value: string | string[] | undefined, count: number) {
  if (typeof value !== 'string' || !/^\d+$/u.test(value)) {
    return 0;
  }

  return Math.min(Math.max(Number(value) - 1, 0), count - 1);
}
