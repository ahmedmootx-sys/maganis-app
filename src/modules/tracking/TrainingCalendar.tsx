import { useState } from 'react'
import type { TrackingSession } from '../shared/types.ts'
import { formatDateOnly } from '../../lib/dateUtils.ts'

interface TrainingCalendarProps {
  sessions: TrackingSession[]
  onDaySelect?: (date: string) => void
}

const MONTH_NAMES_AR = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
]

const DAY_NAMES_SHORT = ['أح', 'إث', 'ثلا', 'أرب', 'خم', 'جم', 'سب']

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export function TrainingCalendar({
  sessions,
  onDaySelect,
}: TrainingCalendarProps) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const sessionDates = new Set(sessions.map((s) => s.date))

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const todayStr = formatDateOnly(now)

  function prevMonth() {
    if (month === 0) {
      setMonth(11)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  function dateKey(d: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  function handleDayClick(day: number) {
    const dk = dateKey(day)
    setSelectedDate(dk)
    onDaySelect?.(dk)
  }

  const selectedSessions = selectedDate
    ? sessions.filter((s) => s.date === selectedDate)
    : []

  // Build calendar cells
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="card training-calendar">
      <div className="training-calendar__header">
        <button type="button" className="ghost" onClick={prevMonth}>
          ←
        </button>
        <h3>
          {MONTH_NAMES_AR[month]} {year}
        </h3>
        <button type="button" className="ghost" onClick={nextMonth}>
          →
        </button>
      </div>

      <div className="training-calendar__grid">
        {DAY_NAMES_SHORT.map((d) => (
          <div key={d} className="training-calendar__day-name">
            {d}
          </div>
        ))}
        {cells.map((cell, idx) => {
          if (cell === null) {
            return <div key={`e-${idx}`} className="training-calendar__empty" />
          }
          const dk = dateKey(cell)
          const hasSession = sessionDates.has(dk)
          const isToday = dk === todayStr
          return (
            <button
              key={dk}
              type="button"
              className={`training-calendar__day${hasSession ? ' training-calendar__day--has-session' : ''}${isToday ? ' training-calendar__day--today' : ''}`}
              onClick={() => handleDayClick(cell)}
            >
              {cell}
              {hasSession && <span className="training-calendar__dot" />}
            </button>
          )
        })}
      </div>

      {selectedSessions.length > 0 && (
        <div className="training-calendar__detail">
          <h4>جلسات {selectedDate}:</h4>
          <ul>
            {selectedSessions.map((s) => (
              <li key={s.id}>
                <span className="muted">
                  {new Date(s.createdAt).toLocaleTimeString('ar-EG', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span>{s.exercises.length} تمرين</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
