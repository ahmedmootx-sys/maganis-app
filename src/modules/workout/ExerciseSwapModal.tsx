import { useMemo, useState } from 'react'
import type { Exercise } from '../shared/types.ts'
import { EXERCISES } from './exercises.ts'
import { ExerciseVisual } from './ExerciseVisual.tsx'
import {
  DIFFICULTY_LABELS,
  EQUIPMENT_LABELS,
  MUSCLE_GROUP_LABELS,
} from '../shared/types.ts'

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
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all')

  const candidates = useMemo(() => {
    const all = [...EXERCISES, ...customExercises]
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
      if (selectedEquipment !== 'all' && e.equipment !== selectedEquipment)
        return false
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        return (
          e.nameAr.toLowerCase().includes(query) ||
          e.descriptionAr.toLowerCase().includes(query) ||
          e.targetSubMuscleAr?.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [
    currentExercise,
    customExercises,
    userInjuries,
    selectedCategory,
    selectedEquipment,
    searchTerm,
  ])

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      data-testid="exercise-swap-modal"
    >
      <div
        className="modal-content card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '95%' }}
      >
        <div className="modal-header">
          <h2>🔄 استبدال التمرين: {currentExercise.nameAr}</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p className="muted" style={{ marginBottom: '12px' }}>
            اختر تمرينًا بديلًا مأموناً ومتوافقاً مع معداتك المتوفرة ومجموعتك
            العضلية:
          </p>

          {/* Search Input */}
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="🔍 ابحث عن اسم التمرين البديل أو الرأس العضلي..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              dir="rtl"
              style={{ width: '100%' }}
            />
          </div>

          {/* Category & Equipment Filters */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '8px',
              marginBottom: '14px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  marginBottom: '4px',
                }}
              >
                المجموعة العضلية:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">جميع المجموعات العضلية</option>
                {Object.entries(MUSCLE_GROUP_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  marginBottom: '4px',
                }}
              >
                الأدوات والمعدات المستخدمة:
              </label>
              <select
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="all">جميع المعدات</option>
                {Object.entries(EQUIPMENT_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Candidates List with Images & Badges */}
          <div
            className="swap-candidates-list"
            style={{
              maxHeight: '340px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {candidates.length === 0 ? (
              <div
                className="card"
                style={{ padding: '20px', textAlign: 'center' }}
              >
                <p className="muted" style={{ margin: 0 }}>
                  لا توجد تمارين مطابقة للأداة أو البحث المختار. جرب اختيار
                  "جميع المعدات".
                </p>
              </div>
            ) : (
              candidates.map((exercise) => (
                <div
                  key={exercise.id}
                  className="card"
                  onClick={() => onSelectSwap(exercise)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '10px 14px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <ExerciseVisual
                      category={exercise.category}
                      exerciseId={exercise.id}
                      exerciseName={exercise.nameAr}
                      imageUrl={exercise.imageUrl}
                      size="small"
                    />
                    <div className="candidate-info" style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <strong style={{ fontSize: '14px' }}>
                          {exercise.name || exercise.nameAr}
                        </strong>
                        {exercise.targetSubMuscleAr && (
                          <span
                            className="chip"
                            style={{
                              fontSize: '11px',
                              background: '#fef3c7',
                              color: '#92400e',
                              padding: '2px 6px',
                            }}
                          >
                            🎯 {exercise.targetSubMuscleAr}
                          </span>
                        )}
                      </div>
                      {exercise.name &&
                        exercise.nameAr &&
                        exercise.name !== exercise.nameAr && (
                          <div
                            style={{
                              fontSize: '12px',
                              color: 'var(--primary)',
                              fontWeight: 600,
                            }}
                          >
                            {exercise.nameAr}
                          </div>
                        )}
                      <p
                        className="muted-small"
                        style={{
                          margin: '2px 0 4px',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {exercise.descriptionAr}
                      </p>
                      <div className="chips-row" style={{ gap: '4px' }}>
                        <span className="chip">
                          {MUSCLE_GROUP_LABELS[exercise.category]}
                        </span>
                        <span className="chip highlight">
                          {EQUIPMENT_LABELS[exercise.equipment]}
                        </span>
                        <span className="chip">
                          {DIFFICULTY_LABELS[exercise.difficulty]}
                        </span>
                      </div>
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
                    ✓ اختيار
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
