/**
 * Downloads a blob as a file with automatic cleanup of the blob URL.
 * 
 * @param blob - The blob to download
 * @param filename - The filename for the downloaded file
 * @param cleanupDelay - Delay in milliseconds before revoking the blob URL (default: 100ms)
 */
export function downloadBlob(blob: Blob, filename: string, cleanupDelay: number = 100): void {
  const blobUrl = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = blobUrl
  link.download = filename
  link.style.display = "none"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  setTimeout(() => {
    URL.revokeObjectURL(blobUrl)
  }, cleanupDelay)
}

