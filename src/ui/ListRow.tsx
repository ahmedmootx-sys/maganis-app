import React from 'react'
import { Icon, type IconName } from './Icon.tsx'

export interface ListRowProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title'
> {
  title: React.ReactNode
  subtitle?: React.ReactNode
  leading?: React.ReactNode
  leadingIcon?: IconName
  trailing?: React.ReactNode
  showChevron?: boolean
  onClick?: () => void
  className?: string
}

export const ListRow: React.FC<ListRowProps> = ({
  title,
  subtitle,
  leading,
  leadingIcon,
  trailing,
  showChevron = false,
  onClick,
  className = '',
  ...props
}) => {
  const isInteractive = Boolean(onClick)

  return (
    <div
      className={`list-row ${isInteractive ? 'list-row--interactive' : ''} ${className}`.trim()}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      {...props}
    >
      {(leading || leadingIcon) && (
        <div className="list-row__leading" aria-hidden="true">
          {leading || (leadingIcon && <Icon name={leadingIcon} size={22} />)}
        </div>
      )}
      <div className="list-row__content">
        <div className="list-row__title">{title}</div>
        {subtitle && <div className="list-row__subtitle">{subtitle}</div>}
      </div>
      {(trailing || showChevron) && (
        <div className="list-row__trailing">
          {trailing}
          {showChevron && (
            <Icon
              name="chevron-left"
              size={18}
              mirrorRtl={true}
              aria-hidden="true"
            />
          )}
        </div>
      )}
    </div>
  )
}
