/**
 * PDF utility functions - main entry point for PDF operations.
 * Re-exports functions from specialized modules for backward compatibility.
 */

// Internal utilities
import { loadPdfFromFile } from "./pdf-loading"
import { convertImageToPdf } from "./pdf-conversion"
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Import needed for re-export
import { extractPageFromPdf } from "./pdf-extraction"

// Types
import type { PdfFile } from "./types"

/**
 * Determines the file type from a File object or PdfFile.
 * 
 * @param file - The File object to check
 * @param pdfFile - Optional PdfFile object that may already have type information
 * @returns 'pdf' if the file is a PDF, 'image' otherwise
 */
export function getFileType(file: File, pdfFile?: PdfFile | null): 'pdf' | 'image' {
  if (pdfFile?.type) {
    return pdfFile.type
  }
  return file.type === 'application/pdf' ? 'pdf' : 'image'
}

/**
 * Loads a file (PDF or image) and creates a blob URL for preview.
 * For images, converts them to PDF. For PDFs, loads them directly.
 * 
 * @param file - The file to load (PDF or image)
 * @param isPdf - Whether the file is a PDF (true) or image (false)
 * @returns Promise that resolves to an object containing the PDF document, blob URL, and file type
 * @throws Error if the file cannot be loaded or converted
 */
export async function loadFileWithPreview(
  file: File,
  isPdf: boolean
): Promise<{
  pdf: Awaited<ReturnType<typeof loadPdfFromFile>>
  url: string
  fileType: 'pdf' | 'image'
}> {
  let pdf: Awaited<ReturnType<typeof loadPdfFromFile>>
  let fileType: 'pdf' | 'image'
  let blob: Blob

  if (isPdf) {
    // Handle PDF files
    blob = new Blob([file], { type: "application/pdf" })
    pdf = await loadPdfFromFile(file)
    fileType = 'pdf'
  } else {
    // Handle image files - convert to PDF
    blob = new Blob([file], { type: file.type })
    pdf = await convertImageToPdf(file)
    fileType = 'image'
  }

  const url = URL.createObjectURL(blob)

  return { pdf, url, fileType }
}

// Re-export functions from specialized modules for backward compatibility
export { loadPdfFromFile } from "./pdf-loading"
export { convertImageToPdf } from "./pdf-conversion"
export { extractPageFromPdf } from "./pdf-extraction"
