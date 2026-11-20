'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/libs/I18nNavigation';
import { getSlideIndex, isCarouselResting } from '@/utils/Carousel';

/**
 * Renders the fixed button that advances the carousel, then opens the welcome screen from the last slide.
 * @param props - Id of the carousel element and the total number of slides.
 * @returns The button.
 */
export function GetStartedButton(props: { carouselId: string; total: number }) {
  const t = useTranslations('IndexPage');
  const router = useRouter();

  return (
    <button
      type="button"
      aria-controls={props.carouselId}
      onClick={() => {
        const carousel = document.querySelector(`#${props.carouselId}`);
        if (!carousel || !isCarouselResting(carousel.scrollLeft, carousel.clientWidth)) {
          return;
        }
        const index = getSlideIndex(carousel.scrollLeft, carousel.clientWidth);
        if (index >= props.total - 1) {
          router.push('/welcome');
          return;
        }
        carousel.scrollTo({ left: (index + 1) * carousel.clientWidth });
      }}
      className="fixed inset-x-4 bottom-14 mx-auto h-15 max-w-95 rounded-button bg-linear-to-r from-brand to-brand-dark text-title-sm text-white shadow-brand outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {t('get_started_button')}
    </button>
  );
}
