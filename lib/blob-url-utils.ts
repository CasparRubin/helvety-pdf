/**
 * Utilities for managing blob URLs safely.
 * Prevents memory leaks by ensuring URLs are properly revoked.
 */

/**
 * Safely revokes a blob URL if it exists and is valid.
 * Handles errors gracefully (e.g., if URL was already revoked).
 * 
 * @param url - The blob URL to revoke, or null/undefined
 * 
 * @example
 * ```typescript
 * safeRevokeObjectURL(blobUrl) // Safe even if already revoked
 * safeRevokeObjectURL(null)    // No-op
 * ```
 */
export function safeRevokeObjectURL(url: string | null | undefined): void {
  if (url && typeof url === 'string') {
    try {
      URL.revokeObjectURL(url)
    } catch {
      // Silently handle errors (URL might already be revoked)
    }
  }
}

/**
 * Creates a blob URL and returns a cleanup function.
 * Useful for ensuring URLs are cleaned up even if errors occur.
 * 
 * @param blob - The blob to create a URL for
 * @returns Object with the URL and a cleanup function
 * 
 * @example
 * ```typescript
 * const { url, cleanup } = createBlobURLWithCleanup(blob)
 * try {
 *   // Use url
 * } finally {
 *   cleanup()
 * }
 * ```
 */
export function createBlobURLWithCleanup(blob: Blob): { url: string; cleanup: () => void } {
  const url = URL.createObjectURL(blob)
  return {
    url,
    cleanup: () => safeRevokeObjectURL(url),
  }
}
