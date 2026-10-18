import React from 'react'

export interface RatioProps extends React.HTMLAttributes<HTMLElement> {
  current: React.ReactNode
  target: React.ReactNode
  unit?: string
  className?: string
}

/**
 * Ratio component renders consumed/target pairs (e.g. 152 / 2775, 20 / 135)
 * inside <bdi dir="ltr"> to ensure identical, consistent ordering across all screens in RTL.
 */
export const Ratio: React.FC<RatioProps> = ({
  current,
  target,
  unit,
  className = '',
  ...props
}) => {
  return (
    <bdi dir="ltr" className={`ratio-val ${className}`.trim()} {...props}>
      {current} / {target}
      {unit ? `\u00A0${unit}` : ''}
    </bdi>
  )
}
