import React, { useRef, useEffect, useState } from 'react'
import './Choice.css'

export interface ChoiceOption<T extends string | number = string> {
  value: T
  label: string
  sublabel?: string
  description?: string
  icon?: React.ReactNode
  disabled?: boolean
}

export interface ChoiceProps<T extends string | number = string> {
  variant: 'segmented' | 'option-card'
  options: ChoiceOption<T>[]
  value: T | T[] | null | undefined
  onChange: (value: T) => void
  multiSelect?: boolean
  name?: string
  ariaLabel?: string
  layout?: 'auto' | 'horizontal' | 'stacked'
  className?: string
  style?: React.CSSProperties
}

/**
 * Unified Choice Component (Part 2)
 *
 * Variants:
 * 1. 'segmented': 2-5 short options in an equal-width grid.
 *    - Equal-width columns (grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); min-width: 0).
 *    - Text wraps up to 2 lines.
 *    - When labels cannot fit (or at font scale 1.3 on narrow screens), stacks as full-width rows.
 *    - Selected look: solid accent fill, dark high-contrast text (>4.5:1), NO check icon.
 * 2. 'option-card': list of longer options with description and radio/check indicator.
 */
export function Choice<T extends string | number = string>({
  variant,
  options,
  value,
  onChange,
  multiSelect = false,
  layout = 'auto',
  name,
  ariaLabel,
  className = '',
  style = {},
}: ChoiceProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldStack, setShouldStack] = useState(() => layout === 'stacked')

  // Measure if options need to stack into rows (e.g. at font-scale 1.3 or narrow width)
  useEffect(() => {
    if (variant !== 'segmented') return
    const el = containerRef.current
    if (!el) return

    function checkFit() {
      if (!el) return
      if (layout === 'stacked') {
        setShouldStack(true)
        return
      }
      if (layout === 'horizontal') {
        setShouldStack(false)
        return
      }

      const vpWidth = typeof window !== 'undefined' ? window.innerWidth : 360
      const rootFontSize =
        typeof window !== 'undefined'
          ? parseFloat(
              window.getComputedStyle(document.documentElement).fontSize,
            ) || 16
          : 16
      const fontScale = rootFontSize / 16
      const maxLen = Math.max(...options.map((o) => o.label.length), 0)
      const width = Math.min(el.clientWidth || vpWidth, vpWidth)

      const colWidth =
        (width - (options.length - 1) * 6 - 16) / Math.max(options.length, 1)
      const estimatedCharWidth = 7.5 * fontScale
      const estimatedTextWidth = (maxLen / 2) * estimatedCharWidth // allowing 2 lines

      if (
        (fontScale >= 1.2 && (options.length >= 3 || maxLen > 8)) ||
        (vpWidth <= 420 && options.length >= 3 && maxLen > 10) ||
        colWidth < estimatedTextWidth + 12 ||
        (width < 320 && (options.length > 2 || maxLen > 10))
      ) {
        setShouldStack(true)
      } else {
        setShouldStack(false)
      }
    }

    checkFit()
    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(checkFit)
        : null
    ro?.observe(el)
    window.addEventListener('resize', checkFit)
    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', checkFit)
    }
  }, [variant, options, layout])

  const isValueSelected = (val: T) => {
    if (multiSelect && Array.isArray(value)) {
      return value.includes(val)
    }
    return value === val
  }

  if (variant === 'segmented') {
    return (
      <div
        ref={containerRef}
        className={`choice-segmented ${shouldStack ? 'choice-segmented--stacked' : ''} ${className}`.trim()}
        role={multiSelect ? 'group' : 'radiogroup'}
        aria-label={ariaLabel || name}
        style={style}
      >
        {options.map((opt) => {
          const selected = isValueSelected(opt.value)
          return (
            <button
              key={String(opt.value)}
              type="button"
              role={multiSelect ? 'checkbox' : 'radio'}
              aria-checked={selected}
              aria-pressed={selected}
              disabled={opt.disabled}
              className={`choice-segmented__item ${selected ? 'choice-segmented__item--selected' : ''}`.trim()}
              onClick={() => onChange(opt.value)}
            >
              {opt.icon && (
                <span
                  className="choice-segmented__icon"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '4px',
                  }}
                  aria-hidden="true"
                >
                  {opt.icon}
                </span>
              )}
              <span className="choice-segmented__label">{opt.label}</span>
              {opt.sublabel && (
                <span className="choice-segmented__sublabel">
                  {opt.sublabel}
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  // Variant: option-card
  return (
    <div
      ref={containerRef}
      className={`choice-card-list ${className}`.trim()}
      role={multiSelect ? 'group' : 'radiogroup'}
      aria-label={ariaLabel || name}
      style={style}
    >
      {options.map((opt) => {
        const selected = isValueSelected(opt.value)
        return (
          <div
            key={String(opt.value)}
            role={multiSelect ? 'checkbox' : 'radio'}
            aria-checked={selected}
            tabIndex={opt.disabled ? -1 : 0}
            className={`choice-card ${selected ? 'choice-card--selected' : ''} ${opt.disabled ? 'choice-card--disabled' : ''}`.trim()}
            onClick={() => !opt.disabled && onChange(opt.value)}
            onKeyDown={(e) => {
              if (!opt.disabled && (e.key === ' ' || e.key === 'Enter')) {
                e.preventDefault()
                onChange(opt.value)
              }
            }}
          >
            <div className="choice-card__indicator" aria-hidden="true">
              {multiSelect ? (
                <span
                  className={`choice-card__checkbox ${selected ? 'choice-card__checkbox--checked' : ''}`}
                >
                  {selected && (
                    <svg
                      viewBox="0 0 16 16"
                      width="12"
                      height="12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
                    </svg>
                  )}
                </span>
              ) : (
                <span
                  className={`choice-card__radio ${selected ? 'choice-card__radio--checked' : ''}`}
                >
                  {selected && <span className="choice-card__radio-dot" />}
                </span>
              )}
            </div>

            <div className="choice-card__content">
              <div className="choice-card__label-row">
                {opt.icon && (
                  <span className="choice-card__icon">{opt.icon}</span>
                )}
                <span className="choice-card__label">{opt.label}</span>
                {opt.sublabel && (
                  <span className="choice-card__sublabel">{opt.sublabel}</span>
                )}
              </div>
              {opt.description && (
                <div className="choice-card__description">
                  {opt.description}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
