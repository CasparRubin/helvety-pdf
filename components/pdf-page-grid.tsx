"use client"

// React
import * as React from "react"

// Internal components
import { PdfPageThumbnail } from "@/components/pdf-page-thumbnail"
import { PdfActionButtons } from "@/components/pdf-action-buttons"
import { Badge } from "@/components/ui/badge"

// Internal utilities
import { cn } from "@/lib/utils"
import { addOklchAlpha } from "@/lib/pdf-colors"
import { createPageMap, createFileMap, createFileUrlMap } from "@/lib/pdf-lookup-utils"
import { createPageActions } from "@/lib/page-actions"

// Custom hooks
import { usePageDragDrop } from "@/hooks/use-page-drag-drop"

// Types
import type { PdfFile, UnifiedPage } from "@/lib/types"

interface PdfPageGridProps {
  readonly pdfFiles: ReadonlyArray<PdfFile>
  readonly unifiedPages: ReadonlyArray<UnifiedPage>
  readonly pageOrder: ReadonlyArray<number>
  readonly deletedPages: ReadonlySet<number>
  readonly pageRotations: Readonly<Record<number, number>>
  readonly onReorder: (newOrder: number[]) => void
  readonly onToggleDelete: (unifiedPageNumber: number) => void
  readonly onRotate: (unifiedPageNumber: number, angle: number) => void
  readonly onResetRotation: (unifiedPageNumber: number) => void
  readonly onExtract: (unifiedPageNumber: number) => void
  readonly isProcessing: boolean
  readonly columns?: number
}

