import { useEffect, useMemo, useRef, useState } from 'react'
import type {
  CustomExercise,
  Exercise,
  ProgramExercise,
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
  Choice,
} from '../../ui/index.ts'
import { CardioRunner } from './CardioRunner.tsx'
import {
  calculateCardioEnergy,
  getCardioActivity,
  type CardioActivityId,
  type CardioEffortLevel,
} from './cardioEngine.ts'
import { trackingStore } from '../tracking/trackingStore.ts'
import type { TrackingSession } from '../shared/types.ts'
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
import { selectWeekLoad } from './weekLoadSelector.ts'
import { ScheduleMismatchCallout } from './ScheduleMismatchCallout.tsx'
import { plural } from '../../utils/plural.ts'
import { saveFile } from '../../utils/saveFile.ts'
import { deriveConstraints, isExerciseAllowed } from './constraints.ts'
import { EXERCISES } from './exercises.ts'
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
  profile?: UserProfile | null
  onUpdateProfile?: (updatedProfile: UserProfile) => void
  onBack: () => void
  onUpdateConfig: (newConfig: Partial<CardioConfig>) => void
  onOpenOverflow: () => void
  onCompleteSession?: () => void
  onSaveSession?: (session: TrackingSession) => void
}

function normalizeCardioActivityId(val?: string): CardioActivityId {
  if (!val) return 'run'
  if (
    val === 'run' ||
    val === 'walk' ||
    val === 'bike' ||
    val === 'swim' ||
    val === 'jumprope' ||
    val === 'rowing'
  ) {
    return val
  }
  if (val.includes('جري')) return 'run'
  if (val.includes('مشي')) return 'walk'
  if (val.includes('دراج')) return 'bike'
  if (val.includes('سباح')) return 'swim'
  if (val.includes('حبل')) return 'jumprope'
  if (val.includes('تجديف')) return 'rowing'
  return 'run'
}

function normalizeCardioEffort(val?: string): CardioEffortLevel {
  if (val === 'light' || val === 'moderate' || val === 'high') return val
  if (val === 'hard') return 'high'
  return 'moderate'
}

