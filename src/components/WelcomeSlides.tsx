import { useTranslations } from 'next-intl';
import { SlidesCarousel } from '@/components/SlidesCarousel';
import { WelcomeSlide } from '@/components/WelcomeSlide';

/**
 * Renders the welcome slides as a native horizontal scroll-snap carousel.
 * @returns The carousel landmark.
 */
export function WelcomeSlides() {
  const t = useTranslations('IndexPage');
  const br = { br: () => <br /> };

  // Photo classes reproduce the Figma crop boxes (414x896 frame) with arbitrary percentages; from sm up the photo covers the slide.
  const slides = [
    {
      heading: t('slide_1_heading'),
      photoSrc: '/assets/images/welcome/slide-1-bag.jpg',
      photoClassName: '-left-[48.55%] top-0 h-[109.82%] w-[158.21%]',
    },
    {
      heading: t.rich('slide_2_heading', br),
      photoSrc: '/assets/images/welcome/slide-2-eggs.jpg',
      photoClassName: '-left-[42.99%] -top-[9.82%] h-[109.82%] w-[158.21%]',
    },
    {
      heading: t.rich('slide_3_heading', br),
      photoSrc: '/assets/images/welcome/slide-3-mesh-bag.jpg',
      photoClassName: '-left-[28.26%] top-0 h-[100.45%] w-[144.69%]',
    },
    {
      heading: t.rich('slide_4_heading', br),
      photoSrc: '/assets/images/welcome/slide-4-apple.jpg',
      photoClassName: '-left-[26.33%] top-0 h-[100.45%] w-[144.69%]',
    },
  ];

  return (
    <SlidesCarousel label={t('slides_label')} count={slides.length}>
      {slides.map((slide, index) => (
        <WelcomeSlide
          key={slide.photoSrc}
          heading={slide.heading}
          photoSrc={slide.photoSrc}
          photoClassName={slide.photoClassName}
          position={index + 1}
          total={slides.length}
        />
      ))}
    </SlidesCarousel>
  );
}
