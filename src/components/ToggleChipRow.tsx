import React from 'react'

export interface ToggleChipOption<T = string | number> {
  value: T
  label: string
  sublabel?: string
  disabled?: boolean
}

export interface ToggleChipRowProps<T = string | number> {
  id?: string
  label?: string
  options: ToggleChipOption<T>[]
  selectedValues: T[]
  onChange: (selected: T[]) => void
  disabled?: boolean
  className?: string
  style?: React.CSSProperties
  'aria-label'?: string
}

/**
 * ToggleChipRow Component
 * Multi-select chips row designed for choices such as weekdays.
 * Strict rule: All items are equal-width in EXACTLY ONE ROW, no orphan rows.
 */
export function ToggleChipRow<T = string | number>({
  id,
  label,
  options,
  selectedValues,
  onChange,
  disabled = false,
  className = '',
  style,
  'aria-label': ariaLabel,
}: ToggleChipRowProps<T>) {
  const handleToggle = (value: T, isOptionDisabled?: boolean) => {
    if (disabled || isOptionDisabled) return
    const isSelected = selectedValues.includes(value)
    if (isSelected) {
      onChange(selectedValues.filter((v) => v !== value))
    } else {
      onChange([...selectedValues, value])
    }
  }

  return (
    <div
      className={`maganis-field toggle-chip-row-field ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        width: '100%',
        ...style,
      }}
      data-testid={id ? `toggle-chip-row-${id}` : 'toggle-chip-row'}
    >
      {label && (
        <label
          htmlFor={id}
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
        </label>
      )}

      {/* Container with Equal Width Columns */}
      <div
        id={id}
        role="group"
        aria-label={ariaLabel || label || 'خيارات متعددة'}
        className="toggle-chip-row-container"
        style={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridAutoColumns: '1fr',
          gridTemplateColumns: `repeat(${options.length > 4 ? 7 : options.length}, minmax(0, 1fr))`,
          width: '100%',
          gap: '4px',
          boxSizing: 'border-box',
        }}
      >
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value)
          const isOptionDisabled = disabled || option.disabled

          return (
            <button
              key={String(option.value)}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              disabled={isOptionDisabled}
              onClick={() => handleToggle(option.value, option.disabled)}
              className={`toggle-chip-button ${isSelected ? 'selected' : ''}`}
              style={{
                minHeight: '44px',
                padding: '4px 2px',
                borderRadius: '8px',
                fontWeight: isSelected ? 700 : 600,
                fontSize: '11.5px',
                cursor: isOptionDisabled ? 'not-allowed' : 'pointer',
                border: isSelected
                  ? '2px solid var(--accent)'
                  : '1px solid var(--line)',
                background: isSelected ? 'var(--accent)' : 'var(--card-subtle)',
                color: isSelected ? '#ffffff' : 'var(--ink)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                transition: 'all 0.15s ease',
                opacity: isOptionDisabled ? 0.45 : 1,
                boxSizing: 'border-box',
                outline: 'none',
                minWidth: 0,
                width: '100%',
              }}
            >
              <span
                style={{
                  lineHeight: 1.15,
                  textAlign: 'center',
                  fontSize: '11px',
                  whiteSpace: 'normal',
                  wordBreak: 'keep-all',
                }}
              >
                {option.label}
              </span>
              {isSelected ? (
                <span
                  style={{
                    fontSize: '10px',
                    lineHeight: 1,
                    display: 'block',
                  }}
                >
                  ✓
                </span>
              ) : option.sublabel ? (
                <span
                  style={{
                    fontSize: '10px',
                    color: 'var(--muted)',
                    lineHeight: 1,
                  }}
                >
                  {option.sublabel}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ToggleChipRow
