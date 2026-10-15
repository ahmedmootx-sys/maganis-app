import type { ReactNode } from 'react'

export interface EmptyStateProps {
  icon?: ReactNode
  title: ReactNode
  message?: ReactNode
  description?: ReactNode
  action?: ReactNode
  actionLabel?: ReactNode
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon,
  title,
  message,
  description,
  action,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  const displayMessage = message ?? description
  const displayAction =
    action ??
    (actionLabel && onAction ? (
      <button type="button" className="btn-primary-action" onClick={onAction}>
        {actionLabel}
      </button>
    ) : null)

  return (
    <div className={`empty-state ${className}`} role="status">
      {icon && <div className="empty-state__icon">{icon}</div>}
      <h3 className="empty-state__title">{title}</h3>
      {displayMessage && (
        <p className="empty-state__message">{displayMessage}</p>
      )}
      {displayAction && (
        <div className="empty-state__action">{displayAction}</div>
      )}
    </div>
  )
}
