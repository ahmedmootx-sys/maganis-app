import { useState, useMemo } from 'react'
import type { ProgramDay, TrackingSession, Exercise } from '../shared/types.ts'
import { EXERCISES } from '../workout/exercises.ts'
import { getEffectiveExercise } from '../workout/exerciseStore.ts'
import { ExerciseMarks } from '../../components/ExerciseMarks.tsx'
import { ExerciseDetailModal } from '../workout/ExerciseDetailModal.tsx'
import { ExerciseVisual } from '../workout/ExerciseVisual.tsx'
import { TopBar, DateField, EmptyState, Sheet } from '../../ui/index.ts'
import { IconPlus, IconTrash, IconInfo } from '../../components/Icons.tsx'
import {
  propagateField,
  undoPropagation,
  computeExerciseSuggestions,
  type TrackedSetItem,
  type SetFieldType,
  type HistoricalSessionSpec,
} from './setPropagation.ts'
import { Claim } from '../../content/Claim.tsx'
import { Toast } from '../../components/Toast.tsx'

export interface SessionLoggerProps {
  programDay: ProgramDay | null
  dayIndex: number | null
  onSave: (session: TrackingSession) => void
  onClose?: () => void
  customExercises?: Exercise[]
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
  onClose,
  customExercises = [],
}: SessionLoggerProps) {
  const [date, setDate] = useState(() => todayStr())

  // Load past sessions for suggestions
  const pastSessions = useMemo<TrackingSession[]>(() => {
    try {
      if (typeof localStorage === 'undefined') return []
      const raw = localStorage.getItem('maganis:tracking.sessions')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }, [])

  const initialExercises = useMemo(() => {
    return (programDay?.exercises ?? []).map((pe) => {
      const exHistory = pastSessions
        .map((s) => {
          const match = s.exercises?.find((e) => e.exerciseId === pe.exerciseId)
          if (!match) return null
          return {
            date: s.date,
            sets: (match.sets || []).map((st) => ({
              reps: st.reps,
              weightKg: st.weightKg,
            })),
          }
        })
        .filter(Boolean) as HistoricalSessionSpec[]

      const sugg = computeExerciseSuggestions(
        {
          reps: pe.reps,
          repsMin: pe.repsMin ?? pe.reps,
          repsMax: pe.repsMax ?? pe.reps,
        },
        exHistory,
      )

      const numSets = pe.sets || 3
      const sets: TrackedSetItem[] = Array.from({ length: numSets }, () => ({
        weight: {
          value: sugg.suggestedWeight ?? 0,
          state: sugg.suggestedWeight ? 'suggested' : 'empty',
        },
        reps: {
          value: sugg.suggestedReps ?? pe.reps ?? 8,
          state: 'suggested',
        },
        completed: false,
      }))

      return {
        exerciseId: pe.exerciseId,
        sets,
        hintClaimId: sugg.hintClaimId,
      }
    })
  }, [programDay, pastSessions])

  const [exercises, setExercises] = useState(initialExercises)
  const [toastInfo, setToastInfo] = useState<{
    message: string
    action?: { label: string; onClick: () => void }
  } | null>(null)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [selectedExerciseForDetail, setSelectedExerciseForDetail] =
    useState<Exercise | null>(null)
  const [showAddExerciseSheet, setShowAddExerciseSheet] = useState(false)
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState('')

  // Find exercise details
  const findExercise = (id: string): Exercise | undefined => {
    return getEffectiveExercise(id, customExercises) || undefined
  }

  // Filtered exercises for add sheet
  const availableExercises = useMemo(() => {
    const term = exerciseSearchTerm.trim().toLowerCase()
    const all = [...customExercises, ...EXERCISES]
    if (!term) return all.slice(0, 40)
    return all.filter(
      (e) =>
        e.nameAr.toLowerCase().includes(term) ||
        (e.name ?? '').toLowerCase().includes(term) ||
        (e.targetMusclesAr &&
          e.targetMusclesAr.some((m) => m.toLowerCase().includes(term))),
    )
  }, [customExercises, exerciseSearchTerm])

  function updateSet(
    exerciseIdx: number,
    setIdx: number,
    field: SetFieldType,
    value: number,
  ) {
    const currentEx = exercises[exerciseIdx]
    if (!currentEx) return

    const { nextSets, propagatedCount, previousSnapshot } = propagateField(
      currentEx.sets,
      setIdx,
      field,
      value,
    )

    let updatedHint = currentEx.hintClaimId
    if (setIdx === 0 && field === 'reps') {
      const pe = programDay?.exercises.find(
        (e) => e.exerciseId === currentEx.exerciseId,
      )
      const minReps = pe?.repsMin ?? pe?.reps ?? 8
      if (value > 0 && value < minReps) {
        updatedHint = 'sugg.below_range'
      }
    }

    setExercises((prev) => {
      const next = [...prev]
      next[exerciseIdx] = {
        ...next[exerciseIdx],
        sets: nextSets,
        hintClaimId: updatedHint,
      }
      return next
    })

    if (propagatedCount > 0) {
      setToastInfo({
        message: 'اتنقلت لباقي المجموعات',
        action: {
          label: 'تراجع',
          onClick: () => {
            setExercises((prev) => {
              const next = [...prev]
              next[exerciseIdx] = {
                ...next[exerciseIdx],
                sets: undoPropagation(previousSnapshot),
              }
              return next
            })
            setToastInfo(null)
          },
        },
      })
    }
  }

  function addSetRow(exerciseIdx: number) {
    setExercises((prev) => {
      const next = [...prev]
      const ex = next[exerciseIdx]
      const lastSet = ex.sets[ex.sets.length - 1]
      next[exerciseIdx] = {
        ...ex,
        sets: [
          ...ex.sets,
          {
            weight: {
              value: lastSet?.weight.value ?? 0,
              state: 'empty',
            },
            reps: {
              value: lastSet?.reps.value ?? 8,
              state: 'suggested',
            },
            completed: false,
          },
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

  function removeExercise(exerciseIdx: number) {
    setExercises((prev) => prev.filter((_, i) => i !== exerciseIdx))
  }

  function addExerciseToSession(exercise: Exercise) {
    setExercises((prev) => [
      ...prev,
      {
        exerciseId: exercise.id,
        sets: [
          {
            weight: { value: 0, state: 'empty' },
            reps: { value: 10, state: 'suggested' },
            completed: false,
          },
          {
            weight: { value: 0, state: 'empty' },
            reps: { value: 10, state: 'suggested' },
            completed: false,
          },
          {
            weight: { value: 0, state: 'empty' },
            reps: { value: 10, state: 'suggested' },
            completed: false,
          },
        ],
        hintClaimId: 'sugg.first_time_weight',
      },
    ])
    setShowAddExerciseSheet(false)
    setExerciseSearchTerm('')
    setError('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (exercises.length === 0) {
      setError('أضف تمارين لتسجيل الجلسة')
      return
    }
    const session: TrackingSession = {
      id: uid(),
      date,
      programDayIndex: dayIndex,
      exercises: exercises.map((e) => ({
        exerciseId: e.exerciseId,
        sets: e.sets.map((s) => ({
          reps: s.reps.value,
          weightKg: s.weight.value,
        })),
        completed: e.sets.some((s) => s.reps.value > 0),
      })),
      notes,
      createdAt: Date.now(),
    }
    onSave(session)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="manual-session-modal"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* TopBar with Back */}
      <TopBar
        title={programDay ? `تسجيل ${programDay.labelAr}` : 'تسجيل يدوي'}
        onBack={onClose}
      />

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        <div
          className="screen-content"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            padding: '16px',
            maxWidth: '680px',
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
            flex: 1,
          }}
        >
          {/* DateField at top */}
          <div
            className="section"
            style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
          >
            <label
              htmlFor="session-date"
              style={{
                fontSize: '13.5px',
                fontWeight: 700,
                color: 'var(--ink)',
              }}
            >
              تاريخ الجلسة
            </label>
            <DateField
              id="session-date"
              value={date}
              onChange={(d) => setDate(d)}
              aria-label="تاريخ الجلسة"
            />
          </div>

          {error && (
            <div
              role="alert"
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'var(--danger-surface, rgba(220, 38, 38, 0.1))',
                color: 'var(--danger)',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          {/* Exercises */}
          {exercises.length === 0 ? (
            <EmptyState
              title="لا توجد تمارين بالجلسة"
              description="أضف تمرينًا لبدء تسجيل مجموعاتك اليدوية"
              actionLabel="إضافة تمرين"
              onAction={() => setShowAddExerciseSheet(true)}
            />
          ) : (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {exercises.map((se, ei) => {
                const exInfo = findExercise(se.exerciseId)
                return (
                  <div
                    key={`${se.exerciseId}-${ei}`}
                    className="card session-exercise-card"
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
                    {/* Header: Thumbnail + Name + Info + Delete */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div
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
                            overflow:
                              'hidden' /* clip-ok: visual element boundary */,
                            flexShrink: 0,
                            background: 'var(--card-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ExerciseVisual
                            category={exInfo?.category ?? 'chest'}
                            exerciseId={se.exerciseId}
                            exerciseName={exInfo?.nameAr}
                            size="medium"
                          />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <h3
                            style={{
                              margin: 0,
                              fontSize: '15.5px',
                              fontWeight: 700,
                              color: 'var(--ink)',
                              lineHeight: 1.3,
                            }}
                          >
                            {exInfo?.nameAr ?? se.exerciseId}
                            <ExerciseMarks
                              hasVideo={
                                (exInfo as { hasVideo?: boolean })?.hasVideo
                              }
                              hasCustomMedia={
                                (exInfo as { hasCustomMedia?: boolean })
                                  ?.hasCustomMedia
                              }
                            />
                          </h3>
                          {exInfo?.name && (
                            <span
                              dir="ltr"
                              style={{
                                fontSize: '12.5px',
                                color: 'var(--muted)',
                                display: 'block',
                                textAlign: 'right',
                              }}
                            >
                              {exInfo.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          flexShrink: 0,
                        }}
                      >
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() =>
                            setSelectedExerciseForDetail(exInfo || null)
                          }
                          aria-label={`شرح تمرين ${exInfo?.nameAr ?? ''}`}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'var(--card-subtle)',
                            color: 'var(--ink)',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <IconInfo size={20} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => removeExercise(ei)}
                          aria-label={`حذف تمرين ${exInfo?.nameAr ?? ''} من الجلسة`}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'transparent',
                            color: 'var(--danger)',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <IconTrash size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Sets Header */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '40px 1fr 1fr 40px',
                        gap: '8px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        color: 'var(--muted)',
                        padding: '0 4px',
                        textAlign: 'center',
                      }}
                    >
                      <span>المجموعة</span>
                      <span>الوزن (كجم)</span>
                      <span>التكرارات</span>
                      <span></span>
                    </div>

                    {/* Sets List */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      {se.sets.map((set, si) => (
                        <div
                          key={si}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '40px 1fr 1fr 40px',
                            gap: '8px',
                            alignItems: 'center',
                          }}
                        >
                          <div
                            style={{
                              height: '48px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '14px',
                              color: 'var(--muted)',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            #{si + 1}
                          </div>
                          <input
                            type="number"
                            min="0"
                            max="1000"
                            step="0.5"
                            value={
                              set.weight.value === 0 ? '' : set.weight.value
                            }
                            placeholder={
                              set.weight.state === 'suggested' &&
                              set.weight.value > 0
                                ? String(set.weight.value)
                                : '0'
                            }
                            onChange={(e) =>
                              updateSet(
                                ei,
                                si,
                                'weight',
                                Number(e.target.value) || 0,
                              )
                            }
                            className="field-input"
                            data-testid={`set-weight-${ei}-${si}`}
                            data-cell-state={set.weight.state}
                            style={{
                              height: '48px',
                              textAlign: 'center',
                              fontVariantNumeric: 'tabular-nums',
                              fontSize: '16px',
                              borderRadius: '10px',
                              border:
                                set.weight.state === 'auto' ||
                                set.weight.state === 'suggested'
                                  ? '1px dashed var(--color-accent)'
                                  : '1px solid var(--color-divider)',
                              color:
                                set.weight.state === 'auto' ||
                                set.weight.state === 'suggested'
                                  ? 'var(--color-text-2)'
                                  : 'var(--color-text)',
                              backgroundColor: 'var(--color-surface)',
                            }}
                            aria-label={`وزن المجموعة ${si + 1}`}
                          />
                          <input
                            type="number"
                            min="0"
                            max="200"
                            value={set.reps.value === 0 ? '' : set.reps.value}
                            placeholder="0"
                            onChange={(e) =>
                              updateSet(
                                ei,
                                si,
                                'reps',
                                Number(e.target.value) || 0,
                              )
                            }
                            className="field-input"
                            data-testid={`set-reps-${ei}-${si}`}
                            data-cell-state={set.reps.state}
                            style={{
                              height: '48px',
                              textAlign: 'center',
                              fontVariantNumeric: 'tabular-nums',
                              fontSize: '16px',
                              borderRadius: '10px',
                              border:
                                set.reps.state === 'auto' ||
                                set.reps.state === 'suggested'
                                  ? '1px dashed var(--color-accent)'
                                  : '1px solid var(--color-divider)',
                              color:
                                set.reps.state === 'auto' ||
                                set.reps.state === 'suggested'
                                  ? 'var(--color-text-2)'
                                  : 'var(--color-text)',
                              backgroundColor: 'var(--color-surface)',
                            }}
                            aria-label={`تكرار المجموعة ${si + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => removeSetRow(ei, si)}
                            disabled={se.sets.length <= 1}
                            aria-label={`حذف المجموعة ${si + 1}`}
                            style={{
                              width: '40px',
                              height: '48px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '10px',
                              border: 'none',
                              background: 'transparent',
                              color:
                                se.sets.length <= 1
                                  ? 'var(--line)'
                                  : 'var(--danger)',
                              cursor:
                                se.sets.length <= 1 ? 'not-allowed' : 'pointer',
                            }}
                          >
                            <IconTrash size={18} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Tertiary Button: Add Set */}
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => addSetRow(ei)}
                      style={{
                        height: '44px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        color: 'var(--brand)',
                        background:
                          'var(--brand-surface, rgba(230, 81, 0, 0.08))',
                        border: 'none',
                        cursor: 'pointer',
                        width: '100%',
                        marginTop: '4px',
                      }}
                    >
                      <IconPlus size={16} />
                      <span>إضافة مجموعة</span>
                    </button>

                    {/* Science suggestion hint (Task G5-B2) */}
                    {se.hintClaimId && (
                      <div
                        data-testid="exercise-suggestion-hint"
                        style={{
                          padding: 'var(--space-2) var(--space-3)',
                          borderRadius: 'var(--radius-control)',
                          backgroundColor: 'var(--color-surface-2)',
                          fontSize: 'var(--font-size-xs)',
                          marginTop: 'var(--space-2)',
                        }}
                      >
                        <Claim id={se.hintClaimId} />
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Add another exercise button */}
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setShowAddExerciseSheet(true)}
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  border: '1px dashed var(--line)',
                  background: 'var(--card-subtle)',
                  color: 'var(--ink)',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <IconPlus size={18} />
                <span>إضافة تمرين للجلسة</span>
              </button>
            </div>
          )}

          {/* Notes */}
          <div
            className="field"
            style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
          >
            <label
              htmlFor="sl-notes"
              style={{
                fontSize: '13.5px',
                fontWeight: 700,
                color: 'var(--ink)',
              }}
            >
              ملاحظات الجلسة (اختياري)
            </label>
            <textarea
              id="sl-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="مثال: دوّن أي شعور بالإجهاد، أوزان قياسية، أو ملاحظات للأسبوع القادم..."
              dir="rtl"
              className="field-input"
              style={{
                minHeight: '84px',
                resize: 'none',
                overflow: 'hidden' /* clip-ok: visual element boundary */,
                textAlign: 'start',
                padding: '12px',
                borderRadius: '10px',
              }}
            />
          </div>
        </div>

        {/* Sticky Bottom Save Bar */}
        <div
          className="sticky-actions-bar"
          style={{
            position: 'sticky',
            bottom: 0,
            background: 'var(--bg)',
            padding: '12px 16px',
            borderTop: '1px solid var(--line)',
            zIndex: 20,
            display: 'flex',
            gap: '12px',
            maxWidth: '680px',
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {onClose && (
            <button
              type="button"
              className="btn-ghost"
              onClick={onClose}
              style={{
                height: '48px',
                flex: '0 0 90px',
                borderRadius: '12px',
                border: '1px solid var(--line)',
                background: 'transparent',
                color: 'var(--ink)',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              إلغاء
            </button>
          )}
          <button
            type="submit"
            className="btn-primary"
            style={{
              height: '48px',
              flex: 1,
              borderRadius: '12px',
              border: 'none',
              background: 'var(--brand)',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            حفظ الجلسة
          </button>
        </div>
      </form>

      {/* Add Exercise Sheet */}
      <Sheet
        isOpen={showAddExerciseSheet}
        onClose={() => {
          setShowAddExerciseSheet(false)
          setExerciseSearchTerm('')
        }}
        title="إضافة تمرين للجلسة"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '8px 0',
          }}
        >
          <div className="field">
            <input
              type="search"
              placeholder="ابحث باسم التمرين أو العضلة..."
              value={exerciseSearchTerm}
              onChange={(e) => setExerciseSearchTerm(e.target.value)}
              className="field-input"
              dir="rtl"
              style={{ height: '48px', width: '100%' }}
              aria-label="البحث عن تمرين"
            />
          </div>
          <div
            style={{
              maxHeight: '360px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {availableExercises.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => addExerciseToSession(ex)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: 'var(--card-subtle)',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'right',
                  width: '100%',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <strong
                    style={{
                      fontSize: '14.5px',
                      color: 'var(--ink)',
                      display: 'block',
                    }}
                  >
                    {ex.nameAr}
                  </strong>
                  <span
                    dir="ltr"
                    style={{
                      fontSize: '12px',
                      color: 'var(--muted)',
                      display: 'block',
                      textAlign: 'right',
                    }}
                  >
                    {ex.name}
                  </span>
                </div>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--card-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brand)',
                  }}
                >
                  <IconPlus size={18} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </Sheet>

      {/* Exercise Detail Modal */}
      {selectedExerciseForDetail && (
        <ExerciseDetailModal
          exercise={selectedExerciseForDetail}
          onClose={() => setSelectedExerciseForDetail(null)}
        />
      )}

      {toastInfo && (
        <Toast
          message={toastInfo.message}
          action={toastInfo.action}
          onDismiss={() => setToastInfo(null)}
        />
      )}
    </div>
  )
}
