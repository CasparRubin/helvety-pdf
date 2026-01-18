// React
import * as React from "react"

// External libraries
import { PDFDocument } from "pdf-lib"

// Internal utilities
import { convertImageToPdf } from "@/lib/pdf-conversion"
import { loadPdfFromFile } from "@/lib/pdf-loading"
import { validateFiles } from "@/lib/validation-utils"
import { formatValidationErrors } from "@/lib/error-formatting"
import { processFile } from "@/lib/file-processing"
import { safeRevokeObjectURL } from "@/lib/blob-url-utils"
import { logger } from "@/lib/logger"
import { FILE_LIMITS } from "@/lib/constants"

// Types
import type { PdfFile, UnifiedPage } from "@/lib/types"

interface UsePdfFilesReturn {
  readonly pdfFiles: ReadonlyArray<PdfFile>
  readonly setPdfFiles: React.Dispatch<React.SetStateAction<PdfFile[]>>
  readonly unifiedPages: ReadonlyArray<UnifiedPage>
  readonly pageOrder: ReadonlyArray<number>
  readonly setPageOrder: React.Dispatch<React.SetStateAction<number[]>>
  readonly pdfCacheRef: React.MutableRefObject<Map<string, PDFDocument>>
  readonly validateAndAddFiles: (files: FileList | ReadonlyArray<File>, onError: (error: string | null) => void) => Promise<void>
  readonly removeFile: (fileId: string) => void
  readonly clearAll: () => void
  readonly getCachedPdf: (fileId: string, file: File, fileType: 'pdf' | 'image') => Promise<PDFDocument>
}


/**
 * Creates a unified pages array from files (PDFs and images), assigning sequential page numbers
 * across all files. Images are treated as single-page documents.
 * 
 * @param files - Array of files (PDFs and images) to process
 * @returns Array of unified pages with sequential numbering
 */
function createUnifiedPages(files: PdfFile[]): UnifiedPage[] {
  const pages: UnifiedPage[] = []
  let unifiedNumber = 1

  for (const file of files) {
    for (let i = 1; i <= file.pageCount; i++) {
      pages.push({
        id: `${file.id}-page-${i}`,
        fileId: file.id,
        originalPageNumber: i,
        unifiedPageNumber: unifiedNumber++,
      })
    }
  }

  return pages
}

/**
 * Custom hook for managing PDF files and their associated state.
 * Handles file validation, caching, and unified page management.
 * 
 * @returns Object containing file state, handlers, and utilities
 */
