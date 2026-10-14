import { useEffect, type ReactNode } from 'react'
import { navigationHistory } from '../utils/navigationHistory'
import { IconClose } from './Icons'

export interface SheetProps {
  isOpen: boolean
  onClose: () => void
  title?: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
  historyKey?: string
}

export function Sheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  className = '',
  historyKey,
}: SheetProps) {
  useEffect(() => {
    if (!isOpen) return
    const key = historyKey || 'sheet_' + Math.random().toString(36).slice(2, 7)
    return navigationHistory.push(key, onClose)
  }, [isOpen, onClose, historyKey])

  if (!isOpen) return null

  return (
    <div
      className="maganis-sheet-portal"
      role="dialog"
      aria-modal="true"
      dir="rtl"
    >
      <div
        className="maganis-sheet-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`maganis-sheet-content ${className}`}>
        <div className="maganis-sheet-drag-handle" aria-hidden="true" />
        {(title || subtitle) && (
          <div className="maganis-sheet-header">
            <div className="maganis-sheet-title-group">
              {title && <h2 className="maganis-sheet-title">{title}</h2>}
              {subtitle && (
                <span className="maganis-sheet-subtitle">{subtitle}</span>
              )}
            </div>
            <button
              type="button"
              className="maganis-sheet-close-btn"
              onClick={onClose}
              aria-label="إغلاق"
            >
              <IconClose size={20} />
            </button>
          </div>
        )}
        <div className="maganis-sheet-body">{children}</div>
        {footer && <div className="maganis-sheet-footer">{footer}</div>}
      </div>
    </div>
  )
}