function PdfPageGridComponent({
  pdfFiles,
  unifiedPages,
  pageOrder,
  deletedPages,
  pageRotations,
  onReorder,
  onToggleDelete,
  onRotate,
  onResetRotation,
  onExtract,
  isProcessing,
  columns,
}: PdfPageGridProps): React.JSX.Element | null {
  // Use drag-and-drop hook for cleaner code organization
  const dragDrop = usePageDragDrop({
    pageOrder,
    onReorder,
    announcementId: 'page-reorder-announcement',
  })

  const handleMoveUp = React.useCallback((index: number): void => {
    if (index === 0) return
    const newOrder = [...pageOrder]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index - 1]
    newOrder[index - 1] = temp
    onReorder(newOrder)
  }, [pageOrder, onReorder])

  const handleMoveDown = React.useCallback((index: number): void => {
    if (index === pageOrder.length - 1) return
    const newOrder = [...pageOrder]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index + 1]
    newOrder[index + 1] = temp
    onReorder(newOrder)
  }, [pageOrder, onReorder])


  // Create memoized maps for O(1) lookups instead of O(n) Array.find()
  const pageInfoMap = React.useMemo(() => createPageMap(unifiedPages), [unifiedPages])
  const fileInfoMap = React.useMemo(() => createFileMap(pdfFiles), [pdfFiles])
  const fileUrlMap = React.useMemo(() => createFileUrlMap(pdfFiles), [pdfFiles])

  // Memoize final page number calculations to avoid recalculating on every render
  const finalPageNumberMap = React.useMemo(() => {
    const map = new Map<number, number | null>()
    let finalPageNum = 0
    pageOrder.forEach((unifiedPageNumber) => {
      if (!deletedPages.has(unifiedPageNumber)) {
        finalPageNum++
        map.set(unifiedPageNumber, finalPageNum)
      } else {
        map.set(unifiedPageNumber, null)
      }
    })
    return map
  }, [pageOrder, deletedPages])

  // Memoize lookup functions to avoid recreating them on every render
  // These are stable as long as the maps don't change (which is controlled by dependencies)
  const getPageInfo = React.useCallback((unifiedPageNumber: number) => {
    return pageInfoMap.get(unifiedPageNumber)
  }, [pageInfoMap])

  const getFileUrl = React.useCallback((fileId: string) => {
    return fileUrlMap.get(fileId)
  }, [fileUrlMap])

  const getFileInfo = React.useCallback((fileId: string) => {
    return fileInfoMap.get(fileId)
  }, [fileInfoMap])

  const getFinalPageNumber = React.useCallback((unifiedPageNumber: number): number | null => {
    return finalPageNumberMap.get(unifiedPageNumber) ?? null
  }, [finalPageNumberMap])

  // Memoize grid style and className to avoid recalculating
  const gridStyle = React.useMemo(() => {
    return columns
      ? {
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          marginTop: 0,
          paddingTop: 0,
        }
      : { marginTop: 0, paddingTop: 0 }
  }, [columns])

  const gridClassName = React.useMemo(() => {
    return columns
      ? "grid gap-6"
      : "grid grid-cols-1 grid-cols-2-at-1230 grid-cols-3-at-1655 gap-6"
  }, [columns])

  if (pageOrder.length === 0) {
    return null
  }

  return (
    <>
      {/* Live region for drag-and-drop and reordering feedback */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="page-reorder-announcement"
      />
      <div 
        className={gridClassName} 
        style={gridStyle}
        role="list"
        aria-label="PDF pages grid"
      >
      {pageOrder.map((unifiedPageNumber, index) => {
        const page = getPageInfo(unifiedPageNumber)
        if (!page) return null

        const fileUrl = getFileUrl(page.fileId)
        if (!fileUrl) return null

        const fileInfo = getFileInfo(page.fileId)
        if (!fileInfo) return null
        const isDeleted = deletedPages.has(unifiedPageNumber)
        const rotation = pageRotations[unifiedPageNumber] || 0
        const hasRotation = rotation !== 0
        const finalPageNumber = getFinalPageNumber(unifiedPageNumber)

        // Create actions using utility function
        const actions = createPageActions({
          index,
          unifiedPageNumber,
          totalPages: pageOrder.length,
          isDeleted,
          hasRotation,
          rotation,
          isProcessing,
          onMoveUp: handleMoveUp,
          onMoveDown: handleMoveDown,
          onMoveLeft: handleMoveUp,
          onMoveRight: handleMoveDown,
          onToggleDelete,
          onRotate,
          onResetRotation,
          onExtract,
        })

        const containerStyle = fileInfo?.color 
          ? { 
              backgroundColor: addOklchAlpha(fileInfo.color, 0.15)
            } 
          : undefined

        const pageDescriptionId = `page-${unifiedPageNumber}-description`
        const pageLabel = `Page ${unifiedPageNumber}${fileInfo.file.name ? ` from ${fileInfo.file.name}` : ''}${isDeleted ? ' (deleted)' : ''}${hasRotation ? ` (rotated ${rotation}°)` : ''}. Use arrow keys to move page up, down, left, or right. Press Tab to access action buttons.`

        return (
          <article
            key={`${page.id}-${index}`}
            draggable
            role="button"
            tabIndex={0}
            aria-label={pageLabel}
            aria-describedby={pageDescriptionId}
            onDragStart={() => dragDrop.handleDragStart(index)}
            onDragOver={(e) => dragDrop.handleDragOver(e, index)}
            onDragLeave={dragDrop.handleDragLeave}
            onDrop={(e) => dragDrop.handleDrop(e, index)}
            onDragEnd={dragDrop.handleDragEnd}
            onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
              // Keyboard navigation for drag and drop
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                // Focus management for keyboard users
                if (e.key === 'Enter') {
                  // Trigger action panel or menu for keyboard users
                  // The action buttons are accessible via tab navigation
                }
              }
              // Arrow key navigation for reordering
              if (e.key === 'ArrowUp' && index > 0) {
                e.preventDefault()
                handleMoveUp(index)
                // Announce reordering to screen readers
                const announcement = document.getElementById('page-reorder-announcement')
                if (announcement) {
                  announcement.textContent = `Page ${unifiedPageNumber} moved up to position ${index}`
                }
              }
              if (e.key === 'ArrowDown' && index < pageOrder.length - 1) {
                e.preventDefault()
                handleMoveDown(index)
                // Announce reordering to screen readers
                const announcement = document.getElementById('page-reorder-announcement')
                if (announcement) {
                  announcement.textContent = `Page ${unifiedPageNumber} moved down to position ${index + 2}`
                }
              }
              if (e.key === 'ArrowLeft' && index > 0) {
                e.preventDefault()
                handleMoveUp(index)
                // Announce reordering to screen readers
                const announcement = document.getElementById('page-reorder-announcement')
                if (announcement) {
                  announcement.textContent = `Page ${unifiedPageNumber} moved left to position ${index}`
                }
              }
              if (e.key === 'ArrowRight' && index < pageOrder.length - 1) {
                e.preventDefault()
                handleMoveDown(index)
                // Announce reordering to screen readers
                const announcement = document.getElementById('page-reorder-announcement')
                if (announcement) {
                  announcement.textContent = `Page ${unifiedPageNumber} moved right to position ${index + 2}`
                }
              }
            }}
            className={cn(
              "relative group border border-border p-4 transition-all flex gap-4",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              dragDrop.draggedIndex === index && "opacity-50",
              dragDrop.dragOverIndex === index && "ring-2 ring-primary ring-offset-2",
              isDeleted && "opacity-50"
            )}
            style={containerStyle}
          >
            <div className="flex-1 min-w-0">
              <PdfPageThumbnail
                fileUrl={fileUrl}
                pageNumber={page.originalPageNumber}
                rotation={rotation}
                pdfColor={fileInfo.color}
                pdfFileName={fileInfo.file.name}
                finalPageNumber={finalPageNumber}
                fileType={fileInfo.type}
                totalPages={pageOrder.length}
              />
              <div id={pageDescriptionId} className="sr-only">
                {`Page ${page.originalPageNumber} of ${fileInfo.file.name}. ${isDeleted ? 'Marked for deletion. ' : ''}${hasRotation ? `Rotated ${rotation} degrees. ` : ''}${finalPageNumber !== null ? `Will be page ${finalPageNumber} in final PDF.` : ''}`}
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-1" aria-hidden="true">
                {isDeleted && (
                  <Badge variant="destructive" className="text-xs">
                    Deleted
                  </Badge>
                )}
                {hasRotation && (
                  <Badge variant="default" className="text-xs">
                    {rotation}°
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              <PdfActionButtons actions={actions} showGrip={true} />
            </div>
          </article>
        )
      })}
      </div>
    </>
  )
}

