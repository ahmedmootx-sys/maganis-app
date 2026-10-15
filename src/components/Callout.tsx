import type { ReactNode } from 'react'

export interface CalloutProps {
  avatar?: ReactNode
  title?: ReactNode
  children?: ReactNode
  message?: ReactNode
  action?: ReactNode
  actionLabel?: ReactNode
  onAction?: () => void
  variant?: 'info' | 'accent' | 'warning' | 'error' | 'tip'
  className?: string
}

export function Callout({
  avatar,
  title,
  children,
  message,
  action,
  actionLabel,
  onAction,
  variant = 'accent',
  className = '',
}: CalloutProps) {
  const content = children ?? message
  const actionElement =
    action ??
    (actionLabel ? (
      <button type="button" className="ghost-secondary" onClick={onAction}>
        {actionLabel}
      </button>
    ) : null)

  return (
    <div className={`callout callout--${variant} ${className}`} role="region">
      {avatar && <div className="callout__avatar">{avatar}</div>}
      <div className="callout__content">
        {title && <div className="callout__title">{title}</div>}
        {content && <div className="callout__message">{content}</div>}
        {actionElement && (
          <div className="callout__action">{actionElement}</div>
        )}
      </div>
    </div>
  )
}
