'use client';

import { useRef, useState } from 'react';
import { SlideDots } from '@/components/SlideDots';
import { getActiveSlideIndex } from '@/utils/Slides';

/**
 * Wraps the slides in the scroll-snap container and tracks the active slide for the page dots.
 * @param props - Element id, accessible label, slide count, initial slide index and the slides.
 * @returns The carousel landmark with the dot overlay.
 */
export function SlidesCarousel(props: {
  id: string;
  label: string;
  count: number;
  initialIndex?: number;
  children: React.ReactNode;
}) {
  const [activeIndex, setActiveIndex] = useState(props.initialIndex ?? 0);
  const mainRef = useRef<HTMLElement>(null);
  const positioned = useRef(false);

  return (
    // Scrollbar hidden through arbitrary properties so the carousel stays scrollable by touch and keyboard.
    <main
      id={props.id}
      aria-roledescription="carousel"
      aria-label={props.label}
      // Keyboard-scrollable region with no interactive children, so it must be focusable itself.
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      ref={(element) => {
        mainRef.current = element;
        // Open on the requested slide once, without smooth scrolling and without an effect.
        if (element && !positioned.current) {
          positioned.current = true;
          element.scrollTo({ left: activeIndex * element.clientWidth, behavior: 'instant' });
        }
      }}
      onScroll={(event) => {
        setActiveIndex(
          getActiveSlideIndex({
            scrollLeft: event.currentTarget.scrollLeft,
            slideWidth: event.currentTarget.clientWidth,
            count: props.count,
          }),
        );
      }}
      className="flex h-dvh snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-inset motion-safe:scroll-smooth [&::-webkit-scrollbar]:hidden"
    >
      {props.children}
      <div className="pointer-events-none fixed inset-x-0 bottom-37 z-10 flex justify-center">
        <div className="pointer-events-auto">
          <SlideDots
            count={props.count}
            activeIndex={activeIndex}
            onSelect={(index) => {
              mainRef.current?.scrollTo({ left: index * mainRef.current.clientWidth });
            }}
          />
        </div>
      </div>
    </main>
  );
}
