import { useEffect, useMemo, useRef, useState } from 'react'
import type {
  CustomExercise,
  Exercise,
  ExerciseSection,
  ProgramDay,
  WorkoutProgram,
  WorkoutSplitType,
} from '../shared/types.ts'
import { WORKOUT_SPLIT_LABELS } from '../shared/types.ts'
import { navigationHistory } from '../../utils/navigationHistory.ts'
import { getExerciseById } from './exercises.ts'
import { ExerciseDetailModal } from './ExerciseDetailModal.tsx'
import { ExercisePickerModal } from './ExercisePickerModal.tsx'
import { ExerciseSwapModal } from './ExerciseSwapModal.tsx'
import { ExerciseVisual } from './ExerciseVisual.tsx'
import { generateProgram } from './programGenerator.ts'
import {
  convertDayToHomeWorkout,
  downloadRoutineFile,
  parseAndValidateRoutineJson,
  shareRoutineFile,
} from './workoutUtils.ts'
import { TopBar } from '../../components/TopBar.tsx'
import { Sheet } from '../../components/Sheet.tsx'
import { ConfirmSheet } from '../../components/ConfirmSheet.tsx'
import { ListRow } from '../../components/ListRow.tsx'
import { EmptyState } from '../../components/EmptyState.tsx'
import { Toast } from '../../components/Toast.tsx'
import {
  IconSearch,
  IconPlus,
  IconMoreVertical,
  IconChevronLeft,
  IconLock,
  IconUnlock,
  IconShare,
  IconDownload,
  IconUpload,
  IconTrash,
  IconDumbbell,
  IconClipboard,
  IconCalendar,
} from '../../components/Icons.tsx'

export interface WeeklyPlanViewProps {
  program: WorkoutProgram | null
  customExercises?: CustomExercise[]
  userInjuries?: string[]
  onUpdateProgram?: (updatedProgram: WorkoutProgram) => void
  onDeleteProgram?: () => void
  onStartRoutine?: (day: ProgramDay) => void
  onOpenScheduleModal?: () => void
  onOpenVaultModal?: () => void
  onOpenLibrary?: () => void
  onOpenCustomBuilder?: () => void
  onOpenSessionLogger?: () => void
  onGenerateProgram?: () => void
  initialSelectedDayIndex?: number | null
}

const SPLIT_TYPE_OPTIONS: {
  value: WorkoutSplitType
  labelAr: string
  labelEn: string
}[] = [
  {
    value: 'ppl',
    labelAr: 'دفع / سحب / أرجل',
    labelEn: 'Push / Pull / Legs (PPL)',
  },
  {
    value: 'upper_lower',
    labelAr: 'علوي / سفلي',
    labelEn: 'Upper / Lower',
  },
  {
    value: 'arnold',
    labelAr: 'تقسيم أرنولد الكلاسيكي',
    labelEn: 'Arnold Split',
  },
  {
    value: 'bro_split',
    labelAr: 'عضلة واحدة يومياً',
    labelEn: 'Bro Split',
  },
]

