import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'subtle'
  compact?: boolean
  interactive?: boolean
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  compact = false,
  interactive = false,
  children,
  className = '',
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

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}
