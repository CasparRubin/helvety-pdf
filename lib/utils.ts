import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges Tailwind CSS class names, resolving conflicts intelligently.
 * 
 * @param inputs - Class values to merge (strings, objects, arrays, etc.)
 * @returns Merged class name string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats the current date and time as a timestamp string.
 * Format: YYYYMMDD-HHMMSS
 * 
 * @returns Timestamp string (e.g., "20240115-143022")
 */
export function formatTimestamp(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")
  const seconds = String(now.getSeconds()).padStart(2, "0")
  return `${year}${month}${day}-${hours}${minutes}${seconds}`
}
