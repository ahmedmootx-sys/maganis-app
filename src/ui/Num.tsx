import React from 'react'

export interface NumProps extends React.HTMLAttributes<HTMLElement> {
  value: React.ReactNode
  unit?: string
  sign?: boolean
  className?: string
}

/**
 * Num component renders numbers, signed values, or percentages in strict LTR isolation
 * via <bdi dir="ltr"> to prevent Arabic RTL punctuation/symbol flips (e.g. +10%, (0%), -500).
 */
export const Num: React.FC<NumProps> = ({
  value,
  unit,
  sign,
  className = '',
  ...props
}) => {
  let display = value
  if (sign && typeof value === 'number' && value > 0) {
    display = `+${value}`
  }

  return (
    <bdi dir="ltr" className={`num-val ${className}`.trim()} {...props}>
      {display}
      {unit ? `\u00A0${unit}` : ''}
    </bdi>
  )
}
