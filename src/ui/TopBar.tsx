import React from 'react'
import { type IconName } from './Icon.tsx'
import { IconButton } from './Button.tsx'

export interface TopBarAction {
  icon: IconName
  onClick: () => void
  ariaLabel: string
}

export interface TopBarProps {
  title: string
  onBack?: () => void
  backAriaLabel?: string
  actions?: TopBarAction[]
  className?: string
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  onBack,
  backAriaLabel = 'رجوع',
  actions = [],
  className = '',
}) => {
  return (
    <header className={`top-bar ${className}`.trim()}>
      <div className="top-bar__inner">
        <div className="top-bar__start">
          {onBack && (
            <IconButton
              name="chevron-right"
              onClick={onBack}
              aria-label={backAriaLabel}
              size={24}
              mirrorRtl={true}
            />
          )}
          <h1 className="top-bar__title">{title}</h1>
        </div>
        {actions.length > 0 && (
          <div className="top-bar__actions">
            {actions.slice(0, 2).map((act, idx) => (
              <IconButton
                key={idx}
                name={act.icon}
                onClick={act.onClick}
                aria-label={act.ariaLabel}
                size={22}
              />
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
