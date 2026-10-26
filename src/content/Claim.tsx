import React from 'react'
import { CLAIMS, type ClaimStatus, type ReferenceKind } from './claims.ts'

export type { ClaimStatus, ReferenceKind }

export interface ClaimProps {
  id?: string
  status?: ClaimStatus
  text?: string
  sourceText?: string
  referenceKind?: ReferenceKind
  params?: Record<string, string | number>
  showSource?: boolean
  className?: string
  style?: React.CSSProperties
  as?: 'p' | 'div' | 'span'
  children?: React.ReactNode
}

/**
 * R23 / R1 Claim Component:
 * - Hides unverified claims completely (returns null).
 * - Renders sourced and coach_authored claims.
 * - Sourced claims display "المصدر: …" line if source_text is present.
 * - Distinguishes textbook references ('general' -> «مرجع عام») from specific studies ('specific' -> «دراسة محددة»).
 */
export function Claim({
  id,
  status,
  text,
  sourceText,
  referenceKind,
  params = {},
  showSource = true,
  className = '',
  style = {},
  as = 'div',
  children,
}: ClaimProps) {
  const claim = id ? CLAIMS[id] : null
  const effectiveStatus: ClaimStatus =
    status ??
    claim?.status ??
    (children || text ? 'coach_authored' : 'unverified')

  // Hide unverified claims until coach provides verified/sourced text
  if (effectiveStatus === 'unverified') {
    return null
  }

  const effectiveSource = sourceText ?? claim?.source_text
  const effectiveRefKind =
    referenceKind ??
    claim?.reference_kind ??
    (effectiveSource &&
    (effectiveSource.toLowerCase().includes('gray') ||
      effectiveSource.toLowerCase().includes('kendall'))
      ? 'general'
      : 'specific')

  let contentNode: React.ReactNode = children

  if (!contentNode) {
    let interpolatedText = text ?? claim?.text_ar ?? ''
    for (const [key, val] of Object.entries(params)) {
      interpolatedText = interpolatedText.replaceAll(`{${key}}`, String(val))
    }
    contentNode = interpolatedText
  }

  const Tag = as

  return (
    <Tag
      data-claim-id={id}
      data-claim-status={effectiveStatus}
      className={`claim-block claim--${effectiveStatus} ${className}`.trim()}
      style={style}
    >
      <span className="claim-text">{contentNode}</span>
      {effectiveSource && showSource && (
        <div
          className="claim-source"
          style={{
            fontSize: '12px',
            color: 'var(--color-text-2, #8e95a2)',
            marginTop: '4px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'wrap',
          }}
        >
          <span>المصدر:</span>
          <bdi dir="ltr">{effectiveSource}</bdi>
          {effectiveRefKind === 'general' ? (
            <span
              style={{
                fontSize: '10.5px',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full, 9999px)',
                background: 'var(--color-surface-2, rgba(255,255,255,0.08))',
                color: 'var(--color-text-2, #8e95a2)',
              }}
            >
              مرجع عام
            </span>
          ) : (
            <span
              style={{
                fontSize: '10.5px',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full, 9999px)',
                background: 'var(--color-surface-2, rgba(255,255,255,0.08))',
                color: 'var(--color-text-2, #8e95a2)',
              }}
            >
              دراسة محددة
            </span>
          )}
        </div>
      )}
    </Tag>
  )
}
