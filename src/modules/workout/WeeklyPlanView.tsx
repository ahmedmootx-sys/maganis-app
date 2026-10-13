import { useState } from 'react'
import type {
  CustomExercise,
  Exercise,
  ExerciseSection,
  ProgramDay,
  ProgramExercise,
  WorkoutProgram,
  WorkoutSplitType,
} from '../shared/types.ts'
import {
  EXERCISE_SECTION_LABELS,
  WORKOUT_SPLIT_LABELS,
} from '../shared/types.ts'
import { getExerciseById } from './exercises.ts'
import { ExerciseDetailModal } from './ExerciseDetailModal.tsx'
import { ExercisePickerModal } from './ExercisePickerModal.tsx'
import { ExerciseSwapModal } from './ExerciseSwapModal.tsx'
import { ExerciseVisual } from './ExerciseVisual.tsx'
import { generateProgram } from './programGenerator.ts'
import {
  convertDayToHomeWorkout,
  downloadRoutineFile,
  parseAndValidateRoutineJson,
} from './workoutUtils.ts'

interface WeeklyPlanViewProps {
  program: WorkoutProgram
  customExercises?: CustomExercise[]
  userInjuries?: string[]
  onUpdateProgram?: (updatedProgram: WorkoutProgram) => void
  onDeleteProgram?: () => void
  onStartRoutine?: (day: ProgramDay) => void
  onOpenScheduleModal?: () => void
  onOpenVaultModal?: () => void
}

