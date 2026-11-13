import { lazy, Suspense } from 'react'
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
  onClose: () => void
  onSwapClick?: () => void
}

export function ExerciseDetailModal({
  exercise,
  exerciseId,
  programDay,
  program,
  onClose,
  onSwapClick,
}: ExerciseDetailModalProps) {
  const effectiveId = exerciseId || exercise?.id
  if (!effectiveId) return null

  // Check if it's a real catalog or saved custom exercise
  const catalogExercise = exercise
    ? getEffectiveExercise(effectiveId) || exercise
    : getEffectiveExercise(effectiveId)
  const isRealCatalog = Boolean(
    catalogExercise &&
    (catalogExercise.steps_ar ||
      (catalogExercise as { stepsAr?: string[] }).stepsAr ||
      catalogExercise.targetMusclesAr ||
      (catalogExercise.category &&
        catalogExercise.equipment &&
        !catalogExercise.id?.startsWith('custom-') &&
        catalogExercise.descriptionAr !== 'تمرين مضاف عبر الذكاء الاصطناعي')),
  )

  const effectiveExercise =
    isRealCatalog && catalogExercise ? catalogExercise : undefined

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      data-testid="exercise-detail-modal"
    >
      <div
        className="modal-content card exercise-detail-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: '90vh',
          overflowY: 'auto',
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
            onBack={onClose}
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
}
