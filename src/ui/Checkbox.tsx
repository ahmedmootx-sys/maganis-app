import React from 'react'

export interface CheckboxProps {
  id?: string
  checked: boolean
  onChange: (checked: boolean) => void
  label?: React.ReactNode
  disabled?: boolean
  className?: string
  style?: React.CSSProperties
}

/**
 * Shared Checkbox component with Maganis accent color (Part 6.3)
 * Eliminates browser-default system blue checkboxes.
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
  style = {},
}) => {
  return (
    <label
      htmlFor={id}
      className={`maganis-checkbox-wrapper ${disabled ? 'maganis-checkbox-wrapper--disabled' : ''} ${className}`.trim()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        ...style,
      }}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        style={{
          width: '20px',
          height: '20px',
          accentColor: 'var(--color-accent, #ff6b00)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          borderRadius: '4px',
          margin: 0,
        }}
      />
      {label && (
        <span
          style={{
            fontSize: '13.5px',
            fontWeight: 600,
            color: disabled ? 'var(--color-text-dim)' : 'var(--color-text)',
            lineHeight: 1.4,
          }}
        >
          {label}
        </span>
      )}
    </label>
  )
}
