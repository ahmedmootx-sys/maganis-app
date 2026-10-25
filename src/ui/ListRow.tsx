import React from 'react'
import { Icon, type IconName } from './Icon.tsx'

export interface ListRowProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title'
> {
  title: React.ReactNode
  subtitle?: React.ReactNode
  secondary?: React.ReactNode
  secondaryIsLtr?: boolean
  tertiary?: React.ReactNode
  leading?: React.ReactNode
  leadingIcon?: IconName
  trailing?: React.ReactNode
  showChevron?: boolean
  onClick?: () => void
  onLongPress?: () => void
  className?: string
}

export const ListRow: React.FC<ListRowProps> = ({
  title,
  subtitle,
  secondary,
  secondaryIsLtr,
  tertiary,
  leading,
  leadingIcon,
  trailing,
  showChevron = false,
  onClick,
  onLongPress,
  className = '',
  ...props
}) => {
  const isInteractive = Boolean(onClick || onLongPress)

  const effectiveSubtitle =
    subtitle ??
    (secondary || tertiary ? (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {secondary && (
          <bdi
            dir={secondaryIsLtr ? 'ltr' : undefined}
            style={{
              display: 'block',
              textAlign: secondaryIsLtr ? 'start' : undefined,
              fontSize: '12.5px',
              color: 'var(--muted)',
            }}
          >
            {secondary}
          </bdi>
        )}
        {tertiary && (
          <span
            style={{
              fontSize: '11.5px',
              color: 'var(--muted-strong, var(--muted))',
            }}
          >
            {tertiary}
          </span>
        )}
      </div>
    ) : undefined)

  return (
    <div
      className={`list-row ${isInteractive ? 'list-row--interactive' : ''} ${className}`.trim()}
      onClick={onClick}
      onContextMenu={
        onLongPress
          ? (e) => {
              e.preventDefault()
              onLongPress()
            }
          : undefined
      }
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
        {effectiveSubtitle && (
          <div className="list-row__subtitle">{effectiveSubtitle}</div>
        )}
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