/**
 * Custom comparison function for React.memo to optimize re-renders.
 * Only re-renders when props actually change.
 */
function arePropsEqual(
  prevProps: PdfPageGridProps,
  nextProps: PdfPageGridProps
): boolean {
  // Compare primitive values first (fastest check)
  if (
    prevProps.isProcessing !== nextProps.isProcessing ||
    prevProps.columns !== nextProps.columns
  ) {
    return false // Props changed, re-render
  }

  // Compare array lengths (fast check)
  if (
    prevProps.pageOrder.length !== nextProps.pageOrder.length ||
    prevProps.pdfFiles.length !== nextProps.pdfFiles.length ||
    prevProps.unifiedPages.length !== nextProps.unifiedPages.length
  ) {
    return false // Array lengths changed, re-render
  }

  // Compare page order (if order changed, we need to re-render)
  if (prevProps.pageOrder.some((val, idx) => val !== nextProps.pageOrder[idx])) {
    return false
  }

  // Check if deleted pages changed (optimized: check size first, then verify all items match)
  if (prevProps.deletedPages.size !== nextProps.deletedPages.size) {
    return false
  }
  // If sizes match, verify all items match (Set equality check)
  // Since Sets are equal if they have the same size and all elements from one exist in the other
  for (const pageNum of prevProps.deletedPages) {
    if (!nextProps.deletedPages.has(pageNum)) {
      return false
    }
  }

  // Check if rotations changed
  const prevRotationKeys = Object.keys(prevProps.pageRotations)
  const nextRotationKeys = Object.keys(nextProps.pageRotations)
  if (prevRotationKeys.length !== nextRotationKeys.length) {
    return false
  }
  for (const key of prevRotationKeys) {
    if (prevProps.pageRotations[Number(key)] !== nextProps.pageRotations[Number(key)]) {
      return false
    }
  }

  // Compare array references (if references are same, arrays haven't changed)
  if (
    prevProps.pdfFiles !== nextProps.pdfFiles ||
    prevProps.unifiedPages !== nextProps.unifiedPages
  ) {
    // Arrays changed, need to re-render
    return false
  }

  // Functions are compared by reference - if they're stable, this is fine
  // If they changed, we want to re-render anyway
  return (
    prevProps.onReorder === nextProps.onReorder &&
    prevProps.onToggleDelete === nextProps.onToggleDelete &&
    prevProps.onRotate === nextProps.onRotate &&
    prevProps.onResetRotation === nextProps.onResetRotation &&
    prevProps.onExtract === nextProps.onExtract
  )
}

// Memoize component to prevent unnecessary re-renders
export const PdfPageGrid = React.memo(PdfPageGridComponent, arePropsEqual)

