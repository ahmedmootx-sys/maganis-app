import type { ReactNode } from 'react'

export interface StatProps {
  label: ReactNode
  value: ReactNode
  secondary?: ReactNode
  className?: string
  isText?: boolean
}

export function Stat({
  label,
  value,
  secondary,
  className = '',
  isText,
}: StatProps) {
  const isTextValue =
    isText ?? (typeof value === 'string' && !/^[0-9—]/.test(value))

  return (
    <div className={`maganis-stat ${className}`}>
      <div
        className={
          isTextValue
            ? 'maganis-stat__value maganis-stat__value--text'
            : 'maganis-stat__value'
        }
        style={
          isTextValue
            ? {
                fontSize: '13px',
                fontWeight: 700,
                lineHeight: 1.25,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden' /* clip-ok: text ellipsis truncation */,
                textOverflow: 'ellipsis',
                textAlign: 'center',
                wordBreak: 'break-word',
              }
            : undefined
        }
      >
        {value}
      </div>
      <div className="maganis-stat__label">{label}</div>
      {secondary && <div className="maganis-stat__secondary">{secondary}</div>}
    </div>
  )
}
