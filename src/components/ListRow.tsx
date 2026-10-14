import { useRef, type ReactNode } from 'react'

export interface ListRowProps {
  leading?: ReactNode
  title: ReactNode
  secondary?: ReactNode
  secondaryIsLtr?: boolean
  tertiary?: ReactNode
  trailing?: ReactNode
  onClick?: () => void
  onLongPress?: () => void
  className?: string
  id?: string
  role?: string
  'aria-label'?: string
}

export function ListRow({
  leading,
  title,
  secondary,
  secondaryIsLtr = false,
  tertiary,
  trailing,
  onClick,
  onLongPress,
  className = '',
  id,
  role,
  'aria-label': ariaLabel,
}: ListRowProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isLongPressRef = useRef(false)

  const handleTouchStart = () => {
    if (!onLongPress) return
    isLongPressRef.current = false
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true
      onLongPress()
    }, 500)
  }

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (isLongPressRef.current) {
      isLongPressRef.current = false
      return
    }
    // If target was an inner interactive button, don't trigger row click
    const target = e.target as HTMLElement
    if (target.closest('button') && !target.classList.contains('list-row')) {
      return
    }
    onClick?.()
  }

  const isClickable = Boolean(onClick || onLongPress)

  return (
    <div
      id={id}
      role={role ?? (isClickable ? 'button' : undefined)}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={ariaLabel}
      className={`list-row ${isClickable ? 'list-row--clickable' : ''} ${className}`}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick?.()
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      {leading && <div className="list-row__leading">{leading}</div>}
      <div className="list-row__content">
        <div className="list-row__title">{title}</div>
        {secondary && (
          <div
            className="list-row__secondary"
            dir={secondaryIsLtr ? 'ltr' : undefined}
          >
            {secondary}
          </div>
        )}
        {tertiary && <div className="list-row__tertiary">{tertiary}</div>}
      </div>
      {trailing && <div className="list-row__trailing">{trailing}</div>}
    </div>
  )
}