export function usePdfFiles(): UsePdfFilesReturn {
  const [pdfFiles, setPdfFiles] = React.useState<PdfFile[]>([])
  const [unifiedPages, setUnifiedPages] = React.useState<UnifiedPage[]>([])
  const [pageOrder, setPageOrder] = React.useState<number[]>([])
  const pdfCacheRef = React.useRef<Map<string, PDFDocument>>(new Map())
  const lastUploadTimeRef = React.useRef<number>(0)

  /**
   * Gets a cached PDF document or loads it if not in cache.
   * Caches the loaded PDF for future use to avoid redundant loading operations.
   * For images, re-converts them to PDF if cache is missing.
   * 
   * @param fileId - The unique identifier of the file
   * @param file - The File object to load if not cached
   * @param fileType - File type ('pdf' | 'image') to determine loading strategy
   * @returns A promise that resolves to the PDFDocument
   */
  const getCachedPdf = React.useCallback(async (fileId: string, file: File, fileType: 'pdf' | 'image'): Promise<PDFDocument> => {
    const cached = pdfCacheRef.current.get(fileId)
    if (cached) {
      logger.log(`Retrieved cached PDF for ${fileType} file:`, file.name, 'with ID:', fileId)
      return cached
    }
    
    // For images, try to re-convert if cache is missing (fallback)
    // This can happen if cache was cleared or file was uploaded before caching was implemented
    if (fileType === 'image') {
      logger.warn('Cache miss for image, re-converting:', file.name, 'ID:', fileId)
      logger.warn('Available cache keys:', Array.from(pdfCacheRef.current.keys()))
      try {
        // Re-convert the image to PDF
        const pdf = await convertImageToPdf(file)
        pdfCacheRef.current.set(fileId, pdf)
        return pdf
      } catch (err) {
        throw new Error(`Failed to convert image to PDF: ${file.name}. ${err instanceof Error ? err.message : String(err)}`)
      }
    }
    // For PDFs, load from file
    const pdf = await loadPdfFromFile(file)
    pdfCacheRef.current.set(fileId, pdf)
    return pdf
  }, [])

  /**
   * Validates and adds PDF files and images to the application state.
   * 
   * Performs validation checks:
   * - Verifies file type is PDF or image
   * - Checks file size against maximum limit
   * - Checks total file count against maximum limit
   * - Checks for duplicate files (by name and size)
   * - Validates PDF can be loaded and has pages, or image can be converted to PDF
   * - Enforces rate limiting between uploads
   * 
   * Creates blob URLs for preview and assigns colors to files.
   * Images are converted to single-page PDFs on upload and cached for performance.
   * 
   * @param files - FileList or array of File objects to validate and add
   * @param onError - Callback function to handle errors
   */
  const validateAndAddFiles = React.useCallback(async (files: FileList | ReadonlyArray<File>, onError: (error: string | null) => void): Promise<void> => {
    const fileArray = Array.from(files)
    const pdfFilesToAdd: PdfFile[] = []

    // Rate limiting: enforce minimum delay between uploads
    const now = Date.now()
    const timeSinceLastUpload = now - lastUploadTimeRef.current
    if (timeSinceLastUpload < FILE_LIMITS.UPLOAD_RATE_LIMIT) {
      const delay = FILE_LIMITS.UPLOAD_RATE_LIMIT - timeSinceLastUpload
      await new Promise<void>((resolve: () => void) => setTimeout(resolve, delay))
    }
    lastUploadTimeRef.current = Date.now()

    // Validate files using extracted utility
    const validationResult = validateFiles(fileArray, pdfFiles)
    if (!validationResult.valid) {
      const errorMessage = formatValidationErrors(validationResult.errors)
      onError(errorMessage)
      return
    }

    const validationErrors: string[] = []
    
    // Process each file
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i]
      const fileIndex = pdfFiles.length + pdfFilesToAdd.length
      
      const result = await processFile(file, fileIndex, pdfCacheRef.current)
      
      if ('error' in result) {
        validationErrors.push(result.error)
      } else {
        pdfFilesToAdd.push(result.pdfFile)
      }
    }

    if (validationErrors.length > 0) {
      const errorMessage = formatValidationErrors(validationErrors)
      onError(errorMessage)
    }

    if (pdfFilesToAdd.length > 0) {
      setPdfFiles((prev) => [...prev, ...pdfFilesToAdd])
      if (validationErrors.length === 0) {
        onError(null)
      }
    }
  }, [pdfFiles])

  // Update unified pages when files change
  React.useEffect(() => {
    if (pdfFiles.length > 0) {
      const newUnifiedPages = createUnifiedPages(pdfFiles)
      setUnifiedPages(newUnifiedPages)
      // Initialize page order as sequential
      setPageOrder(newUnifiedPages.map(p => p.unifiedPageNumber))
    } else {
      setUnifiedPages([])
      setPageOrder([])
    }
  }, [pdfFiles])

  const removeFile = React.useCallback((fileId: string): void => {
    setPdfFiles((prev: PdfFile[]) => {
      const file: PdfFile | undefined = prev.find((f: PdfFile) => f.id === fileId)
      if (file) {
        safeRevokeObjectURL(file.url)
      }
      // Clear PDF from cache
      pdfCacheRef.current.delete(fileId)
      return prev.filter((f: PdfFile) => f.id !== fileId)
    })
  }, [])

  const clearAll = React.useCallback((): void => {
    setPdfFiles((prev: PdfFile[]) => {
      // Clean up all blob URLs
      prev.forEach((file: PdfFile) => {
        safeRevokeObjectURL(file.url)
      })
      // Clear PDF cache
      pdfCacheRef.current.clear()
      return []
    })
    setUnifiedPages([])
    setPageOrder([])
  }, [])

  return {
    pdfFiles,
    setPdfFiles,
    unifiedPages,
    pageOrder,
    setPageOrder,
    pdfCacheRef,
    validateAndAddFiles,
    removeFile,
    clearAll,
    getCachedPdf,
  }
}

