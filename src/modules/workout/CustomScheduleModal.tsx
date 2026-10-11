import { useState } from 'react'
import type { Goal, ProgramDay, WorkoutProgram } from '../shared/types.ts'

interface CustomScheduleModalProps {
  primaryGoal: Goal
  onSaveSchedule: (program: WorkoutProgram) => void
  onClose: () => void
}

const WEEKDAYS: { dayIndex: number; nameAr: string }[] = [
  { dayIndex: 6, nameAr: 'السبت' },
  { dayIndex: 0, nameAr: 'الأحد' },
  { dayIndex: 1, nameAr: 'الإثنين' },
  { dayIndex: 2, nameAr: 'الثلاثاء' },
  { dayIndex: 3, nameAr: 'الأربعاء' },
  { dayIndex: 4, nameAr: 'الخميس' },
  { dayIndex: 5, nameAr: 'الجمعة' },
]

export function CustomScheduleModal({
  primaryGoal,
  onSaveSchedule,
  onClose,
}: CustomScheduleModalProps) {
  const [scheduleTitle, setScheduleTitle] = useState('جدولي التدريبي الخاص')
  const [selectedDayIndexes, setSelectedDayIndexes] = useState<number[]>([
    6, 1, 3, 4,
  ]) // Default: Sat, Mon, Wed, Thu
  const [dayFocuses, setDayFocuses] = useState<Record<number, string>>({
    6: 'عضلات الصدر والبايسبس',
    0: 'راحة واستشفاء',
    1: 'عضلات الظهر والترايسبس',
    2: 'راحة واستشفاء',
    3: 'عضلات الأكتاف والبطن',
    4: 'عضلات الأرجل والسمانة',
    5: 'راحة واستشفاء',
  })

  function toggleDay(dayIndex: number) {
    setSelectedDayIndexes((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex],
    )
  }

  function handleFocusChange(dayIndex: number, text: string) {
    setDayFocuses((prev) => ({
      ...prev,
      [dayIndex]: text,
    }))
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (selectedDayIndexes.length === 0) {
      alert('يرجى اختيار يوم واحد على الأقل للتمرين!')
      return
    }

    // Sort days starting with Saturday (index 6, then 0..5)
    const sortedDays = WEEKDAYS.filter((w) =>
      selectedDayIndexes.includes(w.dayIndex),
    )

    const programDays: ProgramDay[] = sortedDays.map((w, orderIdx) => {
      const focusText =
        dayFocuses[w.dayIndex]?.trim() || `تمرين ${orderIdx + 1}`
      return {
        dayIndex: w.dayIndex,
        labelAr: `يوم ${w.nameAr}`,
        focus: focusText,
        exercises: [],
      }
    })

    const newProgram: WorkoutProgram = {
      id: `custom-program-${Date.now()}`,
      createdAt: Date.now(),
      primaryGoal,
      trainingDaysPerWeek: selectedDayIndexes.length,
      splitType: 'ppl',
      days: programDays,
      isCustom: true,
      isLocked: true,
    }

    onSaveSchedule(newProgram)
    onClose()
  }

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
    >
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '540px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '16px',
          padding: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            borderBottom: '1px solid var(--line)',
            paddingBottom: '12px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
            🗓️ تصميم وتخصيص جدول التمارين بالأيام
          </h2>
          <button
            type="button"
            className="ghost-secondary tiny"
            onClick={onClose}
            style={{ fontSize: '18px', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleCreate}>
          {/* Schedule Title */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontWeight: 700,
                fontSize: '13px',
                marginBottom: '4px',
              }}
            >
              اسم الجدول التدريبي:
            </label>
            <input
              type="text"
              className="field-input"
              value={scheduleTitle}
              onChange={(e) => setScheduleTitle(e.target.value)}
              placeholder="مثال: جدولي الخاص (4 أيام) أو جدول الضخامة..."
              required
              style={{ width: '100%', padding: '10px' }}
            />
          </div>

          {/* Weekday Selection */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontWeight: 700,
                fontSize: '13px',
                marginBottom: '6px',
              }}
            >
              حدد الأيام التي تريد التمرين فيها ({selectedDayIndexes.length}{' '}
              أيام مختارة):
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))',
                gap: '6px',
              }}
            >
              {WEEKDAYS.map((w) => {
                const isSelected = selectedDayIndexes.includes(w.dayIndex)
                return (
                  <button
                    key={w.dayIndex}
                    type="button"
                    onClick={() => toggleDay(w.dayIndex)}
                    style={{
                      padding: '10px 4px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      border: isSelected
                        ? '2px solid var(--accent)'
                        : '1.5px solid var(--line)',
                      background: isSelected
                        ? 'var(--accent)'
                        : 'var(--card-subtle)',
                      color: isSelected ? '#ffffff' : 'var(--ink)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {w.nameAr}
                    {isSelected && <span style={{ display: 'block' }}>✓</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Customized Day Focus */}
          {selectedDayIndexes.length > 0 && (
            <div
              style={{
                background: 'var(--card-subtle)',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid var(--line)',
                marginBottom: '18px',
              }}
            >
              <h4 style={{ margin: '0 0 10px', fontSize: '13px' }}>
                💪 حدد استهداف كل يوم من الأيام المختارة:
              </h4>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  maxHeight: '220px',
                  overflowY: 'auto',
                }}
              >
                {WEEKDAYS.filter((w) =>
                  selectedDayIndexes.includes(w.dayIndex),
                ).map((w) => (
                  <div
                    key={w.dayIndex}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'var(--card-bg)',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--line)',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: '13px',
                        minWidth: '55px',
                        color: 'var(--accent)',
                      }}
                    >
                      {w.nameAr}:
                    </span>
                    <input
                      type="text"
                      className="field-input"
                      value={dayFocuses[w.dayIndex] || ''}
                      onChange={(e) =>
                        handleFocusChange(w.dayIndex, e.target.value)
                      }
                      placeholder="مثال: صدر وبايسبس، ظهر وتراي..."
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        fontSize: '12.5px',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              padding: '10px',
              background: 'var(--accent-soft)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'var(--accent)',
              marginBottom: '16px',
            }}
          >
            🔒 سيتم قفل الجدول لحمايته تلقائياً ولن يتم استبداله بأي توليد
            عشوائي. يمكنك بعد ذلك إضافة وتخصيص تمارين كل يوم بكل حرية!
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="submit"
              className="button-primary"
              style={{ flex: 1, padding: '12px', fontWeight: 800 }}
            >
              🚀 إنشاء وترتيب الجدول التدريبي
            </button>
            <button
              type="button"
              className="ghost"
              onClick={onClose}
              style={{ padding: '12px 16px' }}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
