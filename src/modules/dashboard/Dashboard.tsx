import { useMemo, useState } from 'react'
import { assetUrl } from '../../utils/assetUrl'
import { formatArabicDate } from '../../lib/dateUtils'
import type {
  TrackingSession,
  BodyLogEntry,
  WorkoutProgram,
  ProgramDay,
} from '../shared/types'
import type { UserProfile } from '../onboarding/types'
import { GOALS } from '../onboarding/types'
import { getEffectiveExercise } from '../workout/exerciseStore'
import { ExerciseMarks } from '../../components/ExerciseMarks'
import {
  TopBar,
  Button,
  Card,
  Section,
  ListRow,
  Stat,
  ProgressBar,
  Callout,
  Icon,
  ConfirmSheet,
} from '../../ui'
import { Ratio } from '../../ui/Ratio'
import { computeEnergyPlan } from '../nutrition/computeEnergyPlan'
import { ExerciseThumb } from '../../components/ExerciseThumb'
import { resolveSession, formatPrescription } from '../workout/sessionResolver'
import {
  getOrDeriveSchedule,
  getNextSession,
  getOrderedWeekdays,
} from '../workout/scheduleManager'
import { selectWeekLoad } from '../workout/weekLoadSelector'
import { ScheduleMismatchCallout } from '../workout/ScheduleMismatchCallout'
import { plural } from '../../utils/plural'

export interface DashboardProps {
  profile: UserProfile | null
  program: WorkoutProgram | null
  recentSessions: TrackingSession[]
  bodyLog: BodyLogEntry[]
  onStartWorkout?: (day: ProgramDay) => void
  onViewDay?: (day: ProgramDay) => void
  onOpenNutrition?: () => void
  onSyncTrainingDays?: () => void
  onUpdateProfile?: (profile: UserProfile) => void
  onGenerateProgram?: () => void
  onOpenAiDesigner?: () => void
  onImportProgram?: () => void
  onCreateManualProgram?: () => void
  onSaveBackup?: () => Promise<boolean> | void
}

function getGreeting(name?: string): string {
  const hour = new Date().getHours()
  let prefix = 'مرحباً'
  if (hour >= 5 && hour < 12) {
    prefix = 'صباح الخير'
  } else if (hour >= 12 && hour < 18) {
    prefix = 'أهلاً بك'
  } else {
    prefix = 'مساء الخير'
  }
  const cleanName = name?.trim()
  return cleanName ? `${prefix} يا ${cleanName}` : prefix
}

