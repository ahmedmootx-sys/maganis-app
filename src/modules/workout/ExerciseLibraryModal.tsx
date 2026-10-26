import { useMemo, useState } from 'react'
import type {
  CustomExercise,
  Exercise,
  WorkoutProgram,
} from '../shared/types.ts'
import { EXERCISES } from './exercises.ts'
import { ExerciseDetailModal } from './ExerciseDetailModal.tsx'
import { ExerciseVisual } from './ExerciseVisual.tsx'
import {
  TopBar,
  ListRow,
  Sheet,
  EmptyState,
  Select,
  Choice,
  Button,
  Icon,
} from '../../ui/index.ts'
import {
  IconPlus,
  IconClose,
  IconTrash,
  IconEdit,
  IconSearch,
} from '../../components/Icons.tsx'
import { selectEffectiveExercise } from './exerciseOverrides.ts'
import { ExerciseEditSheet } from './ExerciseEditSheet.tsx'
import { CopyExerciseNameButton } from './CopyExerciseNameButton.tsx'
import { Toast } from '../../components/Toast.tsx'
import { ExerciseMarks } from '../../components/ExerciseMarks.tsx'
import {
  getEquipmentLabel,
  getDifficultyLabel,
  getMuscleGroupLabel,
  formatBdiText,
  MUSCLE_GROUP_MAP,
  DIFFICULTY_MAP,
} from '../../utils/labels.ts'
import type { UserProfile } from '../onboarding/types.ts'
import {
  deriveConstraints,
  isExerciseAllowed,
  FULL_GYM_ALLOWED_EQUIPMENT,
  type UserWorkoutConstraints,
} from './constraints.ts'

