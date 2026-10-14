import { useEffect, useState } from 'react'
import type {
  CustomExercise,
  DaySectionConfig,
  Exercise,
  ExerciseSection,
  ProgramDay,
  ProgramExercise,
  WorkoutProgram,
  WorkoutSplitType,
} from '../shared/types.ts'
import {
  DEFAULT_DAY_SECTIONS,
  PRESET_DAY_SECTIONS,
  WORKOUT_SPLIT_LABELS,
} from '../shared/types.ts'
import { navigationHistory } from '../../utils/navigationHistory.ts'
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
  shareRoutineFile,
} from './workoutUtils.ts'
import { Select } from '../../components/Select'
import { Toast } from '../../components/Toast'

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

  // Section customization state
  const [editingSection, setEditingSection] = useState<{
    dayIndex: number
    section: DaySectionConfig
  } | null>(null)
  const [sectionFormLabel, setSectionFormLabel] = useState('')
  const [sectionFormIcon, setSectionFormIcon] = useState('🏋️')

  const [deletingSection, setDeletingSection] = useState<{
    dayIndex: number
    section: DaySectionConfig
    exercisesCount: number
  } | null>(null)
  const [moveTargetSectionId, setMoveTargetSectionId] = useState<string>('')

  const [addingSectionModalDayIndex, setAddingSectionModalDayIndex] = useState<
    number | null
  >(null)
  const [newCustomSectionLabel, setNewCustomSectionLabel] = useState('')
  const [newCustomSectionIcon, setNewCustomSectionIcon] = useState('⭐')

  // Register modals with mobile back button / swipe-back navigation
  useEffect(() => {
    if (selectedExercise) {
      return navigationHistory.push('selectedExercise', () =>
        setSelectedExercise(null),
      )
    }
  }, [selectedExercise])

  useEffect(() => {
    if (swapTarget) {
      return navigationHistory.push('swapTarget', () => setSwapTarget(null))
    }
  }, [swapTarget])

  useEffect(() => {
    if (addingToDayIndex !== null) {
      return navigationHistory.push('addingExercise', () =>
        setAddingToDayIndex(null),
      )
    }
  }, [addingToDayIndex])

  useEffect(() => {
    if (editingSection) {
      return navigationHistory.push('editingSection', () =>
        setEditingSection(null),
      )
    }
  }, [editingSection])

  useEffect(() => {
    if (deletingSection) {
      return navigationHistory.push('deletingSection', () =>
        setDeletingSection(null),
      )
    }
  }, [deletingSection])

  useEffect(() => {
    if (addingSectionModalDayIndex !== null) {
      return navigationHistory.push('addingSectionModal', () =>
        setAddingSectionModalDayIndex(null),
      )
    }
  }, [addingSectionModalDayIndex])

  function getDaySections(day: ProgramDay): DaySectionConfig[] {
    return day.sections && day.sections.length > 0
      ? day.sections
      : DEFAULT_DAY_SECTIONS
  }

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

  function handleToggleSection(dayIndex: number, sectionId: string) {
    const key = `${dayIndex}_${sectionId}`
    setCollapsedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // --- Section Editing Handlers ---
  function handleOpenEditSection(
    dayIndex: number,
    secConfig: DaySectionConfig,
  ) {
    setEditingSection({ dayIndex, section: secConfig })
    setSectionFormLabel(secConfig.labelAr)
    setSectionFormIcon(secConfig.icon)
  }

  function handleConfirmSaveSection() {
    if (!editingSection || !onUpdateProgram || !sectionFormLabel.trim()) return
    const { dayIndex, section } = editingSection
    const newDays = program.days.map((day) => {
      if (day.dayIndex !== dayIndex) return day
      const currentSections = getDaySections(day)
      const updatedSections = currentSections.map((s) =>
        s.id === section.id
          ? { ...s, labelAr: sectionFormLabel.trim(), icon: sectionFormIcon }
          : s,
      )
      return { ...day, sections: updatedSections }
    })
    onUpdateProgram({ ...program, days: newDays })
    setEditingSection(null)
    setHomeToast('✓ تم تعديل مسمى القسم بنجاح!')
    setTimeout(() => setHomeToast(null), 2500)
  }

  // --- Section Deletion Handlers ---
  function handleOpenDeleteSection(
    dayIndex: number,
    secConfig: DaySectionConfig,
    exercisesCount: number,
  ) {
    setDeletingSection({ dayIndex, section: secConfig, exercisesCount })
    const day = program.days.find((d) => d.dayIndex === dayIndex)
    if (day) {
      const otherSections = getDaySections(day).filter(
        (s) => s.id !== secConfig.id,
      )
      setMoveTargetSectionId(otherSections[0]?.id || '')
    }
  }

  function handleConfirmDeleteSection(mode: 'delete_all' | 'move') {
    if (!deletingSection || !onUpdateProgram) return
    const { dayIndex, section } = deletingSection

    const newDays = program.days.map((day) => {
      if (day.dayIndex !== dayIndex) return day
      const currentSections = getDaySections(day)
      const updatedSections = currentSections.filter((s) => s.id !== section.id)

      let updatedExercises = day.exercises
      if (mode === 'delete_all') {
        updatedExercises = day.exercises.filter(
          (pe) => (pe.section || 'primary') !== section.id,
        )
      } else if (mode === 'move' && moveTargetSectionId) {
        updatedExercises = day.exercises.map((pe) =>
          (pe.section || 'primary') === section.id
            ? { ...pe, section: moveTargetSectionId }
            : pe,
        )
      }

      return {
        ...day,
        sections: updatedSections,
        exercises: updatedExercises,
      }
    })

    onUpdateProgram({ ...program, days: newDays })
    setDeletingSection(null)
    setHomeToast('✓ تم حذف القسم بنجاح!')
    setTimeout(() => setHomeToast(null), 2500)
  }

  // --- Section Addition Handlers ---
  function handleAddPresetSection(dayIndex: number, preset: DaySectionConfig) {
    if (!onUpdateProgram) return
    const newDays = program.days.map((day) => {
      if (day.dayIndex !== dayIndex) return day
      const currentSections = getDaySections(day)
      if (currentSections.some((s) => s.id === preset.id)) return day
      return {
        ...day,
        sections: [...currentSections, { ...preset }],
      }
    })
    onUpdateProgram({ ...program, days: newDays })
    setAddingSectionModalDayIndex(null)
    setHomeToast(`✓ تمت إضافة (${preset.labelAr}) بنجاح!`)
    setTimeout(() => setHomeToast(null), 2500)
  }

  function handleAddCustomSection(dayIndex: number) {
    if (!onUpdateProgram || !newCustomSectionLabel.trim()) return
    const customId = `custom_sec_${Date.now()}`
    const newSec: DaySectionConfig = {
      id: customId,
      labelAr: newCustomSectionLabel.trim(),
      icon: newCustomSectionIcon,
    }
    const newDays = program.days.map((day) => {
      if (day.dayIndex !== dayIndex) return day
      const currentSections = getDaySections(day)
      return {
        ...day,
        sections: [...currentSections, newSec],
      }
    })
    onUpdateProgram({ ...program, days: newDays })
    setNewCustomSectionLabel('')
    setAddingSectionModalDayIndex(null)
    setHomeToast(`✓ تمت إضافة (${newSec.labelAr}) بنجاح!`)
    setTimeout(() => setHomeToast(null), 2500)
  }

  // --- Routine Sharing / Export Handlers ---
  async function handleDirectShareRoutine() {
    const title = program.splitType
      ? WORKOUT_SPLIT_LABELS[program.splitType]
      : 'جدول تمارين مخصص'
    setHomeToast('جاري فتح خيارات المشاركة...')
    const result = await shareRoutineFile(program, title)
    if (result.shared) {
      setHomeToast('✓ تمت المشاركة بنجاح! 📲')
      setTimeout(() => setHomeToast(null), 3000)
    } else {
      setHomeToast(null)
    }
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
        ? '🔒 تم قفل الجدول لمنع التعديلات التلقائية'
        : '🔓 تم فتح الجدول للتعديل والتوليد التلقائي',
    )
    setTimeout(() => setHomeToast(null), 3000)
  }

  function handlePromptDeleteProgram() {
    if (!onDeleteProgram) return
    const ok = window.confirm(
      '⚠️ هل أنت متأكد من رغبتك في حذف جدول التمارين الحالي بالكامل؟\nيمكنك إنشاء جدول جديد أو اختيار أيام جديدة بعد الحذف.',
    )
    if (ok) {
      onDeleteProgram()
    }
  }

  return (
    <div className="weekly-plan">
      <Toast message={homeToast} onDismiss={() => setHomeToast(null)} />

      {/* Program Header */}
      <div className="weekly-plan__header">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div>
            <h2>
              {program.splitType
                ? WORKOUT_SPLIT_LABELS[program.splitType]
                : 'برنامج التدريب الأسبوعي'}
            </h2>
            <div className="chips-row" style={{ marginTop: '6px', gap: '6px' }}>
              <span className="chip">
                {program.days.length} أيام تمرين أسبوعياً
              </span>
              {program.isCustom && (
                <span
                  className="chip"
                  style={{
                    background: '#fef3c7',
                    color: '#92400e',
                    border: '1px solid #fde68a',
                  }}
                >
                  ⭐ جدول مخصص ومحمي
                </span>
              )}
              {program.isLocked && (
                <span
                  className="chip"
                  style={{
                    background: '#dcfce7',
                    color: '#166534',
                    border: '1px solid #bbf7d0',
                  }}
                >
                  🔒 مقفل
                </span>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            {onOpenScheduleModal && (
              <button
                type="button"
                className="chip-btn"
                onClick={onOpenScheduleModal}
                style={{
                  fontWeight: 700,
                  fontSize: '12px',
                  borderColor: 'var(--accent)',
                  color: 'var(--accent)',
                }}
                title="تحديد الأيام التي تبدأ فيها التمارين خلال الأسبوع"
              >
                🗓️ أيامي
              </button>
            )}

            {onOpenVaultModal && (
              <button
                type="button"
                className="chip-btn"
                onClick={onOpenVaultModal}
                style={{
                  fontWeight: 700,
                  fontSize: '12px',
                }}
                title="فتح حافظة الجداول المحفوظة"
              >
                📁 الحافظة
              </button>
            )}

            <button
              type="button"
              className="chip-btn"
              onClick={handleDirectShareRoutine}
              style={{
                fontWeight: 700,
                fontSize: '12px',
                borderColor: '#2563eb',
                color: '#1d4ed8',
                background: '#eff6ff',
              }}
              title="مشاركة جدول التمارين مباشرة عبر واتساب أو تليجرام مع مستخدم آخر"
            >
              📲 مشاركة
            </button>

            <button
              type="button"
              className="chip-btn"
              onClick={() => {
                const title = program.splitType
                  ? WORKOUT_SPLIT_LABELS[program.splitType]
                  : 'جدول تمارين مخصص'
                downloadRoutineFile(program, title)
                setHomeToast('✓ تم تصدير ملف جدول التمارين بنجاح! 💾')
                setTimeout(() => setHomeToast(null), 3000)
              }}
              style={{
                fontWeight: 700,
                fontSize: '12px',
                borderColor: 'var(--accent)',
              }}
              title="تصدير جدول التمارين وحفظه كملف على هاتفك"
            >
              💾 تنزيل
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

        {/* Change Split Type Dropdown */}
        {!program.isCustom && onUpdateProgram && (
          <div style={{ marginTop: '12px', width: '100%' }}>
            <Select
              id="split-type-select"
              label="تغيير النظام التلقائي:"
              value={program.splitType || 'ppl'}
              onChange={(val) => {
                const newSplit = val as WorkoutSplitType
                const newProg = generateProgram({
                  goal: program.primaryGoal,
                  trainingDaysPerWeek: program.trainingDaysPerWeek,
                  splitType: newSplit,
                  injuries: userInjuries,
                  customExercises,
                })
                onUpdateProgram(newProg)
              }}
              options={Object.entries(WORKOUT_SPLIT_LABELS).map(
                ([val, label]) => ({
                  value: val,
                  labelAr: label,
                }),
              )}
              sheetTitle="اختر النظام التدريبي التلقائي"
            />
          </div>
        )}
      </div>

      {/* Days List */}
      <div className="weekly-plan__days">
        {program.days.map((day) => {
          const daySections = getDaySections(day)

          return (
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
                        className="ghost-primary tiny"
                        onClick={() => {
                          if (onUpdateProgram && editingFocusText.trim()) {
                            const newDays = program.days.map((d) =>
                              d.dayIndex === day.dayIndex
                                ? { ...d, focus: editingFocusText.trim() }
                                : d,
                            )
                            onUpdateProgram({ ...program, days: newDays })
                          }
                          setEditingFocusDayIndex(null)
                        }}
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
                        onClick={() => handleConvertToHomeWorkout(day)}
                        title="تحويل تمارين اليوم لتمارين منزلية تعتمد على وزن الجسم والأدوات البسيطة"
                      >
                        🏠 تحويل لمنزلي
                      </button>
                      <button
                        type="button"
                        className="ghost-primary tiny"
                        onClick={() => {
                          setAddingSection(daySections[0]?.id || 'primary')
                          setAddingToDayIndex(day.dayIndex)
                        }}
                      >
                        + إضافة تمرين
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Dynamic Collapsible Exercise Sections */}
              <div
                className="weekly-plan__sections-container"
                style={{ marginTop: '10px' }}
              >
                {daySections.map((secConfig) => {
                  const secKey = secConfig.id
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
                        onClick={() =>
                          handleToggleSection(day.dayIndex, secKey)
                        }
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
                            <>
                              <button
                                type="button"
                                className="ghost-primary tiny"
                                style={{
                                  padding: '2px 8px',
                                  fontSize: '11px',
                                }}
                                onClick={() => {
                                  setAddingSection(secKey)
                                  setAddingToDayIndex(day.dayIndex)
                                }}
                                title={`إضافة تمرين إلى قسم ${secConfig.labelAr}`}
                              >
                                + إضافة
                              </button>
                              <button
                                type="button"
                                className="ghost tiny"
                                style={{
                                  padding: '2px 6px',
                                  fontSize: '11px',
                                  border: 'none',
                                }}
                                onClick={() =>
                                  handleOpenEditSection(day.dayIndex, secConfig)
                                }
                                title="تعديل اسم هذا القسم"
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                className="ghost-danger tiny"
                                style={{
                                  padding: '2px 6px',
                                  fontSize: '11px',
                                  border: 'none',
                                }}
                                onClick={() =>
                                  handleOpenDeleteSection(
                                    day.dayIndex,
                                    secConfig,
                                    secItems.length,
                                  )
                                }
                                title="حذف هذا القسم بالكامل"
                              >
                                🗑️
                              </button>
                            </>
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
                              style={{
                                margin: 0,
                                padding: 0,
                                listStyle: 'none',
                              }}
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
                                      padding: '8px 10px',
                                      borderRadius: '8px',
                                      background: 'var(--card-bg)',
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
                                      onClick={() =>
                                        handleOpenDetail(pe.exerciseId)
                                      }
                                    >
                                      <div
                                        style={{
                                          width: '42px',
                                          height: '42px',
                                          borderRadius: '6px',
                                          overflow: 'hidden',
                                          flexShrink: 0,
                                        }}
                                      >
                                        <ExerciseVisual
                                          category={ex.category}
                                          exerciseId={ex.id}
                                          exerciseName={ex.nameAr}
                                          imageUrl={ex.imageUrl}
                                          size="small"
                                        />
                                      </div>
                                      <div>
                                        <strong
                                          style={{
                                            fontSize: '13px',
                                            display: 'block',
                                          }}
                                        >
                                          {ex.nameAr}
                                        </strong>
                                        <span
                                          className="muted"
                                          style={{ fontSize: '11px' }}
                                        >
                                          {pe.sets} مجموعات × {pe.reps} تكرار
                                        </span>
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
                                          <div
                                            style={{
                                              width: '100%',
                                              margin: '4px 0',
                                            }}
                                          >
                                            <Select
                                              id={`move-ex-${day.dayIndex}-${originalIdx}`}
                                              aria-label="نقل التمرين لقسم آخر"
                                              value={pe.section || 'primary'}
                                              onChange={(val) =>
                                                handleChangeExerciseSection(
                                                  day.dayIndex,
                                                  originalIdx,
                                                  val as ExerciseSection,
                                                )
                                              }
                                              options={daySections.map(
                                                (sec) => ({
                                                  value: sec.id,
                                                  labelAr: sec.labelAr,
                                                }),
                                              )}
                                              sheetTitle="نقل التمرين إلى قسم:"
                                            />
                                          </div>

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

              {/* Add New Section Dropdown Button */}
              {onUpdateProgram && (
                <div
                  style={{
                    marginTop: '8px',
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                  }}
                >
                  <button
                    type="button"
                    className="ghost-primary tiny"
                    onClick={() => setAddingSectionModalDayIndex(day.dayIndex)}
                    style={{
                      fontSize: '12px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      borderStyle: 'dashed',
                    }}
                  >
                    ➕ إضافة قائمة منسدلة (قسم جديد)
                  </button>
                </div>
              )}
            </div>
          )
        })}
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

      {/* Edit Section Modal */}
      {editingSection && (
        <div
          className="modal-backdrop"
          onClick={() => setEditingSection(null)}
          style={{ zIndex: 10000 }}
        >
          <div
            className="card modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '420px', width: '92%' }}
          >
            <h3>✏️ تعديل مسمى القسم</h3>
            <div style={{ marginTop: '12px' }}>
              <label
                className="label"
                style={{ display: 'block', marginBottom: '6px' }}
              >
                اسم القسم:
              </label>
              <input
                type="text"
                value={sectionFormLabel}
                onChange={(e) => setSectionFormLabel(e.target.value)}
                placeholder="مثال: تمارين الإحماء، كارديو، تمارين القوة..."
                style={{ width: '100%' }}
                autoFocus
              />
            </div>
            <div style={{ marginTop: '12px' }}>
              <label
                className="label"
                style={{ display: 'block', marginBottom: '6px' }}
              >
                الأيقونة (Emoji):
              </label>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginTop: '6px',
                }}
              >
                {[
                  '🔥',
                  '🏋️',
                  '🏃',
                  '🧘',
                  '🍫',
                  '🦾',
                  '⚡',
                  '🎯',
                  '✨',
                  '💪',
                ].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={
                      sectionFormIcon === emoji ? 'button-primary' : 'ghost'
                    }
                    style={{ fontSize: '18px', padding: '6px 12px' }}
                    onClick={() => setSectionFormIcon(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="actions-row" style={{ marginTop: '20px' }}>
              <button
                type="button"
                className="button-primary"
                onClick={handleConfirmSaveSection}
                disabled={!sectionFormLabel.trim()}
              >
                حفظ التعديل
              </button>
              <button type="button" onClick={() => setEditingSection(null)}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Section Modal */}
      {deletingSection && (
        <div
          className="modal-backdrop"
          onClick={() => setDeletingSection(null)}
          style={{ zIndex: 10000 }}
        >
          <div
            className="card modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '460px', width: '92%' }}
          >
            <h3 style={{ color: 'var(--danger)' }}>
              🗑️ حذف قسم ({deletingSection.section.icon}{' '}
              {deletingSection.section.labelAr})
            </h3>

            {deletingSection.exercisesCount > 0 ? (
              <div>
                <p
                  style={{
                    marginTop: '10px',
                    fontSize: '13.5px',
                    lineHeight: '1.6',
                  }}
                >
                  ⚠️ يحتوي هذا القسم حالياً على{' '}
                  <strong>{deletingSection.exercisesCount} تمارين</strong>. ماذا
                  تريد أن تفعل بهذه التمارين؟
                </p>

                {/* Option 1: Move exercises */}
                {(() => {
                  const day = program.days.find(
                    (d) => d.dayIndex === deletingSection.dayIndex,
                  )
                  const otherSections = day
                    ? getDaySections(day).filter(
                        (s) => s.id !== deletingSection.section.id,
                      )
                    : []

                  if (otherSections.length === 0) return null

                  return (
                    <div
                      style={{
                        margin: '14px 0',
                        padding: '12px',
                        background: 'var(--card-subtle)',
                        borderRadius: '10px',
                        border: '1px solid var(--line)',
                      }}
                    >
                      <Select
                        id="move-target-section-select"
                        label="➡️ خيار 1: نقل التمارين إلى قسم آخر:"
                        value={moveTargetSectionId}
                        onChange={(val) => setMoveTargetSectionId(val)}
                        options={otherSections.map((s) => ({
                          value: s.id,
                          labelAr: s.labelAr,
                        }))}
                        sheetTitle="اختر القسم البديل لنقل التمارين"
                      />
                      <button
                        type="button"
                        className="button-primary"
                        style={{ marginTop: '10px', width: '100%' }}
                        onClick={() => handleConfirmDeleteSection('move')}
                      >
                        نقل التمارين وحذف هذا القسم فقط
                      </button>
                    </div>
                  )
                })()}

                {/* Option 2: Delete all */}
                <div
                  style={{
                    margin: '14px 0',
                    padding: '12px',
                    background: 'rgba(239, 68, 68, 0.06)',
                    borderRadius: '10px',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                  }}
                >
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 700,
                      marginBottom: '6px',
                      color: 'var(--danger)',
                    }}
                  >
                    ⚠️ خيار 2: حذف القسم مع جميع تمارينه:
                  </label>
                  <button
                    type="button"
                    className="danger"
                    style={{ width: '100%' }}
                    onClick={() => handleConfirmDeleteSection('delete_all')}
                  >
                    حذف القسم وجميع التمارين ({deletingSection.exercisesCount}{' '}
                    تمارين) نهائياً
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ marginTop: '10px', fontSize: '14px' }}>
                  القسم فارغ ولا يحتوي على أي تمارين. هل أنت متأكد من حذفه من
                  هذا اليوم؟
                </p>
                <div className="actions-row" style={{ marginTop: '20px' }}>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => handleConfirmDeleteSection('delete_all')}
                  >
                    تأكيد حذف القسم
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingSection(null)}
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}

            {deletingSection.exercisesCount > 0 && (
              <div style={{ marginTop: '14px', textAlign: 'center' }}>
                <button
                  type="button"
                  className="ghost tiny"
                  onClick={() => setDeletingSection(null)}
                >
                  إلغاء التراجع
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add New Section Modal */}
      {addingSectionModalDayIndex !== null && (
        <div
          className="modal-backdrop"
          onClick={() => setAddingSectionModalDayIndex(null)}
          style={{ zIndex: 10000 }}
        >
          <div
            className="card modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '460px', width: '92%' }}
          >
            <h3>➕ إضافة قائمة منسدلة (قسم جديد)</h3>
            <p
              className="muted"
              style={{ fontSize: '13px', margin: '4px 0 14px' }}
            >
              اختر قالباً جاهزاً أو أدخل اسماً مخصصاً للقسم الجديد:
            </p>

            {/* Presets */}
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              {PRESET_DAY_SECTIONS.map((preset) => {
                const targetDay = program.days.find(
                  (d) => d.dayIndex === addingSectionModalDayIndex,
                )
                const alreadyExists = targetDay
                  ? getDaySections(targetDay).some((s) => s.id === preset.id)
                  : false

                return (
                  <button
                    key={preset.id}
                    type="button"
                    className="ghost"
                    disabled={alreadyExists}
                    onClick={() =>
                      handleAddPresetSection(addingSectionModalDayIndex, preset)
                    }
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      textAlign: 'right',
                      opacity: alreadyExists ? 0.5 : 1,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span style={{ fontSize: '18px' }}>{preset.icon}</span>
                      <span style={{ fontWeight: 700, fontSize: '13.5px' }}>
                        {preset.labelAr}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '12px',
                        color: alreadyExists ? 'var(--muted)' : 'var(--accent)',
                      }}
                    >
                      {alreadyExists ? 'مضاف بالفعل' : '+ إضافة'}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Custom section inputs */}
            <div
              style={{
                marginTop: '18px',
                paddingTop: '14px',
                borderTop: '1px solid var(--line)',
              }}
            >
              <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>
                أو إنشاء قسم مخصص:
              </h4>
              <input
                type="text"
                value={newCustomSectionLabel}
                onChange={(e) => setNewCustomSectionLabel(e.target.value)}
                placeholder="مثال: تمارين الذراعين، تدريبات الهيت، إلخ..."
                style={{ width: '100%', marginBottom: '8px' }}
              />
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginBottom: '14px',
                }}
              >
                {[
                  '⭐',
                  '🎯',
                  '🔥',
                  '🏋️',
                  '🏃',
                  '🧘',
                  '🍫',
                  '🦾',
                  '⚡',
                  '💪',
                ].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={
                      newCustomSectionIcon === emoji
                        ? 'button-primary'
                        : 'ghost'
                    }
                    style={{ fontSize: '18px', padding: '4px 10px' }}
                    onClick={() => setNewCustomSectionIcon(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="button-primary"
                style={{ width: '100%' }}
                disabled={!newCustomSectionLabel.trim()}
                onClick={() =>
                  handleAddCustomSection(addingSectionModalDayIndex)
                }
              >
                ➕ إضافة القسم المخصص
              </button>
            </div>

            <div style={{ marginTop: '14px', textAlign: 'center' }}>
              <button
                type="button"
                className="ghost tiny"
                onClick={() => setAddingSectionModalDayIndex(null)}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
