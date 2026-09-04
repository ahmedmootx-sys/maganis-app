import { useState } from 'react'
import type { TrackingSession, BodyLogEntry } from '../shared/types.ts'
import { getExerciseById } from '../workout/exercises.ts'
import { SvgLineChart } from './SvgLineChart.tsx'

interface ReportsProps {
  sessions: TrackingSession[]
  bodyLog: BodyLogEntry[]
}

type DateRange = '4w' | '8w' | '12w' | 'all'

const RANGE_LABELS: Record<DateRange, string> = {
  '4w': '4 أسابيع',
  '8w': '8 أسابيع',
  '12w': '12 أسبوعاً',
  all: 'الكل',
}

function weeksAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n * 7)
  d.setHours(0, 0, 0, 0)
  return d
}

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function weekLabel(weekStart: string): string {
  const d = new Date(weekStart)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

export function Reports({ sessions, bodyLog }: ReportsProps) {
  const [range, setRange] = useState<DateRange>('8w')

  const cutoff =
    range === 'all'
      ? new Date(0)
      : weeksAgo(range === '4w' ? 4 : range === '8w' ? 8 : 12)

  const filteredSessions = sessions.filter((s) => new Date(s.date) >= cutoff)

  // --- Training volume per week ---
  const volumeByWeek: Record<string, number> = {}
  for (const session of filteredSessions) {
    const wk = getWeekStart(session.date)
    if (!volumeByWeek[wk]) volumeByWeek[wk] = 0
    for (const ex of session.exercises) {
      for (const set of ex.sets) {
        volumeByWeek[wk] += set.reps * set.weightKg
      }
    }
  }
  const volumeData = Object.entries(volumeByWeek)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([wk, vol]) => ({ label: weekLabel(wk), value: Math.round(vol) }))

  // --- Sessions per week ---
  const sessionsByWeek: Record<string, number> = {}
  for (const session of filteredSessions) {
    const wk = getWeekStart(session.date)
    sessionsByWeek[wk] = (sessionsByWeek[wk] ?? 0) + 1
  }
  const sessionsData = Object.entries(sessionsByWeek)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([wk, count]) => ({ label: weekLabel(wk), value: count }))

  // --- Body weight trend ---
  const filteredBodyLog = bodyLog
    .filter((e) => new Date(e.date) >= cutoff)
    .sort((a, b) => a.date.localeCompare(b.date))
  const weightData = filteredBodyLog.map((e) => ({
    label: e.date.slice(5), // MM-DD
    value: e.weightKg,
  }))

  // --- Personal records ---
  const prMap: Record<string, { name: string; weight: number }> = {}
  for (const session of sessions) {
    for (const ex of session.exercises) {
      const info = getExerciseById(ex.exerciseId)
      const name = info?.nameAr ?? ex.exerciseId
      const maxWeight = Math.max(...ex.sets.map((s) => s.weightKg), 0)
      if (maxWeight > 0) {
        if (!prMap[ex.exerciseId] || maxWeight > prMap[ex.exerciseId].weight) {
          prMap[ex.exerciseId] = { name, weight: maxWeight }
        }
      }
    }
  }
  const personalRecords = Object.values(prMap).sort(
    (a, b) => b.weight - a.weight,
  )

  // --- SVG Bar Chart helper ---
  function BarChart({
    data: barData,
  }: {
    data: { label: string; value: number }[]
  }) {
    if (barData.length === 0) return <p className="muted">لا توجد بيانات</p>
    const maxVal = Math.max(...barData.map((d) => d.value), 1)
    return (
      <div className="bar-chart">
        {barData.map((d, i) => (
          <div key={i} className="bar-chart__item">
            <div
              className="bar-chart__bar"
              style={{ height: `${(d.value / maxVal) * 100}%` }}
              title={`${d.label}: ${d.value}`}
            />
            <span className="bar-chart__label">{d.label}</span>
            <span className="bar-chart__value">{d.value}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="reports">
      <h2 className="reports__title">التقارير والإحصائيات</h2>

      <div className="reports__range-selector">
        {(Object.keys(RANGE_LABELS) as DateRange[]).map((r) => (
          <button
            key={r}
            type="button"
            className={r === range ? 'option-btn selected' : 'option-btn'}
            onClick={() => setRange(r)}
          >
            {RANGE_LABELS[r]}
          </button>
        ))}
      </div>

      <div className="card reports__section">
        <h3>حجم التدريب الأسبوعي</h3>
        <BarChart data={volumeData} />
      </div>

      <div className="card reports__section">
        <h3>اتجاه الوزن</h3>
        <SvgLineChart
          data={weightData}
          width={400}
          height={200}
          color="#0284c7"
        />
      </div>

      <div className="card reports__section">
        <h3>جلسات التدريب أسبوعياً</h3>
        <BarChart data={sessionsData} />
      </div>

      <div className="card reports__section">
        <h3>أرقام قياسية شخصية</h3>
        {personalRecords.length === 0 ? (
          <p className="muted">لا توجد أرقام قياسية بعد</p>
        ) : (
          <ul className="reports__pr-list">
            {personalRecords.slice(0, 20).map((pr) => (
              <li key={pr.name}>
                <span>{pr.name}</span>
                <strong>{pr.weight} كجم</strong>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
