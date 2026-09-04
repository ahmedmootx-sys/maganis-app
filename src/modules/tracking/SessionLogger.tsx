import { useState } from 'react'
import type {
  ProgramDay,
  TrackingSession,
  SessionExercise,
} from '../shared/types.ts'
import { getExerciseById } from '../workout/exercises.ts'

interface SessionLoggerProps {
  programDay: ProgramDay | null
  dayIndex: number | null
  onSave: (session: TrackingSession) => void
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function uid(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  }
}

export function SessionLogger({
  programDay,
  dayIndex,
  onSave,
}: SessionLoggerProps) {
  const [exercises, setExercises] = useState<SessionExercise[]>(() =>
    (programDay?.exercises ?? []).map((pe) => ({
      exerciseId: pe.exerciseId,
      sets: Array.from({ length: pe.sets }, () => ({
        reps: pe.reps || 8,
        weightKg: 0,
      })),
      completed: false,
    })),
  )
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  function updateSet(
    exerciseIdx: number,
    setIdx: number,
    field: 'reps' | 'weightKg',
    value: number,
  ) {
    setExercises((prev) => {
      const next = [...prev]
      next[exerciseIdx] = {
        ...next[exerciseIdx],
        sets: next[exerciseIdx].sets.map((s, i) =>
          i === setIdx ? { ...s, [field]: value } : s,
        ),
      }
      return next
    })
  }

  function addSetRow(exerciseIdx: number) {
    setExercises((prev) => {
      const next = [...prev]
      const ex = next[exerciseIdx]
      next[exerciseIdx] = {
        ...ex,
        sets: [
          ...ex.sets,
          { reps: ex.sets[ex.sets.length - 1]?.reps ?? 8, weightKg: 0 },
        ],
      }
      return next
    })
  }

  function removeSetRow(exerciseIdx: number, setIdx: number) {
    setExercises((prev) => {
      const next = [...prev]
      const ex = next[exerciseIdx]
      if (ex.sets.length <= 1) return prev
      next[exerciseIdx] = {
        ...ex,
        sets: ex.sets.filter((_, i) => i !== setIdx),
      }
      return next
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (exercises.length === 0) {
      setError('أضف تمارين لتسجيل الجلسة')
      return
    }
    const session: TrackingSession = {
      id: uid(),
      date: todayStr(),
      programDayIndex: dayIndex,
      exercises: exercises.map((e) => ({
        ...e,
        completed: e.sets.some((s) => s.reps > 0),
      })),
      notes,
      createdAt: Date.now(),
    }
    onSave(session)
  }

  return (
    <form className="card session-logger" onSubmit={handleSubmit}>
      <h2 className="session-logger__title">
        {programDay ? `تسجيل تمرين: ${programDay.labelAr}` : 'تسجيل جلسة تدريب'}
      </h2>

      {error && (
        <div className="error-list">
          <ul>
            <li>{error}</li>
          </ul>
        </div>
      )}

      {exercises.map((se, ei) => {
        const exInfo = getExerciseById(se.exerciseId)
        return (
          <div key={ei} className="session-logger__exercise">
            <div className="session-logger__exercise-header">
              <strong>{exInfo?.nameAr ?? se.exerciseId}</strong>
              <span className="muted">{exInfo?.descriptionAr}</span>
            </div>

            <table className="session-logger__sets-table">
              <thead>
                <tr>
                  <th>المجموعة</th>
                  <th>التكرارات</th>
                  <th>الوزن (كجم)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {se.sets.map((set, si) => (
                  <tr key={si}>
                    <td>#{si + 1}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="200"
                        value={set.reps}
                        onChange={(e) =>
                          updateSet(ei, si, 'reps', Number(e.target.value))
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        step="0.5"
                        value={set.weightKg}
                        onChange={(e) =>
                          updateSet(ei, si, 'weightKg', Number(e.target.value))
                        }
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="ghost-danger"
                        onClick={() => removeSetRow(ei, si)}
                        disabled={se.sets.length <= 1}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              type="button"
              className="ghost session-logger__add-set"
              onClick={() => addSetRow(ei)}
            >
              + مجموعة إضافية
            </button>
          </div>
        )
      })}

      <div className="field">
        <label htmlFor="sl-notes">ملاحظات</label>
        <textarea
          id="sl-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          dir="rtl"
        />
      </div>

      <div className="actions-row">
        <button type="submit">حفظ الجلسة</button>
      </div>
    </form>
  )
}
