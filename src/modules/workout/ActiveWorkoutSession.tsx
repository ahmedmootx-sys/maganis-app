import { useEffect, useMemo, useState } from 'react'
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
import { TopBar, ProgressBar, Sheet, ConfirmSheet } from '../../ui/index.ts'
import exerciseFlagsData from '../../data/exercise-flags.json'
import {
  IconClock,
  IconMoreVertical,
  IconChevronDown,
  IconInfo,
  IconClose,
} from '../../components/Icons.tsx'

export interface ActiveWorkoutSessionProps {
  programDay: ProgramDay
  customExercises?: Exercise[]
  previousSessions?: TrackingSession[]
  onFinish: (session: TrackingSession) => void
  onCancel: () => void
  onMinimize?: () => void
  onElapsedSecondsUpdate?: (seconds: number) => void
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
  previousSessions = [],
  onFinish,
  onCancel,
  onMinimize,
  onElapsedSecondsUpdate,
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
        const defaultReps = pe.reps > 0 ? pe.reps : 0
        const sets: ActiveSet[] = Array.from(
          { length: defaultSetsCount },
          (_, idx) => ({
            id: uniqueId(),
            setNum: idx + 1,
            weightKg: 0,
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

  // Start mascot toast message, auto disappears after 3.5s
  const [toastMessage, setToastMessage] = useState<string | null>(
    'عاش يا بطل! ركّز في الأداء والتكنيك وتدرب بعزيمة.',
  )

  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => {
      setToastMessage(null)
    }, 3500)
    return () => clearTimeout(timer)
  }, [toastMessage])

