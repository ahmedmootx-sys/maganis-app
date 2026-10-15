import React from 'react'
import { Icon, type IconName } from './Icon.tsx'
import { Button } from './Button.tsx'

export interface EmptyStateAction {
  label: string
  onClick: () => void
}

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: IconName
  title: string
  description?: string
  action?: EmptyStateAction
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox' as IconName,
  title,
  description,
  action,
  className = '',
  ...props
}) => {
  return (
    <div className={`empty-state ${className}`.trim()} {...props}>
      <div className="empty-state__icon" aria-hidden="true">
        <Icon name={icon} size={40} strokeWidth={1.5} />
      </div>
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__desc">{description}</p>}
      {action && (
        <Button variant="secondary" size="normal" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
