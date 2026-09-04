import { useMemo, useState } from 'react'
import type { Exercise } from '../shared/types.ts'
import { EXERCISES } from './exercises.ts'
import { EXERCISES_800 } from './exercises800.ts'
import { ExerciseDetailModal } from './ExerciseDetailModal.tsx'
import { ExerciseVisual } from './ExerciseVisual.tsx'
import {
  DIFFICULTY_LABELS,
  EQUIPMENT_LABELS,
  MUSCLE_GROUP_LABELS,
  type MuscleGroup,
} from '../shared/types.ts'

interface ExerciseLibraryModalProps {
  customExercises?: Exercise[]
  onClose: () => void
}

export function ExerciseLibraryModal({
  customExercises = [],
  onClose,
}: ExerciseLibraryModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all')
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  )

  const allExercises = useMemo(
    () => [...EXERCISES, ...EXERCISES_800, ...customExercises],
    [customExercises],
  )

  const filteredExercises = useMemo(() => {
    return allExercises.filter((e) => {
      if (categoryFilter !== 'all' && e.category !== categoryFilter)
        return false
      if (equipmentFilter !== 'all' && e.equipment !== equipmentFilter)
        return false
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchName = e.name ? e.name.toLowerCase().includes(query) : false
        return (
          matchName ||
          e.nameAr.toLowerCase().includes(query) ||
          e.descriptionAr.toLowerCase().includes(query) ||
          e.targetMusclesAr?.some((m) => m.toLowerCase().includes(query))
        )
      }
      return true
    })
  }, [allExercises, categoryFilter, equipmentFilter, searchTerm])

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      data-testid="exercise-library-modal"
    >
      <div
        className="modal-content card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px' }}
      >
        <div className="modal-header">
          <h2>📚 مكتبة وقاعدة بيانات التمارين الشاملة</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p className="muted">
            ابحث وتصفح التمارين المدمجة والمخصصة، مع الشرح التفصيلي والميكانيكا
            والفوائد المثبتة علمياً.
          </p>

          {/* Search & Filter Controls */}
          <div className="field-grid-2">
            <input
              type="text"
              placeholder="🔍 ابحث باسم التمرين أو عضلة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              dir="rtl"
            />
            <div className="radio-row" style={{ margin: 0 }}>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">
                  جميع العضلات ({allExercises.length})
                </option>
                {Object.entries(MUSCLE_GROUP_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>

              <select
                value={equipmentFilter}
                onChange={(e) => setEquipmentFilter(e.target.value)}
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

          <div className="muted-small">
            تم العثور على <strong>{filteredExercises.length}</strong> تمرين
          </div>

          {/* Exercises Grid */}
          <div
            className="exercises-library-grid"
            style={{
              maxHeight: '380px',
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '10px',
            }}
          >
            {filteredExercises.map((ex) => (
              <div
                key={ex.id}
                className="card exercise-library-card"
                onClick={() => setSelectedExercise(ex)}
                style={{ cursor: 'pointer', padding: '12px' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '8px',
                  }}
                >
                  <ExerciseVisual
                    category={ex.category}
                    exerciseId={ex.id}
                    exerciseName={ex.nameAr}
                    imageUrl={ex.imageUrl}
                    size="small"
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <strong style={{ fontSize: '14.5px' }}>
                        {ex.name || ex.nameAr}
                      </strong>
                      {'isCustom' in ex && (
                        <span className="chip highlight">مخصص ✨</span>
                      )}
                    </div>
                    {ex.name && ex.nameAr && ex.name !== ex.nameAr && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--primary)',
                          fontWeight: 600,
                          marginTop: '2px',
                        }}
                      >
                        {ex.nameAr}
                      </div>
                    )}
                    <span className="muted-small">
                      {MUSCLE_GROUP_LABELS[ex.category as MuscleGroup] ||
                        ex.category}
                    </span>
                  </div>
                </div>
                <p className="muted-small" style={{ margin: '6px 0' }}>
                  {ex.descriptionAr}
                </p>
                <div className="chips-row">
                  <span className="chip">
                    {MUSCLE_GROUP_LABELS[ex.category as MuscleGroup] ||
                      ex.category}
                  </span>
                  <span className="chip">
                    {EQUIPMENT_LABELS[ex.equipment] || ex.equipment}
                  </span>
                  <span className="chip">
                    {DIFFICULTY_LABELS[ex.difficulty] || ex.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer actions-row">
          <button type="button" onClick={onClose}>
            إغلاق
          </button>
        </div>

        {/* Nested Exercise Detail View */}
        {selectedExercise && (
          <ExerciseDetailModal
            exercise={selectedExercise}
            onClose={() => setSelectedExercise(null)}
          />
        )}
      </div>
    </div>
  )
}
