/**
 * File processing utilities for handling PDF and image file operations.
 * Extracted from hooks to improve code organization and reusability.
 */

import { PDFDocument } from "pdf-lib"
import { getPdfColor } from "./pdf-colors"
import { createPdfErrorInfo, PdfErrorType } from "./pdf-errors"
import { loadFileWithPreview } from "./pdf-utils"
// Note: loadFileWithPreview is still in pdf-utils.ts as it uses both loading and conversion
import { determineFileType } from "./validation-utils"
import { safeRevokeObjectURL } from "./blob-url-utils"
import { logger } from "./logger"
import { CACHE_LIMITS } from "./constants"
import type { PdfFile } from "./types"

/**
 * Evicts least recently used entry from cache using LRU (Least Recently Used) strategy.
 * 
 * Cache eviction strategy (LRU):
 * - Map maintains insertion order in modern JavaScript, so first entry is least recently used
 * - When cache limit is reached, removes the least recently accessed entry (first in Map)
 * - Provides better cache hit rates than FIFO by keeping frequently used items
 * - Access order is updated when items are retrieved (via getCachedPdf in hook)
 * 
 * How LRU works:
 * 1. New entries are added at the end (most recently used position)
 * 2. When an entry is accessed, it's moved to the end (most recently used)
 * 3. When cache is full, the first entry (least recently used) is evicted
 * 4. This ensures frequently accessed PDFs stay in cache longer
 * 
 * Performance:
 * - Eviction: O(1) - just delete first entry
 * - Access update: O(1) - delete and re-add to end
 * - Better cache hit rates than FIFO for workloads with access patterns
 * 
 * @param cache - The PDF cache map
 * @param maxSize - Maximum cache size
 * @returns The evicted key, or undefined if no eviction occurred
 */
function evictLRUEntry(cache: Map<string, PDFDocument>, maxSize: number): string | undefined {
  if (cache.size >= maxSize) {
    // Evict least recently used (first entry in Map, which is oldest)
    const firstKey = cache.keys().next().value
    if (firstKey) {
      cache.delete(firstKey)
      logger.log(`LRU cache limit reached (${maxSize}), evicted least recently used: ${firstKey}`)
      return firstKey
    }
  }
  return undefined
}

/**
 * Updates access order for LRU cache by moving accessed item to end.
 * This makes the item "most recently used" so it won't be evicted soon.
 * 
 * Note: This function is currently unused but kept for potential future use.
 * Access order is currently updated in the hook's getCachedPdf function.
 * 
 * @param cache - The PDF cache map
 * @param key - The key that was accessed
 * @param value - The value to move to end (most recently used position)
 */
function updateLRUAccess(cache: Map<string, PDFDocument>, key: string, value: PDFDocument): void {
  // Move to end (most recently used) by deleting and re-adding
  if (cache.has(key)) {
    cache.delete(key)
    cache.set(key, value)
  }
}

/**
 * Result type for file processing operations.
 */
type ProcessFileResult = 
  | { readonly pdfFile: PdfFile }
  | { readonly error: string }

/**
 * Generates a unique ID using timestamp and random string.
 * 
 * @returns A unique identifier string
 */
export function generateFileId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

/**
 * Processes a single file (PDF or image) and creates a PdfFile object.
 * Handles file loading, caching, and error handling.
 * 
 * Cache eviction strategy (LRU):
 * - Uses Least Recently Used (LRU) eviction when cache is full
 * - Evicts oldest accessed entry when cache limit is reached
 * - Provides better cache hit rates than FIFO by keeping frequently used items
 * - Access order is updated when items are retrieved from cache
 * 
 * @param file - The file to process
 * @param fileIndex - The index of the file (used for color assignment)
 * @param pdfCache - The PDF cache map to use for storing loaded PDFs
 * @returns Object containing the processed PdfFile or an error message
 * 
 * @example
 * ```typescript
 * const result = await processFile(file, 0, pdfCache)
 * if ('error' in result) {
 *   console.error('Processing failed:', result.error)
 * } else {
 *   console.log('File processed:', result.pdfFile.id)
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Process multiple files
 * for (let i = 0; i < files.length; i++) {
 *   const result = await processFile(files[i], i, pdfCache)
 *   if ('pdfFile' in result) {
 *     pdfFiles.push(result.pdfFile)
 *   }
 * }
 * ```
 */
export async function processFile(
  file: File,
  fileIndex: number,
  pdfCache: Map<string, PDFDocument>
): Promise<ProcessFileResult> {
  // Determine file type
  const isPdf = determineFileType(file) === 'pdf'
  let url: string | null = null

  try {
    // Load file and create preview URL
    const { pdf, url: previewUrl, fileType } = await loadFileWithPreview(file, isPdf)
    url = previewUrl

    if (!url) {
      return { error: `'${file.name}' failed to create preview URL.` }
    }

    const count: number = pdf.getPageCount()

    if (count === 0) {
      safeRevokeObjectURL(url)
      return { error: `'${file.name}' has no pages.` }
    }

    // Generate fileId and manage cache using LRU eviction strategy
    const fileId: string = generateFileId()
    
    // Evict least recently used entry if cache is full (LRU strategy)
    evictLRUEntry(pdfCache, CACHE_LIMITS.MAX_CACHED_PDFS)
    
    // Cache the PDF (for images, this is the converted PDF)
    // New entries are added at the end (most recently used position)
    pdfCache.set(fileId, pdf)
    logger.log(`Cached PDF for ${fileType} file: "${file.name}" (ID: ${fileId}, cache size: ${pdfCache.size}/${CACHE_LIMITS.MAX_CACHED_PDFS})`)

    // Assign color based on file index
    const color: string = getPdfColor(fileIndex)

    const pdfFile: PdfFile = {
      id: fileId,
      file,
      url: url, // url is guaranteed to be set at this point
      pageCount: count,
      color,
      type: fileType,
    }

    // Clear url reference since it's now owned by the PdfFile object
    url = null

    return { pdfFile }
  } catch (err) {
    // Ensure blob URL is cleaned up on error
    safeRevokeObjectURL(url)
    
    const errorInfo = createPdfErrorInfo(err, `Can't load '${file.name}':`)
    // Log structured error for debugging
    if (errorInfo.type === PdfErrorType.CORRUPTED || errorInfo.type === PdfErrorType.INVALID_FORMAT) {
      logger.error('File validation error:', errorInfo)
    }
    
    return { error: errorInfo.message }
  }
}
