import React from 'react'
import { CLAIMS } from './claims.ts'

export interface ClaimProps {
  id: string
  params?: Record<string, string | number>
  showSource?: boolean
  className?: string
  style?: React.CSSProperties
  as?: 'p' | 'div' | 'span'
}

/**
 * R23 Claim Component:
 * - Hides unverified claims completely (returns null).
 * - Renders sourced and coach_authored claims.
 * - Sourced claims display "المصدر: …" line if source_text is present.
 */
export function Claim({
  id,
  params = {},
  showSource = true,
  className = '',
  style = {},
  as = 'div',
}: ClaimProps) {
  const claim = CLAIMS[id]
  if (!claim) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Claim] Unknown claim id "${id}"`)
    }
    return null
  }

  // Hide unverified claims until coach provides sourced text
  if (claim.status === 'unverified') {
    return null
  }

  // Interpolate placeholders: {key}
  let interpolatedText = claim.text_ar
  for (const [key, val] of Object.entries(params)) {
    interpolatedText = interpolatedText.replaceAll(`{${key}}`, String(val))
  }

  const Tag = as

  return (
    <Tag
      data-claim-id={id}
      className={`claim-block claim--${claim.status} ${className}`.trim()}
      style={style}
    >
      <span className="claim-text">{interpolatedText}</span>
      {claim.status === 'sourced' && claim.source_text && showSource && (
        <div
          className="claim-source"
          style={{
            fontSize: '12px',
            color: 'var(--color-text-2, #8e95a2)',
            marginTop: '4px',
            fontWeight: 500,
          }}
        >
          المصدر: <bdi dir="ltr">{claim.source_text}</bdi>
        </div>
      )}
    </Tag>
  )
}
