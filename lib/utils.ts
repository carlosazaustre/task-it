import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with clsx
 * Handles conditional classes and deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique ID using crypto.randomUUID
 * Falls back to a nanoid-like pattern if crypto is not available
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: nanoid-like pattern
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 21; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Format a date string as a relative date in Spanish
 * Examples: "Hoy", "Manana", "Ayer", "Hace 2 dias", "En 3 dias"
 */
export function formatRelativeDate(date: string): string {
  const inputDate = new Date(date);
  const today = new Date();

  // Reset time to compare only dates
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);

  const diffTime = inputDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Hoy";
  } else if (diffDays === 1) {
    return "Manana";
  } else if (diffDays === -1) {
    return "Ayer";
  } else if (diffDays > 1 && diffDays <= 7) {
    return `En ${diffDays} dias`;
  } else if (diffDays < -1 && diffDays >= -7) {
    return `Hace ${Math.abs(diffDays)} dias`;
  } else if (diffDays > 7) {
    return `En ${Math.ceil(diffDays / 7)} semanas`;
  } else {
    return `Hace ${Math.ceil(Math.abs(diffDays) / 7)} semanas`;
  }
}
