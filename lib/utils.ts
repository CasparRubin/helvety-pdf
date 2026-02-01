import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { logger } from "./logger";

/**
 * Merges Tailwind CSS class names, resolving conflicts intelligently.
 *
 * @param inputs - Class values to merge (strings, objects, arrays, etc.)
 * @returns Merged class name string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Generates a secure random ID using crypto.randomUUID() when available,
 * or falls back to a cryptographically secure alternative.
 *
 * @returns A secure random string identifier
 * @throws {Error} If no secure random number generator is available
 */
export function generateSecureId(): string {
  // Use crypto.randomUUID() if available (browser/Node.js 14.17.0+)
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (error) {
      // If randomUUID fails, fall through to getRandomValues
      if (process.env.NODE_ENV === "development") {
        logger.warn(
          "crypto.randomUUID() failed, falling back to getRandomValues:",
          error
        );
      }
    }
  }

  // Fallback for environments without crypto.randomUUID
  // Use crypto.getRandomValues() which is widely available
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    try {
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      // Convert to hex string (32 characters)
      const hexString = Array.from(array)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      // Format as UUID-like string: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
      return [
        hexString.slice(0, 8),
        hexString.slice(8, 12),
        hexString.slice(12, 16),
        hexString.slice(16, 20),
        hexString.slice(20, 32),
      ].join("-");
    } catch (error) {
      // If getRandomValues fails, throw error in production
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          "Secure random number generation is not available in this environment"
        );
      }
      // In development, log warning and continue to last resort
      logger.warn("crypto.getRandomValues() failed:", error);
    }
  }

  // Last resort fallback (should rarely be needed in modern environments)
  // Only use in development - throw error in production for security
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Secure random number generation is not available. " +
        "This environment does not support crypto.randomUUID() or crypto.getRandomValues()."
    );
  }

  // Development fallback with warning
  logger.warn(
    "Using insecure fallback for ID generation. " +
      "This should only happen in development environments without proper crypto support."
  );
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}`;
}

/**
 * Formats the current date and time as a timestamp string.
 * Format: YYYYMMDD-HHMMSS
 *
 * @returns Timestamp string (e.g., "20260131-143022")
 */
export function formatTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last invocation.
 *
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns A debounced version of the function with a cancel method
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = function executedFunction(...args: Parameters<T>): void {
    const later = (): void => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}
