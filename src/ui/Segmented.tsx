export interface SegmentedOption<T extends string | number> {
  value: T
  label?: string
  labelAr?: string
}

export interface SegmentedProps<T extends string | number> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
  name?: string
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  className = '',
  name,
}: SegmentedProps<T>) {
  return (
    <div
      className={`segmented ${className}`.trim()}
      role="radiogroup"
      aria-label={name}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value
        const displayLabel = opt.label || opt.labelAr || String(opt.value)
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={`segmented__item ${isSelected ? 'segmented__item--active' : ''}`.trim()}
            onClick={() => onChange(opt.value)}
          >
            {displayLabel}
          </button>
        )
      })}
    </div>
  )
}
