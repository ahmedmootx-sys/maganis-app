import { useState } from 'react'
import { assetUrl } from '../../utils/assetUrl.ts'
import type { MuscleGroup } from '../shared/types.ts'
import { IconDumbbell } from '../../components/Icons.tsx'

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

  // Resolve media sources
  const activeMedia = gifUrl || imageUrl

  let frame0 = activeMedia
  let frame1 = activeMedia

  if (activeMedia) {
    if (activeMedia.endsWith('/0.jpg')) {
      frame1 = activeMedia.replace(/\/0\.jpg$/i, '/1.jpg')
    } else if (activeMedia.endsWith('_0.jpg')) {
      frame1 = activeMedia.replace(/_0\.jpg$/i, '_1.jpg')
    }
  } else if (exerciseId) {
    frame0 = `exercises/${exerciseId}_0.jpg`
    frame1 = `exercises/${exerciseId}_1.jpg`
  }

  const hasTwoFrames = frame0 && frame1 && frame0 !== frame1

  const rawSrc = hasTwoFrames && frameIndex === 1 ? frame1 : frame0
  const currentSrc =
    rawSrc &&
    (rawSrc.startsWith('http://') ||
      rawSrc.startsWith('https://') ||
      rawSrc.startsWith('data:') ||
      rawSrc.startsWith('/'))
      ? rawSrc
      : rawSrc
        ? assetUrl(rawSrc)
        : ''

  if (imgError || !currentSrc) {
    return (
      <div
        className={`exercise-visual-circle white-theme size-${size}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-surface-2)',
          color: 'var(--color-text-2)',
          borderRadius:
            size === 'large' ? 'var(--radius-card)' : 'var(--radius-control)',
        }}
        title={exerciseName}
      >
        <IconDumbbell size={size === 'large' ? 36 : 22} />
      </div>
    )
  }

  return (
    <div className="exercise-media-box">
      <div
        className={`exercise-media-frame size-${size} ${isAnimated ? 'animated-showcase' : ''}`}
        title={exerciseName}
      >
        <img
          src={currentSrc}
          alt={exerciseName}
          className="exercise-media-img"
          onError={() => setImgError(true)}
          loading="lazy"
          style={{
            maxWidth: '240px',
            maxHeight: '240px',
            objectFit: 'contain',
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
      {attribution && (
        <div className="exercise-media-attribution">{attribution}</div>
      )}
    </div>
  )
}
