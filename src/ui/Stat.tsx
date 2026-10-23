import React from 'react'
import { fmtNumber } from '../utils/bidi.ts'
import { Icon, type IconName } from './Icon.tsx'

export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: number | string
  unit?: string
  secondary?: React.ReactNode
  icon?: IconName
  trend?: {
    value: number | string
    direction: 'up' | 'down' | 'neutral'
  }
  className?: string
  isText?: boolean
}

export const Stat: React.FC<StatProps> = ({
  label,
  value,
  unit,
  secondary,
  icon,
  trend,
  className = '',
  isText,
  ...props
}) => {
  const formattedVal = typeof value === 'number' ? fmtNumber(value) : value
  const isTextValue =
    isText ?? (typeof value === 'string' && !/^[0-9—]/.test(value))

  return (
    <div className={`stat-box ${className}`.trim()} {...props}>
      <div className="stat-box__label">
        {icon && <Icon name={icon} size={16} style={{ marginInlineEnd: 4 }} />}
        <span>{label}</span>
      </div>
      <div className="stat-box__value-row">
        <bdi
          className="stat-box__value"
          style={
            isTextValue
              ? {
                  fontSize: '13px',
                  fontWeight: 700,
                  lineHeight: 1.25,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textAlign: 'center',
                  wordBreak: 'break-word',
                }
              : undefined
          }
        >
          {formattedVal}
        </bdi>
        {unit && <span className="stat-box__unit">{unit}</span>}
        {trend && (
          <span
            className={`stat-box__trend stat-box__trend--${trend.direction}`}
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color:
                trend.direction === 'up'
                  ? 'var(--color-success-text)'
                  : trend.direction === 'down'
                    ? 'var(--color-danger-text)'
                    : 'var(--color-text-2)',
              marginInlineStart: 'auto',
            }}
          >
            <bdi>{trend.value}</bdi>
          </span>
        )}
      </div>
      {secondary && (
        <span
          style={{
            fontSize: '11px',
            color: 'var(--muted, var(--color-text-2))',
            marginTop: '2px',
            display: 'block',
          }}
        >
          {secondary}
        </span>
      )}
    </div>
  )
}
