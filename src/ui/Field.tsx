import React, { useId } from 'react'
import { Icon } from './Icon.tsx'

export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  helper?: string
  error?: string
  required?: boolean
  unitSuffix?: string
  unit?: string
  id?: string
  children?: React.ReactNode
  className?: string
}

export const Field: React.FC<FieldProps> = ({
  label,
  helper,
  error,
  required = false,
  unitSuffix,
  unit,
  id,
  children,
  className = '',
  value,
  onChange,
  type = 'text',
  placeholder,
  ...inputProps
}) => {
  const generatedId = useId()
  const fieldId = id || generatedId
  const helperId = helper ? `${fieldId}-helper` : undefined
  const errorId = error ? `${fieldId}-error` : undefined
  const effectiveUnit = unitSuffix || unit

  return (
    <div className={`field-group ${className}`.trim()}>
      <label htmlFor={fieldId} className="field-label">
        {label}
        {required && (
          <span className="field-label__required" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <div className="field-control-wrap">
        {children ? (
          React.isValidElement(children) ? (
            React.cloneElement(
              children as React.ReactElement<Record<string, unknown>>,
              {
                id: fieldId,
                'aria-describedby':
                  [helperId, errorId].filter(Boolean).join(' ') || undefined,
                'aria-invalid': error ? true : undefined,
                'aria-required': required ? true : undefined,
                className: [
                  (children.props as { className?: string }).className,
                  error ? 'field-input--error' : '',
                ]
                  .filter(Boolean)
                  .join(' '),
              },
            )
          ) : (
            children
          )
        ) : (
          <input
            id={fieldId}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            aria-describedby={
              [helperId, errorId].filter(Boolean).join(' ') || undefined
            }
            aria-invalid={error ? true : undefined}
            aria-required={required ? true : undefined}
            className={`field-input ${error ? 'field-input--error' : ''}`}
            {...inputProps}
          />
        )}

        {effectiveUnit && (
          <span className="field-unit-suffix" aria-hidden="true">
            <bdi>{effectiveUnit}</bdi>
          </span>
        )}
      </div>

      {helper && !error && (
        <div id={helperId} className="field-helper">
          {helper}
        </div>
      )}

      {error && (
        <div id={errorId} className="field-error" role="alert">
          <Icon name="alert-circle" size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
