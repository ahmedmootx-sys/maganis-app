import React, { useState, useMemo } from 'react'
import { Sheet } from './Sheet.tsx'
import { Icon } from './Icon.tsx'
import { Button } from './Button.tsx'

export interface SelectOption {
  value: string
  label?: string
  labelAr?: string
  labelEn?: string
  secondary?: string
  description?: string
  disabled?: boolean
}

export interface SelectProps {
  id?: string
  label?: string
  sheetTitle?: string
  options: (SelectOption | string)[]
  value?: string
  values?: string[]
  multiple?: boolean
  onChange: (value: any) => void
  placeholder?: string
  searchable?: boolean
  disabled?: boolean
  className?: string
}

export const Select: React.FC<SelectProps> = ({
  id,
  label,
  sheetTitle,
  options,
  value,
  values = [],
  multiple = false,
  onChange,
  placeholder = 'اختر خياراً...',
  searchable = true,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [tempValues, setTempValues] = useState<string[]>(values)

  const normalizedOptions: SelectOption[] = useMemo(
    () =>
      options.map((o) =>
        typeof o === 'string'
          ? { value: o, label: o }
          : { ...o, secondary: o.secondary || o.labelEn || o.description },
      ),
    [options],
  )

  const getOptLabel = (o: SelectOption) => o.label || o.labelAr || o.value

  const selectedLabels = useMemo(() => {
    if (multiple) {
      const activeSet = new Set(values)
      return normalizedOptions
        .filter((o) => activeSet.has(o.value))
        .map(getOptLabel)
        .join('، ')
    }
    const found = normalizedOptions.find((o) => o.value === value)
    return found ? getOptLabel(found) : ''
  }, [multiple, normalizedOptions, value, values])

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return normalizedOptions
    const q = search.toLowerCase()
    return normalizedOptions.filter(
      (o) =>
        getOptLabel(o).toLowerCase().includes(q) ||
        (o.secondary && o.secondary.toLowerCase().includes(q)),
    )
  }, [normalizedOptions, search])

  const handleOpen = () => {
    if (disabled) return
    if (multiple) {
      setTempValues(values)
    }
    setSearch('')
    setIsOpen(true)
  }

  const handleSelectOption = (optValue: string) => {
    if (multiple) {
      setTempValues((prev) =>
        prev.includes(optValue)
          ? prev.filter((v) => v !== optValue)
          : [...prev, optValue],
      )
    } else {
      onChange(optValue)
      setIsOpen(false)
    }
  }

  const handleApplyMulti = () => {
    onChange(tempValues)
    setIsOpen(false)
  }

  return (
    <>
      <button
        type="button"
        id={id}
        className={`field-input ${className}`.trim()}
        onClick={handleOpen}
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
            color: selectedLabels ? 'var(--color-text)' : 'var(--color-text-2)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {selectedLabels || placeholder}
        </span>
        <Icon
          name="chevron-down"
          size={18}
          style={{ color: 'var(--color-text-2)' }}
        />
      </button>

      <Sheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={sheetTitle || label || 'اختر من القائمة'}
        footer={
          multiple ? (
            <Button variant="primary" fullWidth onClick={handleApplyMulti}>
              تأكيد الاختيار
            </Button>
          ) : undefined
        }
      >
        {searchable && options.length > 5 && (
          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              className="field-input"
              placeholder="ابحث في الخيارات..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        )}

        <div className="option-list" role="listbox">
          {filteredOptions.length === 0 ? (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                color: 'var(--color-text-2)',
                fontSize: '14px',
              }}
            >
              لا توجد نتائج مطابقة
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = multiple
                ? tempValues.includes(opt.value)
                : opt.value === value

              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={opt.disabled}
                  className={`option-row ${isSelected ? 'option-row--selected' : ''}`.trim()}
                  onClick={() => handleSelectOption(opt.value)}
                >
                  <div className="option-row__content">
                    <div className="option-row__title">{getOptLabel(opt)}</div>
                    {opt.secondary && (
                      <div className="option-row__subtitle">
                        {opt.secondary}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <div className="option-row__indicator">
                      <Icon name="check" size={20} />
                    </div>
                  )}
                </button>
              )
            })
          )}
        </div>
      </Sheet>
    </>
  )
}
