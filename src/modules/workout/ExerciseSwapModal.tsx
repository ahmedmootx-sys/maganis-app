import { useMemo, useState } from 'react'
import type { Exercise } from '../shared/types.ts'
import { EXERCISES } from './exercises.ts'
import { EXERCISES_800 } from './exercises800.ts'
import { ExerciseVisual } from './ExerciseVisual.tsx'
import { EQUIPMENT_LABELS, MUSCLE_GROUP_LABELS } from '../shared/types.ts'

interface ExerciseSwapModalProps {
  currentExercise: Exercise
  customExercises?: Exercise[]
  userInjuries?: string[]
  onSelectSwap: (newExercise: Exercise) => void
  onClose: () => void
}

export function ExerciseSwapModal({
  currentExercise,
  customExercises = [],
  userInjuries = [],
  onSelectSwap,
  onClose,
}: ExerciseSwapModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>(
    currentExercise.category,
  )

  const candidates = useMemo(() => {
    const all = [...EXERCISES, ...EXERCISES_800, ...customExercises]
    return all.filter((e) => {
      if (e.id === currentExercise.id) return false
      // Filter out exercises that conflict with user injuries
      if (
        userInjuries.length > 0 &&
        e.avoidForInjuries?.some((inj) => userInjuries.includes(inj))
      ) {
        return false
      }
      if (selectedCategory && e.category !== selectedCategory) return false
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        return (
          e.nameAr.toLowerCase().includes(query) ||
          e.descriptionAr.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [
    currentExercise,
    customExercises,
    userInjuries,
    selectedCategory,
    searchTerm,
  ])

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      data-testid="exercise-swap-modal"
    >
      <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔄 استبدال التمرين: {currentExercise.nameAr}</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p className="muted" style={{ marginBottom: '12px' }}>
            اختر تمرينًا بديلًا مأموناً ومتوافقاً مع مجموعتك العضلية وأهدافك:
          </p>

          <div className="field-grid-2" style={{ marginBottom: '14px' }}>
            <input
              type="text"
              placeholder="🔍 ابحث عن اسم التمرين البديل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              dir="rtl"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">جميع المجموعات العضلية</option>
              {Object.entries(MUSCLE_GROUP_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div
            className="swap-candidates-list"
            style={{ maxHeight: '320px', overflowY: 'auto' }}
          >
            {candidates.length === 0 ? (
              <p
                className="muted"
                style={{ padding: '16px', textAlign: 'center' }}
              >
                لا توجد تمارين مطابقة للبحث أو تتناسب مع معايير الإصابات
                الحالية.
              </p>
            ) : (
              candidates.map((exercise) => (
                <div
                  key={exercise.id}
                  className="swap-candidate-card"
                  onClick={() => onSelectSwap(exercise)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                  <ExerciseVisual
                    category={exercise.category}
                    exerciseId={exercise.id}
                    exerciseName={exercise.nameAr}
                    imageUrl={exercise.imageUrl}
                    size="small"
                  />
                  <div className="candidate-info" style={{ flex: 1 }}>
                    <strong>{exercise.nameAr}</strong>
                    <p className="muted-small">{exercise.descriptionAr}</p>
                    <div className="chips-row">
                      <span className="chip highlight">
                        {MUSCLE_GROUP_LABELS[exercise.category]}
                      </span>
                      <span className="chip">
                        {EQUIPMENT_LABELS[exercise.equipment]}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="button-primary tiny"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectSwap(exercise)
                    }}
                  >
                    اختيار
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-footer actions-row">
          <button type="button" className="ghost" onClick={onClose}>
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}
