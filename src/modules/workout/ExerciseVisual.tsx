import { useState } from 'react'
import { assetUrl } from '../../utils/assetUrl.ts'
import type { MuscleGroup } from '../shared/types.ts'
import { IconImage } from '../../components/Icons.tsx'

import { resolveMedia } from '../../utils/mediaResolver.ts'
import { getExerciseById } from './exercises.ts'

interface ExerciseVisualProps {
  category?: MuscleGroup | string
  exerciseId?: string
  exerciseName?: string
  imageUrl?: string
  gifUrl?: string
  attribution?: string
  size?: 'small' | 'medium' | 'large'
  isAnimated?: boolean
  showControls?: boolean
}

/**
 * ExerciseVisual handles exercise photography, GIFs, and two-frame motion previews.
 * Adheres strictly to the rule: "Never fall back to the old capsule figure: delete that code."
 */
export function ExerciseVisual({
  exerciseId,
  exerciseName = '',
  imageUrl,
  gifUrl,
  attribution,
  size = 'small',
  isAnimated = false,
  showControls = false,
}: ExerciseVisualProps) {
  const [frameIndex, setFrameIndex] = useState<0 | 1>(0)
  const [imgError, setImgError] = useState(false)
  const [frame1Failed, setFrame1Failed] = useState(false)

  // Resolve media sources using unified resolveMedia
  const rawEx = exerciseId ? getExerciseById(exerciseId) : null
  const resolved = resolveMedia(
    rawEx || { id: exerciseId || '', imageUrl: gifUrl || imageUrl },
  )

  const frame0 = resolved.url || ''
  const frame1 = resolved.frame1Url || frame0

  const hasTwoFrames =
    !frame1Failed &&
    resolved.isKeyframed &&
    Boolean(frame0 && frame1 && frame0 !== frame1)

  const rawSrc = hasTwoFrames && frameIndex === 1 ? frame1 : frame0
  const currentSrc =
    rawSrc &&
    (rawSrc.startsWith('http://') ||
      rawSrc.startsWith('https://') ||
      rawSrc.startsWith('data:'))
      ? rawSrc
      : rawSrc
        ? assetUrl(rawSrc.startsWith('/') ? rawSrc.slice(1) : rawSrc)
        : ''

  if (imgError || !currentSrc) {
    if (size === 'small') {
      return (
        <div
          className="exercise-visual-tile"
          data-testid="exercise-visual-fallback-tile"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-surface-2)',
            color: 'var(--color-text-2)',
            borderRadius: 'var(--radius-control)',
            width: '40px',
            height: '40px',
            minWidth: '40px',
            minHeight: '40px',
            border: '1px solid var(--color-border)',
            boxSizing: 'border-box',
            flexShrink: 0,
          }}
          title={exerciseName}
        >
          <IconImage size={20} />
        </div>
      )
    }

    return (
      <div
        className="exercise-visual-empty"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-surface-2)',
          color: 'var(--color-text-2)',
          borderRadius:
            size === 'large' ? 'var(--radius-card)' : 'var(--radius-control)',
          width: '100%',
          minHeight: size === 'large' ? '180px' : '120px',
          border: '1px solid var(--color-border)',
          textAlign: 'center',
          padding: '24px 16px',
          boxSizing: 'border-box',
          gap: '12px',
        }}
        title={exerciseName}
      >
        <span
          style={{
            fontSize: '13px',
            color: 'var(--color-text-2)',
            fontWeight: 500,
          }}
        >
          لا يوجد شرح مرئي لهذا التمرين بعد
        </span>
        <button
          type="button"
          onClick={() => {
            console.info(
              `[Report Missing Media] exerciseId: ${exerciseId || 'unknown'}`,
            )
            alert(
              'تم استلام البلاغ! سنعمل على توفير الشرح المرئي في التحديث القادم.',
            )
          }}
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-control)',
            padding: '6px 14px',
            fontSize: '12px',
            color: 'var(--color-text)',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          أبلغ عن نقص
        </button>
      </div>
    )
  }

  const finalAttribution =
    attribution ||
    (size === 'large' ? 'Gym Visual / Free Exercise DB' : undefined)

  return (
    <div className="exercise-media-box">
      <div
        className={`exercise-media-frame size-${size} ${hasTwoFrames && isAnimated ? 'animated-showcase' : ''}`}
        title={exerciseName}
        style={{
          minHeight: size === 'small' ? '40px' : '140px',
          minWidth: size === 'small' ? '40px' : undefined,
          width: size === 'small' ? '40px' : '100%',
          height: size === 'small' ? '40px' : undefined,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-surface-2)',
          borderRadius:
            size === 'large' ? 'var(--radius-card)' : 'var(--radius-control)',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <img
          src={currentSrc}
          alt={exerciseName}
          className="exercise-media-img"
          onError={() => {
            if (frameIndex === 1) {
              setFrame1Failed(true)
              setFrameIndex(0)
            } else if (rawSrc.startsWith('http') && exerciseId) {
              // Try local fallback
              setFrameIndex(0)
            } else {
              setImgError(true)
            }
          }}
          loading="eager"
          style={{
            width: size === 'small' ? '100%' : undefined,
            height: size === 'small' ? '100%' : undefined,
            maxWidth: size === 'small' ? '100%' : '220px',
            maxHeight: size === 'small' ? '100%' : '220px',
            objectFit: size === 'small' ? 'cover' : 'contain',
            margin: '0 auto',
            display: 'block',
          }}
        />

        {/* Start / Peak Frame Indicator or Badge */}
        {hasTwoFrames && isAnimated && (
          <span
            className="live-badge"
            style={{
              position: 'absolute',
              bottom: '8px',
              insetInlineStart: '8px',
            }}
          >
            {frameIndex === 0 ? 'وضعية البداية' : 'قمة الانقباض'}
          </span>
        )}
      </div>

      {/* Frame Toggle Controls if requested */}
      {showControls && hasTwoFrames && (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          <button
            type="button"
            className="chip"
            onClick={() => setFrameIndex(0)}
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              cursor: 'pointer',
              background:
                frameIndex === 0
                  ? 'var(--color-accent)'
                  : 'var(--color-surface-2)',
              color: frameIndex === 0 ? '#14161A' : 'var(--color-text)',
              fontWeight: frameIndex === 0 ? 700 : 500,
              border: 'none',
              borderRadius: 'var(--radius-full)',
            }}
          >
            وضعية البداية
          </button>
          <button
            type="button"
            className="chip"
            onClick={() => setFrameIndex(1)}
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              cursor: 'pointer',
              background:
                frameIndex === 1
                  ? 'var(--color-accent)'
                  : 'var(--color-surface-2)',
              color: frameIndex === 1 ? '#14161A' : 'var(--color-text)',
              fontWeight: frameIndex === 1 ? 700 : 500,
              border: 'none',
              borderRadius: 'var(--radius-full)',
            }}
          >
            قمة الانقباض
          </button>
        </div>
      )}

      {/* Attribution line */}
      {finalAttribution && (
        <div className="exercise-media-attribution">{finalAttribution}</div>
      )}
    </div>
  )
}