export function WeeklyPlanView({
  program,
  customExercises = [],
  userInjuries = [],
  onUpdateProgram,
  onDeleteProgram,
  onStartRoutine,
  onOpenScheduleModal,
  onOpenVaultModal,
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
  const [addingSection, setAddingSection] = useState<ExerciseSection>('primary')
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({})
  const [homeToast, setHomeToast] = useState<string | null>(null)
  const [editingFocusDayIndex, setEditingFocusDayIndex] = useState<
    number | null
  >(null)
  const [editingFocusText, setEditingFocusText] = useState('')

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

  function handleMoveExercise(
    dayIndex: number,
    fromIdx: number,
    direction: 'up' | 'down',
  ) {
    if (!onUpdateProgram) return
    const targetIdx = direction === 'up' ? fromIdx - 1 : fromIdx + 1

    const newDays = program.days.map((day) => {
      if (day.dayIndex !== dayIndex) return day
      if (targetIdx < 0 || targetIdx >= day.exercises.length) return day

      const updated = [...day.exercises]
      const temp = updated[fromIdx]
      updated[fromIdx] = updated[targetIdx]
      updated[targetIdx] = temp
      return { ...day, exercises: updated }
    })

    onUpdateProgram({ ...program, days: newDays })
  }

  function handleAddExerciseToDay(
    dayIndex: number,
    newExId: string,
    section: ExerciseSection = addingSection,
  ) {
    if (!onUpdateProgram || !newExId) return
    const newDays = program.days.map((day) => {
      if (day.dayIndex !== dayIndex) return day
      const newPe: ProgramExercise = {
        exerciseId: newExId,
        sets: 3,
        reps: 10,
        restSeconds: 60,
        section,
      }
      return { ...day, exercises: [...day.exercises, newPe] }
    })
    onUpdateProgram({ ...program, days: newDays })
    setAddingToDayIndex(null)
  }

  function handleChangeExerciseSection(
    dayIndex: number,
    exerciseIdx: number,
    newSection: ExerciseSection,
  ) {
    if (!onUpdateProgram) return
    const newDays = program.days.map((day) => {
      if (day.dayIndex !== dayIndex) return day
      const updatedExercises = day.exercises.map((pe, idx) =>
        idx === exerciseIdx ? { ...pe, section: newSection } : pe,
      )
      return { ...day, exercises: updatedExercises }
    })
    onUpdateProgram({ ...program, days: newDays })
  }

  function handleToggleSection(dayIndex: number, section: ExerciseSection) {
    const key = `${dayIndex}_${section}`
    setCollapsedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  function handleImportRoutineFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result
      if (typeof text === 'string') {
        const result = parseAndValidateRoutineJson(text)
        if (result.success) {
          const confirmMsg = `تم العثور على "${result.title}" ويحتوي على ${result.program.days.length} أيام تمرين.\nهل تريد اعتماده وتطبيقه كجدولك الحالي الآن؟`
          if (window.confirm(confirmMsg)) {
            onUpdateProgram?.(result.program)
            setHomeToast(`✓ تم استيراد "${result.title}" وتطبيقه بنجاح! 📥🎉`)
            setTimeout(() => setHomeToast(null), 3500)
          }
        } else {
          alert(`فشل استيراد جدول التمارين:\n${result.error}`)
        }
      }
    }
    reader.readAsText(file)
    e.target.value = ''
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

  function handleToggleLock() {
    if (!onUpdateProgram) return
    const isNowLocked = !program.isLocked
    onUpdateProgram({
      ...program,
      isLocked: isNowLocked,
    })
    setHomeToast(
      isNowLocked
        ? '🔒 تم قفل الجدول لحمايته من أي استبدال عشوائي!'
        : '🔓 تم فتح قفل الجدول للتعديل.',
    )
    setTimeout(() => setHomeToast(null), 2500)
  }

  function handleSaveDayFocus(dayIndex: number) {
    if (!onUpdateProgram) return
    const newDays = program.days.map((d) =>
      d.dayIndex === dayIndex
        ? { ...d, focus: editingFocusText.trim() || d.focus }
        : d,
    )
    onUpdateProgram({ ...program, days: newDays })
    setEditingFocusDayIndex(null)
  }

  function handlePromptDeleteProgram() {
    if (
      window.confirm(
        '⚠️ هل أنت متأكد من حذف الجدول الحالي بالكامل والبدء من الصفر؟ (يمكنك حفظه في الحافظة أولاً إذا أردت الرجوع إليه).',
      )
    ) {
      if (onDeleteProgram) {
        onDeleteProgram()
      }
    }
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

      {/* Program Header with Controls & Protection */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 className="weekly-plan__title" style={{ margin: 0 }}>
                🗓️ الخطة التدريبية
              </h2>
              {program.isLocked ? (
                <span
                  style={{
                    background: '#15803d',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                  }}
                >
                  🔒 محمي من التغيير
                </span>
              ) : (
                <span
                  style={{
                    background: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                  }}
                >
                  ✏️ قيد التعديل
                </span>
              )}
            </div>
            <p className="muted" style={{ margin: '4px 0 0' }}>
              {program.days.length} أيام تمرين أسبوعياً •{' '}
              {program.days.reduce((acc, d) => acc + d.exercises.length, 0)}{' '}
              تمرين إجمالي
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap',
            }}
          >
            {onOpenScheduleModal && (
              <button
                type="button"
                className="chip-btn"
                onClick={onOpenScheduleModal}
                style={{ fontWeight: 700, fontSize: '12px' }}
                title="تحديد أيام الأسبوع وإعادة ترتيب الجدول"
              >
                🗓️ تخصيص الأيام
              </button>
            )}

            {onOpenVaultModal && (
              <button
                type="button"
                className="chip-btn"
                onClick={onOpenVaultModal}
                style={{ fontWeight: 700, fontSize: '12px' }}
                title="فتح حافظة الجداول المحفوظة"
              >
                📁 الحافظة
              </button>
            )}

            <button
              type="button"
              className="chip-btn"
              onClick={() => {
                const title = program.splitType
                  ? WORKOUT_SPLIT_LABELS[program.splitType]
                  : 'جدول تمارين مخصص'
                downloadRoutineFile(program, title)
                setHomeToast('✓ تم تصدير ملف جدول التمارين بنجاح! 📤')
                setTimeout(() => setHomeToast(null), 3000)
              }}
              style={{
                fontWeight: 700,
                fontSize: '12px',
                borderColor: 'var(--accent)',
              }}
              title="تصدير جدول التمارين كملف لمشاركته مع الآخرين"
            >
              📤 تصدير
            </button>

            <label
              className="chip-btn"
              style={{
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                borderColor: '#10b981',
                color: '#059669',
              }}
              title="استيراد جدول تمارين تم إرساله لك من مستخدم آخر"
            >
              📥 استيراد
              <input
                type="file"
                accept=".json,application/json"
                style={{ display: 'none' }}
                onChange={handleImportRoutineFile}
              />
            </label>

            <button
              type="button"
              className="chip-btn"
              onClick={handleToggleLock}
              style={{
                fontWeight: 700,
                fontSize: '12px',
                borderColor: program.isLocked ? '#16a34a' : 'var(--line)',
                color: program.isLocked ? '#16a34a' : 'var(--ink)',
              }}
              title="قفل أو فتح تعديل الجدول"
            >
              {program.isLocked ? '🔓 إلغاء القفل' : '🔒 قفل الجدول'}
            </button>

            {onDeleteProgram && (
              <button
                type="button"
                className="ghost-danger tiny"
                onClick={handlePromptDeleteProgram}
                title="حذف الجدول الحالي بالكامل"
              >
                🗑️ حذف الجدول
              </button>
            )}
          </div>
        </div>

        {/* Change Split Type Dropdown (only when not custom-locked) */}
        {!program.isCustom && onUpdateProgram && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '10px',
            }}
          >
            <span className="muted-small">تغيير النظام التلقائي:</span>
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
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12.5px',
                border: '1px solid var(--line)',
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

      {/* Days List */}
      <div className="weekly-plan__days">
        {program.days.map((day) => (
          <div key={day.dayIndex} className="card weekly-plan__day-card">
            <div className="weekly-plan__day-header">
              <div className="day-title-box">
                <h3 className="weekly-plan__day-label">{day.labelAr}</h3>
                {editingFocusDayIndex === day.dayIndex ? (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginRight: '8px',
                    }}
                  >
                    <input
                      type="text"
                      value={editingFocusText}
                      onChange={(e) => setEditingFocusText(e.target.value)}
                      style={{ padding: '2px 6px', fontSize: '12px' }}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="button-primary tiny"
                      onClick={() => handleSaveDayFocus(day.dayIndex)}
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      className="ghost tiny"
                      onClick={() => setEditingFocusDayIndex(null)}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span className="chip weekly-plan__day-focus">
                      {day.focus}
                    </span>
                    <button
                      type="button"
                      className="ghost tiny"
                      style={{
                        padding: '2px 4px',
                        fontSize: '11px',
                        border: 'none',
                      }}
                      onClick={() => {
                        setEditingFocusDayIndex(day.dayIndex)
                        setEditingFocusText(day.focus)
                      }}
                      title="تعديل مسمى هذا اليوم"
                    >
                      ✏️
                    </button>
                  </div>
                )}
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
                      onClick={() => setAddingToDayIndex(day.dayIndex)}
                    >
                      + إضافة تمرين
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Collapsible Exercise Sections (Warmup, Primary, Flexibility & Core) */}
            <div
              className="weekly-plan__sections-container"
              style={{ marginTop: '10px' }}
            >
              {(
                ['warmup', 'primary', 'flexibility_core'] as ExerciseSection[]
              ).map((secKey) => {
                const secConfig = EXERCISE_SECTION_LABELS[secKey]
                const secItems = day.exercises
                  .map((pe, originalIdx) => ({ pe, originalIdx }))
                  .filter(({ pe }) => (pe.section || 'primary') === secKey)

                const isCollapsed =
                  collapsedSections[`${day.dayIndex}_${secKey}`] ??
                  (secKey !== 'primary' && secItems.length === 0)

                return (
                  <div
                    key={secKey}
                    className="weekly-plan__section-block"
                    style={{ marginBottom: '10px' }}
                  >
                    {/* Section Accordion Header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: 'var(--card-subtle)',
                        border: '1px solid var(--line)',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                      onClick={() => handleToggleSection(day.dayIndex, secKey)}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span style={{ fontSize: '15px' }}>
                          {secConfig.icon}
                        </span>
                        <strong style={{ fontSize: '13px' }}>
                          {secConfig.labelAr}
                        </strong>
                        <span
                          style={{
                            fontSize: '11px',
                            padding: '1px 8px',
                            borderRadius: '999px',
                            background:
                              secItems.length > 0
                                ? 'var(--accent)'
                                : 'var(--line)',
                            color:
                              secItems.length > 0 ? '#fff' : 'var(--muted)',
                            fontWeight: 700,
                          }}
                        >
                          {secItems.length > 0
                            ? `${secItems.length} تمارين`
                            : 'فارغ'}
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {onUpdateProgram && (
                          <button
                            type="button"
                            className="ghost-primary tiny"
                            style={{ padding: '2px 8px', fontSize: '11px' }}
                            onClick={() => {
                              setAddingSection(secKey)
                              setAddingToDayIndex(day.dayIndex)
                            }}
                            title={`إضافة تمرين إلى قسم ${secConfig.labelAr}`}
                          >
                            + إضافة
                          </button>
                        )}
                        <span
                          style={{
                            fontSize: '12px',
                            color: 'var(--muted)',
                            padding: '2px 4px',
                            cursor: 'pointer',
                            fontWeight: 700,
                          }}
                          onClick={() =>
                            handleToggleSection(day.dayIndex, secKey)
                          }
                        >
                          {isCollapsed ? '▼ فتح' : '▲ طي'}
                        </span>
                      </div>
                    </div>

                    {/* Section Content */}
                    {!isCollapsed && (
                      <div style={{ marginTop: '6px' }}>
                        {secItems.length === 0 ? (
                          <div
                            style={{
                              padding: '10px 14px',
                              textAlign: 'center',
                              color: 'var(--muted)',
                              fontSize: '12px',
                              border: '1px dashed var(--line)',
                              borderRadius: '8px',
                            }}
                          >
                            لا توجد تمارين مضافة في ({secConfig.labelAr}) بعد.{' '}
                            {onUpdateProgram && (
                              <button
                                type="button"
                                className="ghost-primary tiny"
                                style={{
                                  display: 'inline-block',
                                  margin: '0 4px',
                                }}
                                onClick={() => {
                                  setAddingSection(secKey)
                                  setAddingToDayIndex(day.dayIndex)
                                }}
                              >
                                + اضغط لإضافة تمرين
                              </button>
                            )}
                          </div>
                        ) : (
                          <ul
                            className="weekly-plan__exercise-list"
                            style={{ margin: 0, padding: 0, listStyle: 'none' }}
                          >
                            {secItems.map(({ pe, originalIdx }) => {
                              const custom = customExercises.find(
                                (c) => c.id === pe.exerciseId,
                              )
                              const ex =
                                custom ?? getExerciseById(pe.exerciseId)
                              if (!ex) return null

                              return (
                                <li
                                  key={`${pe.exerciseId}-${originalIdx}`}
                                  className="weekly-plan__exercise-item"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '8px',
                                    padding: '10px 12px',
                                    borderRadius: '10px',
                                    background: 'var(--card-subtle)',
                                    border: '1px solid var(--line)',
                                    marginBottom: '6px',
                                  }}
                                >
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '10px',
                                      flex: 1,
                                      cursor: 'pointer',
                                    }}
                                    onClick={() => handleOpenDetail(ex.id)}
                                  >
                                    <ExerciseVisual
                                      category={ex.category}
                                      exerciseId={ex.id}
                                      exerciseName={ex.nameAr}
                                      size="small"
                                    />
                                    <div>
                                      <div
                                        style={{
                                          fontWeight: 700,
                                          fontSize: '13.5px',
                                        }}
                                      >
                                        {ex.nameAr}
                                      </div>
                                      <div
                                        style={{
                                          fontSize: '12px',
                                          color: 'var(--muted)',
                                        }}
                                      >
                                        {pe.sets} مجموعات × {pe.reps} تكرار •
                                        راحة {pe.restSeconds}ث
                                      </div>
                                    </div>
                                  </div>

                                  <div
                                    style={{
                                      display: 'flex',
                                      gap: '4px',
                                      alignItems: 'center',
                                      flexWrap: 'wrap',
                                    }}
                                  >
                                    {onUpdateProgram && (
                                      <>
                                        <select
                                          value={pe.section || 'primary'}
                                          onChange={(e) =>
                                            handleChangeExerciseSection(
                                              day.dayIndex,
                                              originalIdx,
                                              e.target.value as ExerciseSection,
                                            )
                                          }
                                          style={{
                                            fontSize: '11px',
                                            padding: '2px 4px',
                                            borderRadius: '6px',
                                            border: '1px solid var(--line)',
                                            background: 'var(--card-bg)',
                                            color: 'var(--ink)',
                                          }}
                                          title="نقل التمرين لقسم آخر"
                                        >
                                          <option value="warmup">
                                            🔥 إحماء
                                          </option>
                                          <option value="primary">
                                            🏋️ أساسي
                                          </option>
                                          <option value="flexibility_core">
                                            🧘 مرونة وثبات
                                          </option>
                                        </select>

                                        {originalIdx > 0 && (
                                          <button
                                            type="button"
                                            className="ghost tiny"
                                            style={{
                                              padding: '2px 6px',
                                              fontSize: '11px',
                                            }}
                                            onClick={() =>
                                              handleMoveExercise(
                                                day.dayIndex,
                                                originalIdx,
                                                'up',
                                              )
                                            }
                                            title="تحريك لأعلى"
                                          >
                                            ▲
                                          </button>
                                        )}
                                        {originalIdx <
                                          day.exercises.length - 1 && (
                                          <button
                                            type="button"
                                            className="ghost tiny"
                                            style={{
                                              padding: '2px 6px',
                                              fontSize: '11px',
                                            }}
                                            onClick={() =>
                                              handleMoveExercise(
                                                day.dayIndex,
                                                originalIdx,
                                                'down',
                                              )
                                            }
                                            title="تحريك لأسفل"
                                          >
                                            ▼
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          className="ghost tiny"
                                          onClick={() =>
                                            setSwapTarget({
                                              dayIndex: day.dayIndex,
                                              exerciseIndex: originalIdx,
                                              exercise: ex,
                                            })
                                          }
                                          title="استبدال بتمرين آخر"
                                        >
                                          🔄
                                        </button>
                                        <button
                                          type="button"
                                          className="ghost-danger tiny"
                                          onClick={() =>
                                            handleRemoveExercise(
                                              day.dayIndex,
                                              originalIdx,
                                            )
                                          }
                                          title="حذف هذا التمرين"
                                        >
                                          ✕
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </li>
                              )
                            })}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Visual Exercise Picker Modal */}
      {addingToDayIndex !== null && (
        <ExercisePickerModal
          dayLabelAr={
            program.days.find((d) => d.dayIndex === addingToDayIndex)
              ?.labelAr || 'اليوم التدريبي'
          }
          customExercises={customExercises}
          userInjuries={userInjuries}
          onSelectExercise={(exerciseId) =>
            handleAddExerciseToDay(addingToDayIndex, exerciseId)
          }
          onClose={() => setAddingToDayIndex(null)}
        />
      )}

      {/* Exercise Swap Modal */}
      {swapTarget && (
        <ExerciseSwapModal
          currentExercise={swapTarget.exercise}
          customExercises={customExercises}
          userInjuries={userInjuries}
          onSelectSwap={handleSwapExercise}
          onClose={() => setSwapTarget(null)}
        />
      )}

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  )
}
