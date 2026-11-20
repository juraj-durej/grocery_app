import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/libs/I18nNavigation';
import { cn } from '@/utils/Cn';

/**
 * Renders the shared auth layout: hero photo with gradient and title bar, and a rounded bottom sheet for the content.
 * @param props - Component props.
 * @param props.photoSrc - Hero photo path.
 * @param props.photoClassName - Static classes placing the photo crop box (offset and width) on mobile.
 * @param props.backHref - Target of the back link.
 * @param props.backLabel - Accessible label of the back link.
 * @param props.titleBar - Text centered in the title bar.
 * @param props.sheetClassName - Static classes for the sheet height and top padding.
 * @param props.children - Sheet content.
 * @returns The page landmark.
 */
export function AuthScreen(props: {
  photoSrc: string;
  photoClassName: string;
  backHref: string;
  backLabel: string;
  titleBar: string;
  sheetClassName: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-dvh flex-col bg-background">
      <section className="relative flex-1 overflow-hidden">
        {/* Crop box reproduces the Figma frame (414x896) with arbitrary percentages; from sm up the photo covers the hero. */}
        <div
          className={cn(
            'absolute aspect-3/2 sm:inset-0 sm:aspect-auto sm:size-full',
            props.photoClassName,
          )}
        >
          <Image
            src={props.photoSrc}
            alt=""
            fill
            sizes="(min-width: 640px) 100vw, 232vw"
            preload
            className="object-cover"
          />
        </div>
        <div className="absolute inset-x-0 top-0 h-32.75 bg-linear-to-b from-black to-transparent" />
        <header className="absolute inset-x-0 top-13.5 flex h-11 items-center justify-center">
          <Link
            href={props.backHref}
            aria-label={props.backLabel}
            className="absolute left-1.5 flex size-11 items-center justify-center rounded-button text-white outline-none focus-visible:ring-3 focus-visible:ring-ring"
          >
            <ArrowLeft aria-hidden className="size-6" />
          </Link>
          <p aria-hidden className="text-toolbar text-white">
            {props.titleBar}
          </p>
        </header>
      </section>
      <section
        className={cn(
          'relative -mt-2.5 flex flex-col rounded-t-sheet bg-surface px-4 pb-9.75',
          props.sheetClassName,
        )}
      >
        {props.children}
      </section>
    </main>
  );
}
