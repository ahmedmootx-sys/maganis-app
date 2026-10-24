/**
 * src/modules/workout/ExerciseEditSheet.tsx
 *
 * Implements Task G5-B4:
 * Full exercise editor sheet for overrides and custom exercises.
 * - Editable: Arabic name, English name, image mode (original, none, custom file with 640px canvas resize),
 *   how to perform (benefits, mechanics, reorderable steps list), muscle targeting (primary/secondary with gym name and <bdi> English),
 *   personal note (max 500 chars), and video URL (B3).
 * - "اعرض الأصلي" toggle and "رجّع الأصلي" action with confirmation.
 * - Follows the sheet contract (scrollable content, fixed footer with bottom inset).
 */

import React, { useState, useMemo } from 'react'
import type { Exercise, ExerciseMuscleTarget } from '../shared/types.ts'
import {
  getExerciseOverride,
  saveExerciseOverride,
  deleteExerciseOverride,
  resizeUserImage,
  type ExerciseOverride,
} from './exerciseOverrides.ts'
import { Sheet } from '../../ui/Sheet.tsx'
import { Button } from '../../ui/Button.tsx'
import { ConfirmSheet } from '../../ui/ConfirmSheet.tsx'
import muscleNamesData from '../../data/muscle-names.json'
import type { MuscleNameEntry } from './muscleNames.ts'

export interface ExerciseEditSheetProps {
  isOpen: boolean
  onClose: () => void
  exercise: Exercise
  onSaved?: (updated: Exercise) => void
  onResetOriginal?: () => void
}

