import React from 'react'
import { fmtNumber } from '../utils/bidi.ts'

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number // 0 to max
  max?: number
  variant?: 'accent' | 'success' | 'warning' | 'danger'
  height?: number
  showLabel?: boolean
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'accent',
  height = 8,
  showLabel = false,
  className = '',
  ...props
}) => {
  const clamped = Math.min(Math.max(0, value), max)
  const percentage = Math.round((clamped / max) * 100)

  const getVariantColor = () => {
    switch (variant) {
      case 'success':
        return 'var(--color-success)'
      case 'warning':
        return 'var(--color-warning)'
      case 'danger':
        return 'var(--color-danger)'
      default:
        return 'var(--color-accent)'
    }
  }

  return (
    <div className={`progress-bar-wrapper ${className}`.trim()} {...props}>
      {showLabel && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: 'var(--color-text-2)',
            marginBottom: '4px',
            fontWeight: 600,
          }}
        >
          <span>التقدم</span>
          <bdi>{fmtNumber(percentage)}%</bdi>
        </div>
      )}
      <div
        className="progress-bar-container"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={max}
        style={{ height: `${height}px` }}
      >
        <div
          className="progress-bar-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: getVariantColor(),
          }}
        />
      </div>
    </div>
  )
}
