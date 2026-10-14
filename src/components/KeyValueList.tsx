import type { ReactNode } from 'react'

export interface KeyValueItem {
  id: string
  label: ReactNode
  value: ReactNode
  secondary?: ReactNode
  secondaryIsLtr?: boolean
  trailing?: ReactNode
  onClick?: () => void
}

export interface KeyValueListProps {
  items: KeyValueItem[]
  className?: string
}

export function KeyValueList({ items, className = '' }: KeyValueListProps) {
  return (
    <div className={`key-value-list ${className}`} role="list">
      {items.map((item) => (
        <div
          key={item.id}
          className={`key-value-row ${item.onClick ? 'key-value-row--clickable' : ''}`}
          role="listitem"
          onClick={item.onClick}
          tabIndex={item.onClick ? 0 : undefined}
          onKeyDown={
            item.onClick
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    item.onClick?.()
                  }
                }
              : undefined
          }
        >
          <div className="key-value-row__label">{item.label}</div>
          <div className="key-value-row__value-group">
            <span
              className="key-value-row__value"
              dir={item.secondaryIsLtr ? 'ltr' : undefined}
            >
              {item.value}
            </span>
            {item.secondary && (
              <span
                className="key-value-row__secondary"
                dir={item.secondaryIsLtr ? 'ltr' : undefined}
              >
                {item.secondary}
              </span>
            )}
            {item.trailing}
          </div>
        </div>
      ))}
    </div>
  )
}
