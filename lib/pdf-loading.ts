/**
 * PDF loading utilities for loading PDF documents from files.
 * Extracted from pdf-utils.ts for better code organization.
 */

import { PDFDocument } from "pdf-lib"

/**
 * Loads a PDF document from a File object.
 * 
 * @param file - The PDF file to load
 * @returns A promise that resolves to the loaded PDFDocument
 * @throws Error if the file cannot be loaded
 * 
 * @example
 * ```typescript
 * const pdf = await loadPdfFromFile(file)
 * const pageCount = pdf.getPageCount()
 * ```
 */
export async function loadPdfFromFile(file: File): Promise<PDFDocument> {
  const arrayBuffer = await file.arrayBuffer()
  return await PDFDocument.load(arrayBuffer)
}
