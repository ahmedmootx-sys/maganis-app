import { assetUrl } from '../../utils/assetUrl.ts'
import type {
  TrackingSession,
  BodyLogEntry,
  WorkoutProgram,
  ProgramDay,
} from '../shared/types.ts'
import type { UserProfile } from '../onboarding/types.ts'
import { GOALS } from '../onboarding/types.ts'
import { getExerciseById } from '../workout/exercises.ts'

interface DashboardProps {
  profile: UserProfile | null
  program: WorkoutProgram | null
  recentSessions: TrackingSession[]
  bodyLog: BodyLogEntry[]
  onStartWorkout?: (day: ProgramDay) => void
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'صباح الخير'
  if (hour >= 18) return 'مساء الخير'
  return 'مرحباً'
}

function toDateOnly(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function getStartOfWeek(): Date {
  const now = new Date()
  const day = now.getDay()
  const start = new Date(now)
  start.setDate(now.getDate() - day)
  start.setHours(0, 0, 0, 0)
  return start
}

function calcStreak(sessions: TrackingSession[]): number {
  if (sessions.length === 0) return 0

  const uniqueDates = [...new Set(sessions.map((s) => s.date))]
    .map(toDateOnly)
    .sort((a, b) => a.getTime() - b.getTime())

  let maxStreak = 1
  let currentStreak = 1

  for (let i = 1; i < uniqueDates.length; i++) {
    const diffMs = uniqueDates[i].getTime() - uniqueDates[i - 1].getTime()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 1) {
      currentStreak++
      if (currentStreak > maxStreak) maxStreak = currentStreak
    } else {
      currentStreak = 1
    }
  }

  return maxStreak
}

function getSessionsThisWeek(sessions: TrackingSession[]): number {
  const weekStart = getStartOfWeek()
  return sessions.filter((s) => toDateOnly(s.date) >= weekStart).length
}

function getLatestWeight(bodyLog: BodyLogEntry[]): string {
  if (bodyLog.length === 0) return '—'
  const sorted = [...bodyLog].sort((a, b) => b.date.localeCompare(a.date))
  return `${sorted[0].weightKg} كجم`
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

export default function Dashboard({
  profile,
  program,
  recentSessions,
  bodyLog,
  onStartWorkout,
}: DashboardProps) {
  const greeting = getGreeting()
  const sessionsThisWeek = getSessionsThisWeek(recentSessions)
  const totalSessions = recentSessions.length
  const latestWeight = getLatestWeight(bodyLog)
  const goalLabel = getGoalLabel(profile)
  const streak = calcStreak(recentSessions)

  const todayDayIndex = new Date().getDay()
  const todayProgramDay = program?.days.find(
    (d) => d.dayIndex === todayDayIndex,
  )

  const completedDays = program
    ? getCompletedDayIndices(recentSessions, program)
    : null

  const nextWorkoutLabel =
    program && completedDays && completedDays.size < program.days.length
      ? (program.days.find((d) => !completedDays.has(d.dayIndex))?.labelAr ??
        null)
      : null

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

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__greeting">{greeting}</h1>
      </div>

      <div className="maganis-coach-card" style={{ marginBottom: '16px' }}>
        <div className="maganis-coach-avatar-wrapper">
          <img
            src={assetUrl('branding/maganis-dumbbell-transparent.png')}
            alt="د. مجانص"
            className="maganis-transparent-mascot"
          />
          <span className="maganis-coach-badge">د. مجانص</span>
        </div>
        <div className="maganis-coach-body">
          <h3 className="maganis-coach-title">
            💡 كبسولة د. مجانص (نار وجيم مصري)
          </h3>
          <div className="maganis-speech-bubble">{dailyTip}</div>
        </div>
      </div>

      <div className="card dashboard__stats">
        <div className="dashboard__stats-grid">
          <div className="dashboard__stat">
            <span className="dashboard__stat-value">{sessionsThisWeek}</span>
            <span className="dashboard__stat-label">
              أيام التدريب هذا الأسبوع
            </span>
          </div>
          <div className="dashboard__stat">
            <span className="dashboard__stat-value">{totalSessions}</span>
            <span className="dashboard__stat-label">الجلسات الإجمالية</span>
          </div>
          <div className="dashboard__stat">
            <span className="dashboard__stat-value">{latestWeight}</span>
            <span className="dashboard__stat-label">الوزن الحالي</span>
          </div>
          <div className="dashboard__stat">
            <span className="dashboard__stat-value">{goalLabel}</span>
            <span className="dashboard__stat-label">الهدف</span>
          </div>
        </div>
      </div>

      {streak > 0 && (
        <div className="card dashboard__streak">
          <span>🔥 {streak} يوم متتالي</span>
        </div>
      )}

      {program && completedDays && (
        <div className="card dashboard__progress">
          <h2 className="dashboard__section-title">التقدم في البرنامج</h2>
          <p>
            {completedDays.size} / {program.days.length} يوم مكتمل
          </p>
          {nextWorkoutLabel && (
            <p className="muted">التمرين القادم: {nextWorkoutLabel}</p>
          )}
        </div>
      )}

      {todayProgramDay && (
        <div className="card dashboard__today">
          <div className="dashboard__today-header">
            <div>
              <h2 className="dashboard__section-title">
                تمرين اليوم: {todayProgramDay.labelAr}
              </h2>
              <span className="chip highlight">{todayProgramDay.focus}</span>
            </div>

            {onStartWorkout && (
              <button
                type="button"
                className="button-primary start-routine-btn"
                onClick={() => onStartWorkout(todayProgramDay)}
              >
                ▶ ابدأ تمرين اليوم (Start)
              </button>
            )}
          </div>
          <ul
            className="dashboard__today-exercises"
            style={{ marginTop: '12px' }}
          >
            {todayProgramDay.exercises.map((pe, idx) => {
              const ex = getExerciseById(pe.exerciseId)
              return (
                <li key={idx} className="dashboard__today-exercise">
                  <span>{ex?.nameAr ?? pe.exerciseId}</span>
                  <span className="muted">
                    {pe.sets} × {pe.reps === 0 ? 'أقصى عدد' : pe.reps}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
