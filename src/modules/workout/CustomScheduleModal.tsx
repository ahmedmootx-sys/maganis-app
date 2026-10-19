import { useState, useMemo } from 'react'
import type { Goal, ProgramDay, WorkoutProgram } from '../shared/types.ts'
import { getOrderedWeekdays } from '../../lib/dateUtils.ts'
import { ToggleChipRow } from '../../components/ToggleChipRow.tsx'
import { TopBar } from '../../components/TopBar.tsx'
import { Callout } from '../../components/Callout.tsx'

export interface CustomScheduleModalProps {
  primaryGoal: Goal
  weekStartDay?: number
  profileDays?: number
  onSaveSchedule: (program: WorkoutProgram) => void
  onClose: () => void
}

export function CustomScheduleModal({
  primaryGoal,
  weekStartDay = 6,
  profileDays,
  onSaveSchedule,
  onClose,
}: CustomScheduleModalProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [scheduleTitle, setScheduleTitle] = useState('جدولي التدريبي الخاص')
  const initialDays = useMemo(() => {
    const defaultDaysByCount: Record<number, number[]> = {
      1: [6],
      2: [6, 2],
      3: [6, 1, 3],
      4: [6, 1, 3, 4],
      5: [6, 0, 1, 3, 4],
      6: [6, 0, 1, 2, 3, 4],
      7: [6, 0, 1, 2, 3, 4, 5],
    }
    return profileDays && defaultDaysByCount[profileDays]
      ? defaultDaysByCount[profileDays]
      : [6, 1, 3, 4]
  }, [profileDays])
  const [selectedDayIndexes, setSelectedDayIndexes] = useState<number[]>(initialDays)
  const [dayFocuses, setDayFocuses] = useState<Record<number, string>>({
    6: 'عضلات الصدر والبايسبس',
    0: 'راحة واستشفاء',
    1: 'عضلات الظهر والترايسبس',
    2: 'راحة واستشفاء',
    3: 'عضلات الأكتاف والبطن',
    4: 'عضلات الأرجل والسمانة',
    5: 'راحة واستشفاء',
  })
  const [error, setError] = useState('')

  const orderedWeekdays = useMemo(
    () => getOrderedWeekdays(weekStartDay),
    [weekStartDay],
  )

  function handleFocusChange(dayIndex: number, text: string) {
    setDayFocuses((prev) => ({
      ...prev,
      [dayIndex]: text,
    }))
  }

  function handleCreate() {
    if (!scheduleTitle.trim()) {
      setError('يرجى إدخال اسم للجدول التدريبي')
      setCurrentStep(1)
      return
    }

    if (selectedDayIndexes.length === 0) {
      setError('يرجى اختيار يوم واحد على الأقل للتمرين!')
      setCurrentStep(2)
      return
    }

    // Sort days according to weekStartDay order
    const sortedDays = orderedWeekdays.filter((w) =>
      selectedDayIndexes.includes(w.dayIndex),
    )

    const programDays: ProgramDay[] = sortedDays.map((w, orderIdx) => {
      const focusText =
        dayFocuses[w.dayIndex]?.trim() || `تمرين ${orderIdx + 1}`
      return {
        dayIndex: w.dayIndex,
        labelAr: `يوم ${w.full}`,
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
      className="custom-schedule-modal modal-fullscreen"
      dir="rtl"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        background: 'var(--bg)',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        height: '100dvh',
        maxHeight: '100dvh',
        overflow: 'hidden',
      }}
    >
      {/* TopBar with Back */}
      <TopBar
        title="جدولي بالأيام"
        subtitle={`خطوة ${currentStep} من 3`}
        onBack={
          currentStep > 1
            ? () => setCurrentStep((prev) => (prev - 1) as 1 | 2)
            : onClose
        }
      />

      <div
        className="screen-content custom-schedule-content"
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '16px',
          paddingBottom: 'var(--page-end, 16px)',
          maxWidth: '720px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Step Indicator */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginBottom: '4px',
          }}
        >
          {[
            { step: 1, title: '1. التسمية' },
            { step: 2, title: '2. الأيام' },
            { step: 3, title: '3. التركيز' },
          ].map((s) => (
            <div
              key={s.step}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div
                style={{
                  height: '4px',
                  borderRadius: '999px',
                  background:
                    currentStep >= s.step ? 'var(--accent)' : 'var(--line)',
                  transition: 'background 0.2s ease',
                }}
              />
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: currentStep === s.step ? 700 : 500,
                  color:
                    currentStep === s.step ? 'var(--accent)' : 'var(--muted)',
                  textAlign: 'center',
                }}
              >
                {s.title}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div
            style={{
              background: 'var(--danger-soft)',
              color: 'var(--danger)',
              border: '1px solid var(--danger-line)',
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            {error}
          </div>
        )}

        {/* STEP 1: Name Field */}
        {currentStep === 1 && (
          <section className="screen-section">
            <div className="section-title">
              <span>اسم الجدول التدريبي</span>
            </div>
            <div
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                padding: '16px',
              }}
            >
              <div className="field">
                <label htmlFor="designer-name">اسم الجدول (مطلوب)</label>
                <input
                  id="designer-name"
                  type="text"
                  className="field-input"
                  value={scheduleTitle}
                  onChange={(e) => {
                    setScheduleTitle(e.target.value)
                    setError('')
                  }}
                  placeholder="مثال: جدولي الخاص (4 أيام) أو جدول الضخامة..."
                  required
                  dir="rtl"
                  autoFocus
                />
              </div>
            </div>
          </section>
        )}

        {/* STEP 2: ONE row of 7 equal-width ToggleChips + count */}
        {currentStep === 2 && (
          <section className="screen-section">
            <div className="section-title">
              <span>أيام التمرين في الأسبوع</span>
              <span className="section-title-counter">
                {selectedDayIndexes.length} أيام مختارة
              </span>
            </div>
            <div
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                padding: '16px',
              }}
            >
              <div className="field">
                <label>اختر أيام التمرين</label>
                <ToggleChipRow
                  options={orderedWeekdays.map((w) => ({
                    value: w.dayIndex,
                    label: w.short,
                  }))}
                  selectedValues={selectedDayIndexes}
                  onChange={(newSelected) => {
                    setSelectedDayIndexes(newSelected)
                    setError('')
                  }}
                  aria-label="أيام التمرين في الأسبوع"
                />
              </div>

              <div
                style={{
                  fontSize: '12.5px',
                  color: 'var(--muted)',
                  lineHeight: '1.4',
                }}
              >
                تم تحديد {selectedDayIndexes.length} أيام تمرين، وباقي أيام
                الأسبوع ستكون أيام راحة واستشفاء.
              </div>

              {profileDays && selectedDayIndexes.length !== profileDays && (
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--accent)',
                    background: 'var(--accent-soft)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--accent-line)',
                  }}
                >
                  تنبيه: اخترت {selectedDayIndexes.length} أيام بينما ملفك
                  الشخصي محدد بـ {profileDays} أيام تدريب.
                </div>
              )}
            </div>
          </section>
        )}

        {/* STEP 3: ListRow per selected day with single-line field + quick chips + Callout + Primary */}
        {currentStep === 3 && (
          <section className="screen-section">
            <div className="section-title">
              <span>تحديد التركيز العضلي لكل يوم</span>
              <span className="section-title-counter">
                {selectedDayIndexes.length} أيام
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {orderedWeekdays
                .filter((w) => selectedDayIndexes.includes(w.dayIndex))
                .map((w) => (
                  <div
                    key={w.dayIndex}
                    className="card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      padding: '12px 14px',
                    }}
                  >
                    <label
                      htmlFor={`focus-${w.dayIndex}`}
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: 'var(--ink)',
                      }}
                    >
                      يوم {w.full}
                    </label>
                    <input
                      id={`focus-${w.dayIndex}`}
                      type="text"
                      className="field-input"
                      value={dayFocuses[w.dayIndex] || ''}
                      onChange={(e) =>
                        handleFocusChange(w.dayIndex, e.target.value)
                      }
                      placeholder="مثال: عضلات الصدر والترايسبس..."
                      dir="rtl"
                      style={{
                        width: '100%',
                        height: '42px',
                        lineHeight: '1.4',
                        boxSizing: 'border-box',
                      }}
                    />
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                        marginTop: '2px',
                      }}
                    >
                      {[
                        'صدر وباي',
                        'ظهر وتراي',
                        'أكتاف وبطن',
                        'أرجل وسمانة',
                        'علوي',
                        'سفلي',
                        'جسم كامل',
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() =>
                            handleFocusChange(w.dayIndex, suggestion)
                          }
                          style={{
                            fontSize: '11px',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            border: '1px solid var(--line)',
                            background:
                              dayFocuses[w.dayIndex] === suggestion
                                ? 'var(--accent-soft)'
                                : 'var(--card-subtle)',
                            color:
                              dayFocuses[w.dayIndex] === suggestion
                                ? 'var(--accent)'
                                : 'var(--ink)',
                            cursor: 'pointer',
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>

            {/* Callout explaining lock */}
            <Callout variant="info" title="قفل وحماية الجدول">
              سيتم قفل الجدول التدريبي تلقائياً لحمايته من أي استبدال عشوائي أو
              توليد آلي. يمكنك بعد ذلك إضافة وتعديل تمارين كل يوم بكل حرية.
            </Callout>

          </section>
        )}
      </div>

      {/* Docked Wizard Footer (<= 72px, grid row 3) */}
      <div
        className="wizard-footer"
        data-testid="wizard-footer"
        style={{
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-divider)',
          padding: '8px 16px calc(env(safe-area-inset-bottom, 0px) + 8px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          maxWidth: '720px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {error && (
          <div
            style={{
              fontSize: '12px',
              color: 'var(--color-accent)',
              textAlign: 'center',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '1.2',
            }}
          >
            {error}
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center' }}>
          {currentStep > 1 && (
            <button
              type="button"
              className="ghost-secondary"
              onClick={() => setCurrentStep((prev) => (prev === 3 ? 2 : 1))}
              style={{ flex: 1, height: '44px' }}
            >
              رجوع
            </button>
          )}
          <button
            type="button"
            className="button-primary"
            style={{ flex: currentStep > 1 ? 2 : 1, height: '44px' }}
            disabled={currentStep === 2 && selectedDayIndexes.length === 0}
            onClick={() => {
              if (currentStep === 1) {
                if (!scheduleTitle.trim()) {
                  setError('يرجى إدخال اسم الجدول')
                  return
                }
                setError('')
                setCurrentStep(2)
              } else if (currentStep === 2) {
                if (selectedDayIndexes.length === 0) {
                  setError('يرجى اختيار يوم واحد على الأقل')
                  return
                }
                setError('')
                setCurrentStep(3)
              } else {
                handleCreate()
              }
            }}
          >
            {currentStep === 1
              ? 'التالي: اختيار الأيام'
              : currentStep === 2
                ? 'التالي: تركيز الأيام'
                : 'إنشاء الجدول'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomScheduleModal
