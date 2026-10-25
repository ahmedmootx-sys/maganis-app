import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'
import { Icon, type IconName } from './Icon.tsx'

export interface ToastItem {
  id: string
  message: string
  icon?: IconName
  duration?: number
  onUndo?: () => void
  undoLabel?: string
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return ctx
}

export interface ToastProps {
  message: string | null
  icon?: IconName
  onDismiss?: () => void
  onUndo?: () => void
  undoLabel?: string
}

export const Toast: React.FC<ToastProps> = ({
  message,
  icon,
  onDismiss,
  onUndo,
  undoLabel = 'تراجع',
}) => {
  useEffect(() => {
    if (!message || !onDismiss) return
    const timer = setTimeout(() => {
      onDismiss()
    }, 3000)
    return () => clearTimeout(timer)
  }, [message, onDismiss])

  if (!message) return null

  return (
    <div className="toast-container" aria-live="polite">
      <div className="toast" role="status">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {icon && <Icon name={icon} size={18} />}
          <span>{message}</span>
        </div>
        {onUndo && (
          <button
            type="button"
            onClick={onUndo}
            style={{
              background: 'none',
              border: 'none',
              padding: '0 4px',
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--color-accent-text)',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {undoLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((toastData: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    const newToast: ToastItem = { ...toastData, id }
    setToasts((prev) => [...prev.slice(-1), newToast]) // max 2 stacked

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, toastData.duration || 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.length > 0 && (
        <div className="toast-container" aria-live="polite" data-overlay="true">
          {toasts.map((t) => (
            <div key={t.id} className="toast" role="status">
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {t.icon && <Icon name={t.icon} size={18} />}
                <span>{t.message}</span>
              </div>
              {t.onUndo && (
                <button
                  type="button"
                  onClick={() => {
                    t.onUndo?.()
                    setToasts((prev) => prev.filter((item) => item.id !== t.id))
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '0 4px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--color-accent-text)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  {t.undoLabel || 'تراجع'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}
