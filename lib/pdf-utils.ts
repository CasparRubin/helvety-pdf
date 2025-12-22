import { PDFDocument } from "pdf-lib"

/**
 * Loads a PDF document from a File object.
 * 
 * @param file - The PDF file to load
 * @returns A promise that resolves to the loaded PDFDocument
 * @throws Error if the file cannot be loaded
 */
export async function loadPdfFromFile(file: File): Promise<PDFDocument> {
  const arrayBuffer = await file.arrayBuffer()
  return await PDFDocument.load(arrayBuffer)
}

/**
 * Extracts a page from a PDF document and creates a new PDF with that page.
 * 
 * @param pdf - The source PDF document
 * @param pageIndex - The zero-based index of the page to extract
 * @returns A promise that resolves to a new PDFDocument containing only the extracted page
 */
export async function extractPageFromPdf(
  pdf: PDFDocument,
  pageIndex: number
): Promise<PDFDocument> {
  const newPdf = await PDFDocument.create()
  const [copiedPage] = await newPdf.copyPages(pdf, [pageIndex])
  newPdf.addPage(copiedPage)
  return newPdf
}

