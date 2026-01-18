/**
 * Batch processing utilities for PDF operations.
 * Extracted from hooks to improve code organization and reusability.
 */

/**
 * Calculates optimal batch size based on total number of items.
 * Uses adaptive sizing: smaller batches for large documents to keep UI responsive,
 * larger batches for small documents to improve throughput.
 * 
 * Batch size strategy:
 * - ≤10 items: 10 per batch (fast processing, minimal UI impact)
 * - ≤50 items: 8 per batch (balanced performance)
 * - ≤100 items: 5 per batch (prioritize UI responsiveness)
 * - >100 items: 3 per batch (maximize UI responsiveness for large documents)
 * 
 * @param totalItems - Total number of items to process
 * @returns Optimal batch size (3-10 depending on total items)
 * 
 * @example
 * ```typescript
 * const batchSize = calculateBatchSize(100) // Returns 5
 * const batchSize = calculateBatchSize(5)  // Returns 10
 * ```
 */
export function calculateBatchSize(totalItems: number): number {
  if (totalItems <= 10) {
    return 10
  }
  if (totalItems <= 50) {
    return 8
  }
  if (totalItems <= 100) {
    return 5
  }
  return 3
}

/**
 * Yields control to the browser to prevent UI blocking.
 * Uses requestIdleCallback if available for optimal performance,
 * otherwise falls back to setTimeout(0) for immediate next tick.
 * 
 * @param timeout - Maximum time to wait in milliseconds (default: 100)
 * @returns Promise that resolves when the browser is ready to continue processing
 * 
 * @example
 * ```typescript
 * // Yield between batches
 * await yieldToBrowser(100)
 * ```
 */
export function yieldToBrowser(timeout: number = 100): Promise<void> {
  return new Promise<void>((resolve: () => void) => {
    if ('requestIdleCallback' in window && typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(() => resolve(), { timeout })
    } else {
      setTimeout(() => resolve(), 0)
    }
  })
}

