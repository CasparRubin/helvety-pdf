import * as React from "react"
import { BREAKPOINTS, COLUMNS, STORAGE_KEYS } from "@/lib/constants"

/**
 * Gets the default column count based on screen size.
 * 
 * @returns The default number of columns for the current screen width
 */
function getDefaultColumns(): number {
  if (typeof window === "undefined") return COLUMNS.DEFAULT_MEDIUM
  const width = window.innerWidth
  if (width >= BREAKPOINTS.THREE_COLUMN) return COLUMNS.DEFAULT_LARGE
  if (width >= BREAKPOINTS.MULTI_COLUMN) return COLUMNS.DEFAULT_MEDIUM
  return COLUMNS.DEFAULT_SMALL
}

/**
 * Custom hook to manage column state with localStorage persistence.
 * 
 * Handles:
 * - Initialization from localStorage or screen size
 * - Window resize handling
 * - Persistence to localStorage (only on large screens)
 * 
 * @returns A tuple of [columns, setColumns] where columns can be undefined during initialization
 */
export function useColumns(): [number | undefined, (columns: number) => void] {
  const [columns, setColumns] = React.useState<number | undefined>(undefined)

  // Initialize columns from localStorage or default based on screen size
  React.useEffect(() => {
    if (typeof window === "undefined") return

    const width = window.innerWidth
    
    // Always force 1 column on small screens (< MULTI_COLUMN), regardless of localStorage
    if (width < BREAKPOINTS.MULTI_COLUMN) {
      setColumns(COLUMNS.DEFAULT_SMALL)
      return
    }

    // On large screens (>= MULTI_COLUMN), use localStorage if available
    const stored = localStorage.getItem(STORAGE_KEYS.COLUMNS)
    if (stored) {
      const parsed = parseInt(stored, 10)
      if (!isNaN(parsed) && parsed >= COLUMNS.MIN && parsed <= COLUMNS.MAX) {
        setColumns(parsed)
        return
      }
    }

    // No stored value, use default based on screen size
    setColumns(getDefaultColumns())
  }, [])

  // Handle window resize to update columns based on screen size
  React.useEffect(() => {
    if (typeof window === "undefined") return

    const handleResize = () => {
      const width = window.innerWidth
      
      // Always force 1 column on small screens (< MULTI_COLUMN), regardless of localStorage
      if (width < BREAKPOINTS.MULTI_COLUMN) {
        setColumns(COLUMNS.DEFAULT_SMALL)
        return
      }

      // On large screens (>= MULTI_COLUMN), restore from localStorage if available
      const stored = localStorage.getItem(STORAGE_KEYS.COLUMNS)
      if (stored) {
        const parsed = parseInt(stored, 10)
        if (!isNaN(parsed) && parsed >= COLUMNS.MIN && parsed <= COLUMNS.MAX) {
          setColumns(parsed)
          return
        }
      }

      // No stored value, use default based on screen size
      setColumns(getDefaultColumns())
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Handle column change and persist to localStorage
  const handleColumnsChange = React.useCallback((newColumns: number) => {
    setColumns(newColumns)
    // Only save to localStorage on large screens (>= MULTI_COLUMN)
    // This prevents saving values that shouldn't be used on mobile
    if (typeof window !== "undefined" && window.innerWidth >= BREAKPOINTS.MULTI_COLUMN) {
      localStorage.setItem(STORAGE_KEYS.COLUMNS, newColumns.toString())
    }
  }, [])

  return [columns, handleColumnsChange]
}

