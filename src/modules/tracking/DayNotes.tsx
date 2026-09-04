import { useState } from 'react'
import type { DayNote } from '../shared/types.ts'
import { sanitizeInput } from '../../lib/sanitizer.ts'
import { formatDateOnly } from '../../lib/dateUtils.ts'

interface DayNotesProps {
  notes: DayNote[]
  onAdd: (note: DayNote) => void
}

export function DayNotes({ notes, onAdd }: DayNotesProps) {
  const [text, setText] = useState('')
  const [date, setDate] = useState(formatDateOnly())
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = sanitizeInput(text)
    if (!trimmed) {
      setError('اكتب ملاحظة أولاً')
      return
    }
    onAdd({ date, note: trimmed })
    setText('')
    setError('')
  }

  const sorted = [...notes].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="card day-notes">
      <h2 className="day-notes__title">ملاحظات يومية</h2>

      <form className="day-notes__form" onSubmit={handleSubmit}>
        {error && (
          <div className="error-list">
            <ul>
              <li>{error}</li>
            </ul>
          </div>
        )}
        <div className="field">
          <label htmlFor="dn-date">التاريخ</label>
          <input
            id="dn-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="dn-text">الملاحظة</label>
          <textarea
            id="dn-text"
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setError('')
            }}
            rows={3}
            dir="rtl"
          />
        </div>
        <button type="submit">حفظ</button>
      </form>

      {sorted.length > 0 && (
        <ul className="day-notes__list">
          {sorted.slice(0, 30).map((n) => (
            <li key={n.date + n.note.slice(0, 10)}>
              <span className="muted">{n.date}</span>
              <span>{n.note}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
