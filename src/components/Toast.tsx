import React, { useEffect } from 'react'

export interface ToastProps {
  message: string | null
  duration?: number // default: 3000ms (0 for persistent)
  onDismiss?: () => void
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * Toast Component
 * Placement rule: Bottom, above the BottomNav (64px) and safe-area inset.
 * Visual rules: Max 2 lines, 3 seconds duration (or persistent if action), never over interactive controls or TopBar.
 * Container has `pointer-events: none` to never block underlying controls, but action button has pointer-events: auto.
 */
export const Toast: React.FC<ToastProps> = ({
  message,
  duration = 3000,
  onDismiss,
  icon,
  action,
}) => {
  useEffect(() => {
    if (
      !message ||
      !onDismiss ||
      duration === 0 ||
      (action && duration === 3000)
    )
      return
    const timer = setTimeout(() => {
      onDismiss()
    }, duration)
    return () => clearTimeout(timer)
  }, [message, duration, onDismiss, action])

  if (!message) return null

  return (
    <div
      className="maganis-toast-portal toast"
      data-overlay="true"
      data-testid="maganis-toast"
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom:
          'calc(var(--bottom-nav-height, 64px) + 16px + env(safe-area-inset-bottom, 0px))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 'var(--z-toast)' as any,
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
          background: 'var(--color-toast-bg)',
          color: 'var(--color-toast-text)',
          padding: '10px 20px',
          borderRadius: '999px',
          fontSize: '13.5px',
          fontWeight: 700,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
          border: '1px solid var(--color-toast-border)',
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
            overflow: 'hidden' /* clip-ok: text ellipsis truncation */,
            textOverflow: 'ellipsis',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {message}
        </span>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            style={{
              pointerEvents: 'auto',
              background: 'var(--brand, #ea580c)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '999px',
              padding: '6px 14px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              marginRight: '8px',
              flexShrink: 0,
            }}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  )
}

export default Toast
