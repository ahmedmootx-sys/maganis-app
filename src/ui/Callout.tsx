import React from 'react'
import { Icon, type IconName } from './Icon.tsx'

export type CalloutVariant =
  'info' | 'warning' | 'danger' | 'error' | 'success' | 'accent' | 'tip'

export interface CalloutAction {
  label: string
  onClick: () => void
}

export interface CalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CalloutVariant
  tone?: CalloutVariant
  title?: string
  message?: string
  actionLabel?: string
  onAction?: () => void
  icon?: IconName
  avatar?: React.ReactNode
  action?: CalloutAction | React.ReactNode
  children?: React.ReactNode
  className?: string
}

const DEFAULT_VARIANT_ICONS: Record<string, IconName> = {
  info: 'info',
  accent: 'info',
  warning: 'alert-triangle',
  danger: 'alert-circle',
  error: 'alert-circle',
  success: 'check-circle-2',
  tip: 'info',
}

export const Callout: React.FC<CalloutProps> = ({
  variant = 'info',
  tone,
  title,
  message,
  actionLabel,
  onAction,
  icon,
  avatar,
  action,
  children,
  className = '',
  ...props
}) => {
  const rawVariant = tone || variant || 'info'
  const resolvedVariant: 'info' | 'warning' | 'danger' | 'success' =
    rawVariant === 'accent' || rawVariant === 'tip'
      ? 'info'
      : rawVariant === 'error'
        ? 'danger'
        : rawVariant
  const iconName = icon || DEFAULT_VARIANT_ICONS[rawVariant] || 'info'
  const effectiveAction =
    action ??
    (actionLabel && onAction
      ? { label: actionLabel, onClick: onAction }
      : undefined)
  const content = children ?? message

  return (
    <aside
      className={`callout callout--${resolvedVariant} ${className}`.trim()}
      role="note"
      {...props}
    >
      <div className="callout__icon" aria-hidden="true">
        {avatar || <Icon name={iconName} size={20} />}
      </div>
      <div className="callout__content">
        {title && <div className="callout__title">{title}</div>}
        {content && <div className="callout__text">{content}</div>}
        {effectiveAction &&
          (React.isValidElement(effectiveAction) ? (
            effectiveAction
          ) : (
            <button
              type="button"
              onClick={(effectiveAction as CalloutAction).onClick}
              style={{
                marginTop: '6px',
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '12.5px',
                fontWeight: 700,
                color: 'currentColor',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {(effectiveAction as CalloutAction).label}
            </button>
          ))}
      </div>
    </aside>
  )
}