export function CardioDayScreen({
  day,
  profile,
  onUpdateProfile,
  onBack,
  onUpdateConfig,
  onOpenOverflow,
  onCompleteSession,
  onSaveSession,
}: CardioDayScreenProps) {
  const currentConfig = day.cardio || day.cardioConfig

  const [activityId, setActivityId] = useState<CardioActivityId>(() =>
    normalizeCardioActivityId(currentConfig?.activity),
  )
  const [plannedMinutes, setPlannedMinutes] = useState<number>(() => {
    const min = currentConfig?.plannedMinutes
    return typeof min === 'number' && min >= 5 && min <= 180 ? min : 30
  })
  const [effort, setEffort] = useState<CardioEffortLevel>(() =>
    normalizeCardioEffort(currentConfig?.effort),
  )

  const [customWeight, setCustomWeight] = useState<string>('')
  const [weightInputError, setWeightInputError] = useState<string>('')
  const [showInfoSheet, setShowInfoSheet] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Check for active in-progress session to resume
  const [isRunnerActive, setIsRunnerActive] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem('maganis:cardio_active_session')
    } catch {
      return false
    }
  })

  // Body weight resolution
  const profileWeight = profile?.body?.weightKg
  const effectiveWeight = useMemo(() => {
    if (typeof profileWeight === 'number' && profileWeight > 0) {
      return profileWeight
    }
    const parsed = parseFloat(customWeight)
    return !isNaN(parsed) && parsed > 0 ? parsed : 0
  }, [profileWeight, customWeight])

  // Energy estimate calculation (Empty or invalid input returns null; NEVER 0 or NaN)
  const estimate = useMemo(() => {
    if (
      !activityId ||
      !effort ||
      plannedMinutes < 5 ||
      plannedMinutes > 180 ||
      effectiveWeight <= 0
    ) {
      return null
    }
    return calculateCardioEnergy(
      activityId,
      effort,
      plannedMinutes,
      effectiveWeight,
    )
  }, [activityId, effort, plannedMinutes, effectiveWeight])

  const selectedActivityDef = useMemo(
    () => getCardioActivity(activityId),
    [activityId],
  )

  function handleActivityChange(val: CardioActivityId) {
    setActivityId(val)
    onUpdateConfig({ activity: val })
  }

  function handleDurationChange(mins: number) {
    const clamped = Math.max(5, Math.min(180, mins))
    setPlannedMinutes(clamped)
    onUpdateConfig({ plannedMinutes: clamped })
  }

  function handleEffortChange(eff: CardioEffortLevel) {
    setEffort(eff)
    onUpdateConfig({ effort: eff })
  }

  function handleSaveCustomWeight() {
    const w = parseFloat(customWeight)
    if (isNaN(w) || w < 25 || w > 350) {
      setWeightInputError('الوزن لازم يكون بين 25 و 350 كجم')
      return
    }
    setWeightInputError('')
    if (profile && onUpdateProfile) {
      const updated: UserProfile = {
        ...profile,
        body: {
          ...profile.body,
          weightKg: w,
        },
        updatedAt: Date.now(),
      }
      onUpdateProfile(updated)
    }
    setToastMsg(`تم حفظ الوزن (${w} كجم)`)
    setTimeout(() => setToastMsg(null), 3000)
  }

  // Activity Choice options with icons and Arabic names
  const ACTIVITY_OPTIONS = useMemo(
    () => [
      {
        value: 'run' as const,
        label: 'جري خارجي',
        icon: <Icon name="activity" size={20} />,
      },
      {
        value: 'walk' as const,
        label: 'مشي سريع / بميل',
        icon: <Icon name="trending-up" size={20} />,
      },
      {
        value: 'bike' as const,
        label: 'دراجة ثابتة',
        icon: <Icon name="refresh-cw" size={20} />,
      },
      {
        value: 'swim' as const,
        label: 'سباحة حرة',
        icon: <Icon name="heart" size={20} />,
      },
      {
        value: 'jumprope' as const,
        label: 'نط الحبل',
        icon: <Icon name="zap" size={20} />,
      },
      {
        value: 'rowing' as const,
        label: 'جهاز التجديف',
        icon: <Icon name="sliders-horizontal" size={20} />,
      },
    ],
    [],
  )

  // Effort options with ui_hint_ar as description
  const EFFORT_OPTIONS = useMemo(() => {
    return [
      {
        value: 'light' as const,
        label: 'خفيف',
        description:
          selectedActivityDef?.levels.light.ui_hint_ar ||
          'وتيرة خفيفة ومريحة',
      },
      {
        value: 'moderate' as const,
        label: 'متوسط',
        description:
          selectedActivityDef?.levels.moderate.ui_hint_ar ||
          'وتيرة متوسطة مع جهد ملحوظ',
      },
      {
        value: 'high' as const,
        label: 'عالي',
        description:
          selectedActivityDef?.levels.high.ui_hint_ar ||
          'وتيرة سريعة وجهد مكثف',
      },
    ]
  }, [selectedActivityDef])

  const durations = [15, 20, 30, 45, 60]

  // Disabled reason line
  const disabledReason = useMemo(() => {
    if (effectiveWeight <= 0) {
      return 'سجّل وزن جسمك أولاً لحساب السعرات وبدء الجلسة'
    }
    if (plannedMinutes < 5 || plannedMinutes > 180) {
      return 'مدة التمرين لازم تكون بين 5 و 180 دقيقة'
    }
    if (!activityId || !effort) {
      return 'اختر نوع النشاط ومستوى الجهد للبدء'
    }
    return null
  }, [effectiveWeight, plannedMinutes, activityId, effort])

  const isStartDisabled = disabledReason !== null

  // Active Runner screen
  if (isRunnerActive) {
    return (
      <CardioRunner
        activityId={activityId}
        level={effort}
        durationMinutes={plannedMinutes}
        weightKg={effectiveWeight > 0 ? effectiveWeight : 70}
        onCancel={() => setIsRunnerActive(false)}
        onFinish={(sessionData) => {
          setIsRunnerActive(false)
          const nowStr = new Date().toISOString().slice(0, 10)
          const session: TrackingSession = {
            id: `cardio-${Date.now()}`,
            date: nowStr,
            programDayIndex: day.dayIndex,
            exercises: [],
            notes: `جلسة كارديو: ${sessionData.activityNameAr} (${sessionData.durationMinutes} دقيقة) · الإجمالي: ${sessionData.grossKcal} سعرة`,
            createdAt: Date.now(),
            cardioDetails: sessionData,
          }
          trackingStore.saveSession(session)
          if (onSaveSession) {
            onSaveSession(session)
          }
          if (onCompleteSession) {
            onCompleteSession()
          }
          setToastMsg(
            `تم حفظ جلسة الكارديو: ${plural(sessionData.durationMinutes, 'minute')} (${plural(sessionData.grossKcal, 'calorie')})`,
          )
          setTimeout(() => setToastMsg(null), 3500)
        }}
      />
    )
  }

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
        {/* Weight input prompt if missing */}
        {effectiveWeight <= 0 && (
          <div
            className="card"
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              background: 'var(--color-surface-2)',
              border: '1px dashed var(--color-accent)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <span
              style={{
                fontSize: '13.5px',
                fontWeight: 700,
                color: 'var(--color-text)',
              }}
            >
              الوزن الحالي مطلوب لحساب السعرات
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                placeholder="وزنك بالكجم (مثلاً 75)"
                value={customWeight}
                onChange={(e) => setCustomWeight(e.target.value)}
                style={{
                  flex: 1,
                  height: '40px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-divider)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: '14px',
                }}
              />
              <Button
                variant="subtle"
                size="sm"
                onClick={handleSaveCustomWeight}
              >
                حفظ الوزن
              </Button>
            </div>
            {weightInputError && (
              <span
                style={{
                  fontSize: '12px',
                  color: 'var(--color-danger)',
                }}
              >
                {weightInputError}
              </span>
            )}
          </div>
        )}

        {/* Live Energy Estimate Card */}
        <div
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
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
                color: 'var(--color-info)',
                background:
                  'var(--color-info-surface, rgba(96, 165, 250, 0.12))',
                padding: '3px 8px',
                borderRadius: '6px',
              }}
            >
              تقدير حرق الطاقة
            </span>
            <button
              type="button"
              onClick={() => setShowInfoSheet(true)}
              aria-label="الفرق بين الإجمالي والصافي"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'transparent',
                border: 'none',
                color: 'var(--color-accent-text, var(--color-accent))',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '2px 4px',
              }}
            >
              <Icon name="info" size={14} />
              <span>الفرق بين الإجمالي والصافي</span>
            </button>
          </div>

          {estimate ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              {/* Gross Energy (Headline) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: 'var(--color-text-2)',
                  }}
                >
                  الإجمالي:
                </span>
                <span
                  style={{
                    fontSize: '26px',
                    fontWeight: 900,
                    color: 'var(--color-accent)',
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1.1,
                  }}
                >
                  {Math.round(estimate.grossSessionKcal)}
                </span>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                  }}
                >
                  سعرة
                </span>
              </div>

              {/* Net Energy (Second line) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: 'var(--color-text-2)',
                  }}
                >
                  الزيادة بسبب التمرين (الصافي):
                </span>
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: 'var(--color-text)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {Math.round(estimate.netSessionKcal)}
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    color: 'var(--color-text-2)',
                  }}
                >
                  سعرة
                </span>
              </div>
            </div>
          ) : (
            <div
              style={{
                fontSize: '13.5px',
                color: 'var(--color-text-2)',
                padding: '8px 0',
                textAlign: 'center',
              }}
            >
              {effectiveWeight <= 0
                ? 'سجّل وزن جسمك لعرض حرق الطاقة التقديري'
                : 'حدد خيارات التمرين لحساب السعرات'}
            </div>
          )}

          {/* Scientific Caveat via Claim */}
          <div style={{ marginTop: '2px' }}>
            <Claim id="cardio_met_caveat" />
          </div>
        </div>

        {/* 1. Activity Choice (6 options with icons & Arabic names) */}
        <section className="screen-section">
          <div className="section-title">
            <span>نوع النشاط البدني</span>
          </div>
          <Choice
            variant="segmented"
            options={ACTIVITY_OPTIONS}
            value={activityId}
            onChange={(val) => handleActivityChange(val as CardioActivityId)}
            ariaLabel="نوع النشاط البدني"
          />
        </section>

        {/* 2. Duration Stepper + Direct Input */}
        <section className="screen-section">
          <div className="section-title">
            <span>مدة الجلسة (بالدقائق)</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '10px',
            }}
          >
            <button
              type="button"
              aria-label="إنقاص المدة 5 دقائق"
              disabled={plannedMinutes <= 5}
              onClick={() => handleDurationChange(plannedMinutes - 5)}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-control)',
                border: '1px solid var(--color-divider)',
                background: 'var(--color-surface-2)',
                color: 'var(--color-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: plannedMinutes <= 5 ? 'not-allowed' : 'pointer',
                opacity: plannedMinutes <= 5 ? 0.4 : 1,
              }}
            >
              <Icon name="minus" size={18} />
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                flex: 1,
              }}
            >
              <input
                type="number"
                min={5}
                max={180}
                value={plannedMinutes}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10)
                  if (!isNaN(val)) {
                    handleDurationChange(val)
                  }
                }}
                aria-label="مدة الجلسة بالدقائق"
                style={{
                  width: '84px',
                  height: '44px',
                  textAlign: 'center',
                  fontSize: '18px',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-control)',
                  border: '1px solid var(--color-divider)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              />
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--color-text-2)',
                }}
              >
                دقيقة
              </span>
            </div>

            <button
              type="button"
              aria-label="زيادة المدة 5 دقائق"
              disabled={plannedMinutes >= 180}
              onClick={() => handleDurationChange(plannedMinutes + 5)}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-control)',
                border: '1px solid var(--color-divider)',
                background: 'var(--color-surface-2)',
                color: 'var(--color-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: plannedMinutes >= 180 ? 'not-allowed' : 'pointer',
                opacity: plannedMinutes >= 180 ? 0.4 : 1,
              }}
            >
              <Icon name="plus" size={18} />
            </button>
          </div>

          {/* Quick preset chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {durations.map((m) => {
              const isSelected = plannedMinutes === m
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleDurationChange(m)}
                  style={{
                    flex: '1 0 calc(20% - 8px)',
                    minWidth: '52px',
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: isSelected
                      ? '1.5px solid var(--color-accent)'
                      : '1px solid var(--color-divider)',
                    background: isSelected
                      ? 'var(--color-accent)'
                      : 'var(--color-surface)',
                    color: isSelected
                      ? 'var(--color-accent-on)'
                      : 'var(--color-text)',
                    fontWeight: 700,
                    fontSize: '13.5px',
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

        {/* 3. Effort Level (with ui_hint_ar under each option) */}
        <section className="screen-section">
          <div className="section-title">
            <span>مستوى الشدة والجهد</span>
          </div>
          <Choice
            variant="option-card"
            options={EFFORT_OPTIONS}
            value={effort}
            onChange={(val) => handleEffortChange(val as CardioEffortLevel)}
            ariaLabel="مستوى الشدة والجهد"
          />
        </section>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="sticky-bottom-bar">
        {disabledReason && (
          <div
            style={{
              fontSize: '12px',
              color: 'var(--color-text-2)',
              textAlign: 'center',
              marginBottom: '6px',
            }}
          >
            {disabledReason}
          </div>
        )}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={isStartDisabled}
          onClick={() => setIsRunnerActive(true)}
        >
          ابدأ جلسة الكارديو
        </Button>
      </div>

      {/* Gross vs Net Info Sheet */}
      <Sheet
        isOpen={showInfoSheet}
        onClose={() => setShowInfoSheet(false)}
        title="الفرق بين الإجمالي والصافي"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '16px',
          }}
        >
          <Claim id="cardio_gross_vs_net" />
          <div
            style={{
              fontSize: '13.5px',
              color: 'var(--color-text-2)',
              lineHeight: 1.5,
            }}
          >
            <strong>الإجمالي:</strong> يشمل إجمالي الطاقة المصروفة أثناء
            التمرين متضمنة حرق الراحة الطبيعي.
          </div>
          <div
            style={{
              fontSize: '13.5px',
              color: 'var(--color-text-2)',
              lineHeight: 1.5,
            }}
          >
            <strong>الزيادة بسبب التمرين:</strong> الطاقة الإضافية المحروقة
            حصرياً بفعل الجهد البدني.
          </div>
        </div>
      </Sheet>

      {/* Local Toast notification */}
      {toastMsg && <Toast message={toastMsg} />}
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

  const weekLoad = useMemo(
    () => selectWeekLoad(profile, program),
    [profile, program],
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

  // B2 Duplicate Day States
  const [isDuplicatePickerOpen, setIsDuplicatePickerOpen] = useState(false)
  const [isDuplicateConfirmOpen, setIsDuplicateConfirmOpen] = useState(false)
  const [duplicateSourceDay, setDuplicateSourceDay] = useState<ProgramDay | null>(null)
  const [duplicateNewName, setDuplicateNewName] = useState('')
  const [duplicateTargetWeekday, setDuplicateTargetWeekday] = useState<number>(0)

  // B1.3 Disallowed Exercises Mismatch States
  const [dismissedDisallowedMismatch, setDismissedDisallowedMismatch] = useState(false)
  const [replacementPreviewOpen, setReplacementPreviewOpen] = useState(false)

  // B3.2 Cardio Finisher States
  const [isFinisherModalOpen, setIsFinisherModalOpen] = useState(false)
  const [finisherTargetDay, setFinisherTargetDay] = useState<ProgramDay | null>(null)
  const [finisherActivity, setFinisherActivity] = useState<string>('جري خفيف')
  const [finisherMinutes, setFinisherMinutes] = useState<number>(20)
  const [finisherLevel, setFinisherLevel] = useState<'خفيف' | 'متوسط' | 'عالي'>('متوسط')
  const [applyFinisherToAll, setApplyFinisherToAll] = useState(false)

  // Constraints & Schedule Derivations
  const constraints = useMemo(() => deriveConstraints(profile), [profile])

  const schedule = useMemo(
    () => getOrDeriveSchedule(profile, program),
    [profile, program],
  )
  const orderedWeekdays = useMemo(
    () => getOrderedWeekdays(profile?.weekStartDay ?? 6),
    [profile?.weekStartDay],
  )

  const freeWeekdays = useMemo(() => {
    return orderedWeekdays.filter((w) => {
      const slot = schedule[w.weekday]
      return !slot || slot === 'rest'
    })
  }, [orderedWeekdays, schedule])

  const allWeekdaysTaken = useMemo(() => {
    return (
      freeWeekdays.length === 0 ||
      (program?.days.length !== undefined && program.days.length >= 7)
    )
  }, [freeWeekdays, program?.days.length])

  // Disallowed Exercises in Current Program (B1.3)
  const disallowedExercisesInfo = useMemo(() => {
    if (!program || dismissedDisallowedMismatch) return []
    const list: Array<{
      dayIndex: number
      dayName: string
      exerciseIndex: number
      currentExercise: ProgramExercise
      catalogExercise: Exercise
      suggestedReplacement: Exercise | null
    }> = []

    for (const d of program.days) {
      if (d.kind === 'cardio') continue
      for (let idx = 0; idx < d.exercises.length; idx++) {
        const pe = d.exercises[idx]
        const catEx =
          customExercises.find((c) => c.id === pe.exerciseId) ||
          EXERCISES.find((e) => e.id === pe.exerciseId)
        if (catEx && !isExerciseAllowed(catEx, constraints)) {
          const replacement =
            EXERCISES.find(
              (cand) =>
                cand.category === catEx.category &&
                cand.id !== catEx.id &&
                isExerciseAllowed(cand, constraints),
            ) || null

          list.push({
            dayIndex: d.dayIndex,
            dayName: d.name || d.labelAr,
            exerciseIndex: idx,
            currentExercise: pe,
            catalogExercise: catEx,
            suggestedReplacement: replacement,
          })
        }
      }
    }
    return list
  }, [program, constraints, customExercises, dismissedDisallowedMismatch])

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

  function handleConfirmDuplicateDay() {
    if (!program || !onUpdateProgram || !duplicateSourceDay) return
    const nextIndex =
      program.days.length > 0
        ? Math.max(...program.days.map((d) => d.dayIndex)) + 1
        : 0
    const newDayId = `day-${Date.now()}`
    const clonedExercises = (duplicateSourceDay.exercises || []).map((pe) => ({
      ...pe,
    }))
    const nameToUse = duplicateNewName.trim() || `${duplicateSourceDay.name || duplicateSourceDay.labelAr} (نسخة)`
    const clonedDay: ProgramDay = {
      ...duplicateSourceDay,
      id: newDayId,
      dayIndex: nextIndex,
      name: nameToUse,
      labelAr: nameToUse,
      customName: nameToUse,
      exercises: clonedExercises,
      cardioConfig: duplicateSourceDay.cardioConfig ? { ...duplicateSourceDay.cardioConfig } : undefined,
      finisher: duplicateSourceDay.finisher ? { ...duplicateSourceDay.finisher } : undefined,
    }

    if (profile && onUpdateProfile && duplicateTargetWeekday !== undefined) {
      const currentSchedule = getOrDeriveSchedule(profile, program)
      const updatedSchedule = {
        ...currentSchedule,
        [duplicateTargetWeekday]: newDayId,
      }
      onUpdateProfile({
        ...profile,
        schedule: updatedSchedule,
      })
    }

    onUpdateProgram({
      ...program,
      days: [...program.days, clonedDay],
    })

    setIsDuplicateConfirmOpen(false)
    setDuplicateSourceDay(null)
    showToast('تم تكرار اليوم بنجاح')
    handleSelectDay(clonedDay.dayIndex)
  }

  function handleConfirmReplaceDisallowed() {
    if (!program || !onUpdateProgram || disallowedExercisesInfo.length === 0) return
    const replacementMap = new Map<string, string>()
    for (const item of disallowedExercisesInfo) {
      if (item.suggestedReplacement) {
        replacementMap.set(item.catalogExercise.id, item.suggestedReplacement.id)
      }
    }

    const newDays = program.days.map((day) => {
      const newExercises = day.exercises.map((pe) => {
        const repId = replacementMap.get(pe.exerciseId)
        if (repId) {
          return { ...pe, exerciseId: repId }
        }
        return pe
      })
      return { ...day, exercises: newExercises }
    })

    onUpdateProgram({ ...program, days: newDays })
    setReplacementPreviewOpen(false)
    setDismissedDisallowedMismatch(true)
    showToast('تم استبدال التمارين غير المتوافقة بنجاح')
  }

  function handleSaveFinisher() {
    if (!program || !onUpdateProgram) return
    const finisherConfig = {
      activity: finisherActivity,
      minutes: finisherMinutes,
      level: finisherLevel,
    }

    const newDays = program.days.map((d) => {
      if (applyFinisherToAll) {
        if (d.kind !== 'cardio') {
          return { ...d, finisher: finisherConfig }
        }
        return d
      }
      if (finisherTargetDay && d.dayIndex === finisherTargetDay.dayIndex) {
        return { ...d, finisher: finisherConfig }
      }
      return d
    })

    onUpdateProgram({ ...program, days: newDays })
    setIsFinisherModalOpen(false)
    setFinisherTargetDay(null)
    showToast(applyFinisherToAll ? 'تم تطبيق الكارديو على كل أيام المقاومة' : 'تم حفظ تمرين الكارديو بعد التمرين')
  }

  function handleRemoveFinisher(removeAll: boolean = false) {
    if (!program || !onUpdateProgram) return
    const newDays = program.days.map((d) => {
      if (removeAll || (finisherTargetDay && d.dayIndex === finisherTargetDay.dayIndex)) {
        return { ...d, finisher: null }
      }
      return d
    })

    onUpdateProgram({ ...program, days: newDays })
    setIsFinisherModalOpen(false)
    setFinisherTargetDay(null)
    showToast(removeAll ? 'تم حذف الكارديو من كل الأيام' : 'تم حذف تمرين الكارديو')
  }

  const renderFinisherSheet = () => (
    <Sheet
      isOpen={isFinisherModalOpen}
      onClose={() => setIsFinisherModalOpen(false)}
      title="كارديو بعد التمرين (Finisher)"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
            النشاط
          </div>
          <Select
            options={[
              { value: 'جري خفيف', label: 'جري خفيف (خارجي أو سير)' },
              { value: 'مشي سريع', label: 'مشي سريع / ميلان' },
              { value: 'دراجة ثابتة', label: 'دراجة ثابتة' },
              { value: 'نط حبل', label: 'نط حبل' },
              { value: 'تجديف', label: 'تجديف (Rowing)' },
            ]}
            value={finisherActivity}
            onChange={(val) => setFinisherActivity(val)}
          />
        </div>

        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
            المدة المخططة ({finisherMinutes} دقيقة)
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[10, 15, 20, 25, 30, 45].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setFinisherMinutes(m)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: finisherMinutes === m ? 'var(--color-accent)' : 'var(--color-divider)',
                  background: finisherMinutes === m ? 'var(--color-accent)' : 'var(--color-surface-2)',
                  color: finisherMinutes === m ? 'var(--color-accent-on)' : 'var(--color-text)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {m} د
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
            مستوى الشدة
          </div>
          <Choice
            variant="option-card"
            options={[
              { value: 'خفيف', label: 'خفيف', description: 'مجهود بسيط وسرعة استشفاء' },
              { value: 'متوسط', label: 'متوسط', description: 'تنفس سريع مع إمكانية الحديث' },
              { value: 'عالي', label: 'عالي', description: 'جهد مكثف وحرق عالٍ' },
            ]}
            value={finisherLevel}
            onChange={(val) => setFinisherLevel(val as 'خفيف' | 'متوسط' | 'عالي')}
            ariaLabel="مستوى شدة الكارديو"
          />
        </div>

        {/* Energy calculation caveat claim */}
        <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--color-surface-2)', border: '1px solid var(--color-divider)' }}>
          <Claim id="cardio_energy_formula" />
        </div>

        {/* Apply to all resistance days switch */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            borderRadius: '8px',
            background: 'var(--color-surface-2)',
            cursor: 'pointer',
          }}
        >
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 700 }}>
              طبّقه على كل أيام المقاومة
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--color-text-2)' }}>
              إضافة نفس النشاط والمدة لجميع أيام الحديد
            </div>
          </div>
          <input
            type="checkbox"
            checked={applyFinisherToAll}
            onChange={(e) => setApplyFinisherToAll(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--color-accent)' }}
          />
        </label>

        {applyFinisherToAll && program && (
          <div style={{ fontSize: '12px', color: 'var(--color-accent)', padding: '4px 8px' }}>
            سيتم تطبيقه على {program.days.filter((d) => d.kind !== 'cardio').length} أيام مقاومة: (
            {program.days
              .filter((d) => d.kind !== 'cardio')
              .map((d) => d.name || d.labelAr)
              .join('، ')}
            )
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <Button
            variant="subtle"
            fullWidth
            onClick={() => setIsFinisherModalOpen(false)}
          >
            إلغاء
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={handleSaveFinisher}
          >
            حفظ الكارديو
          </Button>
        </div>
      </div>
    </Sheet>
  )


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
        profile: profile || undefined,
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
            title="مفيش جدول تمرين دلوقتي"
            message="صمم برنامج تمرين علمي مخصص لأيامك وهدفك، أو اختار تصميم يدوي."
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
            profile={profile}
            onUpdateProfile={onUpdateProfile}
            onBack={handleBackToOverview}
            onUpdateConfig={(newConfig) =>
              handleUpdateCardioConfig(selectedDay.dayIndex, newConfig)
            }
            onOpenOverflow={() => setIsDayOverflowOpen(true)}
            onCompleteSession={() => {
              showToast('تم إتمام وتسجيل جلسة الكارديو بنجاح')
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

          {/* B3.2 Cardio Finisher Card under the exercise list */}
          <section className="screen-section" style={{ marginTop: '12px' }}>
              <div
                className="section-title"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <span>كارديو بعد التمرين (Finisher)</span>
                {selectedDay.finisher && (
                  <button
                    type="button"
                    className="ghost tiny"
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-accent)',
                      padding: '2px 8px',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setFinisherTargetDay(selectedDay)
                      setFinisherActivity(selectedDay.finisher?.activity || 'جري خفيف')
                      setFinisherMinutes(selectedDay.finisher?.minutes || 20)
                      setFinisherLevel(selectedDay.finisher?.level || 'متوسط')
                      setApplyFinisherToAll(false)
                      setIsFinisherModalOpen(true)
                    }}
                  >
                    تعديل
                  </button>
                )}
              </div>
              {selectedDay.finisher ? (
                <div
                  className="card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid var(--color-divider)',
                    background: 'var(--color-surface-2)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: 'var(--color-info-surface, rgba(96, 165, 250, 0.15))',
                        color: 'var(--color-info)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon name="activity" size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--color-text)' }}>
                        {selectedDay.finisher.activity}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-2)' }}>
                        {selectedDay.finisher.minutes} دقيقة · شدة {selectedDay.finisher.level}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ghost tiny"
                    style={{ color: 'var(--color-danger)', padding: '6px' }}
                    onClick={() => {
                      setFinisherTargetDay(selectedDay)
                      handleRemoveFinisher(false)
                    }}
                    aria-label="حذف الكارديو"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1px dashed var(--color-divider)',
                    background: 'var(--color-surface)',
                    width: '100%',
                    textAlign: 'right',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setFinisherTargetDay(selectedDay)
                    setFinisherActivity('جري خفيف')
                    setFinisherMinutes(20)
                    setFinisherLevel('متوسط')
                    setApplyFinisherToAll(false)
                    setIsFinisherModalOpen(true)
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'var(--color-surface-2)',
                      color: 'var(--color-text-2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconPlus size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--color-text)' }}>
                      + إضافة كارديو بعد التمرين
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-2)' }}>
                      جلسة هوائية خفيفة لزيادة حرق السعرات بعد رفع الأثقال
                    </div>
                  </div>
                </button>
              )}
            </section>
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
              className="ghost-secondary full-width"
              style={{
                justifyContent: 'flex-start',
                height: '48px',
                gap: '10px',
              }}
              onClick={() => {
                setIsDayOverflowOpen(false)
                setFinisherTargetDay(selectedDay)
                if (selectedDay.finisher) {
                  setFinisherActivity(selectedDay.finisher.activity)
                  setFinisherMinutes(selectedDay.finisher.minutes)
                  setFinisherLevel(selectedDay.finisher.level)
                } else {
                  setFinisherActivity('جري خفيف')
                  setFinisherMinutes(20)
                  setFinisherLevel('متوسط')
                }
                setApplyFinisherToAll(false)
                setIsFinisherModalOpen(true)
              }}
            >
              <Icon name="activity" size={16} />
              <span>
                {selectedDay.finisher
                  ? 'تعديل كارديو بعد التمرين'
                  : 'إضافة كارديو بعد التمرين'}
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

        {renderFinisherSheet()}

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

        {/* B1.3 Disallowed Exercises Mismatch Callout */}
        {disallowedExercisesInfo.length > 0 && !dismissedDisallowedMismatch && (
          <Callout
            variant="warning"
            title="تمارين لا تناسب إمكانياتك الحالية"
            action={
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setReplacementPreviewOpen(true)}
                >
                  استبدلهم بتمارين مناسبة
                </Button>
                <Button
                  size="sm"
                  variant="subtle"
                  onClick={() => setDismissedDisallowedMismatch(true)}
                >
                  سيبهم
                </Button>
              </div>
            }
          >
            يحتوي جدولك على {disallowedExercisesInfo.length} تمارين تتطلب معدات غير متوفرة لديك بناءً على إعدادات ملفك الشخصي.
          </Callout>
        )}

        {/* Training days mismatch Callout */}
        <ScheduleMismatchCallout
          profile={profile}
          program={program}
          onUpdateProfile={onUpdateProfile}
          onOpenDaysAdjust={() => setIsDaysAdjustSheetOpen(true)}
          showToast={showToast}
        />

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
              style={{
                fontSize: '12px',
                color: 'var(--muted)',
                fontWeight: 600,
              }}
            >
              <bdi dir="ltr">{WORKOUT_SPLIT_EN[program.splitType]}</bdi>
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
            <span>{plural(weekLoad.totalScheduledSessions, 'يوم')} أسبوعياً</span>
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

              // B6.b: Row title = custom name if set, else «weekday · focus» (e.g. «السبت · صدر / بطن»); no generic word
              let titlePart = cleanName
              if (!titlePart || titlePart === 'يوم تدريبي') {
                titlePart = day.focus || (isCardio ? 'كارديو' : deriveDayMuscleSummary(day.exercises))
              }
              const displayTitle = weekdayInfo
                ? `${weekdayInfo.nameAr} · ${titlePart}`
                : titlePart

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
                            ? 'var(--color-info-surface, rgba(96, 165, 250, 0.15))'
                            : 'var(--color-surface-2)',
                        color: isToday
                          ? 'var(--color-accent-on)'
                          : isCardio
                            ? 'var(--color-info)'
                            : 'var(--color-text)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '16px',
                        border: '1px solid var(--color-divider)',
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
                        justifyContent: 'space-between',
                        gap: '6px',
                        flexWrap: 'wrap',
                        minWidth: 0,
                        width: '100%',
                      }}
                    >
                      <span
                        style={{
                          minWidth: 0,
                          flex: '1 1 auto',
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: displayTitle.length >= 60 ? 'hidden' : 'visible',
                          textOverflow: displayTitle.length >= 60 ? 'ellipsis' : 'clip',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                        }}
                      >
                        {displayTitle}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        {isCardio && (
                          <span
                            className="badge"
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: 'var(--color-info)',
                              background: 'var(--color-info-surface, rgba(96, 165, 250, 0.12))',
                              padding: '2px 6px',
                              borderRadius: '6px',
                              whiteSpace: 'nowrap',
                              flex: 'none',
                            }}
                          >
                            كارديو
                          </span>
                        )}
                        {isToday && (
                          <span
                            className="badge"
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: 'var(--color-accent-text)',
                              background: 'var(--color-accent-soft, rgba(235, 94, 40, 0.15))',
                              padding: '2px 6px',
                              borderRadius: '6px',
                              whiteSpace: 'nowrap',
                              flex: 'none',
                            }}
                          >
                            اليوم
                          </span>
                        )}
                      </div>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Group 1: البرنامج */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--color-text-2)',
                paddingInline: '4px',
              }}
            >
              البرنامج
            </div>
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
                setIsDaysAdjustSheetOpen(true)
              }}
            >
              <IconCalendar size={18} />
              <span>تعديل أيام الجدول</span>
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
                minHeight: '48px',
                height: 'auto',
                paddingBlock: '8px',
                gap: '10px',
                alignItems: 'flex-start',
                textAlign: 'right',
              }}
              onClick={() => {
                setIsManageSheetOpen(false)
                handleToggleLock()
              }}
            >
              <div style={{ marginTop: '2px' }}>
                {program.isLocked ? <IconUnlock size={18} /> : <IconLock size={18} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontWeight: 700 }}>
                  {program.isLocked ? 'إلغاء قفل الجدول' : 'قفل الجدول'}
                </span>
                <span style={{ fontSize: '11.5px', color: 'var(--color-text-2)', fontWeight: 400 }}>
                  يمنع تعديل أو إعادة توليد الجدول الحالي لتجنب تغيير التمارين بالخطأ
                </span>
              </div>
            </button>
          </div>

          {/* Group 2: البيانات */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--color-text-2)',
                paddingInline: '4px',
              }}
            >
              البيانات
            </div>
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
              <span>صمم لي جدولي الخاص</span>
            </button>
          </div>

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

          {/* Change split as radio list if not custom */}
          {!program.isCustom && (
            <div
              style={{
                marginTop: '4px',
                borderTop: '1px solid var(--color-divider)',
                paddingTop: '10px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-text-2)',
                  marginBottom: '8px',
                  paddingInline: '4px',
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

          {/* Destructive Delete Button Separated Last */}
          {onDeleteProgram && (
            <div
              style={{
                marginTop: '8px',
                borderTop: '1px solid var(--color-divider)',
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
          'تقدر ترجّعه من حافظة الجداول أو تعمل جدول جديد في أي وقت.',
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
          {allWeekdaysTaken && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'var(--color-surface-2)',
                color: 'var(--color-text-2)',
                fontSize: '13px',
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              كل أيام الأسبوع مشغولة
            </div>
          )}
          <button
            type="button"
            className="ghost-secondary full-width"
            disabled={allWeekdaysTaken}
            style={{
              justifyContent: 'flex-start',
              height: '52px',
              gap: '12px',
              padding: '0 16px',
              opacity: allWeekdaysTaken ? 0.5 : 1,
              cursor: allWeekdaysTaken ? 'not-allowed' : 'pointer',
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
            disabled={allWeekdaysTaken}
            style={{
              justifyContent: 'flex-start',
              height: '52px',
              gap: '12px',
              padding: '0 16px',
              opacity: allWeekdaysTaken ? 0.5 : 1,
              cursor: allWeekdaysTaken ? 'not-allowed' : 'pointer',
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
          <button
            type="button"
            className="ghost-secondary full-width"
            disabled={allWeekdaysTaken || !program || program.days.length === 0}
            style={{
              justifyContent: 'flex-start',
              height: '52px',
              gap: '12px',
              padding: '0 16px',
              opacity: allWeekdaysTaken || !program || program.days.length === 0 ? 0.5 : 1,
              cursor: allWeekdaysTaken || !program || program.days.length === 0 ? 'not-allowed' : 'pointer',
            }}
            onClick={() => {
              setIsAddDaySheetOpen(false)
              setIsDuplicatePickerOpen(true)
            }}
          >
            <IconClipboard size={20} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>
                تكرار يوم موجود
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                نسخ تمارين وأهداف يوم موجود إلى يوم جديد
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
              disabled={allWeekdaysTaken}
              style={{
                justifyContent: 'flex-start',
                height: '48px',
                gap: '10px',
                opacity: allWeekdaysTaken ? 0.5 : 1,
                cursor: allWeekdaysTaken ? 'not-allowed' : 'pointer',
              }}
              onClick={() => {
                const target = dayMenuTarget
                setDayMenuTarget(null)
                setDuplicateSourceDay(target)
                setDuplicateNewName(`${target.name || target.labelAr} (نسخة)`)
                setDuplicateTargetWeekday(freeWeekdays[0]?.weekday ?? 0)
                setIsDuplicateConfirmOpen(true)
              }}
            >
              <IconClipboard size={16} />
              <span>تكرار اليوم</span>
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
            {dayMenuTarget.kind !== 'cardio' && (
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
                  setFinisherTargetDay(target)
                  if (target.finisher) {
                    setFinisherActivity(target.finisher.activity)
                    setFinisherMinutes(target.finisher.minutes)
                    setFinisherLevel(target.finisher.level)
                  } else {
                    setFinisherActivity('جري خفيف')
                    setFinisherMinutes(20)
                    setFinisherLevel('متوسط')
                  }
                  setApplyFinisherToAll(false)
                  setIsFinisherModalOpen(true)
                }}
              >
                <Icon name="activity" size={16} />
                <span>
                  {dayMenuTarget.finisher
                    ? 'تعديل كارديو بعد التمرين'
                    : 'إضافة كارديو بعد التمرين'}
                </span>
              </button>
            )}
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

      {/* Sheet: Duplicate Day Picker */}
      <Sheet
        isOpen={isDuplicatePickerOpen}
        onClose={() => setIsDuplicatePickerOpen(false)}
        title="اختر اليوم المراد تكراره"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {program?.days.map((d) => {
            const sched = getOrDeriveSchedule(profile, program)
            const scheduledWd = Object.entries(sched).find(
              ([_wd, slot]) => slot === d.id || slot === String(d.dayIndex)
            )?.[0]
            const wdInfo = scheduledWd !== undefined ? ALL_WEEKDAYS.find(w => w.weekday === Number(scheduledWd)) : null
            const isCardio = d.kind === 'cardio'

            return (
              <ListRow
                key={d.dayIndex}
                onClick={() => {
                  setDuplicateSourceDay(d)
                  setDuplicateNewName(`${d.name || d.labelAr} (نسخة)`)
                  setDuplicateTargetWeekday(freeWeekdays[0]?.weekday ?? 0)
                  setIsDuplicatePickerOpen(false)
                  setIsDuplicateConfirmOpen(true)
                }}
                leading={
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'var(--color-surface-2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }}
                  >
                    {isCardio ? <Icon name="activity" size={16} /> : <IconDumbbell size={16} />}
                  </div>
                }
                title={wdInfo ? `${wdInfo.nameAr} · ${d.name || d.labelAr}` : d.name || d.labelAr}
                secondary={isCardio ? 'كارديو ولياقة' : `${d.exercises.length} تمارين · ${d.focus}`}
                trailing={<IconChevronLeft size={16} style={{ color: 'var(--muted)' }} />}
              />
            )
          })}
        </div>
      </Sheet>

      {/* Sheet: Duplicate Day Confirm */}
      <Sheet
        isOpen={isDuplicateConfirmOpen}
        onClose={() => setIsDuplicateConfirmOpen(false)}
        title="تكرار اليوم"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '16px' }}>
          <Field
            label="اسم اليوم الجديد"
            value={duplicateNewName}
            onChange={(e) => setDuplicateNewName(e.target.value)}
            placeholder="مثال: علوي (ب)..."
          />

          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              اليوم في الأسبوع
            </div>
            {freeWeekdays.length > 0 ? (
              <Select
                options={freeWeekdays.map((w) => ({
                  value: String(w.weekday),
                  label: w.nameAr,
                }))}
                value={String(duplicateTargetWeekday)}
                onChange={(val) => setDuplicateTargetWeekday(Number(val))}
              />
            ) : (
              <div style={{ fontSize: '12px', color: 'var(--color-danger)' }}>
                كل أيام الأسبوع مشغولة في جدولك الحالي
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <Button
              variant="subtle"
              fullWidth
              onClick={() => setIsDuplicateConfirmOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleConfirmDuplicateDay}
            >
              تأكيد التكرار
            </Button>
          </div>
        </div>
      </Sheet>

      {/* Sheet: Replacement Preview Modal */}
      <Sheet
        isOpen={replacementPreviewOpen}
        onClose={() => setReplacementPreviewOpen(false)}
        title="استبدال التمارين غير المتوافقة"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: 'var(--color-text-2)', margin: 0 }}>
            سيتم استبدال كل تمرين غير متوافق مع إعدادات معداتك الحالية ببديل مناسب من نفس المجموعة العضلية:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
            {disallowedExercisesInfo.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-divider)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--color-text-2)' }}>
                  {item.dayName}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-danger)', fontSize: '13px' }}>
                    {item.catalogExercise.nameAr}
                  </span>
                  <span style={{ color: 'var(--muted)' }}>←</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-success)', fontSize: '13px' }}>
                    {item.suggestedReplacement ? item.suggestedReplacement.nameAr : 'لا يوجد بديل متاح'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <Button
              variant="subtle"
              fullWidth
              onClick={() => setReplacementPreviewOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleConfirmReplaceDisallowed}
            >
              تأكيد الاستبدال
            </Button>
          </div>
        </div>
      </Sheet>

      {/* Sheet: Cardio Finisher Modal */}
      {renderFinisherSheet()}

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
