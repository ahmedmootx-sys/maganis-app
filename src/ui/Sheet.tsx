import React, { useEffect, useRef } from 'react'
import { IconButton } from './Button.tsx'

export interface SheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  className = '',
}) => {
  const sheetRef = useRef<HTMLDivElement>(null)

  // Esc key closes & focus trap
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'Tab' && sheetRef.current) {
        const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        if (focusable.length === 0) return
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

    // Prevent body scroll when sheet is open
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="sheet-backdrop"
      onClick={onClose}
      data-testid="sheet-backdrop"
    >
      <div
        ref={sheetRef}
        className={`sheet ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet__handle" aria-hidden="true" />
        {(title || subtitle) && (
          <div className="sheet__header">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {title && <h3 className="sheet__title">{title}</h3>}
              {subtitle && (
                <span
                  className="sheet__subtitle"
                  style={{ fontSize: '13px', color: 'var(--muted)' }}
                >
                  {subtitle}
                </span>
              )}
            </div>
            <IconButton
              name="x"
              size={20}
              aria-label="إغلاق النافذة"
              onClick={onClose}
            />
          </div>
        )}
        <div className="sheet__body">{children}</div>
        {footer && <div className="sheet__footer">{footer}</div>}
      </div>
    </div>
  )
}
