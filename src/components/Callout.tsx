import type { ReactNode } from 'react'

export interface CalloutProps {
  avatar?: ReactNode
  title?: ReactNode
  children: ReactNode
  action?: ReactNode
  variant?: 'info' | 'accent' | 'warning'
  className?: string
}

export function Callout({
  avatar,
  title,
  children,
  action,
  variant = 'accent',
  className = '',
}: CalloutProps) {
  return (
    <div className={`callout callout--${variant} ${className}`} role="region">
      {avatar && <div className="callout__avatar">{avatar}</div>}
      <div className="callout__content">
        {title && <div className="callout__title">{title}</div>}
        <div className="callout__message">{children}</div>
        {action && <div className="callout__action">{action}</div>}
      </div>
    </div>
  )
}
