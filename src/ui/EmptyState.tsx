import React from 'react'
import { Icon, type IconName } from './Icon.tsx'
import { Button } from './Button.tsx'

export interface EmptyStateAction {
  label: string
  onClick: () => void
}

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: IconName | React.ReactNode
  title: string
  description?: string
  message?: string
  action?: EmptyStateAction | React.ReactNode
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox' as IconName,
  title,
  description,
  message,
  action,
  actionLabel,
  onAction,
  className = '',
  ...props
}) => {
  const desc = description ?? message
  const effectiveAction = action ?? (actionLabel && onAction ? { label: actionLabel, onClick: onAction } : undefined)

  return (
    <div className={`empty-state ${className}`.trim()} {...props}>
      <div className="empty-state__icon" aria-hidden="true">
        {typeof icon === 'string' ? (
          <Icon name={icon as IconName} size={40} strokeWidth={1.5} />
        ) : (
          icon
        )}
      </div>
      <h3 className="empty-state__title">{title}</h3>
      {desc && <p className="empty-state__desc">{desc}</p>}
      {effectiveAction && (
        React.isValidElement(effectiveAction) ? (
          effectiveAction
        ) : (
          <Button variant="secondary" size="normal" onClick={(effectiveAction as EmptyStateAction).onClick}>
            {(effectiveAction as EmptyStateAction).label}
          </Button>
        )
      )}
    </div>
  )
}
