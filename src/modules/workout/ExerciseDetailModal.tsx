import { lazy, Suspense } from 'react'
import type { Exercise } from '../shared/types.ts'

const ExerciseDetailView = lazy(() =>
  import('./ExerciseDetailView.tsx').then((m) => ({
    default: m.ExerciseDetailView,
  })),
)

export interface ExerciseDetailModalProps {
  exercise: Exercise | null
  onClose: () => void
  onSwapClick?: () => void
}

export function ExerciseDetailModal({
  exercise,
  onClose,
  onSwapClick,
}: ExerciseDetailModalProps) {
  if (!exercise) return null

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
            exerciseId={exercise.id}
            exercise={exercise}
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
