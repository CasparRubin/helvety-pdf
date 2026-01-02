/**
 * Represents a file (PDF or image) that has been uploaded and processed.
 * Images are converted to single-page PDFs internally, but the original type is preserved.
 */
export interface PdfFile {
  readonly id: string
  readonly file: File
  readonly url: string
  readonly pageCount: number
  readonly color: string
  readonly type: 'pdf' | 'image' // Required field to track source file type
}

/**
 * Represents a page in the unified page system.
 * Pages from all files are numbered sequentially across all files.
 */
export interface UnifiedPage {
  readonly id: string // Unique ID for this page in unified array
  readonly fileId: string // Which file this page belongs to
  readonly originalPageNumber: number // Original page number in the file (1-based)
  readonly unifiedPageNumber: number // Position in unified array (1-based)
}

/**
 * File type discriminator for PDF and image files.
 */
export type FileType = 'pdf' | 'image'

/**
 * Validation result for file type checking.
 */
export interface FileTypeValidation {
  readonly valid: boolean
  readonly error?: string
}

/**
 * Validation result for file size checking.
 */
export interface FileSizeValidation {
  readonly valid: boolean
  readonly error?: string
}

