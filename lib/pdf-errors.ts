/**
 * Formats PDF-related errors into user-friendly messages.
 * 
 * @param error - The error object (can be Error, string, or unknown)
 * @param context - Context string for the error (e.g., "Can't load 'filename.pdf':" or "Can't extract page:")
 * @returns A formatted error message suitable for display to users
 */
export function formatPdfError(error: unknown, context: string): string {
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : ""
  let userMessage = context
  
  if (errorMessage.includes("password") || errorMessage.includes("encrypted")) {
    userMessage += " password-protected. Remove password and try again."
  } else if (errorMessage.includes("corrupt") || errorMessage.includes("invalid")) {
    userMessage += " file may be corrupted. Try a different file."
  } else {
    userMessage += " file may be corrupted or password-protected."
  }
  
  return userMessage
}

