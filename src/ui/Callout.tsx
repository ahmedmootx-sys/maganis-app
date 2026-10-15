import React from 'react'
import { Icon, type IconName } from './Icon.tsx'

export type CalloutVariant = 'info' | 'warning' | 'danger' | 'success'

export interface CalloutAction {
  label: string
  onClick: () => void
}

export interface CalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CalloutVariant
  title?: string
  icon?: IconName
  action?: CalloutAction
  children: React.ReactNode
  className?: string
}

const DEFAULT_VARIANT_ICONS: Record<CalloutVariant, IconName> = {
  info: 'info',
  warning: 'alert-triangle',
  danger: 'alert-circle',
  success: 'check-circle-2',
}

export const Callout: React.FC<CalloutProps> = ({
  variant = 'info',
  title,
  icon,
  action,
  children,
  className = '',
  ...props
}) => {
  const iconName = icon || DEFAULT_VARIANT_ICONS[variant]

  return (
    <aside
      className={`callout callout--${variant} ${className}`.trim()}
      role="note"
      {...props}
    >
      <div className="callout__icon" aria-hidden="true">
        <Icon name={iconName} size={20} />
      </div>
      <div className="callout__content">
        {title && <div className="callout__title">{title}</div>}
        <div className="callout__text">{children}</div>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            style={{
              marginTop: '6px',
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: '12.5px',
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            {action.label}
          </button>
        )}
      </div>
    </aside>
  )
}
