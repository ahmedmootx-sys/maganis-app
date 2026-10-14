import { useMemo, useState } from 'react'
import type {
  CustomExercise,
  DifficultyLevel,
  EquipmentType,
  Exercise,
  MuscleGroup,
  WorkoutProgram,
} from '../shared/types.ts'
import {
  DIFFICULTY_LABELS,
  EQUIPMENT_LABELS,
  MUSCLE_GROUP_LABELS,
} from '../shared/types.ts'
import { EXERCISES } from './exercises.ts'
import { ExerciseDetailModal } from './ExerciseDetailModal.tsx'
import { ExerciseVisual } from './ExerciseVisual.tsx'
import { TopBar } from '../../components/TopBar.tsx'
import { ListRow } from '../../components/ListRow.tsx'
import { Sheet } from '../../components/Sheet.tsx'
import { EmptyState } from '../../components/EmptyState.tsx'
import { Select } from '../../components/Select.tsx'
import {
  IconPlus,
  IconClose,
  IconTrash,
  IconEdit,
  IconSearch,
} from '../../components/Icons.tsx'

export interface ExerciseLibraryModalProps {
  customExercises?: Exercise[]
  deletedExerciseIds?: string[]
  program?: WorkoutProgram | null
  onClose: () => void
  onDeleteExercise?: (id: string) => void
  onRestoreExercise?: (id: string) => void
  onEditCustomExercise?: (exercise: CustomExercise) => void
  onAddExerciseToDay?: (dayIndex: number, exerciseId: string) => void
}

