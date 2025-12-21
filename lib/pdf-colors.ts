// Color palette for PDF file identification
// 10 distinct colors covering the full spectrum (36° spacing)
// First 10 files get unique colors, then the palette cycles
// Optimized for visibility in both light and dark modes
const PDF_COLOR_PALETTE = [
  "oklch(0.65 0.22 25)",    // 0: Red - close to #ff0000 primary
  "oklch(0.72 0.20 61)",    // 1: Orange - 36° from red
  "oklch(0.80 0.18 97)",    // 2: Yellow - 72° from red
  "oklch(0.75 0.19 133)",   // 3: Yellow-green - 108° from red
  "oklch(0.70 0.20 169)",   // 4: Green - 144° from red
  "oklch(0.72 0.19 205)",   // 5: Cyan - 180° from red
  "oklch(0.70 0.18 241)",   // 6: Blue - 216° from red
  "oklch(0.68 0.21 277)",   // 7: Purple - 252° from red
  "oklch(0.70 0.22 313)",   // 8: Magenta - 288° from red
  "oklch(0.74 0.19 349)",   // 9: Pink - 324° from red
]

/**
 * Get a color for a PDF file based on its index
 * Colors cycle through the palette
 */
export function getPdfColor(fileIndex: number): string {
  return PDF_COLOR_PALETTE[fileIndex % PDF_COLOR_PALETTE.length]
}

/**
 * Get CSS classes for applying PDF color as a border
 */
export function getPdfColorBorderClass(color: string): string {
  return `border-l-4`
}

/**
 * Get inline style for PDF color border
 */
export function getPdfColorBorderStyle(color: string): { borderLeftColor: string } {
  return {
    borderLeftColor: color,
  }
}

/**
 * Get CSS classes for applying PDF color as a subtle background
 */
export function getPdfColorBgClass(): string {
  return `bg-opacity-5`
}

/**
 * Get inline style for PDF color background
 */
export function getPdfColorBgStyle(color: string): { backgroundColor: string } {
  return {
    backgroundColor: `${color}15`, // Add alpha channel for subtlety
  }
}

