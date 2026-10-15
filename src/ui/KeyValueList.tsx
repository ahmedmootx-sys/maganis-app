import React from 'react'

export interface KeyValueItem {
  key: string
  value: React.ReactNode
  bdi?: boolean
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
      {items.map((item, idx) => (
        <div key={idx} className="key-value-item">
          <span className="key-value-item__key">{item.key}</span>
          <span className="key-value-item__val">
            {item.bdi ? <bdi>{item.value}</bdi> : item.value}
          </span>
        </div>
      ))}
    </div>
  )
}
