import { useState } from 'react'
import type {
  CustomExercise,
  Exercise,
  ProgramDay,
  ProgramExercise,
  WorkoutProgram,
  WorkoutSplitType,
} from '../shared/types.ts'
import { WORKOUT_SPLIT_LABELS } from '../shared/types.ts'
import { getExerciseById } from './exercises.ts'
import { ExerciseDetailModal } from './ExerciseDetailModal.tsx'
import { ExercisePickerModal } from './ExercisePickerModal.tsx'
import { ExerciseSwapModal } from './ExerciseSwapModal.tsx'
import { ExerciseVisual } from './ExerciseVisual.tsx'
import { generateProgram } from './programGenerator.ts'
import { convertDayToHomeWorkout } from './workoutUtils.ts'

interface WeeklyPlanViewProps {
  program: WorkoutProgram
  customExercises?: CustomExercise[]
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
  const [homeToast, setHomeToast] = useState<string | null>(null)

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

  function handleConvertToHomeWorkout(targetDay: ProgramDay) {
    if (!onUpdateProgram) return
    const converted = convertDayToHomeWorkout(
      targetDay,
      customExercises,
      userInjuries,
    )
    const newDays = program.days.map((d) =>
      d.dayIndex === targetDay.dayIndex ? converted : d,
    )
    onUpdateProgram({ ...program, days: newDays })
    setHomeToast(
      `✓ تم تحويل تمارين (${targetDay.labelAr}) لتمارين منزلية بوزن الجسم بنجاح! 🏠✨`,
    )
    setTimeout(() => setHomeToast(null), 3500)
  }

  return (
    <div className="weekly-plan" data-testid="weekly-plan-view">
      {homeToast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#16a34a',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: '999px',
            fontWeight: 700,
            fontSize: '13.5px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 10000,
            textAlign: 'center',
          }}
        >
          {homeToast}
        </div>
      )}

      <div className="weekly-plan__header">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h2 className="weekly-plan__title" style={{ margin: 0 }}>
              🗓️ الخطة الأسبوعية المخصصة
            </h2>
            <p className="muted" style={{ margin: '4px 0 0' }}>
              نظام التمرين:{' '}
              <strong>
                {WORKOUT_SPLIT_LABELS[program.splitType || 'ppl'] ||
                  program.splitType}
              </strong>{' '}
              (5-6 تمارين يومياً)
            </p>
          </div>

          {onUpdateProgram && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="muted-small">تغيير النظام:</span>
              <select
                value={program.splitType || 'ppl'}
                onChange={(e) => {
                  const newSplit = e.target.value as WorkoutSplitType
                  const newProg = generateProgram({
                    goal: program.primaryGoal,
                    trainingDaysPerWeek: program.trainingDaysPerWeek,
                    splitType: newSplit,
                    injuries: userInjuries,
                    customExercises,
                  })
                  onUpdateProgram(newProg)
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1.5px solid var(--primary)',
                }}
              >
                {Object.entries(WORKOUT_SPLIT_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="weekly-plan__days">
        {program.days.map((day) => (
          <div key={day.dayIndex} className="card weekly-plan__day-card">
            <div className="weekly-plan__day-header">
              <div className="day-title-box">
                <h3 className="weekly-plan__day-label">{day.labelAr}</h3>
                <span className="chip weekly-plan__day-focus">{day.focus}</span>
              </div>

              <div
                className="day-header-actions"
                style={{
                  display: 'flex',
                  gap: '6px',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                {onStartRoutine && (
                  <button
                    type="button"
                    className="button-primary start-routine-btn tiny"
                    onClick={() => onStartRoutine(day)}
                  >
                    ▶ ابدأ التمرين
                  </button>
                )}

                {onUpdateProgram && (
                  <>
                    <button
                      type="button"
                      className="ghost tiny"
                      style={{
                        borderColor: '#16a34a',
                        color: '#166534',
                        background: '#f0fdf4',
                        fontWeight: 700,
                      }}
                      title="تحويل تمارين اليوم لتمارين في المنزل فقط (بوزن الجسم والدمبل)"
                      onClick={() => handleConvertToHomeWorkout(day)}
                    >
                      🏠 تمرن في البيت اليوم
                    </button>

                    <button
                      type="button"
                      className="ghost-primary tiny"
                      onClick={() =>
                        setAddingToDayIndex(
                          addingToDayIndex === day.dayIndex
                            ? null
                            : day.dayIndex,
                        )
                      }
                    >
                      ➕ إضافة تمرين
                    </button>
                  </>
                )}
              </div>
            </div>

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
                          {ex?.name || exerciseName}
                        </span>
                        {ex?.name && ex?.nameAr && ex.name !== ex.nameAr && (
                          <div
                            style={{
                              fontSize: '12px',
                              color: 'var(--primary)',
                              fontWeight: 600,
                              marginTop: '2px',
                            }}
                          >
                            {ex.nameAr}
                          </div>
                        )}
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

      {/* Visual Exercise Picker Modal */}
      {addingToDayIndex !== null && (
        <ExercisePickerModal
          dayLabelAr={
            program.days.find((d) => d.dayIndex === addingToDayIndex)
              ?.labelAr ?? ''
          }
          customExercises={customExercises}
          userInjuries={userInjuries}
          onSelectExercise={(exerciseId) =>
            handleAddExerciseToDay(addingToDayIndex, exerciseId)
          }
          onClose={() => setAddingToDayIndex(null)}
        />
      )}

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
