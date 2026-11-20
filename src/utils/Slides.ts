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
