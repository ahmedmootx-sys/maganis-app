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
import { Select } from '../../components/Select'
import { Icon } from '../../ui/Icon.tsx'
import { selectEffectiveExercise } from './exerciseStore.ts'
import { ExerciseMarks } from '../../components/ExerciseMarks.tsx'

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
    () =>
      [...EXERCISES, ...customExercises].map((e) => selectEffectiveExercise(e)),
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
          <h2>إضافة تمرين إلى {dayLabelAr}</h2>
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            aria-label="إغلاق"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="muted" style={{ margin: '0 0 10px' }}>
            ابحث وتصفح التمارين بالصور والمعدات لإضافتها مباشرة إلى جدولك
            التدريبي
          </p>

          {/* Search */}
          <input
            type="text"
            placeholder="ابحث باسم التمرين، العضلة، أو الرأس المستهدف..."
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
            <Select
              id="picker-category-filter"
              value={categoryFilter}
              onChange={(val) => {
                setCategoryFilter(val)
                setSubMuscleFilter('all')
              }}
              options={[
                {
                  value: 'all',
                  labelAr: `جميع العضلات (${allExercises.length})`,
                },
                ...Object.entries(MUSCLE_GROUP_LABELS).map(([val, label]) => ({
                  value: val,
                  labelAr: label,
                })),
              ]}
              sheetTitle="تصفية حسب المجموعة العضلية"
            />

            {/* Sub-Muscle Specificity Filter */}
            <Select
              id="picker-submuscle-filter"
              value={subMuscleFilter}
              onChange={(val) => setSubMuscleFilter(val)}
              disabled={availableSubMuscles.length === 0}
              options={[
                { value: 'all', labelAr: 'كل الرؤوس العضلية' },
                ...availableSubMuscles.map((sub) => ({
                  value: sub,
                  labelAr: sub,
                })),
              ]}
              sheetTitle="تصفية حسب الرأس العضلي المستهدف"
            />

            {/* Equipment Filter */}
            <Select
              id="picker-equipment-filter"
              value={equipmentFilter}
              onChange={(val) => setEquipmentFilter(val)}
              options={[
                { value: 'all', labelAr: 'جميع المعدات' },
                ...Object.entries(EQUIPMENT_LABELS).map(([val, label]) => ({
                  value: val,
                  labelAr: label,
                })),
              ]}
              sheetTitle="تصفية حسب المعدات والأجهزة"
            />
          </div>

          <div className="muted-small" style={{ marginBottom: '8px' }}>
            تم العثور على <strong>{filteredExercises.length}</strong> تمرين
          </div>

          {/* Exercises List */}
          <div
            style={{
              maxHeight: '380px',
              overflowY: 'auto',
              scrollbarWidth: 'none',
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
                  className="card exercise-picker-row"
                  onClick={() => onSelectExercise(ex.id)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '56px minmax(0, 1fr) 44px',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: '1px solid var(--line)',
                    borderRadius: '12px',
                    background: 'var(--card-bg)',
                    boxSizing: 'border-box',
                  }}
                >
                  {/* 56px thumbnail at start */}
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      flexShrink: 0,
                      borderRadius: '8px',
                      overflow:
                        'hidden' /* clip-ok: modal sheet scroller boundary */,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--card-subtle)',
                    }}
                  >
                    <ExerciseVisual
                      category={ex.category}
                      exerciseId={ex.id}
                      exerciseName={ex.nameAr}
                      imageUrl={ex.imageUrl}
                      size="small"
                    />
                  </div>

                  {/* Text details in middle column */}
                  <div
                    style={{
                      minWidth: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <strong
                        style={{
                          fontSize: '14.5px',
                          lineHeight: 1.3,
                          color: 'var(--text)',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {ex.nameAr}
                      </strong>
                      <ExerciseMarks
                        hasVideo={ex.hasVideo}
                        hasCustomMedia={ex.hasCustomMedia}
                      />
                      {ex.targetSubMuscleAr && (
                        <span
                          className="submuscle-badge"
                          style={{ fontSize: '11px', padding: '2px 6px' }}
                        >
                          {ex.targetSubMuscleAr}
                        </span>
                      )}
                      {'isCustom' in ex && (
                        <span
                          className="chip highlight"
                          style={{ fontSize: '11px', padding: '2px 6px' }}
                        >
                          مخصص
                        </span>
                      )}
                    </div>

                    {ex.name && ex.name !== ex.nameAr && (
                      <div
                        dir="ltr"
                        style={{
                          fontSize: '12px',
                          color: 'var(--muted)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow:
                            'hidden' /* clip-ok: modal sheet scroller boundary */,
                          lineHeight: 1.25,
                          textAlign: 'right',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        <bdi dir="ltr">{ex.name}</bdi>
                      </div>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '4px',
                        marginTop: '2px',
                      }}
                    >
                      <span
                        className="chip"
                        style={{ fontSize: '11px', padding: '2px 6px' }}
                      >
                        {MUSCLE_GROUP_LABELS[ex.category as MuscleGroup] ||
                          ex.category}
                      </span>
                      <span
                        className="chip highlight"
                        style={{ fontSize: '11px', padding: '2px 6px' }}
                      >
                        {EQUIPMENT_LABELS[ex.equipment] || ex.equipment}
                      </span>
                      <span
                        className="chip"
                        style={{ fontSize: '11px', padding: '2px 6px' }}
                      >
                        {DIFFICULTY_LABELS[ex.difficulty] || ex.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* 44px «+» IconButton at the end */}
                  <button
                    type="button"
                    className="button-primary"
                    style={{
                      width: '44px',
                      height: '44px',
                      minWidth: '44px',
                      minHeight: '44px',
                      borderRadius: '10px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      fontSize: '22px',
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectExercise(ex.id)
                    }}
                    aria-label={`إضافة ${ex.nameAr}`}
                  >
                    +
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