export function WeeklyPlanView({
  program,
  customExercises = [],
  userInjuries = [],
  onUpdateProgram,
  onDeleteProgram,
  onStartRoutine,
  onOpenScheduleModal,
  onOpenVaultModal,
  onOpenLibrary,
  onOpenCustomBuilder,
  onOpenSessionLogger,
  onGenerateProgram,
  initialSelectedDayIndex = null,
}: WeeklyPlanViewProps) {
  // Navigation: null = Week overview; number = Day screen
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(
    initialSelectedDayIndex,
  )

  // Modals & Sheets
  const [isPlusSheetOpen, setIsPlusSheetOpen] = useState(false)
  const [isManageSheetOpen, setIsManageSheetOpen] = useState(false)
  const [isDayOverflowOpen, setIsDayOverflowOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  // Confirmations
  const [replaceConfirm, setReplaceConfirm] = useState<{
    isOpen: boolean
    title: string
    message: string
    action: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
  })

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  // Exercise Sub-Modals
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  )
  const [swapTarget, setSwapTarget] = useState<{
    dayIndex: number
    exerciseIndex: number
    exercise: Exercise
  } | null>(null)
  const [addingToDayIndex, setAddingToDayIndex] = useState<number | null>(null)
  const [addingSection, setAddingSection] = useState<ExerciseSection>('primary')

  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Register Day Screen with mobile back button
  useEffect(() => {
    if (selectedDayIndex !== null) {
      return navigationHistory.push('dayScreen', () => {
        setSelectedDayIndex(null)
        setIsEditMode(false)
      })
    }
  }, [selectedDayIndex])

  // Register Exercise Detail with back button
  useEffect(() => {
    if (selectedExercise) {
      return navigationHistory.push('selectedExercise', () =>
        setSelectedExercise(null),
      )
    }
  }, [selectedExercise])

  // Register Swap Target with back button
  useEffect(() => {
    if (swapTarget) {
      return navigationHistory.push('swapTarget', () => setSwapTarget(null))
    }
  }, [swapTarget])

  // Register Add Exercise with back button
  useEffect(() => {
    if (addingToDayIndex !== null) {
      return navigationHistory.push('addingExercise', () =>
        setAddingToDayIndex(null),
      )
    }
  }, [addingToDayIndex])

  const todayDayIndex = useMemo(() => new Date().getDay(), [])

  const selectedDay = useMemo(() => {
    if (selectedDayIndex === null || !program) return null
    return program.days.find((d) => d.dayIndex === selectedDayIndex) ?? null
  }, [program, selectedDayIndex])

  function handleOpenDetail(exerciseId: string) {
    const custom = customExercises.find((c) => c.id === exerciseId)
    const ex = custom ?? getExerciseById(exerciseId)
    if (ex) {
      setSelectedExercise(ex)
    }
  }

  function handleSwapExercise(newEx: Exercise) {
    if (!swapTarget || !onUpdateProgram || !program) return
    const newDays = program.days.map((day) => {
      if (day.dayIndex !== swapTarget.dayIndex) return day
      const updatedExercises = [...day.exercises]
      updatedExercises[swapTarget.exerciseIndex] = {
        ...updatedExercises[swapTarget.exerciseIndex],
        exerciseId: newEx.id,
      }
      return { ...day, exercises: updatedExercises }
    })
    onUpdateProgram({ ...program, days: newDays })
    setSwapTarget(null)
    showToast('تم استبدال التمرين بنجاح')
  }

  function handleRemoveExercise(dayIndex: number, exerciseIdx: number) {
    if (!onUpdateProgram || !program) return
    const newDays = program.days.map((day) => {
      if (day.dayIndex !== dayIndex) return day
      const updatedExercises = day.exercises.filter(
        (_, idx) => idx !== exerciseIdx,
      )
      return { ...day, exercises: updatedExercises }
    })
    onUpdateProgram({ ...program, days: newDays })
    showToast('تم حذف التمرين من اليوم')
  }

  function handleMoveExercise(
    dayIndex: number,
    fromIdx: number,
    direction: 'up' | 'down',
  ) {
    if (!onUpdateProgram || !program) return
    const targetIdx = direction === 'up' ? fromIdx - 1 : fromIdx + 1
    const newDays = program.days.map((day) => {
      if (day.dayIndex !== dayIndex) return day
      if (targetIdx < 0 || targetIdx >= day.exercises.length) return day
      const updated = [...day.exercises]
      const temp = updated[fromIdx]
      updated[fromIdx] = updated[targetIdx]
      updated[targetIdx] = temp
      return { ...day, exercises: updated }
    })
    onUpdateProgram({ ...program, days: newDays })
  }

  function handleAddExerciseToDay(
    dayIndex: number,
    newExId: string,
    section: ExerciseSection = addingSection,
  ) {
    if (!onUpdateProgram || !program || !newExId) return
    const newDays = program.days.map((day) => {
      if (day.dayIndex !== dayIndex) return day
      const newPe = {
        exerciseId: newExId,
        sets: 3,
        reps: 10,
        restSeconds: 60,
        section,
      }
      return { ...day, exercises: [...day.exercises, newPe] }
    })
    onUpdateProgram({ ...program, days: newDays })
    setAddingToDayIndex(null)
    showToast('تمت إضافة التمرين بنجاح')
  }

  function handleToggleLock() {
    if (!onUpdateProgram || !program) return
    const updated = { ...program, isLocked: !program.isLocked }
    onUpdateProgram(updated)
    showToast(
      updated.isLocked ? 'تم قفل الجدول التدريبي' : 'تم إلغاء قفل الجدول',
    )
  }

  function handleChangeSplit(newSplit: WorkoutSplitType) {
    if (!program || !onUpdateProgram) return
    const doChange = () => {
      const newProg = generateProgram({
        goal: program.primaryGoal,
        trainingDaysPerWeek: program.trainingDaysPerWeek,
        splitType: newSplit,
        injuries: userInjuries,
        customExercises,
      })
      onUpdateProgram(newProg)
      setIsManageSheetOpen(false)
      showToast('تم تغيير النظام التدريبي التلقائي بنجاح')
    }

    setReplaceConfirm({
      isOpen: true,
      title: 'تغيير النظام التدريبي',
      message: `سيتم استبدال جدولك التدريبي الحالي بالنظام الجديد (${WORKOUT_SPLIT_LABELS[newSplit]}). هل تود المتابعة؟`,
      action: doChange,
    })
  }

  function handleConvertToHome() {
    if (!selectedDay || !program || !onUpdateProgram) return
    const converted = convertDayToHomeWorkout(selectedDay)
    const newDays = program.days.map((d) =>
      d.dayIndex === selectedDay.dayIndex ? converted : d,
    )
    onUpdateProgram({ ...program, days: newDays })
    setIsDayOverflowOpen(false)
    showToast('تم تحويل تمارين اليوم إلى بدائل منزلية')
  }

  function handleImportFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const parsed = parseAndValidateRoutineJson(text)
        if (parsed.success) {
          const imported = parsed.program
          setReplaceConfirm({
            isOpen: true,
            title: 'تأكيد استيراد الجدول',
            message: `سيتم استبدال جدولك الحالي بالجدول المستورد: "${parsed.title || (imported as WorkoutProgram & { title?: string }).title || 'جدول تمارين'}" (${imported.days.length} أيام). هل أنت متأكد؟`,
            action: () => {
              onUpdateProgram?.(imported)
              setIsManageSheetOpen(false)
              showToast('تم استيراد الجدول التدريبي بنجاح')
            },
          })
        } else {
          showToast(`خطأ في استيراد الملف: ${parsed.error}`)
        }
      } catch {
        showToast('تعذر قراءة ملف الجدول التدريبي')
      }
    }
    reader.readAsText(file)
  }

  // --- Render Empty State ---
  if (!program || program.days.length === 0) {
    return (
      <div className="screen-container training-screen" dir="rtl">
        <TopBar
          title="التدريب"
          actions={
            <button
              type="button"
              className="topbar-icon-btn"
              onClick={onOpenLibrary}
              aria-label="مكتبة التمارين"
            >
              <IconSearch size={20} />
            </button>
          }
        />
        <div className="screen-content" style={{ padding: '24px 16px' }}>
          <EmptyState
            icon={<IconDumbbell size={48} />}
            title="لا يوجد جدول تدريبي حالي"
            message="قم بإنشاء برنامج تدريبي علمي مخصص وفقاً لأيامك وهدفك الرياضي، أو اختر تصميماً يدوياً."
            action={
              <button
                type="button"
                className="button-primary full-width"
                onClick={onGenerateProgram}
              >
                إنشاء برنامج تدريبي
              </button>
            }
          />
        </div>
      </div>
    )
  }

  // --- Render Day Screen ---
  if (selectedDay) {
    const warmupExercises = selectedDay.exercises.filter(
      (e) => e.section === 'warmup',
    )
    const primaryExercises = selectedDay.exercises.filter(
      (e) => !e.section || e.section === 'primary',
    )
    const cooldownExercises = selectedDay.exercises.filter(
      (e) => e.section === 'cooldown',
    )

    return (
      <div className="screen-container day-screen" dir="rtl">
        {/* TopBar with back */}
        <TopBar
          onBack={() => {
            setSelectedDayIndex(null)
            setIsEditMode(false)
          }}
          title={selectedDay.labelAr}
          subtitle={selectedDay.focus}
          actions={
            <button
              type="button"
              className="topbar-icon-btn"
              onClick={() => setIsDayOverflowOpen(true)}
              aria-label="خيارات اليوم"
            >
              <IconMoreVertical size={20} />
            </button>
          }
        />

        <div
          className="screen-content"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            padding: '16px 16px 80px',
          }}
        >
          {/* Section: الإحماء والتسخين */}
          <section className="screen-section">
            <div className="section-title">
              <span>الإحماء والتسخين</span>
              <span className="section-title-counter">
                {warmupExercises.length}
              </span>
            </div>

            {warmupExercises.length === 0 ? (
              <div
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                }}
              >
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  لا توجد تمارين إحماء مضافة
                </span>
                <button
                  type="button"
                  className="ghost-primary tiny"
                  onClick={() => {
                    setAddingSection('warmup')
                    setAddingToDayIndex(selectedDay.dayIndex)
                  }}
                >
                  + إضافة
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {warmupExercises.map((pe, idx) => {
                  const globalIdx = selectedDay.exercises.indexOf(pe)
                  const ex = getExerciseById(pe.exerciseId)
                  const arabicName = ex?.nameAr ?? pe.exerciseId
                  const englishName =
                    (ex as { nameEn?: string; name?: string })?.nameEn ||
                    ex?.name ||
                    ''
                  const setsReps = `${pe.sets} × ${pe.reps === 0 ? 'أقصى' : pe.reps}`

                  return (
                    <ListRow
                      key={`warmup-${idx}`}
                      onClick={
                        !isEditMode
                          ? () => handleOpenDetail(pe.exerciseId)
                          : undefined
                      }
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
                            category={ex?.category ?? 'chest'}
                            exerciseId={pe.exerciseId}
                            exerciseName={arabicName}
                            size="small"
                          />
                        </div>
                      }
                      title={arabicName}
                      secondary={englishName}
                      secondaryIsLtr={true}
                      trailing={
                        isEditMode ? (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <button
                              type="button"
                              className="ghost tiny"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMoveExercise(
                                  selectedDay.dayIndex,
                                  globalIdx,
                                  'up',
                                )
                              }}
                              disabled={globalIdx === 0}
                              aria-label="تحريك لأعلى"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              className="ghost tiny"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMoveExercise(
                                  selectedDay.dayIndex,
                                  globalIdx,
                                  'down',
                                )
                              }}
                              disabled={
                                globalIdx === selectedDay.exercises.length - 1
                              }
                              aria-label="تحريك لأسفل"
                            >
                              ▼
                            </button>
                            <button
                              type="button"
                              className="ghost-danger tiny"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveExercise(
                                  selectedDay.dayIndex,
                                  globalIdx,
                                )
                              }}
                              aria-label="حذف"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: '13px',
                                color: 'var(--ink)',
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              {setsReps}
                            </span>
                            <IconChevronLeft
                              size={16}
                              style={{ color: 'var(--muted)' }}
                            />
                          </div>
                        )
                      }
                    />
                  )
                })}
              </div>
            )}
          </section>

          {/* Section: التمارين الأساسية */}
          <section className="screen-section">
            <div className="section-title">
              <span>التمارين الأساسية</span>
              <span className="section-title-counter">
                {primaryExercises.length}
              </span>
            </div>

            {primaryExercises.length === 0 ? (
              <div
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                }}
              >
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  لا توجد تمارين أساسية مضافة
                </span>
                <button
                  type="button"
                  className="ghost-primary tiny"
                  onClick={() => {
                    setAddingSection('primary')
                    setAddingToDayIndex(selectedDay.dayIndex)
                  }}
                >
                  + إضافة
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {primaryExercises.map((pe, idx) => {
                  const globalIdx = selectedDay.exercises.indexOf(pe)
                  const ex = getExerciseById(pe.exerciseId)
                  const arabicName = ex?.nameAr ?? pe.exerciseId
                  const englishName =
                    (ex as { nameEn?: string; name?: string })?.nameEn ||
                    ex?.name ||
                    ''
                  const setsReps = `${pe.sets} × ${pe.reps === 0 ? 'أقصى' : pe.reps}`

                  return (
                    <ListRow
                      key={`primary-${idx}`}
                      onClick={
                        !isEditMode
                          ? () => handleOpenDetail(pe.exerciseId)
                          : undefined
                      }
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
                            category={ex?.category ?? 'chest'}
                            exerciseId={pe.exerciseId}
                            exerciseName={arabicName}
                            size="small"
                          />
                        </div>
                      }
                      title={arabicName}
                      secondary={englishName}
                      secondaryIsLtr={true}
                      trailing={
                        isEditMode ? (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <button
                              type="button"
                              className="ghost tiny"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMoveExercise(
                                  selectedDay.dayIndex,
                                  globalIdx,
                                  'up',
                                )
                              }}
                              disabled={globalIdx === 0}
                              aria-label="تحريك لأعلى"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              className="ghost tiny"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMoveExercise(
                                  selectedDay.dayIndex,
                                  globalIdx,
                                  'down',
                                )
                              }}
                              disabled={
                                globalIdx === selectedDay.exercises.length - 1
                              }
                              aria-label="تحريك لأسفل"
                            >
                              ▼
                            </button>
                            <button
                              type="button"
                              className="ghost-danger tiny"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveExercise(
                                  selectedDay.dayIndex,
                                  globalIdx,
                                )
                              }}
                              aria-label="حذف"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: '13px',
                                color: 'var(--ink)',
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              {setsReps}
                            </span>
                            <IconChevronLeft
                              size={16}
                              style={{ color: 'var(--muted)' }}
                            />
                          </div>
                        )
                      }
                    />
                  )
                })}
              </div>
            )}
          </section>

          {/* Optional Cooldown Section if present */}
          {cooldownExercises.length > 0 && (
            <section className="screen-section">
              <div className="section-title">
                <span>المرونة والثبات والتهدئة</span>
                <span className="section-title-counter">
                  {cooldownExercises.length}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {cooldownExercises.map((pe, idx) => {
                  const globalIdx = selectedDay.exercises.indexOf(pe)
                  const ex = getExerciseById(pe.exerciseId)
                  const arabicName = ex?.nameAr ?? pe.exerciseId
                  const englishName =
                    (ex as { nameEn?: string; name?: string })?.nameEn ||
                    ex?.name ||
                    ''
                  const setsReps = `${pe.sets} × ${pe.reps === 0 ? 'أقصى' : pe.reps}`

                  return (
                    <ListRow
                      key={`cooldown-${idx}`}
                      onClick={
                        !isEditMode
                          ? () => handleOpenDetail(pe.exerciseId)
                          : undefined
                      }
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
                            category={ex?.category ?? 'legs'}
                            exerciseId={pe.exerciseId}
                            exerciseName={arabicName}
                            size="small"
                          />
                        </div>
                      }
                      title={arabicName}
                      secondary={englishName}
                      secondaryIsLtr={true}
                      trailing={
                        isEditMode ? (
                          <button
                            type="button"
                            className="ghost-danger tiny"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveExercise(
                                selectedDay.dayIndex,
                                globalIdx,
                              )
                            }}
                          >
                            ✕
                          </button>
                        ) : (
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: '13px',
                              color: 'var(--ink)',
                            }}
                          >
                            {setsReps}
                          </span>
                        )
                      }
                    />
                  )
                })}
              </div>
            </section>
          )}
        </div>

        {/* Sticky Bottom Primary "ابدأ التمرين" */}
        <div className="sticky-bottom-bar">
          <button
            type="button"
            className="button-primary full-width"
            onClick={() => onStartRoutine?.(selectedDay)}
          >
            ابدأ التمرين
          </button>
        </div>

        {/* Day Overflow Sheet */}
        <Sheet
          isOpen={isDayOverflowOpen}
          onClose={() => setIsDayOverflowOpen(false)}
          title={`خيارات ${selectedDay.labelAr}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              className="ghost-secondary full-width"
              style={{ justifyContent: 'flex-start', height: '48px' }}
              onClick={() => {
                setIsDayOverflowOpen(false)
                setAddingSection('primary')
                setAddingToDayIndex(selectedDay.dayIndex)
              }}
            >
              + إضافة تمرين لهذا اليوم
            </button>
            <button
              type="button"
              className="ghost-secondary full-width"
              style={{ justifyContent: 'flex-start', height: '48px' }}
              onClick={() => {
                setIsDayOverflowOpen(false)
                setIsEditMode(!isEditMode)
              }}
            >
              {isEditMode
                ? 'إنهاء وضع التعديل والترتيب'
                : 'ترتيب وتعديل التمارين'}
            </button>
            <button
              type="button"
              className="ghost-secondary full-width"
              style={{ justifyContent: 'flex-start', height: '48px' }}
              onClick={handleConvertToHome}
            >
              تحويل التمارين لبدائل منزلية
            </button>
          </div>
        </Sheet>

        {/* Sub-modals for day */}
        {selectedExercise && (
          <ExerciseDetailModal
            exercise={selectedExercise}
            onClose={() => setSelectedExercise(null)}
            onSwapClick={() => {
              const currentExIdx = selectedDay.exercises.findIndex(
                (e) => e.exerciseId === selectedExercise.id,
              )
              if (currentExIdx >= 0) {
                setSwapTarget({
                  dayIndex: selectedDay.dayIndex,
                  exerciseIndex: currentExIdx,
                  exercise: selectedExercise,
                })
              }
              setSelectedExercise(null)
            }}
          />
        )}

        {swapTarget && (
          <ExerciseSwapModal
            currentExercise={swapTarget.exercise}
            customExercises={customExercises}
            onSelectSwap={handleSwapExercise}
            onClose={() => setSwapTarget(null)}
          />
        )}

        {addingToDayIndex !== null && (
          <ExercisePickerModal
            onSelectExercise={(exId) =>
              handleAddExerciseToDay(addingToDayIndex, exId, addingSection)
            }
            onClose={() => setAddingToDayIndex(null)}
            customExercises={customExercises}
            dayLabelAr={selectedDay.labelAr}
          />
        )}

        {toastMessage && <Toast message={toastMessage} />}
      </div>
    )
  }

  // --- Render Week Overview ---
  const splitLabel = program.splitType
    ? WORKOUT_SPLIT_LABELS[program.splitType]
    : 'جدول مخصص'

  return (
    <div className="screen-container training-screen" dir="rtl">
      {/* TopBar "التدريب" */}
      <TopBar
        title="التدريب"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="topbar-icon-btn"
              onClick={onOpenLibrary}
              aria-label="مكتبة التمارين"
            >
              <IconSearch size={20} />
            </button>
            <button
              type="button"
              className="topbar-icon-btn"
              onClick={() => setIsPlusSheetOpen(true)}
              aria-label="إضافة"
            >
              <IconPlus size={20} />
            </button>
            <button
              type="button"
              className="topbar-icon-btn"
              onClick={() => setIsManageSheetOpen(true)}
              aria-label="إدارة البرنامج"
            >
              <IconMoreVertical size={20} />
            </button>
          </div>
        }
      />

      <div
        className="screen-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '16px',
        }}
      >
        {/* Program Header: Name + N أيام أسبوعياً + small "مقفل" status */}
        <div
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            padding: '14px 16px',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: 'var(--ink)',
            }}
          >
            {splitLabel}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12.5px',
              color: 'var(--muted)',
            }}
          >
            <span>{program.days.length} أيام أسبوعياً</span>
            {program.isLocked && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--accent)',
                  fontWeight: 600,
                }}
              >
                · <IconLock size={12} /> مقفل
              </span>
            )}
          </div>
        </div>

        {/* Week ListRows */}
        <section className="screen-section">
          <div className="section-title">
            <span>أيام الجدول التدريبي</span>
            <span className="section-title-counter">
              {program.days.length} أيام
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {program.days.map((day) => {
              const isToday = day.dayIndex === todayDayIndex
              const exerciseCount = day.exercises.length

              return (
                <ListRow
                  key={day.dayIndex}
                  onClick={() => setSelectedDayIndex(day.dayIndex)}
                  className={isToday ? 'list-row--active' : ''}
                  leading={
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: isToday
                          ? 'var(--accent)'
                          : 'var(--card-subtle)',
                        color: isToday ? '#ffffff' : 'var(--ink)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '14px',
                        border: '1px solid var(--line)',
                      }}
                    >
                      {day.labelAr.slice(0, 3)}
                    </div>
                  }
                  title={
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>{day.labelAr}</span>
                      {isToday && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: 'var(--accent)',
                            background: 'var(--accent-soft)',
                            padding: '2px 6px',
                            borderRadius: '6px',
                          }}
                        >
                          اليوم
                        </span>
                      )}
                    </div>
                  }
                  secondary={day.focus}
                  trailing={
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 600,
                          color: 'var(--muted)',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {exerciseCount} تمارين
                      </span>
                      <IconChevronLeft
                        size={16}
                        style={{ color: 'var(--muted)' }}
                      />
                    </div>
                  }
                />
              )
            })}
          </div>
        </section>
      </div>

      {/* Sheet: Plus Actions */}
      <Sheet
        isOpen={isPlusSheetOpen}
        onClose={() => setIsPlusSheetOpen(false)}
        title="إضافة وتخصيص"
      >
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
              setIsPlusSheetOpen(false)
              onOpenCustomBuilder?.()
            }}
          >
            <IconDumbbell size={18} />
            <span>تمرين مخصص</span>
          </button>
          <button
            type="button"
            className="ghost-secondary full-width"
            style={{
              justifyContent: 'flex-start',
              height: '48px',
              gap: '10px',
            }}
            onClick={() => {
              setIsPlusSheetOpen(false)
              onOpenSessionLogger?.()
            }}
          >
            <IconClipboard size={18} />
            <span>تسجيل يدوي</span>
          </button>
          <button
            type="button"
            className="ghost-secondary full-width"
            style={{
              justifyContent: 'flex-start',
              height: '48px',
              gap: '10px',
            }}
            onClick={() => {
              setIsPlusSheetOpen(false)
              setReplaceConfirm({
                isOpen: true,
                title: 'إنشاء برنامج جديد',
                message:
                  'سيتم استبدال برنامجك الحالي ببرنامج تلقائي جديد مبني على بيانات ملفك الشخصي. هل أنت متأكد؟',
                action: () => onGenerateProgram?.(),
              })
            }}
          >
            <IconPlus size={18} />
            <span>برنامج جديد</span>
          </button>
          <button
            type="button"
            className="ghost-secondary full-width"
            style={{
              justifyContent: 'flex-start',
              height: '48px',
              gap: '10px',
            }}
            onClick={() => {
              setIsPlusSheetOpen(false)
              onOpenScheduleModal?.()
            }}
          >
            <IconCalendar size={18} />
            <span>جدولي بالأيام</span>
          </button>
        </div>
      </Sheet>

      {/* Sheet: Manage Program Overflow */}
      <Sheet
        isOpen={isManageSheetOpen}
        onClose={() => setIsManageSheetOpen(false)}
        title="إدارة البرنامج"
      >
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
              setIsManageSheetOpen(false)
              onOpenVaultModal?.()
            }}
          >
            <IconClipboard size={18} />
            <span>حافظة الجداول</span>
          </button>

          <button
            type="button"
            className="ghost-secondary full-width"
            style={{
              justifyContent: 'flex-start',
              height: '48px',
              gap: '10px',
            }}
            onClick={() => {
              shareRoutineFile(program, splitLabel)
            }}
          >
            <IconShare size={18} />
            <span>مشاركة الجدول</span>
          </button>

          <button
            type="button"
            className="ghost-secondary full-width"
            style={{
              justifyContent: 'flex-start',
              height: '48px',
              gap: '10px',
            }}
            onClick={() => {
              downloadRoutineFile(program, splitLabel)
              showToast('تم تنزيل ملف الجدول بنجاح')
            }}
          >
            <IconDownload size={18} />
            <span>تنزيل كملف</span>
          </button>

          <button
            type="button"
            className="ghost-secondary full-width"
            style={{
              justifyContent: 'flex-start',
              height: '48px',
              gap: '10px',
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <IconUpload size={18} />
            <span>استيراد جدول</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImportFile(file)
            }}
          />

          <button
            type="button"
            className="ghost-secondary full-width"
            style={{
              justifyContent: 'flex-start',
              height: '48px',
              gap: '10px',
            }}
            onClick={() => {
              setIsManageSheetOpen(false)
              handleToggleLock()
            }}
          >
            {program.isLocked ? (
              <>
                <IconUnlock size={18} />
                <span>إلغاء قفل الجدول</span>
              </>
            ) : (
              <>
                <IconLock size={18} />
                <span>قفل الجدول</span>
              </>
            )}
          </button>

          {/* Change split as radio list with English secondary ltr line */}
          {!program.isCustom && (
            <div
              style={{
                marginTop: '8px',
                borderTop: '1px solid var(--line)',
                paddingTop: '10px',
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  marginBottom: '8px',
                }}
              >
                تغيير النظام التلقائي:
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                {SPLIT_TYPE_OPTIONS.map((opt) => {
                  const isSelected = program.splitType === opt.value
                  return (
                    <div
                      key={opt.value}
                      className={`list-row ${isSelected ? 'list-row--active' : ''}`}
                      style={{ padding: '10px 12px', cursor: 'pointer' }}
                      onClick={() => handleChangeSplit(opt.value)}
                    >
                      <div className="list-row__content">
                        <div className="list-row__title">{opt.labelAr}</div>
                        <div
                          className="list-row__secondary"
                          dir="ltr"
                          style={{ textAlign: 'left' }}
                        >
                          {opt.labelEn}
                        </div>
                      </div>
                      <div className="list-row__trailing">
                        <input
                          type="radio"
                          name="splitTypeRadio"
                          checked={isSelected}
                          onChange={() => handleChangeSplit(opt.value)}
                          aria-label={opt.labelAr}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Destructive Delete Button Last */}
          {onDeleteProgram && (
            <div
              style={{
                marginTop: '12px',
                borderTop: '1px solid var(--line)',
                paddingTop: '10px',
              }}
            >
              <button
                type="button"
                className="danger full-width"
                style={{ height: '44px', gap: '8px' }}
                onClick={() => {
                  setIsManageSheetOpen(false)
                  setDeleteConfirmOpen(true)
                }}
              >
                <IconTrash size={18} />
                <span>حذف الجدول الحالي</span>
              </button>
            </div>
          )}
        </div>
      </Sheet>

      {/* ConfirmSheet for Replacing Program */}
      <ConfirmSheet
        isOpen={replaceConfirm.isOpen}
        onClose={() =>
          setReplaceConfirm((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={replaceConfirm.action}
        title={replaceConfirm.title}
        message={replaceConfirm.message}
        confirmLabel="تأكيد الاستبدال"
        cancelLabel="إلغاء"
      />

      {/* ConfirmSheet for Deleting Program */}
      <ConfirmSheet
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => {
          onDeleteProgram?.()
          showToast('تم حذف الجدول التدريبي')
        }}
        title="حذف الجدول التدريبي"
        message="هل أنت متأكد من حذف الجدول التدريبي بالكامل؟ يمكنك استرجاعه من حافظة الجداول أو إنشاء جدول جديد في أي وقت."
        confirmLabel="حذف الجدول"
        cancelLabel="إلغاء"
        isDestructive={true}
      />

      {toastMessage && <Toast message={toastMessage} />}
    </div>
  )
}

export default WeeklyPlanView
