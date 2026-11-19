import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { cn } from '@/utils/Cn';

/**
 * Renders one full-viewport welcome slide with its photo, heading and paragraph.
 * @param props - Slide content, photo source and crop classes, one-based position and total.
 * @returns The slide group.
 */
export function WelcomeSlide(props: {
  heading: React.ReactNode;
  photoSrc: string;
  photoClassName: string;
  position: number;
  total: number;
}) {
  const t = useTranslations('IndexPage');
  const isFirst = props.position === 1;
  const Heading = isFirst ? 'h1' : 'h2';

  return (
    <div
      // APG carousel pattern: each slide is a labelled group.
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="group"
      aria-roledescription="slide"
      aria-label={t('slide_label', { index: props.position, total: props.total })}
      className="relative h-dvh w-full shrink-0 snap-center overflow-hidden bg-background"
    >
      <div className={cn('absolute sm:inset-0 sm:size-full', props.photoClassName)}>
        <Image
          src={props.photoSrc}
          alt=""
          fill
          sizes="(min-width: 640px) 100vw, 160vw"
          preload={isFirst}
          className="object-cover"
        />
      </div>
      <div className="relative mx-auto w-80 pt-24 text-center">
        <Heading className="min-h-26.75 text-heading-1 text-text-strong">
          {props.heading}
          {isFirst && (
            <Image
              src="/assets/images/welcome/big-cart-logo.png"
              alt={t('logo_alt')}
              width={127}
              height={50}
              className="mx-auto mt-1"
            />
          )}
        </Heading>
        <p className="text-paragraph-1 text-text-secondary">{t('slide_paragraph')}</p>
      </div>
    </div>
  );
}
