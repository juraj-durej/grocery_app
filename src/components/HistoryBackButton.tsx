'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from '@/libs/I18nNavigation';

/**
 * Renders the back button that returns to the previous history entry, or opens the fallback when there is none.
 * @param props - Component props.
 * @param props.fallbackHref - Route opened when the browser has no previous entry.
 * @param props.label - Accessible label.
 * @returns The button.
 */
export function HistoryBackButton(props: { fallbackHref: string; label: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label={props.label}
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
          return;
        }
        router.push(props.fallbackHref);
      }}
      className="absolute left-1.5 flex size-11 items-center justify-center rounded-button text-white outline-none focus-visible:ring-3 focus-visible:ring-ring"
    >
      <ArrowLeft aria-hidden className="size-6" />
    </button>
  );
}
