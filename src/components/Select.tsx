import React, { useState, useEffect, useMemo, useId, useRef } from 'react'
import { navigationHistory } from '../utils/navigationHistory'
import { Icon } from '../ui/Icon.tsx'

export interface SelectOption {
  value: string
  labelAr: string
  labelEn?: string
  label?: string
  disabled?: boolean
  description?: string
}

export interface SelectProps {
  id?: string
  name?: string
  value: string
  onChange: (value: string) => void
  options: (SelectOption | string)[]
  placeholder?: string
  label?: string
  disabled?: boolean
  className?: string
  style?: React.CSSProperties
  sheetTitle?: string
  required?: boolean
  'aria-label'?: string
}

/**
 * Remove any emojis from a string to keep the UI clean and professional.
 */
export function stripEmojis(str: string): string {
  if (!str) return ''
  return str.replace(/\p{Extended_Pictographic}/gu, '').trim()
}

/**
 * Parse strings like "صدر (Chest)" or "صدر - Chest" into separate bidi-safe labels.
 * Never displays "Arabic (English)" concatenated in a single string.
 */
export function parseBidiLabels(
  rawLabel: string,
  rawLabelEn?: string,
): { labelAr: string; labelEn?: string } {
  const cleaned = stripEmojis(rawLabel)
  if (rawLabelEn) {
    return {
      labelAr: cleaned,
      labelEn: stripEmojis(rawLabelEn),
    }
  }

  // Check parentheses pattern: e.g. "صدر (Chest)"
  const parenMatch = cleaned.match(/^([^(]+?)\s*\(([^)]+)\)\s*$/)
  if (parenMatch) {
    const p1 = parenMatch[1].trim()
    const p2 = parenMatch[2].trim()
    if (/[a-zA-Z]/.test(p2)) {
      return {
        labelAr: p1,
        labelEn: p2,
      }
    }
  }

  // Check dash pattern: e.g. "صدر - Chest"
  const dashMatch = cleaned.match(/^([^-]+?)\s*-\s*([^-]+)$/)
  if (dashMatch) {
    const p1 = dashMatch[1].trim()
    const p2 = dashMatch[2].trim()
    if (/[a-zA-Z]/.test(p2) && !/[a-zA-Z]/.test(p1)) {
      return {
        labelAr: p1,
        labelEn: p2,
      }
    }
  }

  return { labelAr: cleaned }
}

export function normalizeOption(opt: SelectOption | string): SelectOption {
  if (typeof opt === 'string') {
    const { labelAr, labelEn } = parseBidiLabels(opt)
    return {
      value: opt,
      labelAr,
      labelEn,
    }
  }

  const rawLabel = opt.labelAr || opt.label || opt.value
  const { labelAr, labelEn } = parseBidiLabels(rawLabel, opt.labelEn)

  return {
    value: opt.value,
    labelAr,
    labelEn: labelEn || (opt.labelEn ? stripEmojis(opt.labelEn) : undefined),
    disabled: opt.disabled,
    description: opt.description ? stripEmojis(opt.description) : undefined,
  }
}

/**
 * Select Component
 * Replaces EVERY native <select> with a Field-styled 48px trigger
 * that shows the selected label on up to 2 lines (never clipped)
 * and opens a mobile bottom Sheet with radio rows, full wrapping labels,
 * real-time search field when options > 8, emoji-free, and bidi-safe.
 */
