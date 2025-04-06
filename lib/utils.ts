import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases CSS condicionales utilizando clsx y twMerge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 