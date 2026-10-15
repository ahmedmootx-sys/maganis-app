import React, { useState, useMemo } from 'react'
import { Sheet } from './Sheet.tsx'
import { Icon } from './Icon.tsx'
import { IconButton } from './Button.tsx'
import { fmtDate, fmtNumber } from '../utils/bidi.ts'

export interface DateFieldProps {
  id?: string
  name?: string
  value: string // YYYY-MM-DD
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  min?: string // YYYY-MM-DD
  max?: string // YYYY-MM-DD
  weekStart?: number // 0 = Sun, 6 = Sat (default)
  className?: string
}

// Arabic short day labels starting from Saturday (default)
const DAY_NAMES_SAT_START = [
  { day: 6, label: 'سبت' },
  { day: 0, label: 'أحد' },
  { day: 1, label: 'إثنين' },
  { day: 2, label: 'ثلاثاء' },
  { day: 3, label: 'أربعاء' },
  { day: 4, label: 'خميس' },
  { day: 5, label: 'جمعة' },
]

export const DateField: React.FC<DateFieldProps> = ({
  id,
  name,
  value,
  onChange,
  label = 'اختر التاريخ',
  placeholder = 'اختر التاريخ...',
  disabled = false,
  min,
  max,
  weekStart = 6,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false)

  // Month currently viewed in the grid
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const d = new Date(value)
      if (!isNaN(d.getTime())) return d
    }
    return new Date()
  })

  const formattedValue = useMemo(() => {
    if (!value) return ''
    return fmtDate(value, { year: 'numeric', month: 'long', day: 'numeric' })
  }, [value])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const monthTitle = useMemo(() => {
    return new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
      year: 'numeric',
      month: 'long',
    }).format(viewDate)
  }, [viewDate])

  // Calendar cells computation
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Calculate lead-in offset based on weekStart (default Saturday = 6)
    // If weekStart is Saturday (6), Saturday has offset 0, Sunday (0) has offset 1, etc.
    const leadOffset = (firstDayOfMonth - weekStart + 7) % 7

    const cells: (number | null)[] = []
    for (let i = 0; i < leadOffset; i++) {
      cells.push(null)
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(d)
    }
    return cells
  }, [year, month, weekStart])

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1))
  }

  const handleSelectDay = (day: number) => {
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    const dateStr = `${year}-${mm}-${dd}`
    onChange(dateStr)
    setIsOpen(false)
  }

  const isDayDisabled = (day: number) => {
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    const dateStr = `${year}-${mm}-${dd}`
    if (min && dateStr < min) return true
    if (max && dateStr > max) return true
    return false
  }

  const isDaySelected = (day: number) => {
    if (!value) return false
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    return value === `${year}-${mm}-${dd}`
  }

  return (
    <>
      <button
        type="button"
        id={id}
        className={`field-input ${className}`.trim()}
        onClick={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          textAlign: 'start',
          minHeight: 'var(--control-height)',
        }}
      >
        <span
          style={{
            color: formattedValue ? 'var(--color-text)' : 'var(--color-text-2)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {formattedValue || placeholder}
        </span>
        <Icon
          name="calendar"
          size={18}
          style={{ color: 'var(--color-text-2)' }}
        />
      </button>

      {/* Hidden native date input for form semantics and automated testing */}
      <input
        type="date"
        name={name}
        value={value || ''}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          width: 0,
          height: 0,
        }}
        aria-hidden="true"
      />

      <Sheet isOpen={isOpen} onClose={() => setIsOpen(false)} title={label}>
        {/* Month Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            paddingInline: '4px',
          }}
        >
          <IconButton
            name="chevron-right"
            onClick={handleNextMonth}
            aria-label="الشهر القادم"
            size={20}
          />
          <strong style={{ fontSize: '15px', color: 'var(--color-text)' }}>
            {monthTitle}
          </strong>
          <IconButton
            name="chevron-left"
            onClick={handlePrevMonth}
            aria-label="الشهر السابق"
            size={20}
          />
        </div>

        {/* Day of Week Headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px',
            textAlign: 'center',
            marginBottom: '8px',
          }}
        >
          {DAY_NAMES_SAT_START.map((d) => (
            <span
              key={d.day}
              style={{
                fontSize: '12px',
                color: 'var(--color-text-2)',
                fontWeight: 600,
                paddingBlock: '4px',
              }}
            >
              {d.label}
            </span>
          ))}
        </div>

        {/* Calendar Day Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px',
            textAlign: 'center',
          }}
        >
          {calendarCells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} />
            }

            const isSelected = isDaySelected(day)
            const isDisabled = isDayDisabled(day)

            return (
              <button
                key={day}
                type="button"
                disabled={isDisabled}
                onClick={() => handleSelectDay(day)}
                style={{
                  height: '42px',
                  borderRadius: 'var(--radius-control)',
                  border: isSelected
                    ? '1.5px solid var(--color-accent)'
                    : '1px solid transparent',
                  background: isSelected
                    ? 'var(--color-accent)'
                    : 'transparent',
                  color: isSelected
                    ? 'var(--color-accent-contrast)'
                    : isDisabled
                      ? 'var(--color-divider)'
                      : 'var(--color-text)',
                  fontSize: '14px',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                <bdi>{fmtNumber(day)}</bdi>
              </button>
            )
          })}
        </div>
      </Sheet>
    </>
  )
}
