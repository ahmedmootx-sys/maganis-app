import { useMemo } from 'react'
import { assetUrl } from '../../utils/assetUrl'
import { formatArabicDate, getOrderedWeekdays } from '../../lib/dateUtils'
import type {
  TrackingSession,
  BodyLogEntry,
  WorkoutProgram,
  ProgramDay,
} from '../shared/types'
import type { UserProfile } from '../onboarding/types'
import { GOALS } from '../onboarding/types'
import { getExerciseById } from '../workout/exercises'
import { ExerciseVisual } from '../workout/ExerciseVisual'
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
} from '../../ui'
import { calculateCalorieMacroTargets } from '../nutrition/calorieCalculator'

export interface DashboardProps {
  profile: UserProfile | null
  program: WorkoutProgram | null
  recentSessions: TrackingSession[]
  bodyLog: BodyLogEntry[]
  onStartWorkout?: (day: ProgramDay) => void
  onViewDay?: (day: ProgramDay) => void
  onOpenNutrition?: () => void
  onSyncTrainingDays?: () => void
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

function getCompletedDayIndices(
  sessions: TrackingSession[],
  program: WorkoutProgram,
): Set<number> {
  const validIndices = new Set(program.days.map((d) => d.dayIndex))
  const completed = new Set<number>()
  for (const session of sessions) {
    if (
      session.programDayIndex !== null &&
      validIndices.has(session.programDayIndex)
    ) {
      completed.add(session.programDayIndex)
    }
  }
  return completed
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
}: DashboardProps) {
  const weekStartDay = profile?.weekStartDay ?? 6
  const greeting = getGreeting(profile?.name)
  const arabicDate = useMemo(() => formatArabicDate(new Date()), [])
  const sessionsThisWeek = getSessionsThisWeek(recentSessions, weekStartDay)
  const currentWeight = getCurrentWeightDisplay(bodyLog, profile)
  const goalLabel = getGoalLabel(profile)

  const todayDayIndex = new Date().getDay()
  const todayProgramDay = program?.days.find(
    (d) => d.dayIndex === todayDayIndex,
  )

  const completedDays = program
    ? getCompletedDayIndices(recentSessions, program)
    : null

  const nextWorkoutDay = useMemo(() => {
    if (!program || program.days.length === 0) return null
    if (!completedDays) return program.days[0]
    const uncompleted = program.days.find((d) => !completedDays.has(d.dayIndex))
    return uncompleted ?? program.days[0]
  }, [program, completedDays])

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

  const targets = useMemo(() => {
    if (!profile) return null
    try {
      return calculateCalorieMacroTargets(profile)
    } catch {
      return null
    }
  }, [profile])

  const targetCalories = targets?.targetCalories ?? 2555
  const targetProtein = targets?.proteinGrams ?? 140
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

  // Check for training days mismatch between program and profile
  const trainingDaysMismatch = useMemo(() => {
    if (!program || !profile?.trainingDaysPerWeek) return null
    if (program.days.length !== profile.trainingDaysPerWeek) {
      return {
        programDays: program.days.length,
        goalDays: profile.trainingDaysPerWeek,
      }
    }
    return null
  }, [program, profile])

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
              }}
            >
              مجانص
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
        {/* Single-line Callout when training days differ */}
        {trainingDaysMismatch && (
          <Callout
            variant="warning"
            title="اختلاف في أيام التدريب"
            action={
              onSyncTrainingDays ? (
                <Button size="sm" variant="subtle" onClick={onSyncTrainingDays}>
                  تطابق
                </Button>
              ) : undefined
            }
          >
            جدولك الحالي {trainingDaysMismatch.programDays} أيام بينما هدف ملفك
            الشخصي {trainingDaysMismatch.goalDays} أيام أسبوعياً.
          </Callout>
        )}

        {/* Card تمرين اليوم */}
        <Section
          title="تمرين اليوم"
          trailing={
            todayProgramDay
              ? `${todayProgramDay.exercises.length} تمارين`
              : undefined
          }
        >
          <Card padding="md">
            {todayProgramDay ? (
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
                    {todayProgramDay.labelAr} — {todayProgramDay.focus}
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-text-2)',
                      fontWeight: 600,
                    }}
                  >
                    ~{todayProgramDay.exercises.length * 5} دقيقة
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
                    const ex = getExerciseById(pe.exerciseId)
                    const arabicName =
                      ex?.nameAr ??
                      ((pe as unknown as Record<string, unknown>).customName as
                        string | undefined) ??
                      'تمرين مخصص'
                    const englishName = ex?.name ?? ''
                    const repsDisplay = pe.reps ?? 10
                    const setsReps = `${pe.sets} × ${repsDisplay} تكرار`
                    return (
                      <ListRow
                        key={`${pe.exerciseId}-${idx}`}
                        leading={
                          <div
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              background: 'var(--color-surface-2)',
                              border: '1px solid var(--color-divider)',
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
                    الجلسة التالية: {nextWorkoutDay.labelAr} (
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
            value={sessionsThisWeek}
            secondary={`${recentSessions.length} إجمالي`}
          />
          <Stat
            label="الوزن الحالي"
            value={currentWeight.value}
            secondary={currentWeight.secondary}
          />
          <Stat
            label="الهدف"
            value={goalLabel}
            secondary={profile?.body?.sex === 'female' ? 'أنثى' : 'ذكر'}
          />
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
              const isToday = w.dayIndex === todayDayIndex
              const isDone = sessionDatesThisWeek.has(w.dayIndex)
              const hasWorkout = program?.days.some(
                (d) => d.dayIndex === w.dayIndex,
              )
              return (
                <div
                  key={w.dayIndex}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 2px',
                    borderRadius: 'var(--radius-sm)',
                    background: isToday
                      ? 'var(--color-surface-2)'
                      : 'transparent',
                    border: isToday
                      ? '1px solid var(--color-accent)'
                      : '1px solid transparent',
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
                    {w.short}
                  </span>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isDone
                        ? 'var(--color-success)'
                        : hasWorkout
                          ? 'var(--color-surface-2)'
                          : 'transparent',
                      color: isDone ? '#FFFFFF' : 'var(--color-text-2)',
                      fontSize: '11px',
                    }}
                  >
                    {isDone ? (
                      <Icon name="check" size={12} />
                    ) : hasWorkout ? (
                      <div
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: 'var(--color-accent)',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          background: 'var(--color-divider)',
                        }}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Section>

        {/* Nutrition Today */}
        <Section title="التغذية اليوم">
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
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: 'var(--color-text)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {consumedCalories} / {targetCalories}{' '}
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-text-2)',
                  }}
                >
                  سعرة
                </span>
              </div>
              <div
                style={{
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: 'var(--color-accent-text)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {consumedProtein} / {targetProtein} جم بروتين
              </div>
            </div>

            <ProgressBar
              value={consumedCalories}
              max={targetCalories}
              variant={consumedCalories > targetCalories ? 'warning' : 'accent'}
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
    </div>
  )
}

export default Dashboard
