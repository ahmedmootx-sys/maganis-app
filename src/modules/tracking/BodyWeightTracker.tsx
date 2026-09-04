import { useState } from 'react'
import type { BodyLogEntry } from '../shared/types.ts'

interface BodyWeightTrackerProps {
  bodyLog: BodyLogEntry[]
  onAdd: (entry: BodyLogEntry) => void
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function BodyWeightTracker({ bodyLog, onAdd }: BodyWeightTrackerProps) {
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState(todayStr())
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const w = Number(weight)
    if (!Number.isFinite(w) || w < 20 || w > 500) {
      setError('الوزن يجب أن يكون بين 20 و500 كجم')
      return
    }
    onAdd({ date, weightKg: w })
    setWeight('')
    setError('')
  }

  const sorted = [...bodyLog].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="card body-weight">
      <h2 className="body-weight__title">سجل الوزن</h2>

      <form className="body-weight__form" onSubmit={handleSubmit}>
        {error && (
          <div className="error-list">
            <ul>
              <li>{error}</li>
            </ul>
          </div>
        )}
        <div className="field">
          <label htmlFor="bw-date">التاريخ</label>
          <input
            id="bw-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="bw-weight">الوزن (كجم)</label>
          <input
            id="bw-weight"
            type="number"
            step="0.1"
            min="20"
            max="500"
            value={weight}
            onChange={(e) => {
              setWeight(e.target.value)
              setError('')
            }}
          />
        </div>
        <button type="submit">تسجيل</button>
      </form>

      {sorted.length > 0 && (
        <ul className="body-weight__list">
          {sorted.slice(0, 30).map((entry) => (
            <li key={entry.date}>
              <span className="muted">{entry.date}</span>
              <strong>{entry.weightKg} كجم</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