  // Stopwatch interval
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    onElapsedSecondsUpdate?.(elapsedSeconds)
  }, [elapsedSeconds, onElapsedSecondsUpdate])

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

  // Warmup Confirmation State for high-risk exercises
  const [warmupConfirmationPending, setWarmupConfirmationPending] = useState<{
    exerciseIndex: number
    setIndex: number
  } | null>(null)
  const [confirmedWarmups, setConfirmedWarmups] = useState<
    Record<string, boolean>
  >({})

  function executeToggleSet(exerciseIndex: number, setIndex: number) {
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

  // --- Sets Actions ---
  function handleToggleSetCompleted(exerciseIndex: number, setIndex: number) {
    const exState = exercisesState[exerciseIndex]
    const exId = exState?.exerciseId
    const flag = exId
      ? (exerciseFlagsData.exercises as Record<string, any>)[exId]
      : null

    // If exercise requires warmup confirmation and hasn't been confirmed yet
    if (flag?.requiresWarmupConfirmation && !confirmedWarmups[exId]) {
      setWarmupConfirmationPending({ exerciseIndex, setIndex })
      return
    }

    executeToggleSet(exerciseIndex, setIndex)
  }

  function handleConfirmWarmup() {
    if (!warmupConfirmationPending) return
    const { exerciseIndex, setIndex } = warmupConfirmationPending
    const exId = exercisesState[exerciseIndex]?.exerciseId
    if (exId) {
      setConfirmedWarmups((prev) => ({ ...prev, [exId]: true }))
    }
    executeToggleSet(exerciseIndex, setIndex)
    setWarmupConfirmationPending(null)
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

  // Modals & Sheets
  const [showConfirmFinish, setShowConfirmFinish] = useState(false)
  const [showConfirmCancel, setShowConfirmCancel] = useState(false)
  const [showOverflowSheet, setShowOverflowSheet] = useState(false)

  // Load previous sessions to show "السابق" history per exercise
  const previousHistoryMap = useMemo(() => {
    let allSessions: TrackingSession[] = previousSessions || []
    if (allSessions.length === 0) {
      try {
        const raw = localStorage.getItem('tracking.sessions')
        if (raw) {
          allSessions = JSON.parse(raw)
        }
      } catch {
        // ignore
      }
    }

    const history: Record<string, { weightKg: number; reps: number }[]> = {}
    if (Array.isArray(allSessions)) {
      const sorted = [...allSessions].sort((a, b) => b.createdAt - a.createdAt)
      for (const session of sorted) {
        if (!Array.isArray(session.exercises)) continue
        for (const ex of session.exercises) {
          if (
            !history[ex.exerciseId] &&
            Array.isArray(ex.sets) &&
            ex.sets.length > 0
          ) {
            history[ex.exerciseId] = ex.sets
          }
        }
      }
    }
    return history
  }, [previousSessions])

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
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'var(--bg)',
        paddingBottom: '88px',
      }}
    >
      {/* TopBar with Timer, Overflow and Cancel Confirmation */}
      <TopBar
        title={programDay.labelAr}
        subtitle={programDay.focus}
        onBack={() => setShowConfirmCancel(true)}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              className="stopwatch-badge"
              style={{
                fontVariantNumeric: 'tabular-nums',
                fontWeight: 700,
                fontSize: '13.5px',
                color: 'var(--brand)',
                background: 'var(--card-subtle)',
                padding: '4px 8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                margin: 0,
              }}
            >
              <IconClock size={15} />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>
            {onMinimize && (
              <button
                type="button"
                className="btn-icon"
                onClick={onMinimize}
                title="تصغير الجلسة ومتابعة التصفح"
                aria-label="تصغير الجلسة"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--card-subtle)',
                  color: 'var(--ink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <IconChevronDown size={20} />
              </button>
            )}
            <button
              type="button"
              className="btn-icon"
              onClick={() => setShowOverflowSheet(true)}
              aria-label="خيارات الجلسة"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--card-subtle)',
                color: 'var(--ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <IconMoreVertical size={20} />
            </button>
          </div>
        }
      />

      {/* Progress Strip: Single line + ProgressBar */}
      <div
        className="workout-progress-strip"
        style={{
          padding: '12px 16px',
          background: 'var(--card-bg)',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13.5px',
            fontWeight: 700,
            color: 'var(--ink)',
          }}
        >
          <span>
            {completedSetsCount} من {totalSetsCount} مجموعة مكتملة
          </span>
          <span
            style={{
              color: 'var(--muted)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {totalVolumeKg} كجم
          </span>
        </div>
        <ProgressBar
          value={completedSetsCount}
          max={Math.max(1, totalSetsCount)}
          height={6}
          aria-label="تقدم الجلسة التدريبية"
        />
      </div>

      {/* Floating Rest Timer */}
      {restSecondsLeft !== null && restSecondsLeft > 0 && (
        <div
          className="rest-timer-banner"
          style={{
            margin: '8px 16px',
            padding: '10px 14px',
            borderRadius: '12px',
            background: 'var(--card-subtle)',
            border: '1px solid var(--brand)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13.5px',
              fontWeight: 600,
            }}
          >
            <IconClock size={18} style={{ color: 'var(--brand)' }} />
            <span>فترة الراحة</span>
            <strong
              style={{
                color: 'var(--brand)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {restSecondsLeft} ثانية
            </strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={() =>
                setRestSecondsLeft((prev) => (prev ? prev + 30 : 30))
              }
              style={{
                padding: '6px 10px',
                fontSize: '12.5px',
                borderRadius: '8px',
                border: '1px solid var(--line)',
                background: 'var(--card-bg)',
                cursor: 'pointer',
              }}
            >
              +30ث
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setRestSecondsLeft(null)}
              aria-label="تخطي الراحة"
              style={{
                padding: '6px 10px',
                fontSize: '12.5px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                color: 'var(--danger)',
                cursor: 'pointer',
              }}
            >
              تخطي
            </button>
          </div>
        </div>
      )}

      {/* Exercises List (Hevy / Strong Style) */}
      <main
        className="active-exercises-list"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '16px',
          maxWidth: '720px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {exercisesState.map((exState, exIdx) => {
          const custom = customExercises.find(
            (c) => c.id === exState.exerciseId,
          )
          const exercise = custom ?? getExerciseById(exState.exerciseId)
          const exerciseName = exercise?.nameAr ?? exState.exerciseId

          return (
            <div
              key={exState.exerciseId}
              className="active-exercise-card card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '16px',
                borderRadius: '16px',
                background: 'var(--card-bg)',
                border: '1px solid var(--line)',
              }}
            >
              {/* Exercise Header Row */}
              <div
                className="exercise-card-header"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div
                  className="exercise-title-group"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: 'var(--card-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ExerciseVisual
                      category={exercise?.category ?? 'chest'}
                      exerciseId={exState.exerciseId}
                      exerciseName={exerciseName}
                      imageUrl={exercise?.imageUrl}
                      size="medium"
                    />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3
                      className="exercise-name"
                      style={{
                        margin: 0,
                        fontSize: '15.5px',
                        fontWeight: 700,
                        color: 'var(--ink)',
                      }}
                    >
                      {exerciseName}
                    </h3>
                    {exercise && (
                      <span
                        className="muscle-badge"
                        style={{
                          fontSize: '12px',
                          color: 'var(--muted)',
                          marginTop: '2px',
                          display: 'inline-block',
                        }}
                      >
                        {MUSCLE_GROUP_LABELS[exercise.category] ||
                          exercise.category}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="ghost-primary tiny info-btn"
                  onClick={() => handleOpenExerciseDetail(exState.exerciseId)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    height: '38px',
                    padding: '0 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--line)',
                    background: 'var(--card-subtle)',
                    color: 'var(--ink)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <IconInfo size={16} />
                  <span>شرح التمرين</span>
                </button>
              </div>

              {/* Sets Table */}
              <div className="sets-table-wrapper" style={{ overflowX: 'auto' }}>
                <table className="sets-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th className="col-set">المجموعة</th>
                      <th className="col-prev">السابق</th>
                      <th className="col-input">الوزن</th>
                      <th className="col-input">التكرارات</th>
                      <th className="col-check">تم</th>
                      <th className="col-action"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {exState.sets.map((set, sIdx) => {
                      const prevExSets = previousHistoryMap[exState.exerciseId]
                      const prevSet = prevExSets?.[sIdx]
                      const prevText = prevSet
                        ? `${prevSet.weightKg}\u00A0كجم × ${prevSet.reps}`
                        : '—'

                      return (
                        <tr
                          key={set.id}
                          className={`set-row ${set.isCompleted ? 'set-completed' : ''}`}
                        >
                          <td className="col-set">
                            <span className="set-number-badge">
                              {set.setNum}
                            </span>
                          </td>
                          <td className="col-prev">
                            <span className="set-prev-badge">{prevText}</span>
                          </td>
                          <td className="col-input">
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={set.weightKg === 0 ? '' : set.weightKg}
                              placeholder={
                                prevSet && prevSet.weightKg > 0
                                  ? String(prevSet.weightKg)
                                  : 'كجم'
                              }
                              onChange={(e) =>
                                handleUpdateSetField(
                                  exIdx,
                                  sIdx,
                                  'weightKg',
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="set-field-input"
                              aria-label={`وزن المجموعة ${set.setNum}`}
                            />
                          </td>
                          <td className="col-input">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={set.reps === 0 ? '' : set.reps}
                              placeholder={
                                prevSet && prevSet.reps > 0
                                  ? String(prevSet.reps)
                                  : 'تكرار'
                              }
                              onChange={(e) =>
                                handleUpdateSetField(
                                  exIdx,
                                  sIdx,
                                  'reps',
                                  parseInt(e.target.value, 10) || 0,
                                )
                              }
                              className="set-field-input"
                              aria-label={`تكرار المجموعة ${set.setNum}`}
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
                              aria-label="✓"
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
                                aria-label="حذف المجموعة"
                              >
                                ✕
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Add Set Button */}
              <div className="exercise-card-footer">
                <button
                  type="button"
                  className="ghost-primary tiny add-set-btn"
                  onClick={() => handleAddSet(exIdx)}
                  style={{
                    height: '42px',
                    width: '100%',
                    borderRadius: '10px',
                    border: '1px dashed var(--line)',
                    background: 'var(--card-subtle)',
                    color: 'var(--brand)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  + إضافة مجموعة جديدة
                </button>
              </div>
            </div>
          )
        })}
      </main>

      {/* Bottom Sticky Action Bar: EXACTLY ONE finish button */}
      <footer
        className="active-workout-footer"
        style={{
          position: 'fixed',
          bottom: 0,
          insetInline: 0,
          padding: '10px 16px',
          background: 'var(--bg)',
          borderTop: '1px solid var(--line)',
          zIndex: 900,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <button
          type="button"
          className="button-primary full-width finish-workout-large-btn"
          data-testid="header-finish-btn"
          onClick={() => setShowConfirmFinish(true)}
          style={{
            maxWidth: '560px',
            width: '100%',
            height: '50px',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            background: 'var(--brand)',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '15.5px', fontWeight: 700 }}>
            إنهاء التمرين
          </span>
          <span style={{ fontSize: '12px', fontWeight: 500, opacity: 0.9 }}>
            {completedSetsCount} من {totalSetsCount} مجموعة مكتملة
          </span>
        </button>
      </footer>

      {/* Toast message at session start */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="toast"
          style={{
            position: 'fixed',
            bottom: '76px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            background: 'var(--ink, #1f2937)',
            color: '#fff',
            padding: '10px 18px',
            borderRadius: '12px',
            fontSize: '13.5px',
            fontWeight: 600,
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            maxWidth: 'calc(100vw - 32px)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Overflow Sheet for Session Options */}
      <Sheet
        isOpen={showOverflowSheet}
        onClose={() => setShowOverflowSheet(false)}
        title="خيارات الجلسة"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '8px 0',
          }}
        >
          {onMinimize && (
            <button
              type="button"
              onClick={() => {
                setShowOverflowSheet(false)
                onMinimize()
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '12px',
                border: 'none',
                background: 'var(--card-subtle)',
                color: 'var(--ink)',
                fontSize: '15px',
                fontWeight: 600,
                textAlign: 'right',
                width: '100%',
                cursor: 'pointer',
              }}
            >
              <IconChevronDown size={20} />
              <span>تصغير الجلسة ومتابعة التصفح</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setShowOverflowSheet(false)
              setShowConfirmCancel(true)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              borderRadius: '12px',
              border: 'none',
              background: 'var(--danger-surface, rgba(220, 38, 38, 0.08))',
              color: 'var(--danger)',
              fontSize: '15px',
              fontWeight: 600,
              textAlign: 'right',
              width: '100%',
              cursor: 'pointer',
            }}
          >
            <IconClose size={20} />
            <span>إلغاء الجلسة الحالية</span>
          </button>
        </div>
      </Sheet>

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
            style={{ maxWidth: '440px', width: '100%' }}
          >
            <div className="modal-header">
              <h2>مبروك إنهاء التمرين!</h2>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowConfirmFinish(false)}
                aria-label="إغلاق"
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
                  <span>إجمالي الحمل المرفوع</span>
                  <strong>{totalVolumeKg} كجم</strong>
                </li>
              </ul>
            </div>
            <div
              className="modal-footer actions-row"
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <button
                type="button"
                className="button-primary full-width"
                data-testid="confirm-save-session-btn"
                onClick={() => {
                  setShowConfirmFinish(false)
                  handleSaveAndFinish()
                }}
                style={{ height: '48px', fontSize: '16px', fontWeight: 700 }}
              >
                تأكيد وحفظ الجلسة
              </button>
              <button
                type="button"
                className="ghost full-width"
                onClick={() => setShowConfirmFinish(false)}
                style={{ height: '44px' }}
              >
                الرجوع للجلسة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Cancel Modal / ConfirmSheet */}
      {showConfirmCancel && (
        <ConfirmSheet
          isOpen={showConfirmCancel}
          onClose={() => setShowConfirmCancel(false)}
          onConfirm={() => {
            try {
              localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY)
            } catch {
              // ignore
            }
            setShowConfirmCancel(false)
            onCancel()
          }}
          title="إلغاء الجلسة؟"
          consequences={[
            'هل أنت متأكد من إلغاء جلسة التمرين الحالية؟',
            'لن يتم حفظ المجموعات التي قمت بتسجيلها في سجل التتبع.',
          ]}
          confirmLabel="نعم، إلغاء وخروج"
          cancelLabel="متابعة التمرين"
          isDestructive={true}
        />
      )}

      {/* Warmup Confirmation Sheet for high-risk exercises */}
      {warmupConfirmationPending && (
        <ConfirmSheet
          isOpen={true}
          onClose={() => setWarmupConfirmationPending(null)}
          onConfirm={handleConfirmWarmup}
          title="تأكيد الإحماء قبل بدء التمرين"
          consequences={[
            'هذا التمرين مصنف كعالي الخطورة على المفاصل والأوتار.',
            'تأكد من أداء مجموعات إحماء تدريجية بوزن خفيف وإطالات حركية لتجهيز المفصل وتجنب الإصابة.',
          ]}
          confirmLabel="نعم، أتممت الإحماء"
          cancelLabel="تراجع"
          isDestructive={false}
        />
      )}
    </div>
  )
}
