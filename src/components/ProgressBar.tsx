export interface ProgressBarProps {
  value: number
  max?: number
  height?: number
  className?: string
  color?: string
  'aria-label'?: string
}

export function ProgressBar({
  value,
  max = 100,
  height = 8,
  className = '',
  color,
  'aria-label': ariaLabel = 'شريط التقدم',
}: ProgressBarProps) {
  const percentage = Math.max(
    0,
    Math.min(100, max > 0 ? (value / max) * 100 : 0),
  )

  return (
    <div
      className={`maganis-progress-bar ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={ariaLabel}
      style={{ height: `${height}px` }}
    >
      <div
        className="maganis-progress-bar__fill"
        style={{
          width: `${percentage}%`,
          ...(color ? { background: color } : {}),
        }}
      />
    </div>
  )
}
