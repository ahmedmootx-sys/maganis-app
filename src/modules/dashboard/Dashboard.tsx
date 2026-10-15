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
import { TopBar } from '../../components/TopBar'
import { Callout } from '../../components/Callout'
import { Stat } from '../../components/Stat'
import { ListRow } from '../../components/ListRow'
import { ProgressBar } from '../../components/ProgressBar'
import { calculateCalorieMacroTargets } from '../nutrition/calorieCalculator'

export interface DashboardProps {
  profile: UserProfile | null
  program: WorkoutProgram | null
  recentSessions: TrackingSession[]
  bodyLog: BodyLogEntry[]
  onStartWorkout?: (day: ProgramDay) => void
  onViewDay?: (day: ProgramDay) => void
  onOpenNutrition?: () => void
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
): { value: string; source: string } {
  if (bodyLog.length > 0) {
    const sorted = [...bodyLog].sort((a, b) => b.date.localeCompare(a.date))
    return {
      value: `${sorted[0].weightKg} كجم`,
      source: 'من سجل الوزن',
    }
  }
  if (profile?.body?.weightKg) {
    return {
      value: `${profile.body.weightKg} كجم`,
      source: 'من الملف الشخصي',
    }
  }
  return {
    value: '—',
    source: 'غير محدد',
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

  // Mascot tips verbatim from coachTips
  const coachTips = [
    'يا أسطى العضلات! د. مجانص بيقولك: اللي يفوّت تمرين الرجلين يروح يتمرن زومبا أحسن! الأرجل هي أساس هرمون التستوستيرون يا بطل!',
    'البروتين ثم البروتين! سيبك من الفسيخ والمقليات وركّز في الفراخ والبيض والتونة، عشان الألياف العضلية تبات شبعانة وتصحى عملاقة!',
    'عاش يا وحش! الالتزام بالتحميل التصاعدي وزيادة الأوزان حبة حبة هو سر الفورمة.. البار بيستغيث والدهون بتعيط!',
    'النوم 8 ساعات مش كسل، دي الفترة الوحيدة اللي د. مجانص بيبني فيها عضلاتك في المعمل! متسهرش قدام التيك توك وتطلب فورمة!',
    'الماء يا كوتش! اشرب من 3 إلى 4 لتر مية يومياً.. مفيش بمب عضلات من غير هيدريشن عالي يا صديقي!',
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

  return (
    <div className="screen-container home-screen" dir="rtl">
      {/* TopBar */}
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
              alt="Maganis"
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
                color: 'var(--ink)',
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
          gap: '18px',
          padding: '16px',
        }}
      >
        {/* Card تمرين اليوم */}
        <section className="screen-section">
          <div className="section-title">
            <span>تمرين اليوم</span>
            {todayProgramDay && (
              <span className="section-title-counter">
                {todayProgramDay.exercises.length} تمارين
              </span>
            )}
          </div>

          <div
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              padding: '16px',
            }}
          >
            {todayProgramDay ? (
              <>
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
                      color: 'var(--ink)',
                    }}
                  >
                    {todayProgramDay.labelAr} — {todayProgramDay.focus}
                  </div>
                </div>

                {onStartWorkout && (
                  <button
                    type="button"
                    className="button-primary"
                    style={{
                      width: '100%',
                      height: '48px',
                      fontSize: '15.5px',
                      fontWeight: 700,
                    }}
                    onClick={() => onStartWorkout(todayProgramDay)}
                  >
                    ابدأ التمرين
                  </button>
                )}

                {/* First 3 exercises as ListRows */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {todayProgramDay.exercises.slice(0, 3).map((pe, idx) => {
                    const ex = getExerciseById(pe.exerciseId)
                    const arabicName = ex?.nameAr ?? pe.exerciseId
                    const englishName =
                      (ex as { nameEn?: string; name?: string })?.nameEn ||
                      ex?.name ||
                      ''
                    const setsReps = `${pe.sets} × ${pe.reps === 0 ? 'أقصى عدد' : pe.reps}`
                    return (
                      <ListRow
                        key={idx}
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
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: '13.5px',
                              color: 'var(--ink)',
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
                  <button
                    type="button"
                    className="ghost-secondary full-width"
                    style={{ height: '40px', fontSize: '13.5px' }}
                    onClick={() => onViewDay?.(todayProgramDay)}
                  >
                    عرض اليوم كاملًا
                  </button>
                )}
              </>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '8px 0',
                }}
              >
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: 'var(--ink)',
                  }}
                >
                  يوم راحة
                </div>
                {nextWorkoutDay ? (
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                    التمرين القادم: {nextWorkoutDay.labelAr} (
                    {nextWorkoutDay.focus})
                  </div>
                ) : (
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                    استمتع بالاستشفاء ونم جيداً لبناء الألياف العضلية
                  </div>
                )}
                {nextWorkoutDay && onStartWorkout && (
                  <button
                    type="button"
                    className="ghost-secondary full-width"
                    style={{ marginTop: '8px', height: '44px' }}
                    onClick={() => onStartWorkout(nextWorkoutDay)}
                  >
                    بدء تمرين مبكر ({nextWorkoutDay.labelAr})
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* 1 Row of 3 Stats */}
        <section className="screen-section">
          <div className="stats-strip">
            <Stat
              label="الجلسات هذا الأسبوع"
              value={sessionsThisWeek}
              secondary={`${recentSessions.length} إجمالي`}
            />
            <Stat
              label="الوزن الحالي"
              value={currentWeight.value}
              secondary={currentWeight.source}
            />
            <Stat
              label="الهدف"
              value={goalLabel}
              secondary={profile?.body?.sex === 'female' ? 'أنثى' : 'ذكر'}
            />
          </div>
        </section>

        {/* 7-day strip (done / today / rest) */}
        <section className="screen-section">
          <div className="section-title">
            <span>أيام الأسبوع</span>
          </div>
          <div className="week-strip">
            {orderedWeekdays.map((w) => {
              const isToday = w.dayIndex === todayDayIndex
              const isDone = sessionDatesThisWeek.has(w.dayIndex)
              const hasWorkout = program?.days.some(
                (d) => d.dayIndex === w.dayIndex,
              )
              const statusClass = isDone
                ? 'week-strip__day--done'
                : isToday
                  ? 'week-strip__day--today'
                  : ''
              return (
                <div
                  key={w.dayIndex}
                  className={`week-strip__day ${statusClass}`}
                >
                  <span>{w.short}</span>
                  <div
                    className="week-strip__dot"
                    style={{
                      opacity: isDone || isToday || hasWorkout ? 1 : 0.25,
                    }}
                  />
                </div>
              )
            })}
          </div>
        </section>

        {/* Nutrition Today */}
        <section className="screen-section">
          <div className="section-title">
            <span>التغذية اليوم</span>
          </div>
          <div
            className="card list-row--clickable"
            onClick={onOpenNutrition}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpenNutrition?.()
              }
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              padding: '14px 16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: 'var(--ink)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {consumedCalories} / {targetCalories}{' '}
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--muted)',
                  }}
                >
                  سعرة
                </span>
              </div>
              <div
                style={{
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: 'var(--accent)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {consumedProtein} / {targetProtein} جم بروتين
              </div>
            </div>

            <ProgressBar
              value={consumedCalories}
              max={targetCalories}
              height={8}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11.5px',
                color: 'var(--muted)',
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
          </div>
        </section>

        {/* Mascot Tip: Callout with 56px avatar */}
        <section className="screen-section">
          <Callout
            variant="accent"
            avatar={
              <img
                src={assetUrl('branding/maganis-mascot-inner.png')}
                alt="د. مجانص"
              />
            }
            title="نصيحة د. مجانص"
          >
            {dailyTip}
          </Callout>
        </section>
      </div>
    </div>
  )
}

export default Dashboard
