import { useState, useEffect } from 'react'
import type { Exercise } from '../modules/shared/types.ts'
import { SafeImage } from './SafeImage.tsx'
import { assetUrl } from '../utils/assetUrl.ts'

export interface ExerciseMediaCardProps {
  exercise: Exercise | Partial<Exercise>
}

/**
 * ExerciseMediaCard (Part 1.4 Consolidation)
 * - GIF (Gym Visual): 180 CSS px square native size, centered in a card. Never stretched.
 * - Exact attribution: «© Gym visual — https://gymvisual.com/» under every GIF.
 * - Tap toggles GIF and still thumbnail; prefers-reduced-motion starts as still.
 * - No GIF and frames.display: simple «بداية / نهاية» toggle.
 * - No GIF and no frames: NO media block at all (no empty box, no text).
 * - SafeImage used for all image tags.
 */
export function ExerciseMediaCard({ exercise }: ExerciseMediaCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [frameStep, setFrameStep] = useState<'start' | 'peak'>('start')

  // Check prefers-reduced-motion
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function'
    ) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setIsPlaying(!mediaQuery.matches)
    } else {
      setIsPlaying(true)
    }
  }, [])

  if (!exercise) return null

  const key = exercise.key || exercise.id || ''
  const media = exercise.media
  const hasExactGif = Boolean(
    media?.gif?.display === true && media?.gif?.match === 'exact',
  )
  const hasExactFrames = Boolean(
    media?.frames?.display === true && media?.frames?.match === 'exact',
  )

  // Custom exercise uploaded image or data URI fallback (Part 1.7)
  const customMediaUrl =
    exercise.imageUrl || exercise.thumbnailUrl || exercise.image
  const hasCustomMedia = Boolean(
    customMediaUrl &&
    (customMediaUrl.startsWith('data:') ||
      customMediaUrl.startsWith('blob:') ||
      customMediaUrl.startsWith('media/')),
  )

  // If no GIF, no frames, and no custom media -> render NOTHING per Part 1.4
  if (!hasExactGif && !hasExactFrames && !hasCustomMedia) {
    return null
  }

  // 1. GIF View
  if (hasExactGif) {
    const gifSrc = assetUrl(`media/${key}/animation.gif`)
    const stillSrc = assetUrl(`media/${key}/start.jpg`)
    const currentSrc = isPlaying ? gifSrc : stillSrc

    return (
      <div
        className="card exercise-media-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-card, 16px)',
          border: '1px solid var(--color-divider)',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? 'إيقاف الحركة مؤقتاً' : 'تشغيل الحركة'}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '180px',
              height: '180px',
              minWidth: '180px',
              minHeight: '180px',
              maxWidth: '180px',
              maxHeight: '180px',
              borderRadius: '12px',
              overflow: 'hidden',
              background: '#0b0c0e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <SafeImage
              src={currentSrc}
              style={{
                width: '180px',
                height: '180px',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
          <div
            style={{
              marginTop: '8px',
              fontSize: '12px',
              color: 'var(--color-text-2)',
              fontWeight: 600,
            }}
          >
            {isPlaying ? 'انقر للإيقاف المؤقت' : 'انقر للتشغيل'}
          </div>
        </button>

        <div
          dir="ltr"
          style={{
            fontSize: '11px',
            color: 'var(--color-text-2)',
            marginTop: '8px',
            textAlign: 'center',
            opacity: 0.85,
          }}
        >
          © Gym visual — https://gymvisual.com/
        </div>
      </div>
    )
  }

  // 2. Frames View (No GIF and frames.display exact)
  if (hasExactFrames) {
    const startSrc = assetUrl(`media/${key}/start.jpg`)
    const peakSrc = assetUrl(`media/${key}/peak.jpg`)
    const currentFrame = frameStep === 'start' ? startSrc : peakSrc

    return (
      <div
        className="card exercise-media-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-card, 16px)',
          border: '1px solid var(--color-divider)',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: '180px',
            height: '180px',
            minWidth: '180px',
            minHeight: '180px',
            maxWidth: '180px',
            maxHeight: '180px',
            borderRadius: '12px',
            overflow: 'hidden',
            background: '#0b0c0e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <SafeImage
            src={currentFrame}
            style={{
              width: '180px',
              height: '180px',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>

        {/* بداية / نهاية Toggle */}
        <div
          style={{
            display: 'inline-flex',
            marginTop: '12px',
            background: 'var(--color-surface-2)',
            padding: '3px',
            borderRadius: 'var(--radius-control)',
            gap: '4px',
          }}
        >
          <button
            type="button"
            className={
              frameStep === 'start'
                ? 'btn btn--primary btn--small'
                : 'btn btn--ghost btn--small'
            }
            onClick={() => setFrameStep('start')}
            style={{
              height: '32px',
              padding: '0 12px',
              fontSize: '12px',
              fontWeight: frameStep === 'start' ? 700 : 500,
            }}
          >
            بداية
          </button>
          <button
            type="button"
            className={
              frameStep === 'peak'
                ? 'btn btn--primary btn--small'
                : 'btn btn--ghost btn--small'
            }
            onClick={() => setFrameStep('peak')}
            style={{
              height: '32px',
              padding: '0 12px',
              fontSize: '12px',
              fontWeight: frameStep === 'peak' ? 700 : 500,
            }}
          >
            نهاية
          </button>
        </div>
      </div>
    )
  }

  // 3. User Custom Media (IndexedDB / Data URI)
  if (hasCustomMedia && customMediaUrl) {
    return (
      <div
        className="card exercise-media-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-card, 16px)',
          border: '1px solid var(--color-divider)',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: '180px',
            height: '180px',
            borderRadius: '12px',
            overflow: 'hidden',
            background: '#0b0c0e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SafeImage
            src={customMediaUrl}
            style={{
              width: '180px',
              height: '180px',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
      </div>
    )
  }

  return null
}
