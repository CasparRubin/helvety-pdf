/**
 * Application-wide constants
 */

/**
 * Breakpoint values for responsive column layout (in pixels)
 */
export const BREAKPOINTS = {
  /** Minimum width for multi-column layout (2+ columns) */
  MULTI_COLUMN: 1231,
  /** Minimum width for three-column layout */
  THREE_COLUMN: 1655,
} as const

/**
 * Column configuration
 */
export const COLUMNS = {
  /** Minimum number of columns for validation (allows defaults) */
  MIN: 2,
  /** Maximum number of columns */
  MAX: 6,
  /** Minimum number of columns in slider (user input) */
  SLIDER_MIN: 3,
  /** Default number of columns for small screens */
  DEFAULT_SMALL: 1,
  /** Default number of columns for medium screens */
  DEFAULT_MEDIUM: 2,
  /** Default number of columns for large screens */
  DEFAULT_LARGE: 3,
} as const

/**
 * Timeout delays (in milliseconds)
 */
export const DELAYS = {
  /** Delay before revoking blob URLs after download */
  BLOB_URL_CLEANUP: 100,
  /** Delay before auto-dismissing non-critical errors */
  ERROR_AUTO_DISMISS: 8000,
} as const

/**
 * LocalStorage keys
 */
export const STORAGE_KEYS = {
  /** Key for storing column preference */
  COLUMNS: "helvety-pdf-columns",
} as const

