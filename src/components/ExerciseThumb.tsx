import type { Exercise } from '../modules/shared/types.ts'
import { resolveMedia } from '../utils/mediaResolver.ts'
import { SafeImage } from './SafeImage.tsx'
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
 * In lists: 40x40 icon-only tile.
 * Never paints browser alt text on error (handled by SafeImage).
 */
export function ExerciseThumb({
  exercise,
  exerciseId,
  exerciseName = '',
  size = 40,
  customExercises = [],
  className = '',
  style = {},
}: ExerciseThumbProps) {
  const dimension =
    typeof size === 'number'
      ? `${size}px`
      : size === 'small'
        ? '40px'
        : size === 'medium'
          ? '56px'
          : '72px'

  const resolved = resolveMedia(exercise || exerciseId, customExercises)
  const name = exerciseName || exercise?.nameAr || exercise?.name || 'تمرين'

  const fallbackIcon = (
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
      <IconImage size={typeof size === 'number' && size <= 44 ? 18 : 22} />
    </div>
  )

  return (
    <div
      className={`exercise-thumb-box ${className}`}
      data-testid="exercise-thumb"
      style={{
        width: dimension,
        height: dimension,
        minWidth: dimension,
        minHeight: dimension,
        borderRadius: '8px',
        overflow: 'hidden' /* clip-ok: visual element boundary */,
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
      {resolved.url ? (
        <SafeImage
          src={resolved.url}
          fallback={fallbackIcon}
          loading="lazy"
          decoding="async"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        fallbackIcon
      )}
    </div>
  )
}
