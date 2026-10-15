import React from 'react'
import { Icon } from './Icon.tsx'

export interface OptionItem {
  value: string
  title: string
  subtitle?: string
  disabled?: boolean
}

export interface OptionListProps {
  options: OptionItem[]
  value?: string
  values?: string[]
  multiple?: boolean
  onChange: (value: string | string[]) => void
  className?: string
}

export const OptionList: React.FC<OptionListProps> = ({
  options,
  value,
  values = [],
  multiple = false,
  onChange,
  className = '',
}) => {
  const handleSelect = (optVal: string) => {
    if (multiple) {
      const next = values.includes(optVal)
        ? values.filter((v) => v !== optVal)
        : [...values, optVal]
      onChange(next)
    } else {
      onChange(optVal)
    }
  }

  return (
    <div
      className={`option-list ${className}`.trim()}
      role={multiple ? 'group' : 'radiogroup'}
    >
      {options.map((opt) => {
        const isSelected = multiple
          ? values.includes(opt.value)
          : opt.value === value

        return (
          <button
            key={opt.value}
            type="button"
            role={multiple ? 'checkbox' : 'radio'}
            aria-checked={isSelected}
            disabled={opt.disabled}
            className={`option-row ${isSelected ? 'option-row--selected' : ''}`.trim()}
            onClick={() => handleSelect(opt.value)}
          >
            <div className="option-row__content">
              <div className="option-row__title">{opt.title}</div>
              {opt.subtitle && (
                <div className="option-row__subtitle">{opt.subtitle}</div>
              )}
            </div>
            <div className="option-row__indicator">
              {multiple ? (
                isSelected ? (
                  <Icon name="check-circle-2" size={20} />
                ) : (
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      border: '1.5px solid var(--color-divider)',
                    }}
                  />
                )
              ) : isSelected ? (
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: '5px solid var(--color-accent)',
                    backgroundColor: 'var(--color-surface)',
                    boxSizing: 'border-box',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: '1.5px solid var(--color-divider)',
                    boxSizing: 'border-box',
                  }}
                />
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
