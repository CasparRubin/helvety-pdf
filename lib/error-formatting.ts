/**
 * Error formatting utilities for consistent error messages across the application.
 * Provides standardized formatting for single and multiple errors.
 */

/**
 * Formats a single error message.
 * 
 * @param error - The error message
 * @returns Formatted error message
 */
export function formatSingleError(error: string): string {
  return error.trim()
}

/**
 * Formats multiple error messages into a single formatted string.
 * Each error is numbered for clarity.
 * 
 * @param errors - Array of error messages
 * @returns Formatted error message with numbered list
 */
export function formatMultipleErrors(errors: string[]): string {
  if (errors.length === 0) {
    return ""
  }
  
  if (errors.length === 1) {
    return formatSingleError(errors[0])
  }
  
  return `Some files couldn't be added:\n${errors.map((err, idx) => `${idx + 1}. ${err}`).join('\n')}`
}

/**
 * Formats validation errors (single or multiple) into a user-friendly message.
 * 
 * @param errors - Array of error messages (can be empty)
 * @returns Formatted error message, or empty string if no errors
 */
export function formatValidationErrors(errors: string[]): string {
  if (errors.length === 0) {
    return ""
  }
  
  return formatMultipleErrors(errors)
}
