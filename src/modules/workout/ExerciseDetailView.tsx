import type { MuscleGroup, Difficulty, Equipment } from '../shared/types.ts'
import {
  DIFFICULTY_LABELS,
  EQUIPMENT_LABELS,
  MUSCLE_GROUP_LABELS,
} from '../shared/types.ts'
import { getExerciseById } from './exercises.ts'

interface ExerciseDetailViewProps {
  exerciseId: string
  onBack?: () => void
}

export function ExerciseDetailView({
  exerciseId,
  onBack,
}: ExerciseDetailViewProps) {
  const exercise = getExerciseById(exerciseId)
  const muscles = exercise?.targetMusclesAr ?? []
  const avoid = exercise?.avoidForInjuries ?? []
  const steps = exercise?.howToStepsAr ?? []

  if (!exercise) {
    return (
      <div className="card">
        <p className="muted">التمرين غير موجود</p>
        {onBack && (
          <button className="ghost" onClick={onBack}>
            رجوع
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="card exercise-detail">
      {onBack && (
        <button className="ghost exercise-detail__back" onClick={onBack}>
          ← رجوع
        </button>
      )}

      <h2 className="exercise-detail__name">{exercise.nameAr}</h2>
      <p className="muted exercise-detail__desc">{exercise.descriptionAr}</p>

      <div className="exercise-detail__tags">
        <span className="chip">
          {MUSCLE_GROUP_LABELS[exercise.category as MuscleGroup]}
        </span>
        <span className="chip">
          {DIFFICULTY_LABELS[exercise.difficulty as Difficulty]}
        </span>
        <span className="chip">
          {EQUIPMENT_LABELS[exercise.equipment as Equipment]}
        </span>
      </div>

      {/* العضلات المستهدفة */}
      {muscles.length > 0 && (
        <div className="exercise-detail__section">
          <h3>العضلات المستهدفة</h3>
          <div className="exercise-detail__muscles">
            {muscles.map((m: string, i: number) => (
              <span key={i} className="chip chip--accent">
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* الفائدة */}
      {exercise.benefitAr && (
        <div className="exercise-detail__section">
          <h3>الفائدة</h3>
          <p>{exercise.benefitAr}</p>
        </div>
      )}

      {/* طريقة التنفيذ */}
      {steps.length > 0 && (
        <div className="exercise-detail__section">
          <h3>طريقة التنفيذ</h3>
          <ol className="exercise-detail__steps">
            {steps.map((step: string, i: number) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {/* المصدر العلمي */}
      {exercise.medicalSource && (
        <div className="exercise-detail__section">
          <h3>المرجع العلمي</h3>
          <p className="muted exercise-detail__source">
            {exercise.medicalSource}
          </p>
        </div>
      )}

      {/* تحذير الإصابات */}
      {avoid.length > 0 && (
        <div className="exercise-detail__section exercise-detail__warning">
          <h3>⚠️ تحذير</h3>
          <p>يُنصح بتجنب هذا التمرين إذا كنت تعاني من: {avoid.join('، ')}</p>
        </div>
      )}
    </div>
  )
}
