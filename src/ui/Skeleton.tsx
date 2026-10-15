import React from 'react'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number
  height?: string | number
  radius?: 'control' | 'card' | 'full' | number
  variant?: 'rect' | 'circle' | 'text'
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  radius = 'control',
  variant = 'rect',
  className = '',
  style,
  ...props
}) => {
  const getRadius = () => {
    if (variant === 'circle') return '50%'
    if (typeof radius === 'number') return `${radius}px`
    if (radius === 'card') return 'var(--radius-card)'
    if (radius === 'full') return 'var(--radius-full)'
    return 'var(--radius-control)'
  }

  return (
    <div
      className={`skeleton ${className}`.trim()}
      aria-hidden="true"
      style={{
        width: width ?? (variant === 'text' ? '100%' : '100%'),
        height: height ?? (variant === 'text' ? '16px' : '48px'),
        borderRadius: getRadius(),
        ...style,
      }}
      {...props}
    />
  )
}
