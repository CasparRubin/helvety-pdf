/**
 * Centralized error handling utilities for consistent error management across the application.
 * Provides standardized error handling patterns and error transformation.
 */

import { createPdfErrorInfo, type PdfErrorInfo } from "./pdf-errors"
import { logger } from "./logger"

/**
 * Error handler callback type for setting errors in components.
 */
export type ErrorSetter = (error: string | null) => void

/**
 * Handles an error by creating structured error info and calling the error setter.
 * This is the standard way to handle errors throughout the application.
 * 
 * @param error - The error to handle (can be Error, string, or unknown)
 * @param context - Context string for the error (e.g., "Can't load 'filename.pdf':")
 * @param onError - Callback function to set the error message
 * @param logError - Whether to log the error (default: true)
 * @returns The created error info, or null if error was null/undefined
 * 
 * @example
 * ```typescript
 * try {
 *   await someOperation()
 * } catch (err) {
 *   handleError(err, "Operation failed:", setError)
 * }
 * ```
 */
export function handleError(
  error: unknown,
  context: string,
  onError: ErrorSetter,
  logError: boolean = true
): PdfErrorInfo | null {
  if (error === null || error === undefined) {
    onError(null)
    return null
  }

  const errorInfo = createPdfErrorInfo(error, context)
  
  if (logError) {
    logger.error('Error handled:', errorInfo)
  }
  
  onError(errorInfo.message)
  return errorInfo
}

/**
 * Handles multiple errors by formatting them and calling the error setter.
 * Useful for validation errors where multiple files may fail.
 * 
 * @param errors - Array of error messages or error objects
 * @param context - Context string for the errors
 * @param onError - Callback function to set the error message
 * @param logErrors - Whether to log the errors (default: true)
 * 
 * @example
 * ```typescript
 * const errors = ["File 1 failed", "File 2 failed"]
 * handleMultipleErrors(errors, "File validation failed:", setError)
 * ```
 */
export function handleMultipleErrors(
  errors: ReadonlyArray<string | Error | unknown>,
  context: string,
  onError: ErrorSetter,
  logErrors: boolean = true
): void {
  if (errors.length === 0) {
    onError(null)
    return
  }

  const errorMessages = errors.map((err) => {
    if (typeof err === 'string') {
      return err
    }
    if (err instanceof Error) {
      return err.message
    }
    return String(err)
  })

  const formattedMessage = errorMessages.length === 1
    ? `${context} ${errorMessages[0]}`
    : `${context}\n${errorMessages.map((msg, idx) => `${idx + 1}. ${msg}`).join('\n')}`

  if (logErrors) {
    logger.error('Multiple errors handled:', { context, errors: errorMessages })
  }

  onError(formattedMessage)
}

/**
 * Wraps an async function with standardized error handling.
 * Automatically catches errors and calls the error setter.
 * 
 * @param fn - The async function to wrap
 * @param context - Context string for errors
 * @param onError - Callback function to set the error message
 * @returns A promise that resolves to the function's result or rejects with handled error
 * 
 * @example
 * ```typescript
 * const result = await withErrorHandling(
 *   () => loadPdf(file),
 *   `Loading '${file.name}':`,
 *   setError
 * )
 * ```
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: string,
  onError: ErrorSetter
): Promise<T> {
  try {
    onError(null) // Clear any previous errors
    return await fn()
  } catch (error) {
    handleError(error, context, onError)
    throw error // Re-throw to allow caller to handle if needed
  }
}

/**
 * Checks if an error is retryable based on its type.
 * 
 * @param error - The error to check
 * @returns True if the error is retryable, false otherwise
 */
export function isRetryableError(error: unknown): boolean {
  if (error === null || error === undefined) {
    return false
  }
  
  const errorInfo = createPdfErrorInfo(error, "")
  return errorInfo.retryable
}

/**
 * Gets a user-friendly error message from an error.
 * 
 * @param error - The error to get message from
 * @param context - Context string for the error
 * @returns A user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: unknown, context: string): string {
  if (error === null || error === undefined) {
    return ""
  }
  
  const errorInfo = createPdfErrorInfo(error, context)
  return errorInfo.message
}
