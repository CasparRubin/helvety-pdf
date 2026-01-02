/**
 * Utility functions for efficient page and file lookups.
 * These functions help reduce code duplication and improve performance by converting
 * O(n) Array.find() operations to O(1) Map lookups.
 */

import type { PdfFile, UnifiedPage } from "./types"

/**
 * Creates a map of unified page numbers to UnifiedPage objects for O(1) lookups.
 * 
 * @param unifiedPages - Array of unified pages to convert to a map
 * @returns Map from unified page number to UnifiedPage object
 */
export function createPageMap(unifiedPages: UnifiedPage[]): Map<number, UnifiedPage> {
  const map = new Map<number, UnifiedPage>()
  unifiedPages.forEach(page => {
    map.set(page.unifiedPageNumber, page)
  })
  return map
}

/**
 * Creates a map of file IDs to PdfFile objects for O(1) lookups.
 * 
 * @param pdfFiles - Array of PDF files to convert to a map
 * @returns Map from file ID to PdfFile object
 */
export function createFileMap(pdfFiles: PdfFile[]): Map<string, PdfFile> {
  const map = new Map<string, PdfFile>()
  pdfFiles.forEach(file => {
    map.set(file.id, file)
  })
  return map
}

/**
 * Creates a map of file IDs to blob URLs for O(1) lookups.
 * 
 * @param pdfFiles - Array of PDF files to extract URLs from
 * @returns Map from file ID to blob URL string
 */
export function createFileUrlMap(pdfFiles: PdfFile[]): Map<string, string> {
  const map = new Map<string, string>()
  pdfFiles.forEach(file => {
    map.set(file.id, file.url)
  })
  return map
}

