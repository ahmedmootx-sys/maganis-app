import { useState } from 'react'
import type { MuscleGroup } from '../shared/types.ts'
import { Icon, type IconName } from '../../ui/Icon.tsx'
import { resolveMedia } from '../../utils/mediaResolver.ts'
import { useEffectiveExercise } from './exerciseStore.ts'
import { SafeImage } from '../../components/SafeImage.tsx'

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

function getCategoryIcon(cat?: string): IconName {
  switch (cat) {
    case 'chest':
      return 'dumbbell'
    case 'back':
      return 'layers'
    case 'legs':
      return 'zap'
    case 'shoulders':
      return 'target'
    case 'arms':
      return 'dumbbell'
    case 'cardio':
      return 'activity'
    case 'core':
    case 'abs':
      return 'shield'
    default:
      return 'dumbbell'
  }
}

/**
 * ExerciseVisual handles list thumbnails and media previews.
 * - Uses useEffectiveExercise to guarantee user overrides appear everywhere.
 * - In lists (small): 40x40 icon tile, no text, no empty message.
 * - When media is absent: renders category line icon.
 * - When external media fails offline: shows category icon in lists, and on page shows "الصورة دي محتاجة إنترنت".
 */
export function ExerciseVisual({
  category,
  exerciseId,
  exerciseName = '',
  imageUrl,
  gifUrl,
  size = 'small',
}: ExerciseVisualProps) {
  const [frameIndex] = useState<0 | 1>(0)
  const [hasFailed, setHasFailed] = useState(false)

  const effectiveEx = useEffectiveExercise(exerciseId)
  const resolved = resolveMedia(
    effectiveEx || { id: exerciseId || '', imageUrl: gifUrl || imageUrl },
  )

  const frame0 = resolved.url || ''
  const frame1 = resolved.frame1Url || frame0
  const hasTwoFrames =
    resolved.isKeyframed && Boolean(frame0 && frame1 && frame0 !== frame1)
  const currentSrc = hasTwoFrames && frameIndex === 1 ? frame1 : frame0

  const catIconName = getCategoryIcon(category || effectiveEx?.category)
  const isExternal = currentSrc.startsWith('https://')

  const iconFallback = (
    <div
      style={{
        width: size === 'small' ? '40px' : '100%',
        height: size === 'small' ? '40px' : '140px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-surface-2)',
        color: 'var(--color-text-2)',
        borderRadius: 'var(--radius-control)',
        gap: '4px',
      }}
    >
      <Icon name={catIconName} size={size === 'small' ? 20 : 32} />
      {size !== 'small' && hasFailed && isExternal && (
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
          الصورة دي محتاجة إنترنت
        </span>
      )}
    </div>
  )

  if (!currentSrc) {
    if (size === 'small') {
      return iconFallback
    }
    return null
  }

  return (
    <div
      className={`exercise-media-frame size-${size}`}
      title={exerciseName}
      style={{
        width: size === 'small' ? '40px' : '100%',
        height: size === 'small' ? '40px' : '140px',
        minWidth: size === 'small' ? '40px' : undefined,
        minHeight: size === 'small' ? '40px' : undefined,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-surface-2)',
        borderRadius: 'var(--radius-control)',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <SafeImage
        src={currentSrc}
        fallback={iconFallback}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setHasFailed(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: size === 'small' ? 'cover' : 'contain',
          display: 'block',
        }}
      />
    </div>
  )
}