export function ExerciseLibraryModal({
  customExercises = [],
  deletedExerciseIds = [],
  program,
  onClose,
  onDeleteExercise,
  onRestoreExercise,
  onEditCustomExercise,
  onAddExerciseToDay,
}: ExerciseLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'trash'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [subMuscleFilter, setSubMuscleFilter] = useState<string>('all')
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')

  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  )
  const [actionExercise, setActionExercise] = useState<Exercise | null>(null)
  const [addToDayExercise, setAddToDayExercise] = useState<Exercise | null>(
    null,
  )

  const allExercises = useMemo(
    () => [...EXERCISES, ...customExercises],
    [customExercises],
  )

  const activeExercises = useMemo(() => {
    return allExercises.filter((e) => !deletedExerciseIds.includes(e.id))
  }, [allExercises, deletedExerciseIds])

  const deletedExercises = useMemo(() => {
    return allExercises.filter((e) => deletedExerciseIds.includes(e.id))
  }, [allExercises, deletedExerciseIds])

  // Sub-muscles based on category
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

  // Filtered exercises
  const currentPool = activeTab === 'all' ? activeExercises : deletedExercises
  const filteredExercises = useMemo(() => {
    return currentPool.filter((e) => {
      if (categoryFilter !== 'all' && e.category !== categoryFilter)
        return false
      if (subMuscleFilter !== 'all' && e.targetSubMuscleAr !== subMuscleFilter)
        return false
      if (equipmentFilter !== 'all' && e.equipment !== equipmentFilter)
        return false
      if (levelFilter !== 'all' && e.difficulty !== levelFilter) return false
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
    currentPool,
    categoryFilter,
    subMuscleFilter,
    equipmentFilter,
    levelFilter,
    searchTerm,
  ])

  function handleResetFilter(filterType: 'category' | 'sub' | 'equip' | 'level') {
    if (filterType === 'category') {
      setCategoryFilter('all')
      setSubMuscleFilter('all')
    } else if (filterType === 'sub') {
      setSubMuscleFilter('all')
    } else if (filterType === 'equip') {
      setEquipmentFilter('all')
    } else if (filterType === 'level') {
      setLevelFilter('all')
    }
  }

  return (
    <div
      className="fullscreen-route library-screen"
      dir="rtl"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* TopBar with Back */}
      <TopBar title="مكتبة التمارين" onBack={onClose} />

      <div
        className="screen-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '16px',
          maxWidth: '720px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Search Field (No Emoji) */}
        <div className="field">
          <input
            type="search"
            placeholder="ابحث باسم التمرين أو العضلة المستهدفة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="field-input"
            dir="rtl"
            aria-label="البحث في مكتبة التمارين"
          />
        </div>

        {/* Segmented Tabs: الكل (N) | المحذوفة (M) */}
        <div
          className="segmented-control"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'var(--card-subtle)',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid var(--line)',
            width: '100%',
          }}
        >
          <button
            type="button"
            className={`segmented-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
            style={{
              padding: '10px',
              fontSize: '13.5px',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'all' ? 'var(--card-bg)' : 'transparent',
              color: activeTab === 'all' ? 'var(--ink)' : 'var(--muted)',
              cursor: 'pointer',
              boxShadow:
                activeTab === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            الكل ({activeExercises.length})
          </button>
          <button
            type="button"
            className={`segmented-btn ${activeTab === 'trash' ? 'active' : ''}`}
            onClick={() => setActiveTab('trash')}
            style={{
              padding: '10px',
              fontSize: '13.5px',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'trash' ? 'var(--card-bg)' : 'transparent',
              color: activeTab === 'trash' ? 'var(--danger)' : 'var(--muted)',
              cursor: 'pointer',
              boxShadow:
                activeTab === 'trash' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            المحذوفة ({deletedExercises.length})
          </button>
        </div>

        {/* ChipRow of Select-chips: العضلة، التفصيل، المعدات، المستوى */}
        {activeTab === 'all' && (
          <div
            className="chip-select-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '4px',
            }}
          >
            {/* Muscle Group Chip */}
            <div style={{ flexShrink: 0, minWidth: '130px' }}>
              <Select
                id="library-category"
                value={categoryFilter}
                onChange={(val) => {
                  setCategoryFilter(val)
                  setSubMuscleFilter('all')
                }}
                options={[
                  { value: 'all', labelAr: 'العضلة: الكل' },
                  ...Object.entries(MUSCLE_GROUP_LABELS).map(([k, v]) => ({
                    value: k,
                    labelAr: v,
                  })),
                ]}
                sheetTitle="اختر المجموعة العضلية"
              />
            </div>

            {/* Sub-Muscle Detailed Chip */}
            {availableSubMuscles.length > 0 && (
              <div style={{ flexShrink: 0, minWidth: '130px' }}>
                <Select
                  id="library-submuscle"
                  value={subMuscleFilter}
                  onChange={(val) => setSubMuscleFilter(val)}
                  options={[
                    { value: 'all', labelAr: 'التفصيل: الكل' },
                    ...availableSubMuscles.map((sub) => ({
                      value: sub,
                      labelAr: sub,
                    })),
                  ]}
                  sheetTitle="اختر الرأس العضلي التفصيلي"
                />
              </div>
            )}

            {/* Equipment Chip */}
            <div style={{ flexShrink: 0, minWidth: '130px' }}>
              <Select
                id="library-equipment"
                value={equipmentFilter}
                onChange={(val) => setEquipmentFilter(val)}
                options={[
                  { value: 'all', labelAr: 'المعدات: الكل' },
                  ...Object.entries(EQUIPMENT_LABELS).map(([k, v]) => ({
                    value: k,
                    labelAr: v,
                  })),
                ]}
                sheetTitle="اختر نوع المعدات"
              />
            </div>

            {/* Level Chip */}
            <div style={{ flexShrink: 0, minWidth: '130px' }}>
              <Select
                id="library-level"
                value={levelFilter}
                onChange={(val) => setLevelFilter(val)}
                options={[
                  { value: 'all', labelAr: 'المستوى: الكل' },
                  ...Object.entries(DIFFICULTY_LABELS).map(([k, v]) => ({
                    value: k,
                    labelAr: v,
                  })),
                ]}
                sheetTitle="اختر مستوى الصعوبة"
              />
            </div>
          </div>
        )}

        {/* Active Filter Clear Tags */}
        {(categoryFilter !== 'all' ||
          subMuscleFilter !== 'all' ||
          equipmentFilter !== 'all' ||
          levelFilter !== 'all') && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap',
            }}
          >
            {categoryFilter !== 'all' && (
              <button
                type="button"
                className="chip-btn selected"
                onClick={() => handleResetFilter('category')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11.5px',
                  height: '32px',
                }}
              >
                <span>{MUSCLE_GROUP_LABELS[categoryFilter as MuscleGroup]}</span>
                <IconClose size={14} />
              </button>
            )}
            {subMuscleFilter !== 'all' && (
              <button
                type="button"
                className="chip-btn selected"
                onClick={() => handleResetFilter('sub')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11.5px',
                  height: '32px',
                }}
              >
                <span>{subMuscleFilter}</span>
                <IconClose size={14} />
              </button>
            )}
            {equipmentFilter !== 'all' && (
              <button
                type="button"
                className="chip-btn selected"
                onClick={() => handleResetFilter('equip')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11.5px',
                  height: '32px',
                }}
              >
                <span>
                  {EQUIPMENT_LABELS[equipmentFilter as EquipmentType]}
                </span>
                <IconClose size={14} />
              </button>
            )}
            {levelFilter !== 'all' && (
              <button
                type="button"
                className="chip-btn selected"
                onClick={() => handleResetFilter('level')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11.5px',
                  height: '32px',
                }}
              >
                <span>
                  {DIFFICULTY_LABELS[levelFilter as DifficultyLevel]}
                </span>
                <IconClose size={14} />
              </button>
            )}
          </div>
        )}

        {/* Count Line */}
        <div
          style={{
            fontSize: '12.5px',
            color: 'var(--muted)',
            fontWeight: 600,
          }}
        >
          تم العثور على {filteredExercises.length} تمرين
        </div>

        {/* Results List as ListRows with content-visibility windowing */}
        {filteredExercises.length === 0 ? (
          <EmptyState
            icon={<IconSearch size={36} />}
            title="لم يتم العثور على نتائج"
            message="جرب البحث بكلمات مختلفة أو قم بإزالة بعض الفلاتر لعرض مزيد من التمارين."
            action={
              <button
                type="button"
                className="ghost-secondary full-width"
                onClick={() => {
                  setSearchTerm('')
                  setCategoryFilter('all')
                  setSubMuscleFilter('all')
                  setEquipmentFilter('all')
                  setLevelFilter('all')
                }}
              >
                إلغاء جميع الفلاتر
              </button>
            }
          />
        ) : (
          <div
            className="exercise-library-list"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {filteredExercises.map((ex) => {
              const muscleLabel =
                MUSCLE_GROUP_LABELS[ex.category as MuscleGroup] || ex.category
              const equipLabel =
                EQUIPMENT_LABELS[ex.equipment as EquipmentType] || ex.equipment
              const diffLabel =
                DIFFICULTY_LABELS[ex.difficulty as DifficultyLevel] ||
                ex.difficulty
              const tertiaryInfo = `${muscleLabel} · ${equipLabel} · ${diffLabel}`

              return (
                <ListRow
                  key={ex.id}
                  onClick={() => setSelectedExercise(ex)}
                  onLongPress={() => setActionExercise(ex)}
                  leading={
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        background: 'var(--card-subtle)',
                        border: '1px solid var(--line)',
                        flexShrink: 0,
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
                  }
                  title={ex.nameAr}
                  secondary={ex.name && ex.name !== ex.nameAr ? ex.name : undefined}
                  secondaryIsLtr={true}
                  tertiary={tertiaryInfo}
                  trailing={
                    program && program.days.length > 0 ? (
                      <button
                        type="button"
                        className="topbar-icon-btn"
                        style={{
                          width: '38px',
                          height: '38px',
                          minWidth: '38px',
                          minHeight: '38px',
                          borderRadius: '8px',
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setAddToDayExercise(ex)
                        }}
                        aria-label={`إضافة ${ex.nameAr} لجدول التمرين`}
                      >
                        <IconPlus size={16} />
                      </button>
                    ) : undefined
                  }
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}

      {/* Long Press Management Sheet */}
      <Sheet
        isOpen={Boolean(actionExercise)}
        onClose={() => setActionExercise(null)}
        title={actionExercise?.nameAr}
        subtitle={actionExercise?.name}
      >
        {actionExercise && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              className="ghost-secondary full-width"
              style={{
                justifyContent: 'flex-start',
                height: '48px',
                gap: '10px',
              }}
              onClick={() => {
                const ex = actionExercise
                setActionExercise(null)
                setSelectedExercise(ex)
              }}
            >
              <span>عرض تفاصيل التمرين وتشريح العضلات</span>
            </button>

            {'isCustom' in actionExercise &&
              actionExercise.isCustom &&
              onEditCustomExercise && (
                <button
                  type="button"
                  className="ghost-secondary full-width"
                  style={{
                    justifyContent: 'flex-start',
                    height: '48px',
                    gap: '10px',
                  }}
                  onClick={() => {
                    const ex = actionExercise as CustomExercise
                    setActionExercise(null)
                    onClose()
                    onEditCustomExercise(ex)
                  }}
                >
                  <IconEdit size={18} />
                  <span>تعديل بيانات التمرين المخصص</span>
                </button>
              )}

            {activeTab === 'all' && onDeleteExercise && (
              <button
                type="button"
                className="danger full-width"
                style={{
                  justifyContent: 'flex-start',
                  height: '48px',
                  gap: '10px',
                }}
                onClick={() => {
                  const ex = actionExercise
                  setActionExercise(null)
                  onDeleteExercise(ex.id)
                }}
              >
                <IconTrash size={18} />
                <span>
                  {'isCustom' in actionExercise && actionExercise.isCustom
                    ? 'حذف التمرين المخصص نهائياً'
                    : 'إخفاء التمرين من المكتبة (نقل للمحذوفة)'}
                </span>
              </button>
            )}

            {activeTab === 'trash' && onRestoreExercise && (
              <button
                type="button"
                className="button-primary full-width"
                style={{ height: '48px' }}
                onClick={() => {
                  const ex = actionExercise
                  setActionExercise(null)
                  onRestoreExercise(ex.id)
                }}
              >
                استرجاع التمرين للمكتبة
              </button>
            )}
          </div>
        )}
      </Sheet>

      {/* Add To Day Sheet */}
      <Sheet
        isOpen={Boolean(addToDayExercise)}
        onClose={() => setAddToDayExercise(null)}
        title="إضافة التمرين لليوم"
        subtitle={addToDayExercise?.nameAr}
      >
        {addToDayExercise && program && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 6px' }}>
              اختر اليوم التدريبي لإضافة تمرين "{addToDayExercise.nameAr}":
            </p>
            {program.days.map((day) => (
              <button
                key={day.dayIndex}
                type="button"
                className="list-row list-row--clickable"
                style={{ textAlign: 'right', width: '100%', height: '52px' }}
                onClick={() => {
                  onAddExerciseToDay?.(day.dayIndex, addToDayExercise.id)
                  setAddToDayExercise(null)
                }}
              >
                <div className="list-row__content">
                  <div className="list-row__title">{day.labelAr}</div>
                  <div className="list-row__secondary">{day.focus}</div>
                </div>
                <IconPlus size={16} />
              </button>
            ))}
          </div>
        )}
      </Sheet>
    </div>
  )
}

export default ExerciseLibraryModal
