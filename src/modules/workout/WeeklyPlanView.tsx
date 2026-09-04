import { useState } from 'react'
import type {
  Exercise,
  ProgramDay,
  ProgramExercise,
  WorkoutProgram,
} from '../shared/types.ts'
import { EXERCISES, getExerciseById } from './exercises.ts'
import { ExerciseDetailModal } from './ExerciseDetailModal.tsx'
import { ExerciseSwapModal } from './ExerciseSwapModal.tsx'
import { ExerciseVisual } from './ExerciseVisual.tsx'

interface WeeklyPlanViewProps {
  program: WorkoutProgram
  customExercises?: Exercise[]
  userInjuries?: string[]
  onUpdateProgram?: (updatedProgram: WorkoutProgram) => void
  onStartRoutine?: (day: ProgramDay) => void
}

export function WeeklyPlanView({
  program,
  customExercises = [],
  userInjuries = [],
  onUpdateProgram,
  onStartRoutine,
}: WeeklyPlanViewProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  )
  const [swapTarget, setSwapTarget] = useState<{
    dayIndex: number
    exerciseIndex: number
    exercise: Exercise
  } | null>(null)
  const [addingToDayIndex, setAddingToDayIndex] = useState<number | null>(null)

  function handleOpenDetail(exerciseId: string) {
    const custom = customExercises.find((c) => c.id === exerciseId)
    const ex = custom ?? getExerciseById(exerciseId)
    if (ex) {
      setSelectedExercise(ex)
    }
  }

  function handleSwapExercise(newEx: Exercise) {
    if (!swapTarget || !onUpdateProgram) return

    const newDays = program.days.map((day) => {
      if (day.dayIndex !== swapTarget.dayIndex) return day

      const updatedExercises = [...day.exercises]
      updatedExercises[swapTarget.exerciseIndex] = {
        ...updatedExercises[swapTarget.exerciseIndex],
        exerciseId: newEx.id,
      }

      return { ...day, exercises: updatedExercises }
    })

    onUpdateProgram({ ...program, days: newDays })
    setSwapTarget(null)
  }

  function handleRemoveExercise(dayIndex: number, exerciseIdx: number) {
    if (!onUpdateProgram) return
    const newDays = program.days.map((day) => {
      if (day.dayIndex !== dayIndex) return day
      const updatedExercises = day.exercises.filter(
        (_, idx) => idx !== exerciseIdx,
      )
      return { ...day, exercises: updatedExercises }
    })
    onUpdateProgram({ ...program, days: newDays })
  }

  function handleAddExerciseToDay(dayIndex: number, newExId: string) {
    if (!onUpdateProgram || !newExId) return
    const newDays = program.days.map((day) => {
      if (day.dayIndex !== dayIndex) return day
      const newPe: ProgramExercise = {
        exerciseId: newExId,
        sets: 3,
        reps: 10,
        restSeconds: 60,
      }
      return { ...day, exercises: [...day.exercises, newPe] }
    })
    onUpdateProgram({ ...program, days: newDays })
    setAddingToDayIndex(null)
  }

  return (
    <div className="weekly-plan" data-testid="weekly-plan-view">
      <div className="weekly-plan__header">
        <h2 className="weekly-plan__title">🗓️ الخطة الأسبوعية المخصصة</h2>
        <p className="muted">
          يمكنك النقر على أي تمرين لمشاهدة الميكانيكا والـ GIF، أو استبدال
          وإضافة تمارين يومية.
        </p>
      </div>

      <div className="weekly-plan__days">
        {program.days.map((day) => (
          <div key={day.dayIndex} className="card weekly-plan__day-card">
            <div className="weekly-plan__day-header">
              <div className="day-title-box">
                <h3 className="weekly-plan__day-label">{day.labelAr}</h3>
                <span className="chip weekly-plan__day-focus">{day.focus}</span>
              </div>

              <div className="day-header-actions">
                {onStartRoutine && (
                  <button
                    type="button"
                    className="button-primary start-routine-btn"
                    onClick={() => onStartRoutine(day)}
                  >
                    ▶ ابدأ التمرين (Start Routine)
                  </button>
                )}

                {onUpdateProgram && (
                  <button
                    type="button"
                    className="ghost-primary tiny"
                    onClick={() =>
                      setAddingToDayIndex(
                        addingToDayIndex === day.dayIndex ? null : day.dayIndex,
                      )
                    }
                  >
                    ➕ إضافة تمرين
                  </button>
                )}
              </div>
            </div>

            {/* Quick Add Form */}
            {addingToDayIndex === day.dayIndex && (
              <div
                className="quick-add-box card highlight-box"
                style={{ marginBottom: '12px' }}
              >
                <p className="muted-small">
                  اختر تمرينًا لإضافته إلى {day.labelAr}:
                </p>
                <div className="actions-row">
                  <select
                    onChange={(e) =>
                      handleAddExerciseToDay(day.dayIndex, e.target.value)
                    }
                    defaultValue=""
                  >
                    <option value="" disabled>
                      -- اختر من قاعدة التمارين --
                    </option>
                    {[...EXERCISES, ...customExercises].map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.nameAr} ({ex.category})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="ghost tiny"
                    onClick={() => setAddingToDayIndex(null)}
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}

            <ul className="weekly-plan__exercise-list">
              {day.exercises.map((pe, idx) => {
                const custom = customExercises.find(
                  (c) => c.id === pe.exerciseId,
                )
                const ex = custom ?? getExerciseById(pe.exerciseId)
                const exerciseName =
                  ex?.nameAr ??
                  (pe.exerciseId.length > 20 ? 'تمرين مخصص' : pe.exerciseId)

                return (
                  <li key={idx} className="weekly-plan__exercise-item">
                    <div
                      className="weekly-plan__exercise-main"
                      onClick={() => handleOpenDetail(pe.exerciseId)}
                      style={{ cursor: 'pointer' }}
                    >
                      <ExerciseVisual
                        category={ex?.category ?? 'chest'}
                        exerciseId={pe.exerciseId}
                        exerciseName={exerciseName}
                        imageUrl={ex?.imageUrl}
                        size="small"
                      />
                      <div className="exercise-text-meta">
                        <span className="weekly-plan__exercise-name">
                          {exerciseName}
                        </span>
                        <span className="muted weekly-plan__exercise-meta">
                          <strong>{pe.sets}</strong> مجموعات ×{' '}
                          <strong>
                            {pe.reps === 0
                              ? 'أقصى عدد (AMRAP)'
                              : `${pe.reps} تكرار`}
                          </strong>
                          {' • '}
                          <span className="rest-chip">
                            ⏳ راحة {pe.restSeconds} ثانية
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="exercise-item-actions">
                      <button
                        type="button"
                        className="ghost-primary tiny"
                        title="عرض الشرح التفصيلي والصورة"
                        onClick={() => handleOpenDetail(pe.exerciseId)}
                      >
                        ℹ️ الشرح والصورة
                      </button>

                      {onUpdateProgram && (
                        <>
                          <button
                            type="button"
                            className="ghost tiny"
                            title="استبدال التمرين بآخر"
                            onClick={() =>
                              setSwapTarget({
                                dayIndex: day.dayIndex,
                                exerciseIndex: idx,
                                exercise: ex ?? {
                                  id: pe.exerciseId,
                                  nameAr: exerciseName,
                                  descriptionAr: '',
                                  category: 'chest',
                                  difficulty: 'beginner',
                                  equipment: 'bodyweight',
                                },
                              })
                            }
                          >
                            🔄 استبدال
                          </button>
                          <button
                            type="button"
                            className="ghost-danger tiny"
                            title="حذف التمرين"
                            onClick={() =>
                              handleRemoveExercise(day.dayIndex, idx)
                            }
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}

      {/* Swap Modal */}
      {swapTarget && (
        <ExerciseSwapModal
          currentExercise={swapTarget.exercise}
          customExercises={customExercises}
          userInjuries={userInjuries}
          onSelectSwap={handleSwapExercise}
          onClose={() => setSwapTarget(null)}
        />
      )}
    </div>
  )
}
