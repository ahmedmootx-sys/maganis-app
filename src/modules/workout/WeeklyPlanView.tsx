import { useEffect, useMemo, useRef, useState } from 'react'
import type {
  CustomExercise,
  Exercise,
  ExerciseSection,
  ProgramDay,
  WorkoutProgram,
  WorkoutSplitType,
  DayKind,
  CardioConfig,
} from '../shared/types.ts'
import {
  WORKOUT_SPLIT_LABELS,
  WORKOUT_SPLIT_EN,
  MUSCLE_GROUP_LABELS,
} from '../shared/types.ts'
import { navigationHistory } from '../../utils/navigationHistory.ts'
import { getExerciseById } from './exercises.ts'
import { ExerciseDetailModal } from './ExerciseDetailModal.tsx'
import { ExercisePickerModal } from './ExercisePickerModal.tsx'
import { ExerciseSwapModal } from './ExerciseSwapModal.tsx'
import { ExerciseThumb } from '../../components/ExerciseThumb.tsx'
import { generateProgram } from './programGenerator.ts'
import {
  convertDayToHomeWorkout,
  parseAndValidateRoutineJson,
} from './workoutUtils.ts'
import type { UserProfile } from '../onboarding/types.ts'
import {
  TopBar,
  Sheet,
  ConfirmSheet,
  ListRow,
  EmptyState,
  Toast,
  Select,
  Button,
  Callout,
  Field,
  Icon,
} from '../../ui/index.ts'
import { getExerciseTags } from './limitations.ts'
import {
  getOrDeriveSchedule,
  getOrderedWeekdays,
  ALL_WEEKDAYS,
  type ScheduleSlotType,
} from './scheduleManager.ts'
import {
  resolveSession,
  formatPrescription,
  cleanDayName,
} from './sessionResolver.ts'
import { DaysAdjustSheet } from './DaysAdjustSheet.tsx'
import { Claim } from '../../content/Claim.tsx'
import { saveFile } from '../../utils/saveFile.ts'
import {
  IconSearch,
  IconPlus,
  IconMoreVertical,
  IconChevronLeft,
  IconLock,
  IconUnlock,
  IconDownload,
  IconUpload,
  IconTrash,
  IconDumbbell,
  IconClipboard,
  IconCalendar,
} from '../../components/Icons.tsx'

