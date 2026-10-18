import { useState } from 'react'
import type { Exercise } from '../modules/shared/types.ts'
import { resolveMedia } from '../utils/mediaResolver.ts'
import { IconImage } from './Icons.tsx'

export interface ExerciseThumbProps {
  exercise?: Exercise | Partial<Exercise> | null
  exerciseId?: string
  exerciseName?: string
  size?: number | 'small' | 'medium' | 'large'
  customExercises?: Exercise[]
  className?: string
  style?: React.CSSProperties
}

/**
 * Single, unified thumbnail component for exercises.
 * Used across:
 * - Day lists (WeeklyPlanView)
 * - Library rows (ExerciseLibraryView)
 * - Add-to-day sheet (ExerciseSelectSheet / ExercisePickerModal)
 * - Active session (ActiveWorkoutSession)
 * - History (SessionLogger / ProgressScreen)
 * - Exercise page (ExerciseDetailView)
 *
 * Guarantees a stable, non-jumping box size regardless of loading or placeholder state.
 */
export function ExerciseThumb({
  exercise,
  exerciseId,
  exerciseName = '',
  size = 56,
  customExercises = [],
  className = '',
  style = {},
}: ExerciseThumbProps) {
  const [loadError, setLoadError] = useState(false)

  const dimension =
    typeof size === 'number'
      ? `${size}px`
      : size === 'small'
        ? '44px'
        : size === 'medium'
          ? '56px'
          : '72px'

  const resolved = resolveMedia(exercise || exerciseId, customExercises)
  const name = exerciseName || exercise?.nameAr || exercise?.name || 'تمرين'

  return (
    <div
      className={`exercise-thumb-box ${className}`}
      data-testid="exercise-thumb"
      style={{
        width: dimension,
        height: dimension,
        minWidth: dimension,
        minHeight: dimension,
        borderRadius: '10px',
        overflow: 'hidden',
        background: 'var(--card-subtle, rgba(255, 255, 255, 0.04))',
        border: '1px solid var(--line, rgba(255, 255, 255, 0.1))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxSizing: 'border-box',
        ...style,
      }}
      title={name}
    >
      {resolved.url && !loadError ? (
        <img
          src={resolved.url}
          alt={name}
          loading="lazy"
          decoding="async"
          onError={() => setLoadError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--muted, #9ca3af)',
            background: 'var(--card-subtle, rgba(255, 255, 255, 0.04))',
          }}
        >
          <IconImage size={typeof size === 'number' && size < 48 ? 18 : 24} />
        </div>
      )}
    </div>
  )
}
