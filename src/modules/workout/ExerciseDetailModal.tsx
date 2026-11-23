import { lazy, Suspense } from 'react'
import { createPortal } from 'react-dom'
import type { Exercise, ProgramDay, WorkoutProgram } from '../shared/types.ts'
import { getEffectiveExercise } from './exerciseStore.ts'

const ExerciseDetailView = lazy(() =>
  import('./ExerciseDetailView.tsx').then((m) => ({
    default: m.ExerciseDetailView,
  })),
)

export interface ExerciseDetailModalProps {
  exercise?: Exercise | null
  exerciseId?: string
  programDay?: ProgramDay | null
  program?: WorkoutProgram | null
  customExercises?: Exercise[]
  onClose: () => void
  onSwapClick?: () => void
}

export function ExerciseDetailModal({
  exercise,
  exerciseId,
  programDay,
  program,
  customExercises = [],
  onClose,
  onSwapClick,
}: ExerciseDetailModalProps) {
  const effectiveId = exerciseId || exercise?.id
  if (!effectiveId) return null

  // Check if it's a real catalog or saved custom exercise
  const catalogExercise = exercise
    ? getEffectiveExercise(effectiveId, customExercises) || exercise
    : getEffectiveExercise(effectiveId, customExercises)

  const effectiveExercise = catalogExercise || exercise || undefined

  const modalContent = (
    <div
      className="modal-backdrop"
      onClick={onClose}
      data-testid="exercise-detail-modal"
      style={{ zIndex: 9990 }}
    >
      <div
        className="modal-content card exercise-detail-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: '90vh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          overscrollBehavior: 'contain',
          padding: '16px',
          width: '100%',
          maxWidth: '640px',
        }}
      >
        <Suspense fallback={null}>
          <ExerciseDetailView
            exerciseId={effectiveId}
            exercise={effectiveExercise}
            programDay={programDay}
            program={program}
            customExercises={customExercises}
            onBack={onClose}
            isModal={true}
          />
        </Suspense>
        {onSwapClick && (
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="ghost-secondary"
              onClick={onSwapClick}
              style={{ flex: 1, height: '44px' }}
            >
              استبدال التمرين
            </button>
          </div>
        )}
      </div>
    </div>
  )

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body)
  }

  return modalContent
}
