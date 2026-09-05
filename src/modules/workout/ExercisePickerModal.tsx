import { useMemo, useState } from 'react'
import type { Exercise } from '../shared/types.ts'
import { EXERCISES } from './exercises.ts'
import { ExerciseVisual } from './ExerciseVisual.tsx'
import {
  DIFFICULTY_LABELS,
  EQUIPMENT_LABELS,
  MUSCLE_GROUP_LABELS,
  type MuscleGroup,
} from '../shared/types.ts'

interface ExercisePickerModalProps {
  dayLabelAr: string
  customExercises?: Exercise[]
  userInjuries?: string[]
  onSelectExercise: (exerciseId: string) => void
  onClose: () => void
}

export function ExercisePickerModal({
  dayLabelAr,
  customExercises = [],
  userInjuries = [],
  onSelectExercise,
  onClose,
}: ExercisePickerModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all')
  const [subMuscleFilter, setSubMuscleFilter] = useState<string>('all')

  const allExercises = useMemo(
    () => [...EXERCISES, ...customExercises],
    [customExercises],
  )

  const availableSubMuscles = useMemo(() => {
    const set = new Set<string>()
    for (const ex of allExercises) {
      if (categoryFilter === 'all' || ex.category === categoryFilter) {
        if (ex.targetSubMuscleAr) set.add(ex.targetSubMuscleAr)
      }
    }
    return Array.from(set).sort()
  }, [allExercises, categoryFilter])

  const filteredExercises = useMemo(() => {
    return allExercises.filter((e) => {
      // Filter out injuries
      if (
        userInjuries.length > 0 &&
        e.avoidForInjuries?.some((inj) => userInjuries.includes(inj))
      ) {
        return false
      }
      if (categoryFilter !== 'all' && e.category !== categoryFilter)
        return false
      if (subMuscleFilter !== 'all' && e.targetSubMuscleAr !== subMuscleFilter)
        return false
      if (equipmentFilter !== 'all' && e.equipment !== equipmentFilter)
        return false
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        return (
          e.nameAr.toLowerCase().includes(query) ||
          e.descriptionAr.toLowerCase().includes(query) ||
          e.targetSubMuscleAr?.toLowerCase().includes(query) ||
          (e.name && e.name.toLowerCase().includes(query))
        )
      }
      return true
    })
  }, [
    allExercises,
    userInjuries,
    categoryFilter,
    subMuscleFilter,
    equipmentFilter,
    searchTerm,
  ])

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      data-testid="exercise-picker-modal"
    >
      <div
        className="modal-content card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', width: '95%' }}
      >
        <div className="modal-header">
          <h2>➕ إضافة تمرين إلى {dayLabelAr}</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p className="muted" style={{ margin: '0 0 10px' }}>
            ابحث وتصفح التمارين بالصور والمعدات لإضافتها مباشرة إلى جدولك
            التدريبي:
          </p>

          {/* Search */}
          <input
            type="text"
            placeholder="🔍 ابحث باسم التمرين، العضلة، أو الرأس المستهدف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            dir="rtl"
            style={{ width: '100%', marginBottom: '10px' }}
          />

          {/* Filters Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '6px',
              marginBottom: '12px',
            }}
          >
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setSubMuscleFilter('all')
              }}
            >
              <option value="all">جميع العضلات ({allExercises.length})</option>
              {Object.entries(MUSCLE_GROUP_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>

            {/* Sub-Muscle Specificity Filter */}
            <select
              value={subMuscleFilter}
              onChange={(e) => setSubMuscleFilter(e.target.value)}
              disabled={availableSubMuscles.length === 0}
            >
              <option value="all">🎯 كل الرؤوس العضلية</option>
              {availableSubMuscles.map((sub) => (
                <option key={sub} value={sub}>
                  🎯 {sub}
                </option>
              ))}
            </select>

            {/* Equipment Filter */}
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

          <div className="muted-small" style={{ marginBottom: '8px' }}>
            تم العثور على <strong>{filteredExercises.length}</strong> تمرين
          </div>

          {/* Exercises Grid with Images */}
          <div
            style={{
              maxHeight: '360px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {filteredExercises.length === 0 ? (
              <div
                className="card"
                style={{ textAlign: 'center', padding: '24px' }}
              >
                <p className="muted" style={{ margin: 0 }}>
                  لم يتم العثور على تمارين مطابقة للبحث أو معايير الإصابة
                  الحالية.
                </p>
              </div>
            ) : (
              filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="card"
                  onClick={() => onSelectExercise(ex.id)}
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
                      category={ex.category}
                      exerciseId={ex.id}
                      exerciseName={ex.nameAr}
                      imageUrl={ex.imageUrl}
                      size="small"
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <strong style={{ fontSize: '14px' }}>
                          {ex.name || ex.nameAr}
                        </strong>
                        {ex.targetSubMuscleAr && (
                          <span
                            className="chip"
                            style={{
                              fontSize: '11px',
                              background: '#fef3c7',
                              color: '#92400e',
                              padding: '2px 6px',
                            }}
                          >
                            🎯 {ex.targetSubMuscleAr}
                          </span>
                        )}
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
                          }}
                        >
                          {ex.nameAr}
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
                        {ex.descriptionAr}
                      </p>
                      <div className="chips-row" style={{ gap: '4px' }}>
                        <span className="chip">
                          {MUSCLE_GROUP_LABELS[ex.category as MuscleGroup] ||
                            ex.category}
                        </span>
                        <span className="chip highlight">
                          {EQUIPMENT_LABELS[ex.equipment] || ex.equipment}
                        </span>
                        <span className="chip">
                          {DIFFICULTY_LABELS[ex.difficulty] || ex.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="button-primary tiny"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectExercise(ex.id)
                    }}
                  >
                    + إضافة
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-footer actions-row">
          <button type="button" onClick={onClose}>
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}
