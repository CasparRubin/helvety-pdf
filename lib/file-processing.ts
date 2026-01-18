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
 * @param file - The file to process
 * @param fileIndex - The index of the file (used for color assignment)
 * @param pdfCache - The PDF cache map to use for storing loaded PDFs
 * @returns Object containing the processed PdfFile or an error message
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

    // Generate fileId and manage cache
    const fileId: string = generateFileId()
    
    // Enforce cache size limit - remove oldest entries if cache is full
    if (pdfCache.size >= CACHE_LIMITS.MAX_CACHED_PDFS) {
      const firstKey = pdfCache.keys().next().value
      if (firstKey) {
        pdfCache.delete(firstKey)
        logger.log('Cache limit reached, removed oldest entry:', firstKey)
      }
    }
    
    // Cache the PDF (for images, this is the converted PDF)
    pdfCache.set(fileId, pdf)
    logger.log(`Cached PDF for ${fileType} file:`, file.name, 'with ID:', fileId)

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