export interface WeeklyPlanViewProps {
  program: WorkoutProgram | null
  profile?: UserProfile | null
  onUpdateProfile?: (updatedProfile: UserProfile) => void
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
  onOpenAiDesigner?: () => void
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

export function deriveDayMuscleSummary(
  exercises: Array<{ exerciseId: string }>,
): string {
  if (!exercises || exercises.length === 0) return 'راحة واستشفاء'
  const cats = new Set<string>()
  for (const pe of exercises) {
    const ex = getExerciseById(pe.exerciseId)
    if (ex?.category) cats.add(ex.category)
  }
  if (cats.size === 0) return 'تمارين متنوعة'
  return Array.from(cats)
    .map((c) => MUSCLE_GROUP_LABELS[c as keyof typeof MUSCLE_GROUP_LABELS] || c)
    .join(' / ')
}

interface CardioDayScreenProps {
  day: ProgramDay
  onBack: () => void
  onUpdateConfig: (newConfig: Partial<CardioConfig>) => void
  onOpenOverflow: () => void
  onCompleteSession?: () => void
}

export function CardioDayScreen({
  day,
  onBack,
  onUpdateConfig,
  onOpenOverflow,
  onCompleteSession,
}: CardioDayScreenProps) {
  const config = day.cardioConfig || {
    activity: 'جري',
    plannedMinutes: 30,
    effort: 'moderate',
  }

  const activities: Array<{ id: string; label: string }> = [
    { id: 'جري', label: 'جري خارجي / سير' },
    { id: 'مشي سريع', label: 'مشي سريع / انحدار' },
    { id: 'دراجة ثابتة', label: 'دراجة ثابتة' },
    { id: 'سباحة', label: 'سباحة حرة' },
    { id: 'نط حبل', label: 'نط الحبل' },
    { id: 'جهاز تجديف', label: 'جهاز التجديف' },
  ]

  const durations = [15, 20, 30, 45, 60]

  const effortLevels = [
    {
      value: 'light' as const,
      label: 'خفيف (Zone 2)',
      desc: 'وتيرة يمكنك التحدث خلالها براحة — مثالي لحرق الدهون والاستشفاء العضلي',
    },
    {
      value: 'moderate' as const,
      label: 'متوسط (Zone 3)',
      desc: 'وتيرة ثابتة مع سرعة تنفس متزايدة — لرفع اللياقة القلبية التنفسية',
    },
    {
      value: 'hard' as const,
      label: 'عالي (Zone 4-5 / HIIT)',
      desc: 'فترات انفجارية عالية الشدة تليها فترات راحة — لاستهلاك طاقة مكثف',
    },
  ]

  return (
    <div className="screen-container day-screen" dir="rtl">
      <TopBar
        onBack={onBack}
        title={day.labelAr}
        subtitle="جلسة كارديو ولياقة"
        actions={
          <button
            type="button"
            className="topbar-icon-btn"
            onClick={onOpenOverflow}
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
          padding: '16px 16px 88px',
        }}
      >
        {/* Summary Card */}
        <div
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '16px',
            borderRadius: '16px',
            border: '1px solid var(--color-divider)',
            background: 'var(--color-surface)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#0288d1',
                background: 'rgba(2, 136, 209, 0.12)',
                padding: '3px 8px',
                borderRadius: '6px',
              }}
            >
              جلسة كارديو
            </span>
            <span
              style={{
                fontSize: '13px',
                color: 'var(--muted)',
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {config.plannedMinutes} دقيقة مخطط لها
            </span>
          </div>
          <div
            style={{
              fontSize: '17px',
              fontWeight: 800,
              color: 'var(--ink)',
            }}
          >
            {config.activity} · الشدة:{' '}
            {config.effort === 'light'
              ? 'خفيف'
              : config.effort === 'hard'
                ? 'عالي الشدة'
                : 'متوسط'}
          </div>
          <Claim id="cardio_heart_health" />
        </div>

        {/* Activity Picker */}
        <section className="screen-section">
          <div className="section-title">
            <span>نوع النشاط البدني</span>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
            }}
          >
            {activities.map((act) => {
              const isSelected = config.activity === act.id
              return (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => onUpdateConfig({ activity: act.id })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    borderRadius: '12px',
                    border: isSelected
                      ? '1.5px solid var(--color-accent)'
                      : '1px solid var(--color-divider)',
                    background: isSelected
                      ? 'var(--color-surface-2)'
                      : 'var(--color-surface)',
                    color: isSelected
                      ? 'var(--color-accent-text)'
                      : 'var(--color-text)',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <span>{act.label}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Planned Duration Picker */}
        <section className="screen-section">
          <div className="section-title">
            <span>مدة الجلسة (بالدقائق)</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {durations.map((m) => {
              const isSelected = config.plannedMinutes === m
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => onUpdateConfig({ plannedMinutes: m })}
                  style={{
                    flex: '1 0 calc(20% - 8px)',
                    minWidth: '56px',
                    padding: '10px 4px',
                    borderRadius: '10px',
                    border: isSelected
                      ? '1.5px solid var(--color-accent)'
                      : '1px solid var(--color-divider)',
                    background: isSelected
                      ? 'var(--color-accent)'
                      : 'var(--color-surface)',
                    color: isSelected
                      ? 'var(--btn-primary-fg, #0b0c0e)'
                      : 'var(--color-text)',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {m} د
                </button>
              )
            })}
          </div>
        </section>

        {/* Effort Level Picker */}
        <section className="screen-section">
          <div className="section-title">
            <span>مستوى الجهد والشدة</span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {effortLevels.map((eff) => {
              const isSelected = config.effort === eff.value
              return (
                <button
                  key={eff.value}
                  type="button"
                  onClick={() => onUpdateConfig({ effort: eff.value })}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '4px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: isSelected
                      ? '1.5px solid var(--color-accent)'
                      : '1px solid var(--color-divider)',
                    background: isSelected
                      ? 'var(--color-surface-2)'
                      : 'var(--color-surface)',
                    cursor: 'pointer',
                    textAlign: 'right',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '13.5px',
                        color: isSelected
                          ? 'var(--color-accent-text)'
                          : 'var(--color-text)',
                      }}
                    >
                      {eff.label}
                    </span>
                    {isSelected && (
                      <Icon
                        name="check"
                        size={16}
                        style={{ color: 'var(--color-accent)' }}
                      />
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-text-2)',
                      lineHeight: 1.4,
                    }}
                  >
                    {eff.desc}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Educational Claims (hidden until coach supplies sourced text) */}
        <Claim id="cardio_zone2_fatloss" />
        <Claim id="cardio_hydration_advice" />
        <Claim id="cardio_timing_advice" />
      </div>

      {/* Sticky Bottom Bar */}
      <div className="sticky-bottom-bar">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={onCompleteSession}
        >
          إتمام وتسجيل جلسة الكارديو ({config.plannedMinutes} دقيقة)
        </Button>
      </div>
    </div>
  )
}

export function WeeklyPlanView({
  program,
  profile,
  onUpdateProfile,
  customExercises = [],
  userInjuries = [],
  onUpdateProgram,
  onDeleteProgram,
  onStartRoutine,
  onOpenScheduleModal: _onOpenScheduleModal,
  onOpenVaultModal,
  onOpenLibrary,
  onOpenCustomBuilder,
  onOpenSessionLogger,
  onGenerateProgram,
  onOpenAiDesigner,
  initialSelectedDayIndex = null,
}: WeeklyPlanViewProps) {
  // Navigation: null = Week overview; number = Day screen
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(
    initialSelectedDayIndex,
  )

  // Week Schedule Editor State
  const [isScheduleEditorOpen, setIsScheduleEditorOpen] = useState(false)
  const [isDaysAdjustSheetOpen, setIsDaysAdjustSheetOpen] = useState(false)
  const [draftSchedule, setDraftSchedule] = useState<
    Record<number, ScheduleSlotType>
  >({})

  // Export Sheet State
  const [isExportSheetOpen, setIsExportSheetOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'json'>(
    'pdf',
  )

  // Pre-session Warning for Limitation High Loads
  const [preSessionWarningDay, setPreSessionWarningDay] =
    useState<ProgramDay | null>(null)

  // Red Flag Dismissed in this session
  const [redFlagDismissed, setRedFlagDismissed] = useState(false)
  const [showRedFlagConfirm, setShowRedFlagConfirm] = useState(false)

  useEffect(() => {
    if (
      initialSelectedDayIndex !== undefined &&
      initialSelectedDayIndex !== null
    ) {
      setSelectedDayIndex(initialSelectedDayIndex)
    }
  }, [initialSelectedDayIndex])

  const handleSelectDay = (dayIndex: number) => {
    setSelectedDayIndex(dayIndex)
    window.location.hash = `#/training/day/${dayIndex}`
  }

  const handleBackToOverview = () => {
    setSelectedDayIndex(null)
    setIsEditMode(false)
    window.location.hash = '#/training'
  }

  // Modals & Sheets
  const [isPlusSheetOpen, setIsPlusSheetOpen] = useState(false)
  const [isManageSheetOpen, setIsManageSheetOpen] = useState(false)
  const [isDayOverflowOpen, setIsDayOverflowOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  // Day Management States (Part 5)
  const [isAddDaySheetOpen, setIsAddDaySheetOpen] = useState(false)
  const [dayMenuTarget, setDayMenuTarget] = useState<ProgramDay | null>(null)
  const [renamingDay, setRenamingDay] = useState<ProgramDay | null>(null)
  const [renameInputValue, setRenameInputValue] = useState('')

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

  const todaySession = useMemo(
    () => resolveSession(new Date(), { profile, program }),
    [profile, program],
  )

  const selectedDay = useMemo(() => {
    if (selectedDayIndex === null || !program) return null
    return program.days.find((d) => d.dayIndex === selectedDayIndex) ?? null
  }, [program, selectedDayIndex])

  function handleOpenDetail(exerciseId: string) {
    window.location.hash = `#/exercise/${exerciseId}`
  }

  function handleAddDay(kind: DayKind = 'strength') {
    if (!program || !onUpdateProgram) return
    const nextIndex =
      program.days.length > 0
        ? Math.max(...program.days.map((d) => d.dayIndex)) + 1
        : 0
    const dayNumber = program.days.length + 1
    const isCardio = kind === 'cardio'
    const newDay: ProgramDay = {
      id: `day-${Date.now()}`,
      dayIndex: nextIndex,
      name: isCardio ? `يوم ${dayNumber} - كارديو` : `يوم ${dayNumber}`,
      labelAr: isCardio ? `يوم ${dayNumber} - كارديو` : `يوم ${dayNumber}`,
      kind,
      focus: isCardio ? 'كارديو ولياقة' : 'تمارين مخصصة',
      exercises: [],
      cardioConfig: isCardio
        ? { activity: 'جري', plannedMinutes: 30, effort: 'moderate' }
        : undefined,
    }
    onUpdateProgram({
      ...program,
      days: [...program.days, newDay],
    })
    setIsAddDaySheetOpen(false)
    showToast(
      isCardio ? 'تمت إضافة يوم كارديو جديد' : 'تمت إضافة يوم تدريبي جديد',
    )
  }

  function handleRenameDay(dayIndex: number, newName: string) {
    if (!program || !onUpdateProgram) return
    const trimmed = newName.trim()
    if (!trimmed) return
    const newDays = program.days.map((d) => {
      if (d.dayIndex !== dayIndex) return d
      return {
        ...d,
        name: trimmed,
        labelAr: trimmed,
        customName: trimmed,
      }
    })
    onUpdateProgram({ ...program, days: newDays })
    setRenamingDay(null)
    showToast('تم تعديل اسم اليوم بنجاح')
  }

  function handleToggleDayKind(dayIndex: number) {
    if (!program || !onUpdateProgram) return
    const newDays = program.days.map((d) => {
      if (d.dayIndex !== dayIndex) return d
      const newKind: DayKind = d.kind === 'cardio' ? 'strength' : 'cardio'
      return {
        ...d,
        kind: newKind,
        cardioConfig:
          newKind === 'cardio'
            ? d.cardioConfig || {
                activity: 'جري',
                plannedMinutes: 30,
                effort: 'moderate',
              }
            : d.cardioConfig,
      }
    })
    onUpdateProgram({ ...program, days: newDays })
    setDayMenuTarget(null)
    showToast('تم تغيير نوع اليوم بنجاح')
  }

  function handleDeleteDay(dayIndex: number) {
    if (!program || !onUpdateProgram) return
    if (program.days.length <= 1) {
      showToast('لا يمكن حذف اليوم الوحيد المتبقي في الجدول')
      return
    }
    const newDays = program.days.filter((d) => d.dayIndex !== dayIndex)
    onUpdateProgram({ ...program, days: newDays })
    setDayMenuTarget(null)
    if (selectedDayIndex === dayIndex) {
      setSelectedDayIndex(null)
    }
    showToast('تم حذف اليوم من البرنامج')
  }

  function handleUpdateCardioConfig(
    dayIndex: number,
    newConfig: Partial<CardioConfig>,
  ) {
    if (!program || !onUpdateProgram) return
    const newDays = program.days.map((d) => {
      if (d.dayIndex !== dayIndex) return d
      const current = d.cardioConfig || {
        activity: 'جري',
        plannedMinutes: 30,
        effort: 'moderate',
      }
      return {
        ...d,
        cardioConfig: { ...current, ...newConfig },
      }
    })
    onUpdateProgram({ ...program, days: newDays })
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

  function exportProgramToCsv(p: WorkoutProgram): string {
    const rows = [
      [
        'اليوم',
        'التركيز',
        'اسم التمرين',
        'المجموعات',
        'التكرارات',
        'الراحة (ثانية)',
      ],
    ]
    for (const d of p.days) {
      for (const ex of d.exercises) {
        const def = getExerciseById(ex.exerciseId)
        rows.push([
          d.labelAr,
          d.focus,
          def?.nameAr || ex.exerciseId,
          String(ex.sets),
          String(ex.reps),
          String(ex.restSeconds),
        ])
      }
    }
    return (
      '\uFEFF' +
      rows
        .map((r) =>
          r.map((c) => `"${(c || '').replace(/"/g, '""')}"`).join(','),
        )
        .join('\r\n')
    )
  }

  const handleOpenScheduleEditor = () => {
    const currentSchedule = getOrDeriveSchedule(profile, program)
    setDraftSchedule({ ...currentSchedule })
    setIsScheduleEditorOpen(true)
  }

  const handleSaveScheduleEditor = () => {
    if (profile && onUpdateProfile) {
      onUpdateProfile({
        ...profile,
        schedule: draftSchedule,
      })
      showToast('تم حفظ جدول الأسبوع بنجاح')
    }
    setIsScheduleEditorOpen(false)
  }

  const handleExportProgram = async () => {
    if (!program) return
    if (exportFormat === 'pdf') {
      setIsExportSheetOpen(false)
      setTimeout(() => {
        window.print()
      }, 250)
      return
    }

    if (exportFormat === 'csv') {
      const csv = exportProgramToCsv(program)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      const res = await saveFile(
        blob,
        `maganis-program-${program.id || 'export'}.csv`,
        'text/csv',
      )
      setIsExportSheetOpen(false)
      if (res.downloadNoticeNeeded) {
        showToast('تم حفظ ملف CSV في مجلد التنزيلات')
      } else {
        showToast('تم حفظ ملف CSV بنجاح')
      }
      return
    }

    if (exportFormat === 'json') {
      const jsonStr = JSON.stringify(program, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const res = await saveFile(
        blob,
        `maganis-program-${program.id || 'backup'}.json`,
        'application/json',
      )
      setIsExportSheetOpen(false)
      if (res.downloadNoticeNeeded) {
        showToast('تم حفظ ملف JSON في مجلد التنزيلات')
      } else {
        showToast('تم حفظ ملف JSON بنجاح')
      }
      return
    }
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
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  width: '100%',
                }}
              >
                <button
                  type="button"
                  className="button-primary full-width"
                  onClick={onGenerateProgram}
                >
                  إنشاء برنامج تدريبي
                </button>
                <button
                  type="button"
                  className="button-secondary full-width"
                  onClick={onOpenAiDesigner}
                >
                  صمم لي جدولي الخاص (مرشد الذكاء الاصطناعي)
                </button>
              </div>
            }
          />
        </div>
      </div>
    )
  }

  // --- Render Day Screen ---
  if (selectedDay) {
    if (selectedDay.kind === 'cardio') {
      return (
        <>
          <CardioDayScreen
            day={selectedDay}
            onBack={handleBackToOverview}
            onUpdateConfig={(newConfig) =>
              handleUpdateCardioConfig(selectedDay.dayIndex, newConfig)
            }
            onOpenOverflow={() => setIsDayOverflowOpen(true)}
            onCompleteSession={() => {
              if (onOpenSessionLogger) {
                onOpenSessionLogger()
              } else {
                showToast('تم تسجيل جلسة الكارديو بنجاح.')
              }
            }}
          />

          {/* Day Overflow Sheet */}
          <Sheet
            isOpen={isDayOverflowOpen}
            onClose={() => setIsDayOverflowOpen(false)}
            title={`خيارات ${selectedDay.labelAr}`}
          >
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <button
                type="button"
                className="ghost-secondary full-width"
                style={{
                  justifyContent: 'flex-start',
                  height: '48px',
                  gap: '10px',
                }}
                onClick={() => {
                  setIsDayOverflowOpen(false)
                  setRenamingDay(selectedDay)
                  setRenameInputValue(selectedDay.name || selectedDay.labelAr)
                }}
              >
                <Icon name="edit-2" size={16} />
                <span>تعديل اسم اليوم</span>
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
                  setIsDayOverflowOpen(false)
                  handleToggleDayKind(selectedDay.dayIndex)
                }}
              >
                <Icon name="dumbbell" size={16} />
                <span>تحويل إلى يوم مقاومة (قوة)</span>
              </button>
              <button
                type="button"
                className="ghost-danger full-width"
                style={{
                  justifyContent: 'flex-start',
                  height: '48px',
                  gap: '10px',
                }}
                onClick={() => {
                  setIsDayOverflowOpen(false)
                  handleDeleteDay(selectedDay.dayIndex)
                }}
              >
                <IconTrash size={16} />
                <span>حذف هذا اليوم</span>
              </button>
            </div>
          </Sheet>

          {/* Rename Day Sheet */}
          {renamingDay && (
            <Sheet
              isOpen={Boolean(renamingDay)}
              onClose={() => setRenamingDay(null)}
              title="تعديل اسم اليوم"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (renamingDay) {
                    handleRenameDay(renamingDay.dayIndex, renameInputValue)
                  }
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <Field
                  label="اسم اليوم"
                  value={renameInputValue}
                  onChange={(e) => setRenameInputValue(e.target.value)}
                  placeholder="مثال: كارديو خفيف، جري صباحي..."
                  autoFocus
                />
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Button
                    type="button"
                    variant="subtle"
                    onClick={() => setRenamingDay(null)}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit" variant="primary">
                    حفظ الاسم
                  </Button>
                </div>
              </form>
            </Sheet>
          )}

          {toastMessage && <Toast message={toastMessage} />}
        </>
      )
    }

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
          onBack={handleBackToOverview}
          title={selectedDay.labelAr}
          subtitle={
            (program.splitType && WORKOUT_SPLIT_LABELS[program.splitType]) ||
            'البرنامج التدريبي'
          }
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
          {/* Day Focus Muscle Summary derived from exercises */}
          <div
            className="day-focus-strip"
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'var(--card-subtle)',
              border: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: '12.5px',
                color: 'var(--muted)',
                fontWeight: 600,
              }}
            >
              العضلات المستهدفة
            </span>
            <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>
              {deriveDayMuscleSummary(selectedDay.exercises)}
            </strong>
          </div>

          {/* Section: الإحماء والتسخين */}
          <section className="screen-section">
            <div
              className="section-title"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'flex-start',
              }}
            >
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
                  className="button-secondary tiny"
                  onClick={() => {
                    setAddingSection('warmup')
                    setAddingToDayIndex(selectedDay.dayIndex)
                  }}
                  style={{
                    height: '36px',
                    padding: '0 12px',
                    fontSize: '13px',
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
                  const setsReps = formatPrescription(pe)

                  return (
                    <ListRow
                      key={`warmup-${idx}`}
                      onClick={
                        !isEditMode
                          ? () => handleOpenDetail(pe.exerciseId)
                          : undefined
                      }
                      leading={
                        <ExerciseThumb
                          exercise={ex}
                          exerciseId={pe.exerciseId}
                          size={56}
                        />
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
                              <Icon name="chevron-up" size={14} />
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
                              <Icon name="chevron-down" size={14} />
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
                              <Icon name="x" size={14} />
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
                              <bdi dir="ltr">{setsReps}</bdi>
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
            <div
              className="section-title"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'flex-start',
              }}
            >
              <span>التمارين الأساسية</span>
              <span className="section-title-counter">
                {primaryExercises.length}
              </span>
            </div>
            <div
              className="section-caption"
              style={{
                fontSize: '11.5px',
                color: 'var(--muted)',
                marginTop: '2px',
                marginBottom: '8px',
              }}
            >
              مجموعات × تكرارات
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
                  className="button-secondary tiny"
                  onClick={() => {
                    setAddingSection('primary')
                    setAddingToDayIndex(selectedDay.dayIndex)
                  }}
                  style={{
                    height: '36px',
                    padding: '0 12px',
                    fontSize: '13px',
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
                  const setsReps = formatPrescription(pe)

                  return (
                    <ListRow
                      key={`primary-${idx}`}
                      onClick={
                        !isEditMode
                          ? () => handleOpenDetail(pe.exerciseId)
                          : undefined
                      }
                      leading={
                        <ExerciseThumb
                          exercise={ex}
                          exerciseId={pe.exerciseId}
                          size={56}
                        />
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
                              <Icon name="chevron-up" size={14} />
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
                              <Icon name="chevron-down" size={14} />
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
                              <Icon name="x" size={14} />
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
                              <bdi dir="ltr">{setsReps}</bdi>
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
              <div
                className="section-title"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'flex-start',
                }}
              >
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
                  const setsReps = formatPrescription(pe)

                  return (
                    <ListRow
                      key={`cooldown-${idx}`}
                      onClick={
                        !isEditMode
                          ? () => handleOpenDetail(pe.exerciseId)
                          : undefined
                      }
                      leading={
                        <ExerciseThumb
                          exercise={ex}
                          exerciseId={pe.exerciseId}
                          size={56}
                        />
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
                            aria-label="حذف"
                          >
                            <Icon name="x" size={14} />
                          </button>
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
                              <bdi dir="ltr">{setsReps}</bdi>
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
            </section>
          )}
        </div>

        {/* Sticky Bottom Primary "ابدأ التمرين" */}
        <div className="sticky-bottom-bar">
          <button
            type="button"
            className="button-primary full-width"
            onClick={() => {
              const highExercises = selectedDay.exercises.filter((pe) => {
                const tags = getExerciseTags(
                  pe.exerciseId,
                  profile?.limitations,
                )
                return tags.some((t) => t.level === 'high')
              })
              if (highExercises.length > 0) {
                setPreSessionWarningDay(selectedDay)
              } else {
                onStartRoutine?.(selectedDay)
              }
            }}
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
            <button
              type="button"
              className="ghost-secondary full-width"
              style={{
                justifyContent: 'flex-start',
                height: '48px',
                gap: '10px',
              }}
              onClick={() => {
                setIsDayOverflowOpen(false)
                setRenamingDay(selectedDay)
                setRenameInputValue(selectedDay.name || selectedDay.labelAr)
              }}
            >
              <Icon name="edit-2" size={16} />
              <span>تعديل اسم اليوم</span>
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
                setIsDayOverflowOpen(false)
                handleToggleDayKind(selectedDay.dayIndex)
              }}
            >
              <Icon name="activity" size={16} />
              <span>تحويل إلى يوم كارديو</span>
            </button>
            <button
              type="button"
              className="ghost-danger full-width"
              style={{
                justifyContent: 'flex-start',
                height: '48px',
                gap: '10px',
              }}
              onClick={() => {
                setIsDayOverflowOpen(false)
                handleDeleteDay(selectedDay.dayIndex)
              }}
            >
              <IconTrash size={16} />
              <span>حذف هذا اليوم</span>
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

        {/* Rename Day Sheet */}
        {renamingDay && (
          <Sheet
            isOpen={Boolean(renamingDay)}
            onClose={() => setRenamingDay(null)}
            title="تعديل اسم اليوم"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (renamingDay) {
                  handleRenameDay(renamingDay.dayIndex, renameInputValue)
                }
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <Field
                label="اسم اليوم"
                value={renameInputValue}
                onChange={(e) => setRenameInputValue(e.target.value)}
                placeholder="مثال: دفع علوي، سحب وظهر..."
                autoFocus
              />
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'flex-end',
                }}
              >
                <Button
                  type="button"
                  variant="subtle"
                  onClick={() => setRenamingDay(null)}
                >
                  إلغاء
                </Button>
                <Button type="submit" variant="primary">
                  حفظ الاسم
                </Button>
              </div>
            </form>
          </Sheet>
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
        {/* Red Flag Persistent Callout */}
        {profile?.redFlag && !redFlagDismissed && (
          <Callout
            variant="danger"
            title="تنبيه صحي"
            action={
              <Button
                size="sm"
                variant="subtle"
                onClick={() => setShowRedFlagConfirm(true)}
              >
                تأكيد
              </Button>
            }
          >
            ينصح بمراجعة طبيب قبل التمرين، خصوصًا للمنطقة المصابة.
          </Callout>
        )}

        {/* Training days mismatch Callout */}
        {(() => {
          const strengthDaysCount = program.days.filter(
            (d) => d.kind !== 'cardio',
          ).length
          if (
            !profile?.trainingDaysPerWeek ||
            strengthDaysCount === profile.trainingDaysPerWeek
          ) {
            return null
          }
          return (
            <Callout
              variant="warning"
              title="اختلاف في أيام التدريب"
              action={
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={() => {
                      if (profile && onUpdateProfile) {
                        onUpdateProfile({
                          ...profile,
                          trainingDaysPerWeek: strengthDaysCount,
                        })
                        showToast(
                          `تم اعتماد ${strengthDaysCount} أيام في الملف الشخصي`,
                        )
                      }
                    }}
                  >
                    اعتمد {strengthDaysCount} أيام
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsDaysAdjustSheetOpen(true)}
                  >
                    تعديل الجدول
                  </Button>
                </div>
              }
            >
              برنامجك فيه {strengthDaysCount} أيام تمارين مقاومة (تم استثناء
              الكارديو)، بينما اخترت {profile.trainingDaysPerWeek} أيام في الملف
              الشخصي.
            </Callout>
          )
        })()}

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
          {program.splitType && (
            <div
              dir="ltr"
              style={{
                fontSize: '12px',
                color: 'var(--muted)',
                fontWeight: 600,
              }}
            >
              {WORKOUT_SPLIT_EN[program.splitType]}
            </div>
          )}
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
          <div
            className="section-title"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>أيام الجدول التدريبي</span>
              <span className="section-title-counter">
                {program.days.length} أيام
              </span>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsAddDaySheetOpen(true)}
            >
              + إضافة يوم
            </Button>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {program.days.map((day, idx) => {
              const isToday = Boolean(
                todaySession.programDay &&
                ((day.id &&
                  todaySession.programDay.id &&
                  day.id === todaySession.programDay.id) ||
                  day.dayIndex === todaySession.programDay.dayIndex),
              )
              const isCardio = day.kind === 'cardio'
              const exerciseCount = day.exercises.length
              const cleanName = cleanDayName(day.name || day.labelAr)
              const schedule = getOrDeriveSchedule(profile, program)
              const scheduledWeekday = Object.entries(schedule).find(
                ([_wd, slot]) =>
                  slot === day.id || slot === String(day.dayIndex),
              )?.[0]
              const weekdayInfo =
                scheduledWeekday !== undefined
                  ? ALL_WEEKDAYS.find(
                      (w) => w.weekday === Number(scheduledWeekday),
                    )
                  : null
              const displayTitle = weekdayInfo
                ? `${weekdayInfo.nameAr} · ${cleanName}`
                : cleanName

              return (
                <ListRow
                  key={day.dayIndex}
                  onClick={() => handleSelectDay(day.dayIndex)}
                  className={isToday ? 'list-row--active' : ''}
                  leading={
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: isToday
                          ? 'var(--color-accent)'
                          : isCardio
                            ? 'rgba(2, 136, 209, 0.15)'
                            : 'var(--color-surface-2)',
                        color: isToday
                          ? '#ffffff'
                          : isCardio
                            ? '#0288d1'
                            : 'var(--ink)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '16px',
                        border: '1px solid var(--line)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {isCardio ? <Icon name="activity" size={18} /> : idx + 1}
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
                      <span>{displayTitle}</span>
                      {isCardio && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#0288d1',
                            background: 'rgba(2, 136, 209, 0.12)',
                            padding: '2px 6px',
                            borderRadius: '6px',
                          }}
                        >
                          كارديو
                        </span>
                      )}
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
                  secondary={
                    isCardio
                      ? day.cardioConfig
                        ? `${day.cardioConfig.activity || 'كارديو'} · ${day.cardioConfig.plannedMinutes || 30} دقيقة`
                        : 'جلسة كارديو ولياقة'
                      : deriveDayMuscleSummary(day.exercises)
                  }
                  trailing={
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      {!isCardio && (
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
                      )}
                      <button
                        type="button"
                        className="ghost tiny day-menu-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDayMenuTarget(day)
                        }}
                        aria-label="خيارات اليوم"
                        style={{
                          padding: '4px',
                          borderRadius: '6px',
                          color: 'var(--color-text-2)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconMoreVertical size={16} />
                      </button>
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

        {/* Library Prominent Row */}
        <section className="screen-section">
          <ListRow
            onClick={() => {
              window.location.hash = '#/library'
            }}
            leading={
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'var(--card-subtle)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--line)',
                }}
              >
                <IconDumbbell size={20} />
              </div>
            }
            title="مكتبة التمارين الشاملة"
            secondary="استعراض وتصفية التمارين حسب العضلة والأداة والمستوى"
            trailing={
              <IconChevronLeft size={16} style={{ color: 'var(--muted)' }} />
            }
          />
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
              setIsAddDaySheetOpen(true)
            }}
          >
            <IconPlus size={18} />
            <span>إضافة يوم للجدول</span>
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
              handleOpenScheduleEditor()
            }}
          >
            <IconCalendar size={18} />
            <span>جدول الأسبوع</span>
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
              setIsManageSheetOpen(false)
              handleOpenScheduleEditor()
            }}
          >
            <IconCalendar size={18} />
            <span>جدول الأسبوع</span>
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
              setIsManageSheetOpen(false)
              setIsExportSheetOpen(true)
            }}
          >
            <IconDownload size={18} />
            <span>تصدير البرنامج</span>
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
          />{' '}
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
              onOpenAiDesigner?.()
            }}
          >
            <IconDownload size={18} />
            <span>صمم لي جدولي الخاص (مرشد الذكاء الاصطناعي)</span>
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
                تغيير النظام التلقائي
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
        consequences={[replaceConfirm.message]}
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
        consequences={[
          'هل أنت متأكد من حذف الجدول التدريبي بالكامل؟',
          'يمكنك استرجاعه من حافظة الجداول أو إنشاء جدول جديد في أي وقت.',
        ]}
        confirmLabel="حذف الجدول"
        cancelLabel="إلغاء"
        isDestructive={true}
      />

      {/* Export Program Sheet */}
      <Sheet
        isOpen={isExportSheetOpen}
        onClose={() => setIsExportSheetOpen(false)}
        title="تصدير البرنامج"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            paddingBottom: '16px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '8px',
              }}
            >
              صيغة التصدير
            </div>
            <Select
              options={[
                { value: 'pdf', label: 'ملف للطباعة (PDF)' },
                { value: 'csv', label: 'جدول بيانات (CSV)' },
                {
                  value: 'json',
                  label: 'نسخة احتياطية قابلة للاستيراد (JSON)',
                },
              ]}
              value={exportFormat}
              onChange={(val) => setExportFormat(val as 'pdf' | 'csv' | 'json')}
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleExportProgram}
          >
            حفظ الملف
          </Button>
        </div>
      </Sheet>

      {/* Week Schedule Editor Sheet */}
      <Sheet
        isOpen={isScheduleEditorOpen}
        onClose={() => setIsScheduleEditorOpen(false)}
        title="جدول الأسبوع"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            paddingBottom: '16px',
          }}
        >
          <p
            style={{
              fontSize: '13px',
              color: 'var(--color-text-2)',
              margin: 0,
            }}
          >
            حدد تمرين كل يوم من أيام الأسبوع حسب خطتك التدريبية
          </p>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {getOrderedWeekdays(profile?.weekStartDay ?? 6).map((w) => {
              const currentSlot = draftSchedule[w.weekday] || 'rest'
              const options = [
                ...(program?.days.map((d) => ({
                  value: d.id ?? String(d.dayIndex),
                  label: `${d.labelAr} (${d.focus})`,
                })) || []),
                { value: 'cardio', label: 'كارديو خفيف' },
                { value: 'rest', label: 'راحة' },
              ]

              return (
                <div
                  key={w.weekday}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '8px 12px',
                    background: 'var(--color-surface-2)',
                    borderRadius: 'var(--radius-control)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      width: '70px',
                      flexShrink: 0,
                    }}
                  >
                    {w.nameAr}
                  </span>
                  <div style={{ flex: 1 }}>
                    <Select
                      options={options}
                      value={currentSlot}
                      onChange={(val) => {
                        setDraftSchedule((prev) => ({
                          ...prev,
                          [w.weekday]: val,
                        }))
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleSaveScheduleEditor}
          >
            حفظ الجدول
          </Button>
        </div>
      </Sheet>

      {/* Pre-session High Load Warning */}
      <ConfirmSheet
        isOpen={!!preSessionWarningDay}
        onClose={() => setPreSessionWarningDay(null)}
        title="تنبيه أحمال التمارين لحالتك"
        consequences={[
          preSessionWarningDay
            ? `هذا اليوم يحتوي على تمارين بحمل عالٍ على المناطق المصابة لديك (${preSessionWarningDay.exercises
                .filter((pe) =>
                  getExerciseTags(pe.exerciseId, profile?.limitations).some(
                    (t) => t.level === 'high',
                  ),
                )
                .map((pe) => {
                  const ex = getExerciseById(pe.exerciseId)
                  return ex?.nameAr || pe.exerciseId
                })
                .join('، ')}). هل تود إكمال الجلسة بحذر؟`
            : '',
        ]}
        confirmLabel="أكمل بحذر"
        cancelLabel="إلغاء"
        onConfirm={() => {
          if (preSessionWarningDay) {
            onStartRoutine?.(preSessionWarningDay)
            setPreSessionWarningDay(null)
          }
        }}
      />

      {/* Red Flag Dismiss Confirm Sheet */}
      <ConfirmSheet
        isOpen={showRedFlagConfirm}
        onClose={() => setShowRedFlagConfirm(false)}
        title="تأكيد مراجعة الطبيب"
        consequences={[
          'هل قمت بمراجعة الطبيب المختص أو هل هذا التحذير لا ينطبق على حالتك؟',
        ]}
        confirmLabel="راجعت الطبيب / لا ينطبق"
        cancelLabel="إبقاء التحذير"
        onConfirm={() => {
          setRedFlagDismissed(true)
          setShowRedFlagConfirm(false)
          if (profile && onUpdateProfile) {
            onUpdateProfile({ ...profile, redFlag: false })
          }
        }}
      />

      {/* Sheet: Add Day */}
      <Sheet
        isOpen={isAddDaySheetOpen}
        onClose={() => setIsAddDaySheetOpen(false)}
        title="إضافة يوم جديد إلى الجدول"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            className="ghost-secondary full-width"
            style={{
              justifyContent: 'flex-start',
              height: '52px',
              gap: '12px',
              padding: '0 16px',
            }}
            onClick={() => handleAddDay('strength')}
          >
            <IconDumbbell size={20} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>
                يوم تمارين مقاومة (قوة)
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                إضافة يوم لتمارين الحديد والأوزان
              </div>
            </div>
          </button>
          <button
            type="button"
            className="ghost-secondary full-width"
            style={{
              justifyContent: 'flex-start',
              height: '52px',
              gap: '12px',
              padding: '0 16px',
            }}
            onClick={() => handleAddDay('cardio')}
          >
            <Icon name="activity" size={20} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>
                يوم كارديو ولياقة
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                جري، مشي سريع، دراجة ثابتة، سباحة...
              </div>
            </div>
          </button>
        </div>
      </Sheet>

      {/* Sheet: Per-Day Menu */}
      <Sheet
        isOpen={Boolean(dayMenuTarget)}
        onClose={() => setDayMenuTarget(null)}
        title={
          dayMenuTarget
            ? `خيارات: ${dayMenuTarget.name || dayMenuTarget.labelAr}`
            : 'خيارات اليوم'
        }
      >
        {dayMenuTarget && (
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
                const target = dayMenuTarget
                setDayMenuTarget(null)
                setRenamingDay(target)
                setRenameInputValue(target.name || target.labelAr)
              }}
            >
              <Icon name="edit-2" size={16} />
              <span>تعديل اسم اليوم</span>
            </button>
            <button
              type="button"
              className="ghost-secondary full-width"
              style={{
                justifyContent: 'flex-start',
                height: '48px',
                gap: '10px',
              }}
              onClick={() => handleToggleDayKind(dayMenuTarget.dayIndex)}
            >
              <Icon
                name={dayMenuTarget.kind === 'cardio' ? 'dumbbell' : 'activity'}
                size={16}
              />
              <span>
                {dayMenuTarget.kind === 'cardio'
                  ? 'تحويل إلى يوم مقاومة (قوة)'
                  : 'تحويل إلى يوم كارديو'}
              </span>
            </button>
            <button
              type="button"
              className="ghost-danger full-width"
              style={{
                justifyContent: 'flex-start',
                height: '48px',
                gap: '10px',
              }}
              onClick={() => handleDeleteDay(dayMenuTarget.dayIndex)}
            >
              <IconTrash size={16} />
              <span>حذف هذا اليوم</span>
            </button>
          </div>
        )}
      </Sheet>

      {/* Sheet / Modal: Rename Day */}
      {renamingDay && (
        <Sheet
          isOpen={Boolean(renamingDay)}
          onClose={() => setRenamingDay(null)}
          title="تعديل اسم اليوم"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (renamingDay) {
                handleRenameDay(renamingDay.dayIndex, renameInputValue)
              }
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <Field
              label="اسم اليوم"
              value={renameInputValue}
              onChange={(e) => setRenameInputValue(e.target.value)}
              placeholder="مثال: دفع علوي، كارديو صباحي..."
              autoFocus
            />
            <div
              style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'flex-end',
              }}
            >
              <Button
                type="button"
                variant="subtle"
                onClick={() => setRenamingDay(null)}
              >
                إلغاء
              </Button>
              <Button type="submit" variant="primary">
                حفظ الاسم
              </Button>
            </div>
          </form>
        </Sheet>
      )}

      {isDaysAdjustSheetOpen && profile && program && (
        <DaysAdjustSheet
          isOpen={isDaysAdjustSheetOpen}
          onClose={() => setIsDaysAdjustSheetOpen(false)}
          program={program}
          profile={profile}
          showToast={showToast}
          onSave={(updatedProgram, updatedSchedule) => {
            onUpdateProgram?.(updatedProgram)
            if (onUpdateProfile) {
              onUpdateProfile({
                ...profile,
                schedule: updatedSchedule,
              })
            }
          }}
        />
      )}

      {toastMessage && <Toast message={toastMessage} />}
    </div>
  )
}

export default WeeklyPlanView
