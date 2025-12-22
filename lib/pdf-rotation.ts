import { PDFPage, degrees } from "pdf-lib"

/**
 * Normalizes a rotation angle to 0, 90, 180, or 270 degrees.
 * 
 * @param angle - The rotation angle in degrees
 * @returns Normalized angle (0, 90, 180, or 270)
 */
export function normalizeRotation(angle: number): number {
  let normalized = angle % 360
  if (normalized < 0) normalized += 360
  return Math.round(normalized / 90) * 90 % 360
}

/**
 * Type guard to check if a rotation value is an object with an angle property.
 */
function isRotationObject(value: unknown): value is { angle: number } {
  return value !== null && typeof value === 'object' && 'angle' in value
}

/**
 * Extracts the rotation angle from a PDF page rotation value.
 * Handles both number and object formats.
 * 
 * @param rotationValue - The rotation value from PDFPage.getRotation()
 * @returns The rotation angle in degrees
 */
function extractRotationAngle(rotationValue: unknown): number {
  if (isRotationObject(rotationValue)) {
    return rotationValue.angle
  }
  if (typeof rotationValue === 'number') {
    return rotationValue
  }
  return 0
}

/**
 * Applies rotation to a target PDF page, combining the original page rotation
 * with user-applied rotation.
 * 
 * @param sourcePage - The original PDF page to read rotation from
 * @param targetPage - The target PDF page to apply rotation to
 * @param userRotation - The user-applied rotation in degrees (0, 90, 180, or 270)
 */
export async function applyPageRotation(
  sourcePage: PDFPage,
  targetPage: PDFPage,
  userRotation: number
): Promise<void> {
  if (userRotation === 0) {
    return
  }

  try {
    // Get original page rotation and combine with user rotation
    const rotationObj = sourcePage.getRotation()
    const originalRotation = extractRotationAngle(rotationObj)
    const totalRotation = normalizeRotation(originalRotation + userRotation)
    targetPage.setRotation(degrees(totalRotation))
  } catch {
    // If we can't read original rotation, just apply user rotation
    targetPage.setRotation(degrees(userRotation))
  }
}

