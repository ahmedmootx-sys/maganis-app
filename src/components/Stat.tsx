import type { ReactNode } from 'react'

export interface StatProps {
  label: ReactNode
  value: ReactNode
  secondary?: ReactNode
  className?: string
}

export function Stat({ label, value, secondary, className = '' }: StatProps) {
  return (
    <div className={`maganis-stat ${className}`}>
      <div className="maganis-stat__value">{value}</div>
      <div className="maganis-stat__label">{label}</div>
      {secondary && <div className="maganis-stat__secondary">{secondary}</div>}
    </div>
  )
}
