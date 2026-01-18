/**
 * PDF conversion utilities for converting images to PDF documents.
 * Extracted from pdf-utils.ts for better code organization.
 */

import { PDFDocument } from "pdf-lib"
import { safeRevokeObjectURL } from "./blob-url-utils"

/**
 * Represents an embedded image with its dimensions.
 */
interface ImageEmbed {
  readonly embed: Awaited<ReturnType<typeof PDFDocument.prototype.embedPng>> | Awaited<ReturnType<typeof PDFDocument.prototype.embedJpg>>
  readonly width: number
  readonly height: number
}

/**
 * Converts an image file to a single-page PDF document.
 * Supports PNG, JPEG, and other formats (via Canvas conversion if needed).
 * 
 * @param file - The image file to convert
 * @returns A promise that resolves to a PDFDocument containing the image as a single page
 * @throws Error if the image cannot be loaded or converted
 * 
 * @example
 * ```typescript
 * const pdf = await convertImageToPdf(imageFile)
 * // PDF now contains the image as a single page
 * ```
 */
export async function convertImageToPdf(file: File): Promise<PDFDocument> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await PDFDocument.create()
  
  // Detect image format from MIME type or file extension
  const mimeType = file.type.toLowerCase()
  const fileName = file.name.toLowerCase()
  
  let imageEmbed: ImageEmbed | null = null
  
  try {
    // Try PNG first
    if (mimeType === 'image/png' || fileName.endsWith('.png')) {
      const pngImage = await pdf.embedPng(arrayBuffer)
      imageEmbed = {
        embed: pngImage,
        width: pngImage.width,
        height: pngImage.height,
      }
    }
    // Try JPEG
    else if (mimeType === 'image/jpeg' || mimeType === 'image/jpg' || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
      const jpgImage = await pdf.embedJpg(arrayBuffer)
      imageEmbed = {
        embed: jpgImage,
        width: jpgImage.width,
        height: jpgImage.height,
      }
    }
    // For other formats (WebP, GIF, etc.), convert via Canvas
    else {
      // Ensure we're in a browser environment
      if (typeof document === 'undefined' || typeof Image === 'undefined') {
        throw new Error('Image conversion requires a browser environment')
      }
      
      // Create an image element to load and convert the image
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image()
        const blob = new Blob([arrayBuffer], { type: file.type || 'image/png' })
        const url = URL.createObjectURL(blob)
        
        image.onload = () => {
          safeRevokeObjectURL(url)
          resolve(image)
        }
        image.onerror = () => {
          safeRevokeObjectURL(url)
          reject(new Error(`Failed to load image: ${file.name}`))
        }
        image.src = url
      })
      
      // Convert image to PNG via Canvas
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Failed to get canvas context')
      }
      ctx.drawImage(img, 0, 0)
      
      // Convert canvas to blob, then to array buffer
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob: Blob | null) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to convert image to blob'))
          }
        }, 'image/png')
      })
      
      const pngBuffer = await blob.arrayBuffer()
      const pngImage = await pdf.embedPng(pngBuffer)
      imageEmbed = {
        embed: pngImage,
        width: pngImage.width,
        height: pngImage.height,
      }
    }
    
    // Create a page with the image dimensions
    if (!imageEmbed) {
      throw new Error('Failed to embed image: imageEmbed is null')
    }
    
    const page = pdf.addPage([imageEmbed.width, imageEmbed.height])
    page.drawImage(imageEmbed.embed, {
      x: 0,
      y: 0,
      width: imageEmbed.width,
      height: imageEmbed.height,
    })
    
    return pdf
  } catch (error) {
    throw new Error(`Failed to convert image to PDF: ${error instanceof Error ? error.message : String(error)}`)
  }
}
