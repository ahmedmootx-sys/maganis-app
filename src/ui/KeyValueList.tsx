import React from 'react'

export interface KeyValueItem {
  key?: string
  label?: string
  id?: string
  value: React.ReactNode
  bdi?: boolean
  stacked?: boolean
  onClick?: () => void
}

export interface KeyValueListProps extends React.HTMLAttributes<HTMLDivElement> {
  items: KeyValueItem[]
  className?: string
}

export const KeyValueList: React.FC<KeyValueListProps> = ({
  items,
  className = '',
  ...props
}) => {
  return (
    <div className={`key-value-list ${className}`.trim()} {...props}>
      {items.map((item, idx) => {
        const itemKey = item.key || item.label || item.id || String(idx)
        return (
          <div
            key={idx}
            className={`key-value-item ${item.stacked ? 'key-value-item--stacked' : ''} ${item.onClick ? 'key-value-item--interactive' : ''}`}
            onClick={item.onClick}
            role={item.onClick ? 'button' : undefined}
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
            style={item.onClick ? { cursor: 'pointer' } : undefined}
          >
            <span className="key-value-item__key">{itemKey}</span>
            <span className="key-value-item__val">
              {item.bdi ? <bdi dir="ltr">{item.value}</bdi> : item.value}
            </span>
          </div>
        )
      })}
    </div>
  )
}
