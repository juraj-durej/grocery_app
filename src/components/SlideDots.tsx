import { useTranslations } from 'next-intl';
import { cn } from '@/utils/Cn';

const dotClassNames = {
  active: 'bg-brand-dark',
  inactive: 'bg-pointer-inactive',
} as const;

/**
 * Renders the page dots that jump to a slide.
 * @param props - Dot count, active zero-based index and select handler.
 * @returns The dot group.
 */
export function SlideDots(props: {
  count: number;
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const t = useTranslations('IndexPage');

  return (
    <div
      // Plain group of buttons labelled for assistive tech.
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="group"
      aria-label={t('dots_label')}
      className="flex w-12 justify-between"
    >
      {Array.from({ length: props.count }, (_, index) => {
        const isActive = index === props.activeIndex;

        return (
          <button
            key={index}
            type="button"
            aria-label={t('dot_label', { index: index + 1 })}
            aria-current={isActive ? 'true' : undefined}
            onClick={() => {
              props.onSelect(index);
            }}
            // after: grows the hit area to a 44px touch target vertically, and horizontally only into half the gap so neighbours never overlap.
            className={cn(
              'relative size-2 rounded-full outline-none after:absolute after:-inset-x-0.5 after:-inset-y-4.5 after:content-[""] focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 motion-safe:transition-colors',
              dotClassNames[isActive ? 'active' : 'inactive'],
            )}
          />
        );
      })}
    </div>
  );
}
