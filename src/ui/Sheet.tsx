import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { IconButton } from './Button.tsx'

export interface SheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: React.ReactNode
  headerAction?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  headerAction,
  children,
  footer,
  className = '',
}) => {
  const sheetRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  // Esc key closes, focus trap, return focus & background inert/aria-hidden
  useEffect(() => {
    if (!isOpen) return

    triggerRef.current = document.activeElement as HTMLElement | null

    // Mark background inert & aria-hidden
    const rootEl = document.getElementById('root')
    if (rootEl) {
      rootEl.setAttribute('aria-hidden', 'true')
      rootEl.inert = true
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'Tab' && sheetRef.current) {
        const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        if (focusable.length === 0) {
          e.preventDefault()
          return
        }
        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    // Prevent body scroll and mark sheet open on body
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.dataset.sheetOpen = 'true'

    window.addEventListener('keydown', handleKeyDown)

    // Focus first interactive element inside sheet if not already focused
    const focusTimer = setTimeout(() => {
      if (sheetRef.current) {
        if (
          document.activeElement &&
          sheetRef.current.contains(document.activeElement) &&
          document.activeElement !== sheetRef.current
        ) {
          return
        }
        const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        if (focusable.length > 0) {
          focusable[0].focus()
        } else {
          sheetRef.current.focus()
        }
      }
    }, 50)

    return () => {
      clearTimeout(focusTimer)
      document.body.style.overflow = prevOverflow
      delete document.body.dataset.sheetOpen
      window.removeEventListener('keydown', handleKeyDown)

      // Restore background
      if (rootEl) {
        rootEl.removeAttribute('aria-hidden')
        rootEl.inert = false
      }

      // Return focus to trigger element
      if (
        triggerRef.current &&
        typeof triggerRef.current.focus === 'function'
      ) {
        triggerRef.current.focus()
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sheetContent = (
    <div
      className="sheet-backdrop"
      onClick={onClose}
      data-testid="sheet-backdrop"
      data-overlay="true"
      dir="rtl"
    >
      <div
        ref={sheetRef}
        className={`sheet ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-overlay="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet__handle" aria-hidden="true" />
        {(title || subtitle || headerAction) && (
          <div className="sheet__header">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minWidth: 0,
              }}
            >
              {title && <h3 className="sheet__title">{title}</h3>}
              {subtitle && (
                <span
                  className="sheet__subtitle"
                  style={{ fontSize: '13px', color: 'var(--color-text-2)' }}
                >
                  {subtitle}
                </span>
              )}
            </div>
            {headerAction && (
              <div style={{ marginInlineEnd: 'var(--space-2)' }}>
                {headerAction}
              </div>
            )}
            <IconButton
              name="x"
              size={20}
              aria-label="إغلاق النافذة"
              onClick={onClose}
            />
          </div>
        )}
        <div className="sheet__body">{children}</div>
        {footer && (
          <div className="sheet__footer" data-overlay="true">
            {footer}
          </div>
        )}
      </div>
    </div>
  )

  if (typeof document !== 'undefined') {
    return createPortal(sheetContent, document.body)
  }

  return sheetContent
}