export interface ExerciseLibraryModalProps {
  customExercises?: Exercise[]
  deletedExerciseIds?: string[]
  program?: WorkoutProgram | null
  profile?: UserProfile | null
  constraints?: UserWorkoutConstraints
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
  profile,
  constraints: customConstraints,
  onClose,
  onDeleteExercise,
  onRestoreExercise,
  onEditCustomExercise,
  onAddExerciseToDay,
}: ExerciseLibraryModalProps) {
  const effectiveConstraints = useMemo(
    () => customConstraints || deriveConstraints(profile),
    [customConstraints, profile],
  )

  const hasConstraints = useMemo(() => {
    return (
      effectiveConstraints.isCalisthenicsOnly ||
      effectiveConstraints.isHomeDumbbellsOnly ||
      effectiveConstraints.excludedExerciseKeys.size > 0 ||
      !effectiveConstraints.allowsLoadedExercises ||
      effectiveConstraints.allowedEquipment.size <
        FULL_GYM_ALLOWED_EQUIPMENT.size
    )
  }, [effectiveConstraints])

  const [filterSuitableOnly, setFilterSuitableOnly] = useState<boolean>(() =>
    Boolean(hasConstraints),
  )

  const [activeTab, setActiveTab] = useState<'all' | 'trash'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [subMuscleFilter, setSubMuscleFilter] = useState<string>('all')
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)

  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  )
  const [actionExercise, setActionExercise] = useState<Exercise | null>(null)
  const [addToDayExercise, setAddToDayExercise] = useState<Exercise | null>(
    null,
  )

  const [editSheetExercise, setEditSheetExercise] = useState<Exercise | null>(
    null,
  )
  const [toastMsg, setToastMsg] = useState('')
  const [overridesVersion, setOverridesVersion] = useState(0)

  const allExercises = useMemo(() => {
    void overridesVersion
    return [...EXERCISES, ...customExercises].map((ex) =>
      selectEffectiveExercise(ex),
    )
  }, [customExercises, overridesVersion])

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

  // Active filters list
  const activeFilters = useMemo(() => {
    const list: Array<{
      id: 'category' | 'sub' | 'equip' | 'level'
      label: string
    }> = []
    if (categoryFilter !== 'all') {
      list.push({
        id: 'category',
        label: MUSCLE_GROUP_MAP[categoryFilter] || categoryFilter,
      })
    }
    if (subMuscleFilter !== 'all') {
      list.push({ id: 'sub', label: subMuscleFilter })
    }
    if (equipmentFilter !== 'all') {
      list.push({ id: 'equip', label: getEquipmentLabel(equipmentFilter) })
    }
    if (levelFilter !== 'all') {
      list.push({ id: 'level', label: getDifficultyLabel(levelFilter) })
    }
    return list
  }, [categoryFilter, subMuscleFilter, equipmentFilter, levelFilter])

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
      if (filterSuitableOnly && hasConstraints) {
        if (!isExerciseAllowed(e, effectiveConstraints)) return false
      }
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
    filterSuitableOnly,
    hasConstraints,
    effectiveConstraints,
    searchTerm,
  ])

  function handleResetFilter(
    filterType: 'category' | 'sub' | 'equip' | 'level',
  ) {
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
      className="fullscreen-route library-screen modal-fullscreen"
      dir="rtl"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        background: 'var(--bg)',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        height: '100dvh',
        maxHeight: '100dvh',
        overflow: 'hidden' /* clip-ok: modal sheet scroller boundary */,
      }}
    >
      {/* TopBar with Back and Add Exercise */}
      <TopBar
        title="مكتبة التمارين"
        onBack={onClose}
        actions={
          onEditCustomExercise ? (
            <button
              type="button"
              className="btn btn-subtle"
              style={{
                width: '44px',
                height: '44px',
                minWidth: '44px',
                minHeight: '44px',
                padding: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-control, 10px)',
              }}
              aria-label="إضافة تمرين"
              onClick={() =>
                onEditCustomExercise({
                  id: '',
                  nameAr: '',
                  category: 'chest',
                  difficulty: 'beginner',
                  equipment: 'bodyweight',
                  measurementType: 'reps',
                  isCustom: true,
                  descriptionAr: '',
                })
              }
            >
              <IconPlus size={20} />
            </button>
          ) : undefined
        }
      />

      <div
        className="screen-content exercise-library-content"
        style={{
          overflowY: 'auto',
          overflowX: 'hidden' /* clip-ok: modal sheet scroller boundary */,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '16px',
          paddingBottom: 'var(--page-end, 16px)',
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

        {/* Segmented Tabs: الكل (N) | المحذوفة (M) using Choice with equal widths */}
        {deletedExercises.length > 0 && (
          <Choice<'all' | 'trash'>
            variant="segmented"
            options={[
              { value: 'all', label: `الكل (${activeExercises.length})` },
              {
                value: 'trash',
                label: `المحذوفة (${deletedExercises.length})`,
              },
            ]}
            value={activeTab}
            onChange={(val) => setActiveTab(val)}
            ariaLabel="تصفية التمارين حسب الحالة"
          />
        )}

        {/* Compact Filters Row */}
        {activeTab === 'all' && (
          <div
            className="library-filters-bar"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              width: '100%',
              margin: '2px 0 4px',
            }}
          >
            <button
              type="button"
              className={`chip-btn ${activeFilters.length > 0 ? 'selected' : ''}`}
              data-testid="library-filters-btn"
              onClick={() => setIsFilterSheetOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                minHeight: '36px',
                padding: '0 12px',
                borderRadius: 'var(--radius-control, 8px)',
                border:
                  activeFilters.length > 0
                    ? '1px solid var(--color-accent)'
                    : '1px solid var(--line)',
                background:
                  activeFilters.length > 0
                    ? 'var(--color-accent-subtle, rgba(235,94,40,0.12))'
                    : 'var(--card-subtle)',
                color:
                  activeFilters.length > 0
                    ? 'var(--color-accent-text, #eb5e28)'
                    : 'var(--ink)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <Icon name="filter" size={15} />
              <span>فلاتر</span>
              {activeFilters.length > 0 && (
                <span
                  style={{
                    background: 'var(--color-accent, #eb5e28)',
                    color: 'var(--color-accent-on, #ffffff)',
                    borderRadius: '10px',
                    padding: '1px 6px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {activeFilters.length}
                </span>
              )}
            </button>

            {/* Suitable for equipment toggle button */}
            {hasConstraints && (
              <button
                type="button"
                data-testid="suitable-equipment-filter-btn"
                className={`chip-btn ${filterSuitableOnly ? 'selected' : ''}`}
                onClick={() => setFilterSuitableOnly((prev) => !prev)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  minHeight: '34px',
                  padding: '0 12px',
                  borderRadius: '17px',
                  border: filterSuitableOnly
                    ? '1px solid var(--color-accent)'
                    : '1px solid var(--line)',
                  background: filterSuitableOnly
                    ? 'var(--color-accent-subtle, rgba(235,94,40,0.12))'
                    : 'var(--card-subtle)',
                  color: filterSuitableOnly
                    ? 'var(--color-accent-text, #eb5e28)'
                    : 'var(--ink)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <span>{filterSuitableOnly ? 'مناسب لمعداتي' : 'عرض الكل'}</span>
              </button>
            )}

            {/* Active Removable Chips */}
            {activeFilters.map((f) => (
              <button
                key={f.id}
                type="button"
                className="chip-btn selected"
                onClick={() => handleResetFilter(f.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  minHeight: '34px',
                  padding: '0 10px',
                  borderRadius: '17px',
                  border: '1px solid var(--color-accent)',
                  background:
                    'var(--color-accent-subtle, rgba(235,94,40,0.08))',
                  color: 'var(--color-accent-text, #eb5e28)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <span>{f.label}</span>
                <IconClose size={14} />
              </button>
            ))}
          </div>
        )}

        {/* Count Line */}
        <div
          data-testid="library-count-line"
          style={{
            fontSize: '13px',
            color: 'var(--muted)',
            fontWeight: 600,
            margin: '2px 0 6px 0',
          }}
        >
          تم العثور على {filteredExercises.length} تمرين
          {hasConstraints && (
            <span> ({filterSuitableOnly ? 'مناسب لمعداتي' : 'عرض الكل'})</span>
          )}
        </div>

        {/* Results List as ListRows with content-visibility windowing */}
        {filteredExercises.length === 0 ? (
          <EmptyState
            icon={<IconSearch size={36} />}
            title="ملقيناش نتايج"
            message="جرّب تبحث بكلمات تانية أو شيل شوية فلاتر عشان تشوف تمارين أكتر."
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
              const muscleLabel = getMuscleGroupLabel(ex.category)
              const equipLabel = getEquipmentLabel(ex.equipment)
              const diffLabel = getDifficultyLabel(ex.difficulty)
              const tertiaryInfo = `${muscleLabel} · ${equipLabel} · ${diffLabel}`

              return (
                <ListRow
                  key={ex.id}
                  onClick={() => {
                    window.location.hash = `#/exercise/${ex.id}`
                  }}
                  onLongPress={() => setActionExercise(ex)}
                  style={{
                    contentVisibility: 'auto',
                    containIntrinsicSize: '0 72px',
                  }}
                  leading={
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '10px',
                        overflow:
                          'hidden' /* clip-ok: modal sheet scroller boundary */,
                        background: 'var(--color-surface)',
                        border: '1px solid var(--line)',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
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
                  title={
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>{formatBdiText(ex.nameAr)}</span>
                      <ExerciseMarks
                        hasVideo={(ex as { hasVideo?: boolean }).hasVideo}
                        hasCustomMedia={
                          (ex as { hasCustomMedia?: boolean }).hasCustomMedia
                        }
                      />
                    </span>
                  }
                  secondary={
                    ex.name && ex.name !== ex.nameAr ? (
                      <bdi dir="ltr">{ex.name}</bdi>
                    ) : undefined
                  }
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

            {/* Action: Copy Name (Task G5-B4.1) */}
            <div style={{ padding: '4px 0' }}>
              <CopyExerciseNameButton
                nameAr={actionExercise.nameAr}
                nameEn={actionExercise.nameEn || actionExercise.name}
                onToast={(msg) => setToastMsg(msg)}
                style={{ width: '100%' }}
              />
            </div>

            {/* Action: Edit Exercise (Task G5-B4) */}
            <button
              type="button"
              data-testid="library-edit-exercise-btn"
              className="ghost-secondary full-width"
              style={{
                justifyContent: 'flex-start',
                height: '48px',
                gap: '10px',
              }}
              onClick={() => {
                const ex = actionExercise
                setActionExercise(null)
                setEditSheetExercise(ex)
              }}
            >
              <IconEdit size={18} />
              <span>تعديل بيانات التمرين</span>
            </button>

            {Boolean(
              'isCustom' in actionExercise &&
              actionExercise.isCustom &&
              onEditCustomExercise,
            ) && (
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
                  onEditCustomExercise?.(ex)
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
            <p
              style={{
                fontSize: '13px',
                color: 'var(--muted)',
                margin: '0 0 6px',
              }}
            >
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

      {/* Library Filter Sheet */}
      {isFilterSheetOpen && (
        <Sheet
          isOpen={isFilterSheetOpen}
          onClose={() => setIsFilterSheetOpen(false)}
          title="فلاتر التمارين"
          footer={
            <div
              style={{
                display: 'flex',
                gap: '8px',
                width: '100%',
                paddingBottom: 'env(safe-area-inset-bottom, 12px)',
              }}
            >
              <Button
                variant="primary"
                fullWidth
                onClick={() => setIsFilterSheetOpen(false)}
              >
                تطبيق
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setCategoryFilter('all')
                  setSubMuscleFilter('all')
                  setEquipmentFilter('all')
                  setLevelFilter('all')
                }}
              >
                مسح الفلاتر
              </Button>
            </div>
          }
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '8px 0 16px 0',
            }}
          >
            {/* Muscle Group */}
            <div>
              <label
                htmlFor="library-sheet-category"
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  color: 'var(--ink)',
                }}
              >
                المجموعة العضلية
              </label>
              <Select
                id="library-sheet-category"
                value={categoryFilter}
                onChange={(val) => {
                  setCategoryFilter(val)
                  setSubMuscleFilter('all')
                }}
                options={[
                  { value: 'all', label: 'الكل' },
                  ...Object.entries(MUSCLE_GROUP_MAP).map(([k, v]) => ({
                    value: k,
                    label: v,
                  })),
                ]}
                sheetTitle="اختر المجموعة العضلية"
              />
            </div>

            {/* Sub-Muscle Head (التفصيل) */}
            {availableSubMuscles.length > 0 && (
              <div>
                <label
                  htmlFor="library-sheet-submuscle"
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    color: 'var(--ink)',
                  }}
                >
                  الاستهداف التفصيلي (الرأس العضلي)
                </label>
                <Select
                  id="library-sheet-submuscle"
                  value={subMuscleFilter}
                  onChange={(val) => setSubMuscleFilter(val)}
                  options={[
                    { value: 'all', labelAr: 'الكل' },
                    ...availableSubMuscles.map((sub) => ({
                      value: sub,
                      labelAr: sub,
                    })),
                  ]}
                  sheetTitle="اختر الرأس العضلي التفصيلي"
                />
              </div>
            )}

            {/* Equipment */}
            <div>
              <label
                htmlFor="library-sheet-equipment"
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  color: 'var(--ink)',
                }}
              >
                نوع المعدات
              </label>
              <Select
                id="library-sheet-equipment"
                value={equipmentFilter}
                onChange={(val) => setEquipmentFilter(val)}
                options={[
                  { value: 'all', labelAr: 'الكل' },
                  { value: 'barbell', labelAr: 'بار' },
                  { value: 'dumbbell', labelAr: 'دامبل' },
                  { value: 'cable', labelAr: 'كابل' },
                  { value: 'machine', labelAr: 'جهاز' },
                  { value: 'bodyweight', labelAr: 'وزن الجسم' },
                  { value: 'band', labelAr: 'حبل مقاومة' },
                ]}
                sheetTitle="اختر نوع المعدات"
              />
            </div>

            {/* Difficulty Level */}
            <div>
              <label
                htmlFor="library-sheet-level"
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  color: 'var(--ink)',
                }}
              >
                مستوى الصعوبة
              </label>
              <Select
                id="library-sheet-level"
                value={levelFilter}
                onChange={(val) => setLevelFilter(val)}
                options={[
                  { value: 'all', label: 'الكل' },
                  ...Object.entries(DIFFICULTY_MAP).map(([k, v]) => ({
                    value: k,
                    label: v,
                  })),
                ]}
                sheetTitle="اختر مستوى الصعوبة"
              />
            </div>
          </div>
        </Sheet>
      )}

      {editSheetExercise && (
        <ExerciseEditSheet
          isOpen={Boolean(editSheetExercise)}
          onClose={() => setEditSheetExercise(null)}
          exercise={editSheetExercise}
          onSaved={() => setOverridesVersion((v) => v + 1)}
          onResetOriginal={() => setOverridesVersion((v) => v + 1)}
        />
      )}

      {toastMsg && (
        <Toast message={toastMsg} onDismiss={() => setToastMsg('')} />
      )}
    </div>
  )
}

export default ExerciseLibraryModal
