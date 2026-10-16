import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'subtle'
  compact?: boolean
  interactive?: boolean
  padding?: string
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  compact = false,
  interactive = false,
  padding,
  children,
  className = '',
  style,
  ...props
}) => {
  const classes = [
    'card',
    variant !== 'default' ? `card--${variant}` : '',
    compact ? 'card--compact' : '',
    interactive ? 'card--interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const mergedStyle = padding ? { padding, ...style } : style

  return (
    <div className={classes} style={mergedStyle} {...props}>
      {children}
    </div>
  )
}
