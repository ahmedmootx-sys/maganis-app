import React, { useId, useRef } from 'react'
import { Icon } from '../ui/Icon.tsx'

export interface DateFieldProps {
  id?: string
  name?: string
  value: string // YYYY-MM-DD
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  min?: string
  max?: string
  className?: string
  style?: React.CSSProperties
  'aria-label'?: string
}

/**
 * Format a YYYY-MM-DD date into an Arabic readable string (e.g. "١٥ أكتوبر ٢٠٢٦" or "15 أكتوبر 2026").
 */
export function formatArabicDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const parts = dateStr.split('-')
    if (parts.length !== 3) return dateStr
    const year = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10)
    const day = parseInt(parts[2], 10)
    if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr

    const date = new Date(year, month - 1, day)
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  } catch {
    return dateStr
  }
}

/**
 * DateField Component
 * Field-styled 48px trigger with calendar icon and formatted Arabic date over
 * the native picker. Completely prevents raw browser-styled date inputs anywhere.
 */
export const DateField: React.FC<DateFieldProps> = ({
  id,
  name,
  value,
  onChange,
  label,
  placeholder = 'اختر التاريخ...',
  disabled = false,
  required = false,
  min,
  max,
  className = '',
  style,
  'aria-label': ariaLabel,
}) => {
  const generatedId = useId()
  const fieldId = id || generatedId
  const inputRef = useRef<HTMLInputElement>(null)

  const formattedDate = value ? formatArabicDate(value) : ''

  const handleTriggerClick = () => {
    if (disabled) return
    if (inputRef.current) {
      if (typeof inputRef.current.showPicker === 'function') {
        try {
          inputRef.current.showPicker()
        } catch {
          inputRef.current.focus()
          inputRef.current.click()
        }
      } else {
        inputRef.current.focus()
        inputRef.current.click()
      }
    }
  }

  return (
    <div
      className={`maganis-field date-field ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        width: '100%',
        position: 'relative',
        ...style,
      }}
      data-testid={`date-field-${fieldId}`}
    >
      {label && (
        <label
          htmlFor={fieldId}
          className="field-label"
          style={{
            display: 'block',
            fontSize: '13.5px',
            fontWeight: 600,
            color: 'var(--ink)',
            marginBottom: '2px',
            textAlign: 'right',
          }}
        >
          {label}
          {required && (
            <span style={{ color: 'var(--danger)', marginInlineStart: '4px' }}>
              *
            </span>
          )}
        </label>
      )}

      {/* Field Trigger Container */}
      <div
        className="date-field-wrapper"
        style={{
          position: 'relative',
          width: '100%',
          height: '48px',
        }}
      >
        <button
          type="button"
          id={fieldId}
          disabled={disabled}
          onClick={handleTriggerClick}
          aria-label={ariaLabel || label || placeholder}
          className={`date-field-trigger ${disabled ? 'disabled' : ''} ${value ? 'has-value' : 'placeholder'}`}
          style={{
            width: '100%',
            height: '48px',
            minHeight: '48px',
            maxHeight: '48px',
            padding: '0 14px',
            borderRadius: '10px',
            border: '1px solid var(--input-border, var(--line))',
            background: 'var(--input-bg, var(--card-bg))',
            color: value ? 'var(--ink)' : 'var(--muted)',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            boxSizing: 'border-box',
            textAlign: 'right',
            direction: 'rtl',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {/* Calendar Icon */}
            <span
              aria-hidden="true"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <Icon name="calendar" size={18} />
            </span>
            <span
              style={{
                fontSize: '14px',
                fontWeight: value ? 600 : 400,
              }}
            >
              {formattedDate || placeholder}
            </span>
          </div>

          {/* Quick Clear or Picker Indicator */}
          {value && !disabled ? (
            <span
              role="button"
              tabIndex={0}
              aria-label="مسح التاريخ"
              onClick={(e) => {
                e.stopPropagation()
                onChange('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation()
                  onChange('')
                }
              }}
              style={{
                color: 'var(--muted)',
                fontSize: '14px',
                padding: '4px',
                cursor: 'pointer',
              }}
            >
              ✕
            </span>
          ) : (
            <span
              style={{
                color: 'var(--muted)',
                fontSize: '12px',
              }}
            >
              ▼
            </span>
          )}
        </button>

        {/* Hidden styled native input overlaid over trigger */}
        <input
          ref={inputRef}
          type="date"
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          tabIndex={-1}
          aria-hidden="true"
          className="date-field__native-input"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            pointerEvents: 'none',
            zIndex: -1,
          }}
        />
      </div>
    </div>
  )
}

export default DateField
