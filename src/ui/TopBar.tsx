import React from 'react'
import { type IconName } from './Icon.tsx'
import { IconButton } from './Button.tsx'

export interface TopBarAction {
  icon: IconName
  onClick: () => void
  ariaLabel: string
}

export interface TopBarProps {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  onBack?: () => void
  backAriaLabel?: string
  leading?: React.ReactNode
  actions?: TopBarAction[] | React.ReactNode
  className?: string
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  onBack,
  backAriaLabel = 'رجوع',
  leading,
  actions = [],
  className = '',
}) => {
  return (
    <header className={`top-bar ${className}`.trim()}>
      <div className="top-bar__inner">
        <div className="top-bar__start">
          {onBack ? (
            <IconButton
              name="chevron-right"
              onClick={onBack}
              aria-label={backAriaLabel}
              size={24}
              mirrorRtl={true}
            />
          ) : (
            leading
          )}
          {(title || subtitle) && (
            <div
              className="top-bar__title-group"
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              {title &&
                (typeof title === 'string' ? (
                  <h1 className="top-bar__title">{title}</h1>
                ) : (
                  title
                ))}
              {subtitle && (
                <span
                  className="top-bar__subtitle"
                  style={{ fontSize: '12px', color: 'var(--muted)' }}
                >
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>
        {actions && (
          <div className="top-bar__actions">
            {Array.isArray(actions)
              ? actions
                  .slice(0, 2)
                  .map((act, idx) => (
                    <IconButton
                      key={idx}
                      name={act.icon}
                      onClick={act.onClick}
                      aria-label={act.ariaLabel}
                      size={22}
                    />
                  ))
              : actions}
          </div>
        )}
      </div>
    </header>
  )
}