function toDateOnly(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function getStartOfWeek(startDayIndex: number = 6): Date {
  const now = new Date()
  const currentDay = now.getDay()
  const diff = (currentDay - startDayIndex + 7) % 7
  const start = new Date(now)
  start.setDate(now.getDate() - diff)
  start.setHours(0, 0, 0, 0)
  return start
}

function getSessionsThisWeek(
  sessions: TrackingSession[],
  startDayIndex: number = 6,
): number {
  const weekStart = getStartOfWeek(startDayIndex)
  return sessions.filter((s) => toDateOnly(s.date) >= weekStart).length
}

function getCurrentWeightDisplay(
  bodyLog: BodyLogEntry[],
  profile: UserProfile | null,
): { value: string; secondary: string } {
  if (bodyLog.length > 0) {
    const sorted = [...bodyLog].sort((a, b) => b.date.localeCompare(a.date))
    const latest = sorted[0].weightKg
    let deltaStr = ''
    if (sorted.length > 1) {
      const prev = sorted[1].weightKg
      const diff = Math.round((latest - prev) * 10) / 10
      if (diff > 0) deltaStr = ` (+${diff} كجم)`
      else if (diff < 0) deltaStr = ` (${diff} كجم)`
      else deltaStr = ' (ثابت)'
    }
    return {
      value: `${latest} كجم`,
      secondary: deltaStr ? `آخر تسجيل${deltaStr}` : 'آخر تسجيل',
    }
  }
  if (profile?.body?.weightKg) {
    return {
      value: `${profile.body.weightKg} كجم`,
      secondary: 'من الملف الشخصي',
    }
  }
  return {
    value: '—',
    secondary: 'غير محدد',
  }
}

function getGoalLabel(profile: UserProfile | null): string {
  if (!profile) return '—'
  const found = GOALS.find((g) => g.value === profile.primaryGoal)
  return found?.labelAr ?? '—'
}

export function Dashboard({
  profile,
  program,
  recentSessions,
  bodyLog,
  onStartWorkout,
  onViewDay,
  onOpenNutrition,
  onSyncTrainingDays,
  onUpdateProfile,
  onGenerateProgram,
  onOpenAiDesigner,
  onImportProgram,
  onCreateManualProgram,
  onSaveBackup,
}: DashboardProps) {
  const weekStartDay = profile?.weekStartDay ?? 6
  const greeting = getGreeting(profile?.name)
  const arabicDate = useMemo(() => formatArabicDate(new Date()), [])
  const sessionsThisWeek = getSessionsThisWeek(recentSessions, weekStartDay)
  const currentWeight = getCurrentWeightDisplay(bodyLog, profile)
  const goalLabel = getGoalLabel(profile)

  const [backupDismissed, setBackupDismissed] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('maganis:backup_reminder_dismissed')
      if (!raw) return false
      const ts = Number(raw)
      return Number.isFinite(ts) && Date.now() - ts < 3 * 24 * 60 * 60 * 1000
    } catch {
      return false
    }
  })

  const lastBackupAt = useMemo<number | null>(() => {
    try {
      const raw = localStorage.getItem('backup.last-export')
      if (!raw) return null
      const ts = Number(JSON.parse(raw))
      return Number.isFinite(ts) ? ts : null
    } catch {
      return null
    }
  }, [])

  const hasData = Boolean(
    program || recentSessions.length > 0 || bodyLog.length > 0 || profile,
  )

  const isBackupOverdue =
    !lastBackupAt || Date.now() - lastBackupAt > 7 * 24 * 60 * 60 * 1000
  const showBackupReminder = hasData && !backupDismissed && isBackupOverdue

  // Schedule decoupled from program definition
  const schedule = useMemo(
    () => getOrDeriveSchedule(profile, program),
    [profile, program],
  )
  const weekLoad = useMemo(
    () => selectWeekLoad(profile, program),
    [profile, program],
  )

  const todayDayIndex = new Date().getDay()
  const todaySession = useMemo(
    () => resolveSession(new Date(), { profile, program }),
    [profile, program],
  )
  const todayProgramDay = todaySession.programDay

  const nextSessionInfo = useMemo(
    () => getNextSession(schedule, todayDayIndex, program, weekStartDay),
    [schedule, todayDayIndex, program, weekStartDay],
  )
  const nextWorkoutDay =
    !todayProgramDay && nextSessionInfo ? nextSessionInfo.day : null

  // Red Flag state & confirmation
  const [redFlagDismissed, setRedFlagDismissed] = useState(() => {
    try {
      return localStorage.getItem('maganis:redflag_dismissed') === 'true'
    } catch {
      return false
    }
  })
  const [showRedFlagConfirm, setShowRedFlagConfirm] = useState(false)

  // Mismatch edit modal state
  const [showMismatchEditModal, setShowMismatchEditModal] = useState(false)
  const [selectedGoalDays, setSelectedGoalDays] = useState(
    profile?.trainingDaysPerWeek ?? 4,
  )

  // Verified safe mascot tips (excluding items marked NEEDS REVIEW in docs/tips-review.md)
  const coachTips = [
    'عاش يا وحش! الالتزام بالتحميل التصاعدي وزيادة الأوزان حبة حبة هو سر الفورمة.. البار بيستغيث والدهون بتعيط!',
    'د. مجانص شايفك وانت بتبص على الشاورما! لو هتاكل، احسبها في الماكروز وسف السعرات بالتمرين، كل حاجة بالعلم بتتحل!',
  ]
  const tipIndex =
    Math.abs(
      (profile?.primaryGoal?.length ?? 0) +
        sessionsThisWeek * 3 +
        new Date().getDate(),
    ) % coachTips.length
  const dailyTip = coachTips[tipIndex]

  // Nutrition summary for today
  const todayKey = useMemo(() => new Date().toISOString().split('T')[0], [])
  const dailyNutrition = useMemo(() => {
    try {
      const raw = localStorage.getItem(`maganis:daily_nutrition_${todayKey}`)
      if (raw) return JSON.parse(raw)
    } catch {
      // ignore
    }
    return {
      consumedCalories: 0,
      consumedProtein: 0,
    }
  }, [todayKey])

  // Single source of truth for nutrition targets
  const energyPlan = useMemo(
    () => computeEnergyPlan(profile, bodyLog),
    [profile, bodyLog],
  )
  const targetCalories = energyPlan?.target ?? null
  const targetProtein = energyPlan?.proteinGrams ?? null
  const consumedCalories = dailyNutrition.consumedCalories ?? 0
  const consumedProtein = dailyNutrition.consumedProtein ?? 0

  // 7-Day Week Strip calculation
  const orderedWeekdays = useMemo(
    () => getOrderedWeekdays(weekStartDay),
    [weekStartDay],
  )
  const sessionDatesThisWeek = useMemo(() => {
    const weekStart = getStartOfWeek(weekStartDay)
    return new Set(
      recentSessions
        .filter((s) => toDateOnly(s.date) >= weekStart)
        .map((s) => toDateOnly(s.date).getDay()),
    )
  }, [recentSessions, weekStartDay])

  return (
    <div className="screen-container home-screen" dir="rtl">
      {/* TopBar with greeting & small mascot avatar */}
      <TopBar
        leading={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <img
              src={assetUrl('branding/maganis-mascot-inner.png')}
              alt="د. مجانص"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                objectFit: 'contain',
              }}
            />
            <span
              data-testid="app-title"
              style={{
                fontWeight: 800,
                fontSize: '17px',
                color: 'var(--color-text)',
                letterSpacing: '-0.02em',
                fontFamily: 'Inter, Roboto, system-ui, sans-serif',
                whiteSpace: 'nowrap',
              }}
            >
              <bdi dir="ltr">Maganis</bdi>
            </span>
          </div>
        }
        title={greeting}
        subtitle={arabicDate}
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
        {/* Red Flag Persistent Medical Callout */}
        {profile?.redFlag && !redFlagDismissed && (
          <Callout
            variant="danger"
            title="تنبيه طبي هام"
            action={
              <Button
                size="sm"
                variant="subtle"
                onClick={() => setShowRedFlagConfirm(true)}
              >
                فهمت واستشرت طبيباً
              </Button>
            }
          >
            أشرت في تقييمك الصحي إلى وجود أعراض أو إصابات تتطلب فحصاً طبياً.
            نوصي بعدم البدء بأوزان ثقيلة ومراجعة طبيب مختص قبل ممارسة أي تمرين.
          </Callout>
        )}

        {/* Shared Schedule Mismatch Callout */}
        <ScheduleMismatchCallout
          profile={profile}
          program={program}
          onUpdateProfile={onUpdateProfile}
          onOpenDaysAdjust={() => {
            if (program && program.days.length > 0) {
              onViewDay?.(program.days[0])
            }
          }}
          showToast={
            onSyncTrainingDays ? () => onSyncTrainingDays() : undefined
          }
        />

        {/* Calm Backup Reminder Card */}
        {showBackupReminder && (
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-divider)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                  }}
                >
                  {lastBackupAt
                    ? `آخر نسخة احتياطية من ${formatArabicDate(new Date(lastBackupAt).toISOString().slice(0, 10))}`
                    : 'آخر نسخة احتياطية: لم يتم أخذ نسخة بعد'}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--color-text-2)',
                    marginTop: '2px',
                  }}
                >
                  احفظ نسخة من بياناتك لضمان عدم ضياع تمارينك وسجلاتك.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.setItem(
                      'maganis:backup_reminder_dismissed',
                      String(Date.now()),
                    )
                  } catch {
                    // ignore
                  }
                  setBackupDismissed(true)
                }}
                aria-label="إغلاق التنبيه"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-2)',
                  fontSize: '20px',
                  minWidth: '44px',
                  minHeight: '44px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            <div>
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  if (onSaveBackup) {
                    await onSaveBackup()
                  }
                  try {
                    localStorage.setItem(
                      'maganis:backup_reminder_dismissed',
                      String(Date.now()),
                    )
                  } catch {
                    // ignore
                  }
                  setBackupDismissed(true)
                }}
              >
                احفظ نسخة دلوقتي
              </Button>
            </div>
          </div>
        )}

        {/* Card تمرين اليوم أو ابدأ برنامجك عند عدم وجود جدول */}
        <Section
          title={
            program && program.days.length > 0 ? 'تمرين اليوم' : 'ابدأ برنامجك'
          }
          trailing={
            todayProgramDay
              ? `${todayProgramDay.exercises.length} تمارين`
              : undefined
          }
        >
          <Card padding="md">
            {!program || program.days.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '4px 0',
                }}
              >
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    marginBottom: '4px',
                  }}
                >
                  لا يوجد برنامج تدريبي نشط حاليًا
                </div>
                <Button variant="primary" fullWidth onClick={onGenerateProgram}>
                  إنشاء برنامج تدريبي
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={onOpenAiDesigner}
                >
                  صمم لي جدولي بالذكاء الاصطناعي
                </Button>
                <Button variant="secondary" fullWidth onClick={onImportProgram}>
                  استيراد جدول
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={onCreateManualProgram}
                >
                  بناء جدول يدوي
                </Button>
              </div>
            ) : todayProgramDay ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '17px',
                      fontWeight: 800,
                      color: 'var(--color-text)',
                    }}
                  >
                    {todaySession.dayTitle} — {todaySession.daySubtitle}
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-text-2)',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ~{todaySession.estimatedMinutes} دقيقة
                  </div>
                </div>

                {onStartWorkout && (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => onStartWorkout(todayProgramDay)}
                  >
                    ابدأ التمرين
                  </Button>
                )}

                {/* First 3 exercises as ListRows */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  {todayProgramDay.exercises.slice(0, 3).map((pe, idx) => {
                    const ex = getEffectiveExercise(pe.exerciseId)
                    const arabicName =
                      ex?.nameAr ??
                      ((pe as unknown as Record<string, unknown>).customName as
                        string | undefined) ??
                      'تمرين مخصص'
                    const englishName = ex?.name ?? ''
                    const setsReps = formatPrescription(pe)
                    return (
                      <ListRow
                        key={`${pe.exerciseId}-${idx}`}
                        leading={
                          <ExerciseThumb
                            exerciseId={pe.exerciseId}
                            exerciseName={arabicName}
                            size={40}
                          />
                        }
                        title={
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                          >
                            <span>{arabicName}</span>
                            <ExerciseMarks
                              hasVideo={ex?.hasVideo}
                              hasCustomMedia={ex?.hasCustomMedia}
                            />
                          </span>
                        }
                        subtitle={englishName}
                        trailing={
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: '13.5px',
                              color: 'var(--color-text)',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {setsReps}
                          </span>
                        }
                      />
                    )
                  })}
                </div>

                {todayProgramDay.exercises.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={() => onViewDay?.(todayProgramDay)}
                  >
                    عرض اليوم كاملًا
                  </Button>
                )}
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '4px 0',
                }}
              >
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: 'var(--color-text)',
                  }}
                >
                  لا يوجد تمرين اليوم (يوم راحة)
                </div>
                {nextWorkoutDay ? (
                  <div
                    style={{ fontSize: '13px', color: 'var(--color-text-2)' }}
                  >
                    الجلسة التالية — {nextWorkoutDay.labelAr} (
                    {nextWorkoutDay.focus})
                  </div>
                ) : (
                  <div
                    style={{ fontSize: '13px', color: 'var(--color-text-2)' }}
                  >
                    استمتع بالاستشفاء ونم جيداً لبناء الألياف العضلية
                  </div>
                )}
                {nextWorkoutDay && onStartWorkout && (
                  <div style={{ marginTop: '6px' }}>
                    <Button
                      variant="subtle"
                      size="md"
                      fullWidth
                      onClick={() => onStartWorkout(nextWorkoutDay)}
                    >
                      بدء تمرين مبكر ({nextWorkoutDay.labelAr})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </Section>

        {/* 1 Row of 3 Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
          }}
        >
          <Stat
            label="الجلسات هذا الأسبوع"
            value={
              program && program.days.length > 0
                ? `${sessionsThisWeek} من ${weekLoad.totalScheduledSessions}`
                : '٠ من ٤'
            }
            secondary={
              program && program.days.length > 0
                ? `${weekLoad.breakdownAr}${weekLoad.plannedCardioMinutes > 0 ? ` (+ ${plural(weekLoad.plannedCardioMinutes, 'دقيقة')} كارديو)` : ''}`
                : plural(0, 'جلسة')
            }
          />
          <Stat
            label="الوزن الحالي"
            value={currentWeight.value}
            secondary={currentWeight.secondary}
          />
          <Stat label="الهدف" value={goalLabel} isText />
        </div>

        {/* 7-Day Week Strip */}
        <Section title="أيام الأسبوع">
          <div
            className="week-strip"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '6px',
              background: 'var(--color-surface)',
              padding: '12px 8px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-divider)',
              textAlign: 'center',
            }}
          >
            {orderedWeekdays.map((w) => {
              const isToday = w.weekday === todayDayIndex
              const isDone = sessionDatesThisWeek.has(w.weekday)
              const slot = schedule[w.weekday]
              const day = program?.days?.find(
                (d) => d.id === slot || String(d.dayIndex) === slot,
              )
              const kind = day
                ? day.kind || 'strength'
                : slot === 'cardio'
                  ? 'cardio'
                  : slot === 'rest'
                    ? 'rest'
                    : null
              const isTrainingDay = kind === 'strength'
              const isCardio = kind === 'cardio'
              const isMobility = kind === 'mobility'
              const isRest = kind === 'rest'
              return (
                <div
                  key={w.weekday}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 2px',
                    borderRadius: 'var(--radius-control)',
                    background: isToday
                      ? 'var(--color-surface-2)'
                      : 'transparent',
                    border: isToday
                      ? '1.5px solid var(--color-accent)'
                      : '1.5px solid transparent',
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: isToday ? 800 : 600,
                      color: isToday
                        ? 'var(--color-accent-text)'
                        : 'var(--color-text)',
                    }}
                  >
                    {w.shortAr}
                  </span>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isDone
                        ? 'var(--color-success)'
                        : isTrainingDay
                          ? 'var(--color-accent-subtle, rgba(255, 107, 0, 0.15))'
                          : 'var(--color-surface-2)',
                      color: isDone ? '#FFFFFF' : 'var(--color-text-2)',
                      fontSize: '11px',
                      border:
                        isTrainingDay && !isDone
                          ? '1.5px solid var(--color-accent)'
                          : '1px solid transparent',
                    }}
                  >
                    {isDone ? (
                      <Icon name="check" size={12} />
                    ) : isTrainingDay ? (
                      <Icon name="dumbbell" size={12} />
                    ) : isCardio ? (
                      <Icon name="activity" size={12} />
                    ) : isMobility ? (
                      <Icon name="heart" size={12} />
                    ) : isRest ? (
                      <Icon name="moon" size={12} />
                    ) : (
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: 'var(--color-text-2)',
                          lineHeight: 1,
                        }}
                      >
                        —
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <div
            className="week-strip__legend"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '11px',
              color: 'var(--color-text-2)',
              marginTop: '8px',
            }}
          >
            <span>قوة · كارديو · راحة</span>
          </div>
        </Section>

        {/* Nutrition Today */}
        <Section title="التغذية اليوم">
          {energyPlan === null ||
          targetCalories === null ||
          targetProtein === null ? (
            <Card padding="md">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 4px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                  }}
                >
                  أدخل بياناتك لعرض الحساب
                </div>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-text-2)',
                    margin: 0,
                    maxWidth: '360px',
                  }}
                >
                  يتطلب حساب السعرات والماكروز معرفة الوزن والطول والعمر والجنس
                  بدقة دون تخمين.
                </p>
                {onOpenNutrition && (
                  <Button variant="primary" size="sm" onClick={onOpenNutrition}>
                    إدخال البيانات
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <Card
              padding="md"
              interactive
              onClick={onOpenNutrition}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onOpenNutrition?.()
                }
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <div style={{ fontSize: '18px', fontWeight: 800 }}>
                  <Ratio
                    current={consumedCalories}
                    target={targetCalories}
                    unit="سعرة"
                  />
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--color-accent-text)',
                  }}
                >
                  <Ratio
                    current={consumedProtein}
                    target={targetProtein}
                    unit="جم بروتين"
                  />
                </div>
              </div>

              <ProgressBar
                value={consumedCalories}
                max={targetCalories}
                variant={
                  consumedCalories > targetCalories ? 'warning' : 'accent'
                }
              />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: 'var(--color-text-2)',
                  marginTop: '8px',
                }}
              >
                <span>اضغط لعرض الوجبات وحساب السعرات</span>
                <span>
                  {Math.round(
                    targetCalories > 0
                      ? (consumedCalories / targetCalories) * 100
                      : 0,
                  )}
                  %
                </span>
              </div>
            </Card>
          )}
        </Section>

        {/* Mascot Tip: Approved motivation */}
        <Callout
          variant="accent"
          avatar={
            <img
              src={assetUrl('branding/maganis-mascot-inner.png')}
              alt="د. مجانص"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                objectFit: 'contain',
              }}
            />
          }
          title="نصيحة د. مجانص"
        >
          {dailyTip}
        </Callout>
      </div>

      {/* Red Flag Confirmation Sheet */}
      <ConfirmSheet
        isOpen={showRedFlagConfirm}
        title="تأكيد الاستشارة الطبية"
        message="هل استشرت طبيباً مختصاً وتأكدت من أمان ممارسة التمارين الرياضية لحالتك الصحية؟"
        confirmLabel="نعم، تأكدت"
        cancelLabel="إلغاء"
        onConfirm={() => {
          try {
            localStorage.setItem('maganis:redflag_dismissed', 'true')
          } catch {
            // ignore
          }
          setRedFlagDismissed(true)
          setShowRedFlagConfirm(false)
        }}
        onCancel={() => setShowRedFlagConfirm(false)}
      />

      {/* Goal Days Edit Modal */}
      <ConfirmSheet
        isOpen={showMismatchEditModal}
        title="تعديل عدد أيام التدريب المستهدفة"
        confirmLabel="حفظ التعديل"
        cancelLabel="إلغاء"
        onConfirm={() => {
          if (profile && onUpdateProfile) {
            onUpdateProfile({
              ...profile,
              trainingDaysPerWeek: selectedGoalDays,
            })
          }
          setShowMismatchEditModal(false)
        }}
        onCancel={() => setShowMismatchEditModal(false)}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '8px 0',
          }}
        >
          <div style={{ fontSize: '13.5px', color: 'var(--color-text-2)' }}>
            حدد عدد أيام التدريب التي ترغب بالالتزام بها أسبوعياً في خطتك:
          </div>
          <div
            style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}
          >
            {[2, 3, 4, 5, 6].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setSelectedGoalDays(days)}
                style={{
                  minWidth: '44px',
                  minHeight: '44px',
                  borderRadius: 'var(--radius-control)',
                  border:
                    selectedGoalDays === days
                      ? '1.5px solid var(--color-accent)'
                      : '1px solid var(--color-divider)',
                  background:
                    selectedGoalDays === days
                      ? 'var(--color-surface-2)'
                      : 'var(--color-surface)',
                  color:
                    selectedGoalDays === days
                      ? 'var(--color-accent-text)'
                      : 'var(--color-text)',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: 'pointer',
                }}
              >
                {days}
              </button>
            ))}
          </div>
        </div>
      </ConfirmSheet>
    </div>
  )
}

export default Dashboard