export const Select: React.FC<SelectProps> = ({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = 'اختر...',
  label,
  disabled = false,
  className = '',
  style,
  sheetTitle,
  required,
  'aria-label': ariaLabel,
}) => {
  const generatedId = useId()
  const selectId = id || generatedId
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Normalize all options
  const normalizedOptions = useMemo(() => {
    return options.map(normalizeOption)
  }, [options])

  // Selected option
  const selectedOption = useMemo(() => {
    return normalizedOptions.find((opt) => opt.value === value)
  }, [normalizedOptions, value])

  // Filter options when searching
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions
    const q = searchQuery.trim().toLowerCase()
    return normalizedOptions.filter((opt) => {
      const arMatch = opt.labelAr.toLowerCase().includes(q)
      const enMatch = opt.labelEn?.toLowerCase().includes(q)
      const descMatch = opt.description?.toLowerCase().includes(q)
      const valMatch = opt.value.toLowerCase().includes(q)
      return arMatch || enMatch || descMatch || valMatch
    })
  }, [normalizedOptions, searchQuery])

  // Mobile Back Navigation Integration
  useEffect(() => {
    if (!isOpen) return
    const unregister = navigationHistory.push(
      `select-sheet-${selectId}`,
      () => {
        setIsOpen(false)
      },
    )
    return () => {
      unregister()
    }
  }, [isOpen, selectId])

  // Focus search input on open if search exists
  useEffect(() => {
    if (isOpen && normalizedOptions.length > 8) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus()
      }, 80)
      return () => clearTimeout(timer)
    }
  }, [isOpen, normalizedOptions.length])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleSelect = (val: string, isDisabled?: boolean) => {
    if (isDisabled) return
    onChange(val)
    setIsOpen(false)
    setSearchQuery('')
  }

  const triggerLabel = selectedOption ? (
    <div className="select-trigger-label-container">
      <span className="select-trigger-label-ar">{selectedOption.labelAr}</span>
      {selectedOption.labelEn && (
        <span className="select-trigger-label-en" dir="ltr">
          {selectedOption.labelEn}
        </span>
      )}
    </div>
  ) : (
    <span className="select-trigger-placeholder">{placeholder}</span>
  )

  return (
    <div
      className={`maganis-field select-field ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        width: '100%',
        ...style,
      }}
      data-testid={`select-field-${selectId}`}
    >
      {label && (
        <label
          htmlFor={selectId}
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
          {stripEmojis(label)}
          {required && (
            <span style={{ color: 'var(--danger)', marginInlineStart: '4px' }}>
              *
            </span>
          )}
        </label>
      )}

      {/* 48px Field Trigger */}
      <button
        type="button"
        id={selectId}
        name={name}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || label || placeholder}
        aria-required={required}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setSearchQuery('')
            setIsOpen(true)
          }
        }}
        className={`select-trigger ${disabled ? 'disabled' : ''} ${selectedOption ? 'has-value' : 'placeholder'}`}
        style={{
          width: '100%',
          height: '48px',
          minHeight: '48px',
          maxHeight: '48px',
          padding: '0 14px',
          borderRadius: '10px',
          border: '1px solid var(--input-border, var(--line))',
          background: 'var(--input-bg, var(--card-bg))',
          color: 'var(--ink)',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          boxSizing: 'border-box',
          textAlign: 'right',
          direction: 'rtl',
        }}
      >
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.3,
            textAlign: 'right',
          }}
        >
          {triggerLabel}
        </div>

        {/* Chevron Icon */}
        <span
          className="select-chevron"
          aria-hidden="true"
          style={{
            color: 'var(--muted)',
            display: 'inline-flex',
            alignItems: 'center',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          <Icon name="chevron-down" size={14} />
        </span>
      </button>

      {/* Bottom Sheet Modal */}
      {isOpen && (
        <div
          className="select-sheet-backdrop"
          role="presentation"
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            animation: 'fadeInBackdrop 0.2s ease-out',
          }}
        >
          <div
            className="select-sheet-container"
            role="dialog"
            aria-modal="true"
            aria-label={sheetTitle || label || 'قائمة الخيارات'}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '600px',
              maxHeight: '82vh',
              background: 'var(--card-bg)',
              color: 'var(--ink)',
              borderRadius: '20px 20px 0 0',
              boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              padding:
                '16px 16px calc(24px + env(safe-area-inset-bottom, 0px))',
              animation: 'slideUpSheet 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              direction: 'rtl',
              boxSizing: 'border-box',
            }}
          >
            {/* Grab Handle */}
            <div
              style={{
                width: '40px',
                height: '4px',
                borderRadius: '999px',
                background: 'var(--line)',
                margin: '0 auto 12px',
              }}
            />

            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '12px',
                borderBottom: '1px solid var(--line)',
                marginBottom: '12px',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--ink)',
                }}
              >
                {sheetTitle || label || 'اختر من القائمة'}
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="إغلاق"
                style={{
                  background: 'var(--card-subtle)',
                  border: '1px solid var(--line)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--ink)',
                }}
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            {/* Search Field when > 8 options */}
            {normalizedOptions.length > 8 && (
              <div
                className="select-search-field-row"
                style={{
                  marginBottom: '12px',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                  }}
                >
                  <input
                    ref={searchInputRef}
                    type="search"
                    className="select-search-input"
                    placeholder="بحث في الخيارات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--input-border, var(--line))',
                      background: 'var(--input-bg, var(--card-subtle))',
                      color: 'var(--ink)',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      textAlign: 'right',
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="مسح البحث"
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      <Icon name="x" size={16} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Radio Rows Options List */}
            <div
              role="listbox"
              aria-label={label || sheetTitle || 'خيارات'}
              className="select-options-list"
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                paddingRight: '2px',
                maxHeight: '55vh',
              }}
            >
              {filteredOptions.length === 0 ? (
                <div
                  style={{
                    padding: '24px 16px',
                    textAlign: 'center',
                    color: 'var(--muted)',
                    fontSize: '14px',
                  }}
                >
                  لا توجد نتائج مطابقة
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={opt.disabled}
                      onClick={() => handleSelect(opt.value, opt.disabled)}
                      className={`select-radio-row ${isSelected ? 'selected' : ''}`}
                      style={{
                        width: '100%',
                        minHeight: '48px',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: isSelected
                          ? '2px solid var(--accent)'
                          : '1px solid var(--line)',
                        background: isSelected
                          ? 'var(--accent-soft)'
                          : 'var(--card-subtle)',
                        color: 'var(--ink)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        cursor: opt.disabled ? 'not-allowed' : 'pointer',
                        opacity: opt.disabled ? 0.45 : 1,
                        textAlign: 'right',
                        transition: 'all 0.15s ease',
                        boxSizing: 'border-box',
                      }}
                    >
                      {/* Option Text Content */}
                      <div
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          textAlign: 'right',
                        }}
                      >
                        <span
                          className="select-option-ar"
                          style={{
                            fontSize: '14px',
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? 'var(--accent)' : 'var(--ink)',
                            lineHeight: 1.35,
                          }}
                        >
                          {opt.labelAr}
                        </span>

                        {opt.labelEn && (
                          <span
                            className="select-option-en"
                            dir="ltr"
                            style={{
                              fontSize: '12px',
                              color: 'var(--muted)',
                              textAlign: 'right',
                              fontWeight: 400,
                            }}
                          >
                            {opt.labelEn}
                          </span>
                        )}

                        {opt.description && (
                          <span
                            className="select-option-desc"
                            style={{
                              fontSize: '11.5px',
                              color: 'var(--muted)',
                              lineHeight: 1.3,
                            }}
                          >
                            {opt.description}
                          </span>
                        )}
                      </div>

                      {/* Radio Circle Indicator */}
                      <div
                        aria-hidden="true"
                        style={{
                          width: '20px',
                          height: '20px',
                          minWidth: '20px',
                          borderRadius: '50%',
                          border: isSelected
                            ? '6px solid var(--accent)'
                            : '2px solid var(--line)',
                          background: isSelected ? '#ffffff' : 'transparent',
                          boxSizing: 'border-box',
                          transition: 'all 0.15s ease',
                        }}
                      />
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Select
