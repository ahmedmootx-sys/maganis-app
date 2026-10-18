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
  const resolved = resolveMedia(rawEx || { id: exerciseId || '', imageUrl: gifUrl || imageUrl })

  let frame0 = resolved.url || gifUrl || imageUrl || ''
  let frame1 = resolved.frame1Url || frame0

  if (frame0 && frame0.includes('_0.jpg')) {
    frame1 = frame0.replace('_0.jpg', '_1.jpg')
  } else if (frame0.endsWith('/0.jpg')) {
    frame1 = frame0.replace(/\/0\.jpg$/i, '/1.jpg')
  }

  const hasTwoFrames =
    !frame1Failed && Boolean(frame0 && frame1 && frame0 !== frame1)

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
    return (
      <div
        className={`exercise-visual-circle white-theme size-${size}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-surface-2)',
          color: 'var(--color-text-2)',
          borderRadius:
            size === 'large' ? 'var(--radius-card)' : 'var(--radius-control)',
          width: size === 'small' ? '48px' : '100%',
          height:
            size === 'small'
              ? '48px'
              : size === 'medium'
                ? '120px'
                : '180px',
          minWidth: size === 'small' ? '48px' : undefined,
          minHeight: size === 'small' ? '48px' : undefined,
          border: '1px solid var(--color-border)',
          textAlign: 'center',
          padding: '2px',
          boxSizing: 'border-box',
          gap: '2px',
        }}
        title={exerciseName}
      >
        <IconImage
          size={size === 'large' ? 32 : size === 'medium' ? 22 : 16}
        />
        <span
          style={{
            fontSize: size === 'small' ? '8.5px' : '12px',
            color: 'var(--color-text-2)',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          لا توجد صورة
        </span>
      </div>
    )
  }

  const finalAttribution =
    attribution || (size === 'large' ? 'Gym Visual / Free Exercise DB' : undefined)

  return (
    <div className="exercise-media-box">
      <div
        className={`exercise-media-frame size-${size} ${isAnimated ? 'animated-showcase' : ''}`}
        title={exerciseName}
        style={{
          minHeight: size === 'small' ? '48px' : '140px',
          minWidth: size === 'small' ? '48px' : undefined,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-surface-2)',
          borderRadius:
            size === 'large' ? 'var(--radius-card)' : 'var(--radius-control)',
          overflow: 'hidden',
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
