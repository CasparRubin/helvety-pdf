/**
 * Batch processing utilities for PDF operations.
 * Extracted from hooks to improve code organization and reusability.
 * 
 * Batch processing approach:
 * - Processes items in configurable batch sizes (3-10 items per batch)
 * - Adaptive batch sizing: smaller batches for large documents, larger for small documents
 * - Each batch has timeout protection (scales with batch size)
 * - Yields to browser between batches to prevent UI blocking
 * - Supports partial failure mode (continueOnError option)
 * - Provides progress callbacks for UI updates
 * 
 * Batch size calculation strategy:
 * - ≤10 items: 10 per batch (fast processing, minimal UI impact)
 * - ≤50 items: 8 per batch (balanced performance)
 * - ≤100 items: 5 per batch (prioritize UI responsiveness)
 * - >100 items: 3 per batch (maximize UI responsiveness for large documents)
 * 
 * Timeout strategy:
 * - Each batch has a timeout that scales with batch size
 * - Default: OPERATION_TIMEOUT * batchSize (capped at 3x OPERATION_TIMEOUT)
 * - Individual items within batch can also have timeouts
 * - Batch timeout prevents entire operation from hanging
 * 
 * Error handling:
 * - Uses Promise.allSettled to continue processing even if some items fail
 * - Can be configured to stop on first batch failure (continueOnError: false)
 * - Collects all errors and returns them in results array
 * - Provides detailed error information including item index
 * 
 * Performance characteristics:
 * - Batch size calculation: O(1)
 * - Processing: O(n) where n is number of items
 * - Memory: O(batchSize) - only one batch in memory at a time
 * - Time complexity: O(n) with browser yields between batches
 * - Browser yields prevent UI blocking and maintain responsiveness
 */

import { withTimeout } from "./timeout-utils"
import { TIMEOUTS } from "./constants"

/**
 * Result of processing a single item in a batch.
 */
export type BatchItemResult<T> = 
  | { readonly success: true; readonly value: T }
  | { readonly success: false; readonly error: string; readonly itemIndex: number }

/**
 * Options for batch processing.
 */
export interface BatchProcessOptions {
  /** Maximum time to wait for entire batch (ms). Defaults to OPERATION_TIMEOUT * batchSize (capped at 3x) */
  readonly batchTimeout?: number
  /** Time to yield to browser between batches (ms). Default: 100 */
  readonly yieldDelay?: number
  /** Whether to continue processing if some items fail. Default: false */
  readonly continueOnError?: boolean
  /** Callback for progress updates */
  readonly onProgress?: (processed: number, total: number, batchNumber: number, totalBatches: number) => void
}

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

/**
 * Processes items in batches with timeout handling and error recovery.
 * 
 * Batch processing strategy:
 * - Processes items in configurable batch sizes
 * - Each batch has its own timeout (scales with batch size)
 * - Yields to browser between batches to prevent UI blocking
 * - Supports partial failure (continueOnError option)
 * - Provides progress callbacks
 * 
 * @param items - Array of items to process
 * @param processor - Function to process each item (returns Promise)
 * @param batchSize - Number of items per batch (default: calculated from total)
 * @param options - Processing options (timeouts, error handling, callbacks)
 * @returns Array of results for each item (success or error)
 * @template TItem - Type of items to process
 * @template TResult - Type of result from processing
 * 
 * @example
 * ```typescript
 * const results = await processInBatches(
 *   pages,
 *   async (page) => await processPage(page),
 *   5,
 *   { continueOnError: true, onProgress: (p, t) => console.log(`${p}/${t}`) }
 * )
 * ```
 */
export async function processInBatches<TItem, TResult>(
  items: ReadonlyArray<TItem>,
  processor: (item: TItem, index: number) => Promise<TResult>,
  batchSize: number = calculateBatchSize(items.length),
  options: BatchProcessOptions = {}
): Promise<ReadonlyArray<BatchItemResult<TResult>>> {
  const {
    batchTimeout,
    yieldDelay = 100,
    continueOnError = false,
    onProgress,
  } = options

  const results: BatchItemResult<TResult>[] = []
  const totalBatches = Math.ceil(items.length / batchSize)

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchNumber = Math.floor(i / batchSize) + 1
    const batchStartIndex = i

    // Calculate timeout for this batch (scales with batch size)
    const calculatedTimeout = batchTimeout ?? Math.min(
      TIMEOUTS.OPERATION_TIMEOUT * batch.length,
      TIMEOUTS.OPERATION_TIMEOUT * 3
    )

    try {
      // Process batch with timeout
      const batchResults = await withTimeout(
        Promise.allSettled(
          batch.map(async (item, batchIdx) => {
            const globalIdx = batchStartIndex + batchIdx
            try {
              const value = await processor(item, globalIdx)
              return { success: true as const, value, itemIndex: globalIdx }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error)
              return { success: false as const, error: errorMessage, itemIndex: globalIdx }
            }
          })
        ),
        calculatedTimeout,
        `Batch ${batchNumber}/${totalBatches} timed out after ${calculatedTimeout}ms.`
      )

      // Process results
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          // Batch-level timeout
          const errorMessage = result.reason instanceof Error ? result.reason.message : String(result.reason)
          // Mark all items in batch as failed
          for (let j = 0; j < batch.length; j++) {
            results.push({
              success: false,
              error: errorMessage,
              itemIndex: batchStartIndex + j,
            })
          }
        }
      }

      // Check if we should continue on errors
      const batchErrors = results.filter((r): r is Extract<BatchItemResult<TResult>, { success: false }> => 
        !r.success && r.itemIndex >= batchStartIndex && r.itemIndex < batchStartIndex + batch.length
      )
      if (batchErrors.length === batch.length && !continueOnError) {
        throw new Error(`All items in batch ${batchNumber} failed. First error: ${batchErrors[0]?.error ?? 'unknown'}`)
      }

      // Progress callback
      if (onProgress) {
        onProgress(Math.min(i + batchSize, items.length), items.length, batchNumber, totalBatches)
      }

    } catch (err) {
      // Batch-level error (timeout or all items failed)
      if (!continueOnError) {
        throw err
      }
      // Mark remaining items in batch as failed
      for (let j = results.length; j < batchStartIndex + batch.length; j++) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        results.push({
          success: false,
          error: errorMessage,
          itemIndex: j,
        })
      }
    }

    // Yield to browser between batches (except after last batch)
    if (i + batchSize < items.length) {
      await yieldToBrowser(yieldDelay)
    }
  }

  return results
}

