import type { ReactNode } from 'react'
import { IconArrowRight } from './Icons'

export interface TopBarProps {
  title?: ReactNode
  subtitle?: ReactNode
  onBack?: () => void
  leading?: ReactNode
  actions?: ReactNode
  className?: string
}

export function TopBar({
  title,
  subtitle,
  onBack,
  leading,
  actions,
  className = '',
}: TopBarProps) {
  return (
    <header className={`topbar ${className}`} role="banner">
      <div className="topbar__start">
        {onBack ? (
          <button
            type="button"
            className="topbar__back-btn"
            onClick={onBack}
            aria-label="رجوع"
          >
            <IconArrowRight size={22} />
          </button>
        ) : (
          leading
        )}
        {(title || subtitle) && (
          <div className="topbar__title-group">
            {title && <h1 className="topbar__title">{title}</h1>}
            {subtitle && <span className="topbar__subtitle">{subtitle}</span>}
          </div>
        )}
      </div>
      {actions && <div className="topbar__actions">{actions}</div>}
    </header>
  )
}
