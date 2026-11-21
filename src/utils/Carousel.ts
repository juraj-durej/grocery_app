/**
 * Computes the zero-based index of the slide currently snapped in a horizontal carousel.
 * @param scrollLeft - Horizontal scroll offset of the carousel.
 * @param clientWidth - Width of one slide.
 * @returns The slide index, or 0 when the width is not positive.
 */
export function getSlideIndex(scrollLeft: number, clientWidth: number) {
  return clientWidth > 0 ? Math.round(scrollLeft / clientWidth) : 0;
}

/**
 * Tells whether a horizontal carousel rests on a slide, i.e. no scroll is in flight.
 * Left-to-right only: right-to-left carousels are not supported.
 * @param scrollLeft - Horizontal scroll offset of the carousel.
 * @param clientWidth - Width of one slide.
 * @returns True when the offset is within 1px of the nearest slide start.
 */
export function isCarouselResting(scrollLeft: number, clientWidth: number) {
  return Math.abs(scrollLeft - getSlideIndex(scrollLeft, clientWidth) * clientWidth) < 1;
}
