'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRef, useState } from 'react';

const slideKeys = ['slide_1', 'slide_2', 'slide_3', 'slide_4'] as const;

export const PromoCarousel = () => {
  const t = useTranslations('PromoCarousel');
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  return (
    <section aria-roledescription="carousel" aria-label={t('label')} className="relative">
      <div
        ref={scroller}
        onScroll={(event) => {
          setActive(Math.round(event.currentTarget.scrollLeft / event.currentTarget.clientWidth));
        }}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
      >
        {slideKeys.map((key, index) => (
          <div
            key={key}
            className="relative aspect-380/283 w-full shrink-0 snap-center overflow-hidden"
          >
            <Image
              src="/images/promotions/first-purchase.jpg"
              alt=""
              width={490}
              height={327}
              className="promo-photo"
              priority={index === 0}
            />
            <p className="absolute top-37.75 left-11 max-w-42.5 text-title-md font-semibold text-black">
              {t(key)}
            </p>
          </div>
        ))}
      </div>
      <div className="absolute top-61.75 left-4 flex gap-1.75">
        {slideKeys.map((key, index) => (
          <button
            key={key}
            type="button"
            aria-label={t('go_to_slide', { number: index + 1 })}
            aria-current={index === active}
            onClick={() => {
              const el = scroller.current;
              el?.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
            }}
            className={`relative h-1.5 rounded-full after:absolute after:-inset-2 ${
              index === active ? 'w-6 bg-brand' : 'w-1.5 bg-white'
            }`}
          />
        ))}
      </div>
    </section>
  );
};
