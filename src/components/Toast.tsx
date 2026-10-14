import React, { useEffect } from 'react'

export interface ToastProps {
  message: string | null
  duration?: number // default: 3000ms
  onDismiss?: () => void
  icon?: React.ReactNode
}

/**
 * Toast Component
 * Placement rule: Bottom, above the BottomNav (64px) and safe-area inset.
 * Visual rules: Max 2 lines, 3 seconds duration, never over interactive controls or TopBar.
 * Container has `pointer-events: none` to never block underlying controls.
 */
export const Toast: React.FC<ToastProps> = ({
  message,
  duration = 3000,
  onDismiss,
  icon,
}) => {
  useEffect(() => {
    if (!message || !onDismiss) return
    const timer = setTimeout(() => {
      onDismiss()
    }, duration)
    return () => clearTimeout(timer)
  }, [message, duration, onDismiss])

  if (!message) return null

  return (
    <div
      className="maganis-toast-portal"
      data-testid="maganis-toast"
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom:
          'calc(var(--bottom-nav-height, 64px) + 16px + env(safe-area-inset-bottom, 0px))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 'max-content',
        maxWidth: 'min(calc(100vw - 32px), 420px)',
        boxSizing: 'border-box',
        animation: 'toastSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        className="maganis-toast-pill"
        style={{
          background: 'rgba(15, 23, 42, 0.94)',
          color: '#ffffff',
          padding: '10px 20px',
          borderRadius: '999px',
          fontSize: '13.5px',
          fontWeight: 700,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textAlign: 'center',
          lineHeight: 1.35,
          boxSizing: 'border-box',
          maxWidth: '100%',
        }}
      >
        {icon && (
          <span style={{ fontSize: '15px', flexShrink: 0 }}>{icon}</span>
        )}
        <span
          className="maganis-toast-text"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {message}
        </span>
      </div>
    </div>
  )
}

export default Toast
