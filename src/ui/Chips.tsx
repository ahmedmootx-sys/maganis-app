import React from 'react'
import { Icon, type IconName } from './Icon.tsx'

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  icon?: IconName
  removable?: boolean
  onRemove?: () => void
  children: React.ReactNode
}

export const Chip: React.FC<ChipProps> = ({
  active = false,
  icon,
  removable = false,
  onRemove,
  children,
  className = '',
  role,
  ...props
}) => {
  const isInteractive = Boolean(props.onClick || onRemove)
  const finalRole = role ?? (isInteractive ? (active !== undefined ? 'checkbox' : 'button') : 'button')

  return (
    <button
      type="button"
      role={finalRole}
      aria-checked={finalRole === 'radio' || finalRole === 'checkbox' ? active : undefined}
      aria-pressed={finalRole === 'button' && active ? true : undefined}
      className={`chip ${active ? 'chip--active' : ''} ${className}`.trim()}
      {...props}
    >
      {icon && <Icon name={icon} size={16} />}
      <span>{children}</span>
      {active && !removable && (
        <span
          className="chip__check"
          aria-hidden="true"
          style={{ display: 'inline-flex', marginInlineStart: '6px' }}
        >
          <Icon name="check" size={16} />
        </span>
      )}
      {removable && (
        <span
          role="button"
          tabIndex={0}
          aria-label="إزالة"
          onClick={(e) => {
            e.stopPropagation()
            onRemove?.()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation()
              onRemove?.()
            }
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            marginInlineStart: '4px',
            opacity: 0.7,
            cursor: 'pointer',
          }}
        >
          <Icon name="x" size={14} />
        </span>
      )}
    </button>
  )
}

export interface ChipRowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const ChipRow: React.FC<ChipRowProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`chip-row ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

export interface ToggleChipProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange'
> {
  checked: boolean
  onChange: (checked: boolean) => void
  children: React.ReactNode
}

export const ToggleChip: React.FC<ToggleChipProps> = ({
  checked,
  onChange,
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-pressed={checked}
      disabled={disabled}
      className={`chip ${checked ? 'chip--active' : ''} ${className}`.trim()}
      onClick={() => !disabled && onChange(!checked)}
      {...props}
    >
      <span>{children}</span>
      {checked && (
        <span
          className="chip__check"
          aria-hidden="true"
          style={{ display: 'inline-flex', marginInlineStart: '6px' }}
        >
          <Icon name="check" size={16} />
        </span>
      )}
    </button>
  )
}

export interface ChipsProps extends ChipProps {
  selected?: boolean
}

export const Chips: React.FC<ChipsProps> = ({
  selected,
  active,
  role,
  ...props
}) => {
  const isSel = selected ?? active
  const effRole = role ?? 'checkbox'
  return (
    <Chip
      active={isSel}
      role={effRole}
      aria-checked={isSel}
      {...props}
    />
  )
}
