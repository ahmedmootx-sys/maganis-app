import { useMemo, useState } from 'react'
import type { CustomExercise, Exercise } from '../shared/types.ts'
import { EXERCISES } from './exercises.ts'
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
  deletedExerciseIds?: string[]
  onClose: () => void
  onDeleteExercise?: (id: string) => void
  onRestoreExercise?: (id: string) => void
  onEditCustomExercise?: (exercise: CustomExercise) => void
}

export function ExerciseLibraryModal({
  customExercises = [],
  deletedExerciseIds = [],
  onClose,
  onDeleteExercise,
  onRestoreExercise,
  onEditCustomExercise,
}: ExerciseLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<'library' | 'trash'>('library')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [subMuscleFilter, setSubMuscleFilter] = useState<string>('all')
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all')
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  )

  const allExercises = useMemo(
    () => [...EXERCISES, ...customExercises],
    [customExercises],
  )

  // Active (non-deleted) exercises
  const activeExercises = useMemo(() => {
    return allExercises.filter((e) => !deletedExerciseIds.includes(e.id))
  }, [allExercises, deletedExerciseIds])

  // Deleted exercises
  const deletedExercises = useMemo(() => {
    return allExercises.filter((e) => deletedExerciseIds.includes(e.id))
  }, [allExercises, deletedExerciseIds])

  // Available sub-muscles in the current category selection
  const availableSubMuscles = useMemo(() => {
    const set = new Set<string>()
    for (const ex of activeExercises) {
      if (categoryFilter === 'all' || ex.category === categoryFilter) {
        if (ex.targetSubMuscleAr) {
          set.add(ex.targetSubMuscleAr)
        }
      }
    }
    return Array.from(set).sort()
  }, [activeExercises, categoryFilter])

  // Filtered active exercises
  const filteredExercises = useMemo(() => {
    return activeExercises.filter((e) => {
      if (categoryFilter !== 'all' && e.category !== categoryFilter)
        return false
      if (subMuscleFilter !== 'all' && e.targetSubMuscleAr !== subMuscleFilter)
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
          e.targetSubMuscleAr?.toLowerCase().includes(query) ||
          e.targetMusclesAr?.some((m) => m.toLowerCase().includes(query))
        )
      }
      return true
    })
  }, [
    activeExercises,
    categoryFilter,
    subMuscleFilter,
    equipmentFilter,
    searchTerm,
  ])

  function handleDelete(e: React.MouseEvent, ex: Exercise) {
    e.stopPropagation()
    const confirmMsg =
      'isCustom' in ex && ex.isCustom
        ? `هل أنت متأكد من حذف التمرين المخصص "${ex.nameAr}"؟`
        : `هل تريد إخفاء تمرين "${ex.nameAr}" من المكتبة وتوليد البرامج؟ (يمكنك استرجاعه لاحقاً)`

    if (window.confirm(confirmMsg)) {
      onDeleteExercise?.(ex.id)
    }
  }

  function handleRestore(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    onRestoreExercise?.(id)
  }

  function handleEdit(e: React.MouseEvent, ex: Exercise) {
    e.stopPropagation()
    if ('isCustom' in ex && ex.isCustom && onEditCustomExercise) {
      onEditCustomExercise(ex as CustomExercise)
    }
  }

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      data-testid="exercise-library-modal"
    >
      <div
        className="modal-content card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '720px', width: '95%' }}
      >
        <div className="modal-header">
          <h2>📚 مكتبة وقاعدة بيانات التمارين الشاملة</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Navigation Tabs (Library / Trash) */}
          <div
            className="chips-row"
            style={{ marginBottom: '14px', gap: '8px' }}
          >
            <button
              type="button"
              className={
                'chip-btn' + (activeTab === 'library' ? ' selected' : '')
              }
              onClick={() => setActiveTab('library')}
            >
              📖 جميع التمارين ({activeExercises.length})
            </button>
            <button
              type="button"
              className={
                'chip-btn' + (activeTab === 'trash' ? ' selected' : '')
              }
              onClick={() => setActiveTab('trash')}
              style={{
                color: activeTab === 'trash' ? '#fff' : '#b91c1c',
                background: activeTab === 'trash' ? '#b91c1c' : '#fee2e2',
              }}
            >
              🗑️ التمارين المحذوفة ({deletedExercises.length})
            </button>
          </div>

          {activeTab === 'trash' ? (
            <div>
              <p className="muted">
                التمارين الموجودة هنا تم إخفاؤها من المكتبة ولن تظهر عند إنشاء
                برامج تدريبية جديدة. يمكنك استرجاع أي تمرين بضغطة زر.
              </p>

              {deletedExercises.length === 0 ? (
                <div
                  className="card"
                  style={{ textAlign: 'center', padding: '32px' }}
                >
                  <p className="muted">سلة التمارين المحذوفة فارغة. ✨</p>
                </div>
              ) : (
                <div
                  style={{
                    maxHeight: '380px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {deletedExercises.map((ex) => (
                    <div
                      key={ex.id}
                      className="card"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <ExerciseVisual
                          category={ex.category}
                          exerciseId={ex.id}
                          exerciseName={ex.nameAr}
                          imageUrl={ex.imageUrl}
                          size="small"
                        />
                        <div>
                          <strong>{ex.nameAr}</strong>
                          {ex.targetSubMuscleAr && (
                            <span
                              className="chip"
                              style={{
                                fontSize: '11px',
                                marginRight: '6px',
                                background: '#fff',
                              }}
                            >
                              🎯 {ex.targetSubMuscleAr}
                            </span>
                          )}
                          <div className="muted-small">
                            {MUSCLE_GROUP_LABELS[ex.category as MuscleGroup] ||
                              ex.category}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="button-primary tiny"
                        onClick={(e) => handleRestore(e, ex.id)}
                      >
                        ♻️ استرجاع للمكتبة
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <p className="muted" style={{ margin: '0 0 12px' }}>
                ابحث وتصفح التمارين المدمجة والمخصصة، مع تحديد الرؤوس العضلية
                الدقيقة (صدر علوي/سفلي، بايسبس، سواعد، إلخ) وإمكانية الحذف
                والتعديل.
              </p>

              {/* Search & Filter Controls */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginBottom: '12px',
                }}
              >
                <input
                  type="text"
                  placeholder="🔍 ابحث باسم التمرين، العضلة، أو الرأس المستهدف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  dir="rtl"
                  style={{ width: '100%' }}
                />

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '6px',
                  }}
                >
                  {/* Category Filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value)
                      setSubMuscleFilter('all') // Reset submuscle filter when category changes
                    }}
                  >
                    <option value="all">
                      جميع العضلات ({activeExercises.length})
                    </option>
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
                    <option value="all">🎯 كل الرؤوس العضلية التفصيلية</option>
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
              </div>

              <div
                className="muted-small"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <span>
                  تم العثور على <strong>{filteredExercises.length}</strong>{' '}
                  تمرين
                </span>
                {subMuscleFilter !== 'all' && (
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    🎯 فلترة حسب: {subMuscleFilter}
                  </span>
                )}
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
                {filteredExercises.map((ex) => {
                  const isCustom = 'isCustom' in ex && Boolean(ex.isCustom)
                  return (
                    <div
                      key={ex.id}
                      className="card exercise-library-card"
                      onClick={() => setSelectedExercise(ex)}
                      style={{
                        cursor: 'pointer',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
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
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <strong
                                style={{
                                  fontSize: '14px',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {ex.name || ex.nameAr}
                              </strong>
                              {isCustom && (
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
                              {MUSCLE_GROUP_LABELS[
                                ex.category as MuscleGroup
                              ] || ex.category}
                            </span>
                          </div>
                        </div>

                        {/* Sub-Muscle Specificity Badge */}
                        {ex.targetSubMuscleAr && (
                          <div style={{ marginBottom: '6px' }}>
                            <span
                              className="chip"
                              style={{
                                background: '#fef3c7',
                                color: '#92400e',
                                fontWeight: 700,
                                fontSize: '11px',
                                padding: '2px 8px',
                              }}
                            >
                              🎯 {ex.targetSubMuscleAr}
                            </span>
                          </div>
                        )}

                        <p
                          className="muted-small"
                          style={{
                            margin: '4px 0 8px',
                            lineHeight: '1.4',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {ex.descriptionAr}
                        </p>

                        <div
                          className="chips-row"
                          style={{ gap: '4px', marginBottom: '8px' }}
                        >
                          <span className="chip">
                            {EQUIPMENT_LABELS[ex.equipment] || ex.equipment}
                          </span>
                          <span className="chip">
                            {DIFFICULTY_LABELS[ex.difficulty] || ex.difficulty}
                          </span>
                        </div>
                      </div>

                      {/* Card Action Controls (Edit & Delete) */}
                      <div
                        style={{
                          display: 'flex',
                          gap: '6px',
                          borderTop: '1px solid #f1f5f9',
                          paddingTop: '8px',
                          marginTop: '4px',
                        }}
                      >
                        {isCustom && onEditCustomExercise && (
                          <button
                            type="button"
                            className="ghost tiny"
                            onClick={(e) => handleEdit(e, ex)}
                            style={{ flex: 1, padding: '4px 8px' }}
                            title="تعديل التمرين المخصص"
                          >
                            ✏️ تعديل
                          </button>
                        )}
                        <button
                          type="button"
                          className="ghost-danger tiny"
                          onClick={(e) => handleDelete(e, ex)}
                          style={{ flex: 1, padding: '4px 8px' }}
                          title="حذف/إخفاء من المكتبة"
                        >
                          🗑️ حذف
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
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
