import { useEffect, useMemo, useState } from 'react'
import { assetUrl } from '../../utils/assetUrl.ts'
import type {
  Exercise,
  ProgramDay,
  SessionExercise,
  TrackingSession,
} from '../shared/types.ts'
import { getExerciseById } from './exercises.ts'
import { ExerciseDetailModal } from './ExerciseDetailModal.tsx'
import { ExerciseVisual } from './ExerciseVisual.tsx'
import { formatTime } from './workoutUtils.ts'
import { MUSCLE_GROUP_LABELS } from '../shared/types.ts'

interface ActiveWorkoutSessionProps {
  programDay: ProgramDay
  customExercises?: Exercise[]
  onFinish: (session: TrackingSession) => void
  onCancel: () => void
}

interface ActiveSet {
  id: string
  setNum: number
  weightKg: number
  reps: number
  isCompleted: boolean
}

interface ActiveExerciseState {
  exerciseId: string
  sets: ActiveSet[]
}

function uniqueId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  }
}

const ACTIVE_SESSION_STORAGE_KEY = 'maganis:active_session'

interface SavedSessionState {
  programDay: ProgramDay
  dayIndex: number
  exercisesState: ActiveExerciseState[]
  elapsedSeconds: number
  savedAt: number
}

export function ActiveWorkoutSession({
  programDay,
  customExercises = [],
  onFinish,
  onCancel,
}: ActiveWorkoutSessionProps) {
  // --- Initialize Exercises & Sets with Refresh Recovery ---
  const [exercisesState, setExercisesState] = useState<ActiveExerciseState[]>(
    () => {
      try {
        const raw = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw) as SavedSessionState
          if (
            parsed.dayIndex === programDay.dayIndex &&
            Array.isArray(parsed.exercisesState) &&
            Date.now() - parsed.savedAt < 1000 * 60 * 60 * 12
          ) {
            return parsed.exercisesState
          }
        }
      } catch {
        // fallback
      }
      return programDay.exercises.map((pe) => {
        const defaultSetsCount = Math.max(1, pe.sets || 3)
        const defaultReps = pe.reps > 0 ? pe.reps : 10
        const sets: ActiveSet[] = Array.from(
          { length: defaultSetsCount },
          (_, idx) => ({
            id: uniqueId(),
            setNum: idx + 1,
            weightKg: 20,
            reps: defaultReps,
            isCompleted: false,
          }),
        )
        return {
          exerciseId: pe.exerciseId,
          sets,
        }
      })
    },
  )

  // --- Session Stopwatch (Elapsed Time) with Refresh Recovery ---
  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    try {
      const raw = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as SavedSessionState
        if (
          parsed.dayIndex === programDay.dayIndex &&
          typeof parsed.elapsedSeconds === 'number' &&
          Date.now() - parsed.savedAt < 1000 * 60 * 60 * 12
        ) {
          return parsed.elapsedSeconds
        }
      }
    } catch {
      // fallback
    }
    return 0
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto-persist active session state on every update
  useEffect(() => {
    try {
      const dataToSave: SavedSessionState = {
        programDay,
        dayIndex: programDay.dayIndex,
        exercisesState,
        elapsedSeconds,
        savedAt: Date.now(),
      }
      localStorage.setItem(
        ACTIVE_SESSION_STORAGE_KEY,
        JSON.stringify(dataToSave),
      )
    } catch {
      // ignore
    }
  }, [programDay, exercisesState, elapsedSeconds])

  // Prevent accidental back/refresh during active workout
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // --- Smart Rest Timer ---
  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null)

  useEffect(() => {
    if (restSecondsLeft === null || restSecondsLeft <= 0) return
    const interval = setInterval(() => {
      setRestSecondsLeft((prev) => {
        if (prev === null || prev <= 1) return null
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [restSecondsLeft])

  function triggerRestTimer(seconds = 60) {
    setRestSecondsLeft(seconds)
  }

  // --- Exercise Detail Modal ---
  const [selectedExerciseForDetail, setSelectedExerciseForDetail] =
    useState<Exercise | null>(null)

  function handleOpenExerciseDetail(exerciseId: string) {
    const custom = customExercises.find((c) => c.id === exerciseId)
    const ex = custom ?? getExerciseById(exerciseId)
    if (ex) {
      setSelectedExerciseForDetail(ex)
    }
  }

  // --- Sets Actions ---
  function handleToggleSetCompleted(exerciseIndex: number, setIndex: number) {
    setExercisesState((prev) => {
      const next = [...prev]
      const currentEx = { ...next[exerciseIndex] }
      const nextSets = [...currentEx.sets]
      const currentSet = { ...nextSets[setIndex] }

      const newStatus = !currentSet.isCompleted
      currentSet.isCompleted = newStatus
      nextSets[setIndex] = currentSet
      currentEx.sets = nextSets
      next[exerciseIndex] = currentEx

      // If marked completed, start rest timer
      if (newStatus) {
        const pe = programDay.exercises[exerciseIndex]
        const rest = pe?.restSeconds > 0 ? pe.restSeconds : 60
        triggerRestTimer(rest)
      }

      return next
    })
  }

  function handleUpdateSetField(
    exerciseIndex: number,
    setIndex: number,
    field: 'weightKg' | 'reps',
    value: number,
  ) {
    setExercisesState((prev) => {
      const next = [...prev]
      const currentEx = { ...next[exerciseIndex] }
      const nextSets = [...currentEx.sets]
      nextSets[setIndex] = {
        ...nextSets[setIndex],
        [field]: Math.max(0, value),
      }
      currentEx.sets = nextSets
      next[exerciseIndex] = currentEx
      return next
    })
  }

  function handleAddSet(exerciseIndex: number) {
    setExercisesState((prev) => {
      const next = [...prev]
      const currentEx = { ...next[exerciseIndex] }
      const lastSet = currentEx.sets[currentEx.sets.length - 1]
      const newSet: ActiveSet = {
        id: uniqueId(),
        setNum: currentEx.sets.length + 1,
        weightKg: lastSet ? lastSet.weightKg : 20,
        reps: lastSet ? lastSet.reps : 10,
        isCompleted: false,
      }
      currentEx.sets = [...currentEx.sets, newSet]
      next[exerciseIndex] = currentEx
      return next
    })
  }

  function handleRemoveSet(exerciseIndex: number, setIndex: number) {
    setExercisesState((prev) => {
      const next = [...prev]
      const currentEx = { ...next[exerciseIndex] }
      if (currentEx.sets.length <= 1) return prev
      const filtered = currentEx.sets.filter((_, idx) => idx !== setIndex)
      currentEx.sets = filtered.map((s, idx) => ({ ...s, setNum: idx + 1 }))
      next[exerciseIndex] = currentEx
      return next
    })
  }

  // --- Finish Workout Handler ---
  const [showConfirmFinish, setShowConfirmFinish] = useState(false)
  const [showConfirmCancel, setShowConfirmCancel] = useState(false)

  const completedSetsCount = useMemo(() => {
    return exercisesState.reduce((acc, ex) => {
      return acc + ex.sets.filter((s) => s.isCompleted).length
    }, 0)
  }, [exercisesState])

  const totalSetsCount = useMemo(() => {
    return exercisesState.reduce((acc, ex) => acc + ex.sets.length, 0)
  }, [exercisesState])

  const totalVolumeKg = useMemo(() => {
    return exercisesState.reduce((acc, ex) => {
      return (
        acc +
        ex.sets
          .filter((s) => s.isCompleted)
          .reduce((sAcc, s) => sAcc + s.weightKg * s.reps, 0)
      )
    }, 0)
  }, [exercisesState])

  function handleSaveAndFinish() {
    const todayStr = new Date().toISOString().split('T')[0]

    const sessionExercises: SessionExercise[] = exercisesState.map(
      (exState) => {
        const completedSets = exState.sets
          .filter((s) => s.isCompleted)
          .map((s) => ({
            reps: s.reps,
            weightKg: s.weightKg,
          }))

        return {
          exerciseId: exState.exerciseId,
          sets:
            completedSets.length > 0
              ? completedSets
              : exState.sets.map((s) => ({
                  reps: s.reps,
                  weightKg: s.weightKg,
                })),
          completed: completedSets.length > 0,
        }
      },
    )

    const newSession: TrackingSession = {
      id: uniqueId(),
      date: todayStr,
      programDayIndex: programDay.dayIndex,
      exercises: sessionExercises,
      notes: `جلسة تدريب مكتملة في ${formatTime(elapsedSeconds)} — إجمالي الحجم: ${totalVolumeKg} كجم`,
      createdAt: Date.now(),
    }

    try {
      localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY)
    } catch {
      // ignore
    }

    onFinish(newSession)
  }

  return (
    <div
      className="active-workout-session"
      data-testid="active-workout-session"
    >
      {/* Top Header */}
      <header className="active-workout-header">
        <div className="header-left">
          <button
            type="button"
            className="ghost-danger tiny"
            onClick={() => setShowConfirmCancel(true)}
          >
            ✕ إلغاء الجلسة
          </button>
        </div>

        <div className="header-center">
          <h2 className="routine-title">{programDay.labelAr}</h2>
          <span className="routine-focus">{programDay.focus}</span>
        </div>

        <div className="header-right">
          <div className="stopwatch-badge">⏱️ {formatTime(elapsedSeconds)}</div>
          <button
            type="button"
            className="button-primary tiny finish-btn"
            data-testid="header-finish-btn"
            onClick={() => setShowConfirmFinish(true)}
          >
            🏁 إنهاء وحفظ
          </button>
        </div>
      </header>

      {/* Dr. Maganis Gym Coach Callout */}
      <div className="maganis-callout-toast" style={{ margin: '0 16px' }}>
        <img
          src={assetUrl('branding/maganis-dumbbell-transparent.png')}
          alt="د. مجانص"
          className="maganis-mini-avatar"
        />
        <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
          <strong>د. مجانص في ضهرك:</strong> عاش يا كوتش! البار بيستغيث والعضلات
          بتكبر، ركّز في الأداء ومترحمهاش! 💪🔥
        </div>
      </div>

      {/* Floating Rest Timer */}
      {restSecondsLeft !== null && restSecondsLeft > 0 && (
        <div className="rest-timer-banner">
          <div className="rest-timer-info">
            <span className="rest-icon">⏳</span>
            <span className="rest-label">فترة راحة بين المجموعات:</span>
            <strong className="rest-countdown">{restSecondsLeft} ثانية</strong>
          </div>
          <div className="rest-timer-actions">
            <button
              type="button"
              className="ghost tiny"
              onClick={() =>
                setRestSecondsLeft((prev) => (prev ? prev + 30 : 30))
              }
            >
              +30ث
            </button>
            <button
              type="button"
              className="ghost-danger tiny"
              onClick={() => setRestSecondsLeft(null)}
            >
              تخطي ✕
            </button>
          </div>
        </div>
      )}

      {/* Progress Strip */}
      <div className="workout-progress-strip">
        <div className="progress-info">
          <span>
            المجموعات المكتملة: {completedSetsCount} من {totalSetsCount}
          </span>
          <span>إجمالي الوزن المرفوع: {totalVolumeKg} كجم</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${totalSetsCount > 0 ? (completedSetsCount / totalSetsCount) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Exercises List (Hevy / Strong Style) */}
      <main className="active-exercises-list">
        {exercisesState.map((exState, exIdx) => {
          const custom = customExercises.find(
            (c) => c.id === exState.exerciseId,
          )
          const exercise = custom ?? getExerciseById(exState.exerciseId)
          const exerciseName = exercise?.nameAr ?? exState.exerciseId

          return (
            <div key={exState.exerciseId} className="active-exercise-card card">
              {/* Exercise Header Row */}
              <div className="exercise-card-header">
                <div className="exercise-title-group">
                  <ExerciseVisual
                    category={exercise?.category ?? 'chest'}
                    exerciseId={exState.exerciseId}
                    exerciseName={exerciseName}
                    imageUrl={exercise?.imageUrl}
                    size="medium"
                  />
                  <div>
                    <h3 className="exercise-name">{exerciseName}</h3>
                    {exercise && (
                      <span className="muscle-badge">
                        {MUSCLE_GROUP_LABELS[exercise.category] ||
                          exercise.category}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="ghost-primary tiny info-btn"
                  title="عرض الميكانيكا والفائدة والصورة"
                  onClick={() => handleOpenExerciseDetail(exState.exerciseId)}
                >
                  ℹ️ الشرح والفائدة
                </button>
              </div>

              {/* Sets Table */}
              <div className="sets-table-wrapper">
                <table className="sets-table">
                  <thead>
                    <tr>
                      <th className="col-set">SET</th>
                      <th className="col-input">KG</th>
                      <th className="col-input">REPS</th>
                      <th className="col-check">✓</th>
                      <th className="col-action"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {exState.sets.map((set, sIdx) => (
                      <tr
                        key={set.id}
                        className={`set-row ${set.isCompleted ? 'set-completed' : ''}`}
                      >
                        <td className="col-set">
                          <span className="set-number-badge">{set.setNum}</span>
                        </td>
                        <td className="col-input">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={set.weightKg}
                            onChange={(e) =>
                              handleUpdateSetField(
                                exIdx,
                                sIdx,
                                'weightKg',
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="set-field-input"
                          />
                        </td>
                        <td className="col-input">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={set.reps}
                            onChange={(e) =>
                              handleUpdateSetField(
                                exIdx,
                                sIdx,
                                'reps',
                                parseInt(e.target.value, 10) || 0,
                              )
                            }
                            className="set-field-input"
                          />
                        </td>
                        <td className="col-check">
                          <button
                            type="button"
                            className={`set-check-btn ${set.isCompleted ? 'checked' : ''}`}
                            onClick={() =>
                              handleToggleSetCompleted(exIdx, sIdx)
                            }
                            title={
                              set.isCompleted
                                ? 'إلغاء التحديد'
                                : 'تأكيد إنهاء المجموعة'
                            }
                          >
                            ✓
                          </button>
                        </td>
                        <td className="col-action">
                          {exState.sets.length > 1 && (
                            <button
                              type="button"
                              className="ghost-danger tiny remove-set-btn"
                              onClick={() => handleRemoveSet(exIdx, sIdx)}
                              title="حذف هذه المجموعة"
                            >
                              ✕
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Set Button */}
              <div className="exercise-card-footer">
                <button
                  type="button"
                  className="ghost-primary tiny add-set-btn"
                  onClick={() => handleAddSet(exIdx)}
                >
                  + إضافة مجموعة جديدة
                </button>
              </div>
            </div>
          )
        })}
      </main>

      {/* Bottom Sticky Action Bar */}
      <footer className="active-workout-footer">
        <button
          type="button"
          className="button-primary full-width finish-workout-large-btn"
          onClick={() => setShowConfirmFinish(true)}
        >
          🏁 إنهاء التمرين وحفظ الجلسة ({completedSetsCount} مجموعة مكتملة)
        </button>
      </footer>

      {/* Exercise Detail Modal */}
      {selectedExerciseForDetail && (
        <ExerciseDetailModal
          exercise={selectedExerciseForDetail}
          onClose={() => setSelectedExerciseForDetail(null)}
        />
      )}

      {/* Confirm Finish Modal */}
      {showConfirmFinish && (
        <div
          className="modal-backdrop"
          onClick={() => setShowConfirmFinish(false)}
        >
          <div
            className="modal-content card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>🎉 مبروك إنهاء التمرين!</h2>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowConfirmFinish(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>هل ترغب في حفظ هذه الجلسة في سجل التتبع الخاص بك والتقويم؟</p>
              <ul className="summary-list">
                <li>
                  <span>اليوم التدريبي</span>
                  <strong>
                    {programDay.labelAr} ({programDay.focus})
                  </strong>
                </li>
                <li>
                  <span>مدة التمرين</span>
                  <strong>{formatTime(elapsedSeconds)}</strong>
                </li>
                <li>
                  <span>المجموعات المنجزة</span>
                  <strong>{completedSetsCount} مجموعة</strong>
                </li>
                <li>
                  <span>إجمالي الوزن المرفوع</span>
                  <strong>{totalVolumeKg} كجم</strong>
                </li>
              </ul>
            </div>
            <div className="modal-footer actions-row">
              <button
                type="button"
                className="button-primary"
                data-testid="confirm-save-session-btn"
                onClick={() => {
                  setShowConfirmFinish(false)
                  handleSaveAndFinish()
                }}
              >
                💾 تأكيد وحفظ الجلسة
              </button>
              <button
                type="button"
                className="ghost"
                onClick={() => setShowConfirmFinish(false)}
              >
                الرجوع للجلسة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Cancel Modal */}
      {showConfirmCancel && (
        <div
          className="modal-backdrop"
          onClick={() => setShowConfirmCancel(false)}
        >
          <div
            className="modal-content card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>⚠️ إلغاء الجلسة</h2>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowConfirmCancel(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>
                هل أنت متأكد من إلغاء جلسة التمرين الحالية؟ لن يتم حفظ المجموعات
                التي قمت بتسجيلها.
              </p>
            </div>
            <div className="modal-footer actions-row">
              <button
                type="button"
                className="danger"
                onClick={() => {
                  try {
                    localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY)
                  } catch {
                    // ignore
                  }
                  setShowConfirmCancel(false)
                  onCancel()
                }}
              >
                نعم، إلغاء وخروج
              </button>
              <button
                type="button"
                className="ghost"
                onClick={() => setShowConfirmCancel(false)}
              >
                متابعة التمرين
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
