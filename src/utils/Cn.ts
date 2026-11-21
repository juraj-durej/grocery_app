import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'title-sm',
            'title-md',
            'title-lg',
            'title-xl',
            'paragraph',
            'paragraph-medium',
            'label',
            'heading-1',
            'heading-2',
            'paragraph-1',
            'paragraph-2',
            'toolbar',
            'caption',
            'heading-3',
            'body-lg',
            'body-sm',
            'micro',
          ],
        },
      ],
      rounded: [{ rounded: ['button', 'sheet', 'field'] }],
    },
  },
});

/**
 * Merges conditional class names and resolves conflicting Tailwind utilities, including the custom type and radius tokens.
 * @param inputs The class values to combine.
 * @returns The merged class name string.
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
