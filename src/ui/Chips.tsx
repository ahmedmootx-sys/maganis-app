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
  ...props
}) => {
  return (
    <button
      type="button"
      className={`chip ${active ? 'chip--active' : ''} ${className}`.trim()}
      {...props}
    >
      {icon && <Icon name={icon} size={16} />}
      <span>{children}</span>
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
      aria-pressed={checked}
      disabled={disabled}
      className={`chip ${checked ? 'chip--active' : ''} ${className}`.trim()}
      onClick={() => !disabled && onChange(!checked)}
      {...props}
    >
      {checked && <Icon name="check" size={16} />}
      <span>{children}</span>
    </button>
  )
}

export interface ChipsProps extends ChipProps {
  selected?: boolean
}

export const Chips: React.FC<ChipsProps> = ({ selected, active, ...props }) => {
  return <Chip active={selected ?? active} {...props} />
}
