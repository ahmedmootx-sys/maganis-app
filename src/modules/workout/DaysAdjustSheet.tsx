import { useState } from 'react'
import type { WorkoutProgram, ProgramDay } from '../shared/types.ts'
import type { UserProfile } from '../onboarding/types.ts'
import { Sheet, Button, Choice, Callout, Select } from '../../ui'
import {
  getOrDeriveSchedule,
  type ScheduleSlotType,
} from './scheduleManager.ts'

export interface DaysAdjustSheetProps {
  isOpen: boolean
  onClose: () => void
  program: WorkoutProgram
  profile: UserProfile
  onSave: (
    updatedProgram: WorkoutProgram,
    updatedProfileSchedule: Record<number, ScheduleSlotType>,
  ) => void
  showToast: (msg: string) => void
}

export type AddDayOption = 'empty_strength' | 'copy_existing' | 'cardio'

interface PendingAddDay {
  dayNumber: number
  type: AddDayOption
  sourceDayIndex?: number
  name: string
}

export function DaysAdjustSheet({
  isOpen,
  onClose,
  program,
  profile,
  onSave,
  showToast,
}: DaysAdjustSheetProps) {
  const targetDays = profile.trainingDaysPerWeek ?? 4
  const currentStrengthDays = program.days.filter((d) => d.kind !== 'cardio')
  const currentStrengthCount = currentStrengthDays.length
  const isIncreasing = targetDays > currentStrengthCount
  const isDecreasing = targetDays < currentStrengthCount
  const diff = Math.abs(targetDays - currentStrengthCount)

  const [pendingAdds, setPendingAdds] = useState<PendingAddDay[]>(() => {
    if (!isIncreasing) return []
    const adds: PendingAddDay[] = []
    for (let i = 0; i < diff; i++) {
      const dayNum = program.days.length + i + 1
      adds.push({
        dayNumber: dayNum,
        type: 'empty_strength',
        name: `يوم ${dayNum}`,
      })
    }
    return adds
  })

  const [selectedDaysToRemove, setSelectedDaysToRemove] = useState<number[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showConfirmRemove, setShowConfirmRemove] = useState(false)

  if (!isOpen) return null

  // Helper to suggest split name
  function getSuggestedName(dayNum: number, type: AddDayOption): string {
    if (type === 'cardio') return `يوم ${dayNum} - كارديو`
    const lowerUpperSplit = program.splitType?.toLowerCase() || ''
    if (lowerUpperSplit.includes('upper_lower')) {
      const upperCount = program.days.filter((d) =>
        (d.name || d.labelAr || '').includes('علوي'),
      ).length
      const lowerCount = program.days.filter((d) =>
        (d.name || d.labelAr || '').includes('سفلي'),
      ).length
      return upperCount <= lowerCount ? 'علوي (ج)' : 'سفلي (ج)'
    }
    return `يوم ${dayNum}`
  }

  const handleApplyChanges = () => {
    try {
      setErrorMessage(null)
      const nextDays = [...program.days]

      if (isIncreasing) {
        let maxIndex =
          nextDays.length > 0
            ? Math.max(...nextDays.map((d) => d.dayIndex))
            : -1
        const addedNames: string[] = []

        for (const add of pendingAdds) {
          maxIndex++
          let newDay: ProgramDay

          if (
            add.type === 'copy_existing' &&
            add.sourceDayIndex !== undefined
          ) {
            const source = nextDays.find(
              (d) => d.dayIndex === add.sourceDayIndex,
            )
            if (source) {
              newDay = {
                ...JSON.parse(JSON.stringify(source)),
                id: `day-${Date.now()}-${maxIndex}`,
                dayIndex: maxIndex,
                name: add.name || `نسخة من ${source.name}`,
                labelAr: add.name || `نسخة من ${source.name}`,
              }
            } else {
              throw new Error('لم يتم العثور على اليوم المراد نسخه')
            }
          } else if (add.type === 'cardio') {
            newDay = {
              id: `day-${Date.now()}-${maxIndex}`,
              dayIndex: maxIndex,
              name: add.name || `يوم ${add.dayNumber} - كارديو`,
              labelAr: add.name || `يوم ${add.dayNumber} - كارديو`,
              kind: 'cardio',
              focus: 'كارديو ولياقة',
              exercises: [],
              cardioConfig: {
                activity: 'جري',
                plannedMinutes: 30,
                effort: 'moderate',
              },
            }
          } else {
            // empty strength
            newDay = {
              id: `day-${Date.now()}-${maxIndex}`,
              dayIndex: maxIndex,
              name: add.name || `يوم ${add.dayNumber}`,
              labelAr: add.name || `يوم ${add.dayNumber}`,
              kind: 'strength',
              focus: 'تمارين مخصصة',
              exercises: [],
            }
          }

          nextDays.push(newDay)
          addedNames.push(newDay.name || newDay.labelAr || `يوم ${targetDays}`)
        }

        const updatedProgram: WorkoutProgram = {
          ...program,
          days: nextDays,
          trainingDaysPerWeek: targetDays,
        }

        // Derive updated schedule
        const newSchedule = getOrDeriveSchedule(profile, updatedProgram)
        onSave(updatedProgram, newSchedule)
        showToast(
          addedNames.length === 1
            ? `تمت إضافة اليوم ${targetDays}: ${addedNames[0]}`
            : `تمت إضافة ${addedNames.length} أيام إلى الجدول بنجاح`,
        )
        onClose()
      } else if (isDecreasing) {
        if (selectedDaysToRemove.length !== diff) {
          setErrorMessage(`يرجى تحديد ${diff} أيام لحذفها من الجدول`)
          return
        }

        const remainingDays = nextDays.filter(
          (d) => !selectedDaysToRemove.includes(d.dayIndex),
        )

        // Re-index remaining days cleanly
        const reindexedDays = remainingDays.map((d, idx) => ({
          ...d,
          dayIndex: idx,
        }))

        const updatedProgram: WorkoutProgram = {
          ...program,
          days: reindexedDays,
          trainingDaysPerWeek: targetDays,
        }

        const newSchedule = getOrDeriveSchedule(profile, updatedProgram)
        onSave(updatedProgram, newSchedule)

        // Show toast with Undo action capability
        showToast(`تم تقليص الجدول إلى ${targetDays} أيام`)
        onClose()
      } else {
        onClose()
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'حدث خطأ أثناء تعديل الجدول',
      )
    }
  }

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="تعديل أيام الجدول">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '8px 0 24px',
        }}
        dir="rtl"
      >
        {errorMessage && (
          <Callout variant="error" title="خطأ في التعديل">
            {errorMessage}
          </Callout>
        )}

        <div
          style={{
            background: 'var(--color-surface-2)',
            padding: '12px 14px',
            borderRadius: '10px',
            border: '1px solid var(--color-divider)',
            fontSize: '13.5px',
            lineHeight: 1.6,
            color: 'var(--color-text)',
          }}
        >
          <div>
            <strong>أيام المقاومة الحالية:</strong> {currentStrengthCount} أيام
          </div>
          <div>
            <strong>الأيام المستهدفة في ملفك:</strong> {targetDays} أيام
          </div>
        </div>

        {/* INCREASING DAYS (Missing days) */}
        {isIncreasing && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--color-text)',
              }}
            >
              إعداد الأيام الناقصة ({diff} {diff === 1 ? 'يوم' : 'أيام'}):
            </div>

            {pendingAdds.map((add, index) => (
              <div
                key={add.dayNumber}
                style={{
                  border: '1px solid var(--color-divider)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  background: 'var(--color-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                  }}
                >
                  اليوم {add.dayNumber}:
                </div>

                <Choice
                  variant="segmented"
                  options={[
                    { value: 'empty_strength', label: 'يوم قوة فارغ' },
                    { value: 'copy_existing', label: 'نسخة من يوم موجود' },
                    { value: 'cardio', label: 'يوم كارديو' },
                  ]}
                  value={add.type}
                  onChange={(val) => {
                    const nextType = val as AddDayOption
                    const next = [...pendingAdds]
                    next[index] = {
                      ...next[index],
                      type: nextType,
                      name: getSuggestedName(add.dayNumber, nextType),
                      sourceDayIndex:
                        nextType === 'copy_existing' && program.days.length > 0
                          ? program.days[0].dayIndex
                          : undefined,
                    }
                    setPendingAdds(next)
                  }}
                />

                {add.type === 'copy_existing' && (
                  <div>
                    <Select
                      id={`source-day-select-${index}`}
                      label="اختر اليوم المراد نسخه:"
                      value={String(add.sourceDayIndex ?? '')}
                      options={program.days.map((d) => ({
                        value: String(d.dayIndex),
                        labelAr: d.name || d.labelAr || `يوم ${d.dayIndex + 1}`,
                        secondary: `${d.exercises.length} تمارين`,
                      }))}
                      onChange={(val) => {
                        const sIdx = Number(val)
                        const src = program.days.find(
                          (d) => d.dayIndex === sIdx,
                        )
                        const next = [...pendingAdds]
                        next[index] = {
                          ...next[index],
                          sourceDayIndex: sIdx,
                          name: src
                            ? `نسخة من ${src.name || src.labelAr}`
                            : next[index].name,
                        }
                        setPendingAdds(next)
                      }}
                    />
                  </div>
                )}

                <div>
                  <label
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: 'var(--color-text-2)',
                      marginBottom: '4px',
                      display: 'block',
                    }}
                  >
                    اسم اليوم:
                  </label>
                  <input
                    type="text"
                    className="field-input"
                    value={add.name}
                    onChange={(e) => {
                      const next = [...pendingAdds]
                      next[index] = { ...next[index], name: e.target.value }
                      setPendingAdds(next)
                    }}
                    style={{
                      height: '40px',
                      width: '100%',
                      borderRadius: '8px',
                      border: '1px solid var(--color-divider)',
                      padding: '0 10px',
                      background: 'var(--color-surface-2)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DECREASING DAYS (Pick which to remove) */}
        {isDecreasing && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--color-text)',
              }}
            >
              اختر {diff} {diff === 1 ? 'يوم' : 'أيام'} لحذفها من الجدول:
            </div>

            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              {program.days.map((d) => {
                const isSelected = selectedDaysToRemove.includes(d.dayIndex)
                return (
                  <button
                    key={d.dayIndex}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedDaysToRemove(
                          selectedDaysToRemove.filter(
                            (idx) => idx !== d.dayIndex,
                          ),
                        )
                      } else {
                        if (selectedDaysToRemove.length >= diff) {
                          setSelectedDaysToRemove([
                            ...selectedDaysToRemove.slice(1),
                            d.dayIndex,
                          ])
                        } else {
                          setSelectedDaysToRemove([
                            ...selectedDaysToRemove,
                            d.dayIndex,
                          ])
                        }
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: isSelected
                        ? '2px solid var(--color-danger, #ef4444)'
                        : '1px solid var(--color-divider)',
                      background: isSelected
                        ? 'rgba(239, 68, 68, 0.12)'
                        : 'var(--color-surface-2)',
                      cursor: 'pointer',
                      textAlign: 'start',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: 'var(--color-text)',
                        }}
                      >
                        {d.name}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--color-text-2)',
                        }}
                      >
                        {d.kind === 'cardio'
                          ? 'يوم كارديو'
                          : `${d.exercises.length} تمارين`}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: isSelected
                          ? 'var(--color-danger, #ef4444)'
                          : 'var(--color-text-2)',
                      }}
                    >
                      {isSelected ? 'محدد للحذف' : 'إبقاء'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => {
              if (isDecreasing && !showConfirmRemove) {
                if (selectedDaysToRemove.length !== diff) {
                  setErrorMessage(`يرجى تحديد ${diff} أيام لحذفها`)
                  return
                }
                setShowConfirmRemove(true)
                return
              }
              handleApplyChanges()
            }}
          >
            {showConfirmRemove ? 'تأكيد الحذف وحفظ الجدول' : 'حفظ التعديلات'}
          </Button>
          <Button variant="ghost" size="md" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </div>
    </Sheet>
  )
}
