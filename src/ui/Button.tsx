import React from 'react'
import { Icon, type IconName } from './Icon.tsx'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost' | 'subtle'
  size?: 'normal' | 'large' | 'small' | 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
  leadingIcon?: IconName
  trailingIcon?: IconName
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'normal',
  fullWidth = false,
  loading = false,
  leadingIcon,
  trailingIcon,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const normalizedVariant =
    variant === 'ghost'
      ? 'tertiary'
      : variant === 'subtle'
        ? 'secondary'
        : variant
  const normalizedSize =
    size === 'sm'
      ? 'small'
      : size === 'lg'
        ? 'large'
        : size === 'md'
          ? 'normal'
          : size

  const classes = [
    'btn',
    `btn--${normalizedVariant}`,
    normalizedSize === 'large'
      ? 'btn--large'
      : normalizedSize === 'small'
        ? 'btn--small'
        : '',
    fullWidth ? 'btn--full-width' : '',
    loading ? 'btn--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading ? 'true' : undefined}
      {...props}
    >
      {loading && (
        <span className="btn__spinner" aria-hidden="true">
          <Icon name="loader-2" size={20} className="maganis-spin" />
        </span>
      )}
      {leadingIcon && !loading && (
        <Icon name={leadingIcon} size={size === 'large' ? 24 : 20} />
      )}
      <span className="btn__label">{children}</span>
      {trailingIcon && !loading && (
        <Icon name={trailingIcon} size={size === 'large' ? 24 : 20} />
      )}
    </button>
  )
}

export interface IconButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  name: IconName
  'aria-label': string
  size?: number
  mirrorRtl?: boolean
  variant?: 'default' | 'surface' | 'accent' | 'danger'
}

export const IconButton: React.FC<IconButtonProps> = ({
  name,
  'aria-label': ariaLabel,
  size = 20,
  mirrorRtl,
  variant = 'default',
  className = '',
  disabled,
  ...props
}) => {
  const classes = [
    'icon-btn',
    variant !== 'default' ? `icon-btn--${variant}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      className={classes}
      aria-label={ariaLabel}
      disabled={disabled}
      {...props}
    >
      <Icon name={name} size={size} mirrorRtl={mirrorRtl} />
    </button>
  )
}
