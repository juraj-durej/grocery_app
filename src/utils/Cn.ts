import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges conditional class names and resolves conflicting Tailwind utilities.
 * @param inputs The class values to combine.
 * @returns The merged class name string.
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
