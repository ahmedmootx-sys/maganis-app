import React from 'react'

export interface ToggleProps {
  id?: string
  checked: boolean
  onChange: (checked: boolean) => void
  label?: React.ReactNode
  disabled?: boolean
  className?: string
  'aria-label'?: string
}

export const Toggle: React.FC<ToggleProps> = ({
  id,
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
}) => {
  return (
    <label
      htmlFor={id}
      className={`toggle-switch ${disabled ? 'toggle-switch--disabled' : ''} ${className}`.trim()}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      style={{
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.checked)}
        style={{
          position: 'absolute',
          opacity: 0,
          width: 0,
          height: 0,
          pointerEvents: 'none',
        }}
      />
      <div className="toggle-switch__track" aria-hidden="true">
        <div className="toggle-switch__thumb" />
      </div>
      {label && (
        <span
          style={{
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text)',
          }}
        >
          {label}
        </span>
      )}
    </label>
  )
}
