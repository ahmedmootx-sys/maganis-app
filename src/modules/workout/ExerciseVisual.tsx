import { useState } from 'react'
import type { MuscleGroup } from '../shared/types.ts'
import { Icon, type IconName } from '../../ui/Icon.tsx'
import { resolveMedia } from '../../utils/mediaResolver.ts'
import { getExerciseById } from './exercises.ts'
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
 * - In lists (small): 40x40 icon tile, no text, no empty message.
 * - When media is absent: renders category line icon (never picture icon).
 * - SafeImage used for all images.
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

  const rawEx = exerciseId ? getExerciseById(exerciseId) : null
  const resolved = resolveMedia(
    rawEx || { id: exerciseId || '', imageUrl: gifUrl || imageUrl },
  )

  const frame0 = resolved.url || ''
  const frame1 = resolved.frame1Url || frame0
  const hasTwoFrames =
    resolved.isKeyframed && Boolean(frame0 && frame1 && frame0 !== frame1)
  const currentSrc = hasTwoFrames && frameIndex === 1 ? frame1 : frame0

  const catIconName = getCategoryIcon(category || rawEx?.category)

  const iconFallback = (
    <div
      style={{
        width: size === 'small' ? '40px' : '100%',
        height: size === 'small' ? '40px' : '140px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-surface-2)',
        color: 'var(--color-text-2)',
        borderRadius: 'var(--radius-control)',
      }}
    >
      <Icon name={catIconName} size={size === 'small' ? 20 : 32} />
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
        overflow: 'hidden' /* clip-ok: visual element boundary */,
        flexShrink: 0,
      }}
    >
      <SafeImage
        src={currentSrc}
        fallback={iconFallback}
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