export const ExerciseEditSheet: React.FC<ExerciseEditSheetProps> = ({
  isOpen,
  onClose,
  exercise,
  onSaved,
  onResetOriginal,
}) => {
  const existingOverride = useMemo(
    () => getExerciseOverride(exercise.id),
    [exercise.id, isOpen],
  )

  const [showOriginal, setShowOriginal] = useState(false)
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Form State
  const [nameAr, setNameAr] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [imageMode, setImageMode] = useState<'original' | 'none' | 'custom'>('original')
  const [customImageBlob, setCustomImageBlob] = useState<string>('')
  const [benefitAr, setBenefitAr] = useState('')
  const [mechanicsAr, setMechanicsAr] = useState('')
  const [steps, setSteps] = useState<string[]>([])
  const [newStepText, setNewStepText] = useState('')
  const [muscles, setMuscles] = useState<ExerciseMuscleTarget[]>([])
  const [personalNote, setPersonalNote] = useState('')
  const [videoUrl, setVideoUrl] = useState('')

  // Sync state when opened
  React.useEffect(() => {
    if (isOpen) {
      setErrorMsg('')
      setShowOriginal(false)
      const ov = existingOverride

      setNameAr(ov?.nameAr ?? exercise.nameAr ?? '')
      setNameEn(ov?.nameEn ?? exercise.nameEn ?? exercise.name ?? '')
      setImageMode(ov?.imageMode ?? 'original')
      setCustomImageBlob(ov?.customImageBlob ?? '')
      setBenefitAr(ov?.benefitAr ?? exercise.benefitAr ?? exercise.benefit ?? '')
      setMechanicsAr(ov?.mechanicsAr ?? exercise.mechanicsAr ?? exercise.mechanics ?? '')

      const initialSteps =
        ov?.howToStepsAr ??
        exercise.howToStepsAr ??
        exercise.steps ??
        exercise.steps_ar ??
        []
      setSteps([...initialSteps])
      setNewStepText('')

      const initialMuscles = ov?.muscles ?? exercise.muscles ?? []
      setMuscles([...initialMuscles])

      setPersonalNote(ov?.personalNote ?? '')
      setVideoUrl(ov?.videoUrl ?? '')
    }
  }, [isOpen, exercise, existingOverride])

  const allMuscles = useMemo(
    () => muscleNamesData.muscles as MuscleNameEntry[],
    [],
  )

  // Step operations
  const handleAddStep = () => {
    if (!newStepText.trim()) return
    setSteps([...steps, newStepText.trim()])
    setNewStepText('')
  }

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, idx) => idx !== index))
  }

  const handleMoveStep = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= steps.length) return
    const updated = [...steps]
    const item = updated.splice(fromIdx, 1)[0]
    updated.splice(toIdx, 0, item)
    setSteps(updated)
  }

  // Muscle Targeting
  const handleMuscleToggle = (muscleId: string) => {
    const existing = muscles.find((m) => m.id === muscleId)
    if (!existing) {
      // Unselected -> Primary
      setMuscles([...muscles, { id: muscleId, role: 'primary' }])
    } else if (existing.role === 'primary') {
      // Primary -> Secondary
      setMuscles(
        muscles.map((m) =>
          m.id === muscleId ? { ...m, role: 'secondary' } : m,
        ),
      )
    } else {
      // Secondary -> Remove
      setMuscles(muscles.filter((m) => m.id !== muscleId))
    }
  }

  // File Picker for custom image
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const resized = await resizeUserImage(file)
      setCustomImageBlob(resized)
      setImageMode('custom')
      setErrorMsg('')
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'فشل في معالجة الصورة')
    }
  }

  const handleSave = async () => {
    setErrorMsg('')
    try {
      const overrideData: ExerciseOverride = {
        exerciseId: exercise.id,
        nameAr: nameAr.trim() || undefined,
        nameEn: nameEn.trim() || undefined,
        imageMode,
        customImageBlob: imageMode === 'custom' ? customImageBlob : undefined,
        benefitAr: benefitAr.trim() || undefined,
        mechanicsAr: mechanicsAr.trim() || undefined,
        howToStepsAr: steps.length > 0 ? steps : undefined,
        muscles: muscles.length > 0 ? muscles : undefined,
        personalNote: personalNote.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
      }

      await saveExerciseOverride(overrideData)
      onSaved?.({
        ...exercise,
        nameAr: overrideData.nameAr || exercise.nameAr,
        nameEn: overrideData.nameEn || exercise.nameEn,
        benefitAr: overrideData.benefitAr || exercise.benefitAr,
        mechanicsAr: overrideData.mechanicsAr || exercise.mechanicsAr,
        howToStepsAr: overrideData.howToStepsAr || exercise.howToStepsAr,
        muscles: overrideData.muscles || exercise.muscles,
      })
      onClose()
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'حدث خطأ أثناء حفظ التعديلات')
    }
  }

  const handleReset = async () => {
    try {
      await deleteExerciseOverride(exercise.id)
      onResetOriginal?.()
      onClose()
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'فشل في استعادة البيانات الأصلية')
    }
  }

  return (
    <>
      <Sheet
        isOpen={isOpen}
        onClose={onClose}
        title="تعديل بيانات التمرين"
        subtitle={exercise.nameAr}
      >
        <div
          data-testid="exercise-edit-sheet-content"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            paddingBottom: 'calc(var(--footer-max-height, 72px) + 24px)',
          }}
        >
          {errorMsg && (
            <div
              data-testid="edit-error-banner"
              style={{
                backgroundColor: 'var(--color-danger-bg)',
                border: '1px solid var(--color-danger-border)',
                color: 'var(--color-danger)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-control)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Toggle "اعرض الأصلي" vs Edit */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-2) var(--space-3)',
              backgroundColor: 'var(--color-surface-2)',
              borderRadius: 'var(--radius-control)',
            }}
          >
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
              {showOriginal ? 'عرض البيانات الأصلية (للمعاينة فقط)' : 'تعديل البيانات'}
            </span>
            <button
              type="button"
              data-testid="toggle-show-original"
              onClick={() => setShowOriginal(!showOriginal)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-accent-text)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              {showOriginal ? 'العودة للتعديل' : 'اعرض الأصلي'}
            </button>
          </div>

          {showOriginal ? (
            /* Original Catalog View */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                opacity: 0.9,
              }}
            >
              <div>
                <strong style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-2)' }}>
                  الاسم بالعربي:
                </strong>
                <div>{exercise.nameAr}</div>
              </div>
              {exercise.nameEn && (
                <div>
                  <strong style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-2)' }}>
                    الاسم بالإنجليزي:
                  </strong>
                  <div>
                    <bdi dir="ltr">{exercise.nameEn}</bdi>
                  </div>
                </div>
              )}
              {exercise.benefitAr && (
                <div>
                  <strong style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-2)' }}>
                    الفائدة:
                  </strong>
                  <div>{exercise.benefitAr}</div>
                </div>
              )}
              {exercise.mechanicsAr && (
                <div>
                  <strong style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-2)' }}>
                    الميكانيكا:
                  </strong>
                  <div>{exercise.mechanicsAr}</div>
                </div>
              )}
            </div>
          ) : (
            /* Editable Form */
            <>
              {/* Arabic Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <label
                  htmlFor="edit-name-ar"
                  style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}
                >
                  الاسم بالعربي
                </label>
                <input
                  id="edit-name-ar"
                  data-testid="input-name-ar"
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  style={{
                    height: 'var(--control-height)',
                    padding: '0 var(--space-3)',
                    borderRadius: 'var(--radius-control)',
                    border: '1px solid var(--color-divider)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    fontSize: 'var(--font-size-md)',
                  }}
                />
              </div>

              {/* English Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <label
                  htmlFor="edit-name-en"
                  style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}
                >
                  الاسم بالإنجليزي
                </label>
                <input
                  id="edit-name-en"
                  data-testid="input-name-en"
                  type="text"
                  dir="ltr"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  style={{
                    height: 'var(--control-height)',
                    padding: '0 var(--space-3)',
                    borderRadius: 'var(--radius-control)',
                    border: '1px solid var(--color-divider)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    fontSize: 'var(--font-size-md)',
                  }}
                />
              </div>

              {/* Image Mode */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                  صورة التمرين
                </span>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button
                    type="button"
                    data-testid="img-mode-original"
                    onClick={() => setImageMode('original')}
                    style={{
                      flex: 1,
                      minHeight: 'var(--touch-target-min)',
                      borderRadius: 'var(--radius-control)',
                      border: `1px solid ${imageMode === 'original' ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                      backgroundColor: imageMode === 'original' ? 'var(--color-accent-tint)' : 'var(--color-surface)',
                      color: imageMode === 'original' ? 'var(--color-accent-text)' : 'var(--color-text)',
                      fontWeight: 'var(--font-weight-semibold)',
                      cursor: 'pointer',
                    }}
                  >
                    الأصلية
                  </button>
                  <button
                    type="button"
                    data-testid="img-mode-none"
                    onClick={() => setImageMode('none')}
                    style={{
                      flex: 1,
                      minHeight: 'var(--touch-target-min)',
                      borderRadius: 'var(--radius-control)',
                      border: `1px solid ${imageMode === 'none' ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                      backgroundColor: imageMode === 'none' ? 'var(--color-accent-tint)' : 'var(--color-surface)',
                      color: imageMode === 'none' ? 'var(--color-accent-text)' : 'var(--color-text)',
                      fontWeight: 'var(--font-weight-semibold)',
                      cursor: 'pointer',
                    }}
                  >
                    من غير صورة
                  </button>
                  <button
                    type="button"
                    data-testid="img-mode-custom"
                    onClick={() => setImageMode('custom')}
                    style={{
                      flex: 1,
                      minHeight: 'var(--touch-target-min)',
                      borderRadius: 'var(--radius-control)',
                      border: `1px solid ${imageMode === 'custom' ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                      backgroundColor: imageMode === 'custom' ? 'var(--color-accent-tint)' : 'var(--color-surface)',
                      color: imageMode === 'custom' ? 'var(--color-accent-text)' : 'var(--color-text)',
                      fontWeight: 'var(--font-weight-semibold)',
                      cursor: 'pointer',
                    }}
                  >
                    صورتي
                  </button>
                </div>

                {imageMode === 'custom' && (
                  <div style={{ marginTop: 'var(--space-2)' }}>
                    <input
                      type="file"
                      accept="image/*"
                      data-testid="custom-file-input"
                      onChange={handleFileChange}
                      style={{ fontSize: 'var(--font-size-sm)' }}
                    />
                    {customImageBlob && (
                      <div style={{ marginTop: 'var(--space-2)', textAlign: 'center' }}>
                        <img
                          src={customImageBlob}
                          alt="معاينة الصورة"
                          style={{
                            maxWidth: '180px',
                            maxHeight: '180px',
                            borderRadius: 'var(--radius-control)',
                            border: '1px solid var(--color-divider)',
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* How to Perform: Benefit & Mechanics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <label
                  htmlFor="edit-benefit"
                  style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}
                >
                  الفائدة العضلية
                </label>
                <textarea
                  id="edit-benefit"
                  data-testid="input-benefit"
                  rows={2}
                  value={benefitAr}
                  onChange={(e) => setBenefitAr(e.target.value)}
                  style={{
                    padding: 'var(--space-2)',
                    borderRadius: 'var(--radius-control)',
                    border: '1px solid var(--color-divider)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    fontSize: 'var(--font-size-sm)',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <label
                  htmlFor="edit-mechanics"
                  style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}
                >
                  ميكانيكا الأداء
                </label>
                <textarea
                  id="edit-mechanics"
                  data-testid="input-mechanics"
                  rows={2}
                  value={mechanicsAr}
                  onChange={(e) => setMechanicsAr(e.target.value)}
                  style={{
                    padding: 'var(--space-2)',
                    borderRadius: 'var(--radius-control)',
                    border: '1px solid var(--color-divider)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    fontSize: 'var(--font-size-sm)',
                  }}
                />
              </div>

              {/* Steps List (Add, Remove, Reorder) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                  خطوات الأداء ({steps.length})
                </span>
                {steps.map((st, idx) => (
                  <div
                    key={idx}
                    data-testid={`step-row-${idx}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      padding: 'var(--space-2)',
                      backgroundColor: 'var(--color-surface-2)',
                      borderRadius: 'var(--radius-control)',
                    }}
                  >
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'bold' }}>
                      {idx + 1}.
                    </span>
                    <span style={{ flex: 1, fontSize: 'var(--font-size-sm)' }}>{st}</span>
                    <button
                      type="button"
                      onClick={() => handleMoveStep(idx, idx - 1)}
                      disabled={idx === 0}
                      aria-label="تحريك لأعلى"
                      style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveStep(idx, idx + 1)}
                      disabled={idx === steps.length - 1}
                      aria-label="تحريك لأسفل"
                      style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      aria-label="حذف الخطوة"
                      style={{ border: 'none', background: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                  <input
                    type="text"
                    data-testid="input-new-step"
                    placeholder="أضف خطوة جديدة..."
                    value={newStepText}
                    onChange={(e) => setNewStepText(e.target.value)}
                    style={{
                      flex: 1,
                      height: 'var(--control-height)',
                      padding: '0 var(--space-3)',
                      borderRadius: 'var(--radius-control)',
                      border: '1px solid var(--color-divider)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text)',
                      fontSize: 'var(--font-size-sm)',
                    }}
                  />
                  <Button variant="secondary" onClick={handleAddStep}>
                    إضافة
                  </Button>
                </div>
              </div>

              {/* Muscle Targeting (Primary / Secondary / None) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                  العضلات المستهدفة (اضغط للتبديل: رئيسية / مساعدة / إزالة)
                </span>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--space-2)',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    padding: 'var(--space-2)',
                    borderRadius: 'var(--radius-control)',
                    border: '1px solid var(--color-divider)',
                    backgroundColor: 'var(--color-surface)',
                  }}
                >
                  {allMuscles.map((m) => {
                    const match = muscles.find((target) => target.id === m.id)
                    const role = match?.role

                    let border = '1px solid var(--color-divider)'
                    let bg = 'var(--color-surface-2)'
                    let color = 'var(--color-text)'

                    if (role === 'primary') {
                      border = '1px solid var(--atlas-primary-stroke)'
                      bg = 'var(--atlas-primary)'
                      color = '#ffffff'
                    } else if (role === 'secondary') {
                      border = '1px solid var(--atlas-secondary-stroke)'
                      bg = 'var(--atlas-secondary)'
                      color = '#0b0c0e'
                    }

                    return (
                      <button
                        key={m.id}
                        type="button"
                        data-testid={`muscle-chip-${m.id}`}
                        onClick={() => handleMuscleToggle(m.id)}
                        style={{
                          padding: 'var(--space-1) var(--space-2)',
                          borderRadius: 'var(--radius-control)',
                          border,
                          backgroundColor: bg,
                          color,
                          fontSize: 'var(--font-size-xs)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 'var(--space-1)',
                        }}
                      >
                        <span>{m.gym_ar}</span>
                        <bdi dir="ltr" style={{ opacity: 0.85 }}>({m.sci_en})</bdi>
                        {role && (
                          <span style={{ fontWeight: 'bold' }}>
                            [{role === 'primary' ? 'رئيسية' : 'مساعدة'}]
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Personal Note (Max 500 chars) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label
                    htmlFor="edit-personal-note"
                    style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}
                  >
                    ملاحظة شخصية
                  </label>
                  <span
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      color: personalNote.length > 500 ? 'var(--color-danger)' : 'var(--color-text-2)',
                    }}
                  >
                    {personalNote.length} / 500
                  </span>
                </div>
                <textarea
                  id="edit-personal-note"
                  data-testid="input-personal-note"
                  rows={3}
                  maxLength={500}
                  placeholder="ملاحظاتك الخاصة لأداء هذا التمرين..."
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  style={{
                    padding: 'var(--space-2)',
                    borderRadius: 'var(--radius-control)',
                    border: '1px solid var(--color-divider)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    fontSize: 'var(--font-size-sm)',
                  }}
                />
              </div>

              {/* Video URL (Task B3) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <label
                  htmlFor="edit-video-url"
                  style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}
                >
                  رابط فيديو شرح (يوتيوب أو فيميو أو ملف فيديو مباشر)
                </label>
                <input
                  id="edit-video-url"
                  data-testid="input-video-url"
                  type="url"
                  dir="ltr"
                  placeholder="https://..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  style={{
                    height: 'var(--control-height)',
                    padding: '0 var(--space-3)',
                    borderRadius: 'var(--radius-control)',
                    border: '1px solid var(--color-divider)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    fontSize: 'var(--font-size-md)',
                  }}
                />
              </div>

              {/* Reset to Original Button (if previously modified) */}
              {existingOverride && (
                <div style={{ marginTop: 'var(--space-3)' }}>
                  <Button
                    variant="danger"
                    data-testid="btn-reset-original"
                    onClick={() => setShowConfirmReset(true)}
                    fullWidth
                  >
                    رجّع الأصلي
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Fixed Sheet Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 'var(--space-3) var(--space-4)',
            paddingBottom: 'calc(var(--space-3) + var(--safe-area-bottom, 0px))',
            backgroundColor: 'var(--color-surface)',
            borderTop: '1px solid var(--color-divider)',
            display: 'flex',
            gap: 'var(--space-3)',
            zIndex: 20,
          }}
        >
          <Button
            variant="secondary"
            data-testid="btn-cancel-edit"
            onClick={onClose}
            style={{ flex: 1 }}
          >
            إلغاء
          </Button>
          <Button
            variant="primary"
            data-testid="btn-save-edit"
            onClick={handleSave}
            style={{ flex: 2 }}
          >
            حفظ التعديلات
          </Button>
        </div>
      </Sheet>

      {/* Confirmation for "رجّع الأصلي" */}
      <ConfirmSheet
        isOpen={showConfirmReset}
        onCancel={() => setShowConfirmReset(false)}
        onConfirm={handleReset}
        title="تأكيد استعادة التمرين الأصلي"
        message="هل أنت متأكد من حذف كافة التعديلات واستعادة البيانات الأصلية للتمرين من الكتالوج؟"
        confirmLabel="نعم، رجّع الأصلي"
        cancelLabel="إلغاء"
        isDestructive
      />
    </>
  )
}
