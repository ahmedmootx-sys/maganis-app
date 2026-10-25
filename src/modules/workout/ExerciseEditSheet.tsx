/**
 * src/modules/workout/ExerciseEditSheet.tsx
 *
 * Implements Task G5-B4 & Task G6-A D6:
 * Full exercise editor sheet for overrides and custom exercises.
 * - Editable: Arabic name, English name, image mode (original, none, custom file with 640px canvas resize),
 *   how to perform (benefits, mechanics, reorderable steps list), muscle targeting (primary/secondary with gym name and <bdi> English),
 *   personal note (max 500 chars), and video URL (B3).
 * - "اعرض الأصلي" toggle and "إعادة الضبط" action in sheet header with explicit confirmation.
 * - Auto-growing textareas (min 4 lines, max 40vh, text-align: start, no internal scroll until max).
 * - Muscle targeting: no nested scroll, organized by groups from muscle-names.json, summary at top,
 *   3-option segmented control (أساسية / مساعدة / مش مستهدفة), AA contrast role badges (no brackets).
 * - Personal note counter: <bdi dir="ltr">{personalNote.length} / 500</bdi>.
 * - Step controls: 44x44px chevron buttons + delete + step numbers.
 * - Follows the sheet contract (scrollable content, fixed footer with bottom inset).
 * - Dirty-state guard prevents losing unsaved edits.
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
import { Icon } from '../../ui/Icon.tsx'
import { useToast } from '../../ui/Toast.tsx'
import { getMuscleInfo } from '../../utils/labels.ts'
import muscleNamesData from '../../data/muscle-names.json'

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
  let showToast: ReturnType<typeof useToast>['showToast'] | undefined
  try {
    const toastCtx = useToast()
    showToast = toastCtx.showToast
  } catch {
    // outside ToastProvider in isolated test environments
  }

  const existingOverride = useMemo(
    () => getExerciseOverride(exercise.id),
    [exercise.id, isOpen],
  )

  const [showOriginal, setShowOriginal] = useState(false)
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  const [showConfirmClose, setShowConfirmClose] = useState(false)
  const [activeMusclePickerId, setActiveMusclePickerId] = useState<string | null>(null)
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

  const isDirty = useMemo(() => {
    const ov = existingOverride
    const origNameAr = ov?.nameAr ?? exercise.nameAr ?? ''
    const origNameEn = ov?.nameEn ?? exercise.nameEn ?? exercise.name ?? ''
    const origImageMode = ov?.imageMode ?? 'original'
    const origCustomImageBlob = ov?.customImageBlob ?? ''
    const origBenefitAr = ov?.benefitAr ?? exercise.benefitAr ?? exercise.benefit ?? ''
    const origMechanicsAr = ov?.mechanicsAr ?? exercise.mechanicsAr ?? exercise.mechanics ?? ''
    const origSteps =
      ov?.howToStepsAr ??
      exercise.howToStepsAr ??
      exercise.steps ??
      exercise.steps_ar ??
      []
    const origMuscles = ov?.muscles ?? exercise.muscles ?? []
    const origPersonalNote = ov?.personalNote ?? ''
    const origVideoUrl = ov?.videoUrl ?? ''

    if (nameAr !== origNameAr) return true
    if (nameEn !== origNameEn) return true
    if (imageMode !== origImageMode) return true
    if (customImageBlob !== origCustomImageBlob) return true
    if (benefitAr !== origBenefitAr) return true
    if (mechanicsAr !== origMechanicsAr) return true
    if (personalNote !== origPersonalNote) return true
    if (videoUrl !== origVideoUrl) return true
    if (JSON.stringify(steps) !== JSON.stringify(origSteps)) return true
    if (JSON.stringify(muscles) !== JSON.stringify(origMuscles)) return true

    return false
  }, [
    nameAr,
    nameEn,
    imageMode,
    customImageBlob,
    benefitAr,
    mechanicsAr,
    steps,
    muscles,
    personalNote,
    videoUrl,
    existingOverride,
    exercise,
  ])

  const handleAttemptClose = () => {
    if (isDirty) {
      setShowConfirmClose(true)
    } else {
      onClose()
    }
  }

  const primarySummary = useMemo(() => {
    return muscles
      .filter((m) => m.role === 'primary')
      .map((m) => getMuscleInfo(m.id)?.gymAr || m.id)
      .join('، ')
  }, [muscles])

  const secondarySummary = useMemo(() => {
    return muscles
      .filter((m) => m.role === 'secondary')
      .map((m) => getMuscleInfo(m.id)?.gymAr || m.id)
      .join('، ')
  }, [muscles])

  // Sync state when opened
  React.useEffect(() => {
    if (isOpen) {
      setErrorMsg('')
      setShowOriginal(false)
      setActiveMusclePickerId(null)
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

  // Muscle Targeting explicit role setter
  const handleSetMuscleRole = (muscleId: string, role: 'primary' | 'secondary' | 'none') => {
    if (role === 'none') {
      setMuscles(muscles.filter((m) => m.id !== muscleId))
    } else {
      const exists = muscles.some((m) => m.id === muscleId)
      if (exists) {
        setMuscles(
          muscles.map((m) => (m.id === muscleId ? { ...m, role } : m)),
        )
      } else {
        setMuscles([...muscles, { id: muscleId, role }])
      }
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
      const prevOverride = existingOverride
      await deleteExerciseOverride(exercise.id)

      if (showToast) {
        showToast({
          message: 'رجّعنا التمرين زي ما كان',
          duration: 8000,
          undoLabel: 'تراجع',
          onUndo: async () => {
            if (prevOverride) {
              await saveExerciseOverride(prevOverride)
              onSaved?.({
                ...exercise,
                nameAr: prevOverride.nameAr || exercise.nameAr,
                nameEn: prevOverride.nameEn || exercise.nameEn,
                benefitAr: prevOverride.benefitAr || exercise.benefitAr,
                mechanicsAr: prevOverride.mechanicsAr || exercise.mechanicsAr,
                howToStepsAr: prevOverride.howToStepsAr || exercise.howToStepsAr,
                muscles: prevOverride.muscles || exercise.muscles,
              })
            }
          },
        })
      }

      onResetOriginal?.()
      setShowConfirmReset(false)
      onClose()
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'فشل في استعادة البيانات الأصلية')
    }
  }

  const handleAutoGrow = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget
    el.style.height = 'auto'
    const maxHeight = typeof window !== 'undefined' ? window.innerHeight * 0.4 : 320
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`
  }

  return (
    <>
      <Sheet
        isOpen={isOpen}
        onClose={handleAttemptClose}
        title="تعديل بيانات التمرين"
        subtitle={exercise.nameAr}
        headerAction={
          existingOverride ? (
            <button
              type="button"
              data-testid="header-btn-reset"
              onClick={() => setShowConfirmReset(true)}
              style={{
                background: 'none',
                border: '1px solid var(--color-danger-border, #fca5a5)',
                color: 'var(--color-danger, #ef4444)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-control, 8px)',
                fontSize: 'var(--font-size-xs, 12px)',
                fontWeight: 'var(--font-weight-bold, 700)',
                cursor: 'pointer',
                minHeight: '36px',
              }}
            >
              إعادة الضبط
            </button>
          ) : undefined
        }
        footer={
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              width: '100%',
            }}
          >
            <Button
              variant="secondary"
              data-testid="btn-cancel-edit"
              onClick={handleAttemptClose}
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
        }
      >
        <div
          data-testid="exercise-edit-sheet-content"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            paddingBottom: 'var(--space-4)',
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

              {/* How to Perform: Benefit & Mechanics (Auto-grow, start-aligned, min 4 lines, max 40vh) */}
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
                  rows={4}
                  value={benefitAr}
                  onChange={(e) => setBenefitAr(e.target.value)}
                  onInput={handleAutoGrow}
                  style={{
                    minHeight: '100px',
                    maxHeight: '40vh',
                    overflowY: 'auto',
                    textAlign: 'start',
                    lineHeight: '1.6',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-control)',
                    border: '1px solid var(--color-divider)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    fontSize: 'var(--font-size-sm)',
                    resize: 'none',
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
                  rows={4}
                  value={mechanicsAr}
                  onChange={(e) => setMechanicsAr(e.target.value)}
                  onInput={handleAutoGrow}
                  style={{
                    minHeight: '100px',
                    maxHeight: '40vh',
                    overflowY: 'auto',
                    textAlign: 'start',
                    lineHeight: '1.6',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-control)',
                    border: '1px solid var(--color-divider)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    fontSize: 'var(--font-size-sm)',
                    resize: 'none',
                  }}
                />
              </div>

              {/* Steps List (Add, Remove, Reorder with 44x44px chevron buttons and step numbers) */}
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
                    <span
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 'bold',
                        color: 'var(--color-text-2)',
                        minWidth: '24px',
                      }}
                    >
                      {idx + 1}.
                    </span>
                    <span style={{ flex: 1, fontSize: 'var(--font-size-sm)', lineHeight: '1.5' }}>
                      {st}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleMoveStep(idx, idx - 1)}
                      disabled={idx === 0}
                      aria-label="تحريك لأعلى"
                      style={{
                        minWidth: '44px',
                        minHeight: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        background: 'none',
                        cursor: idx === 0 ? 'default' : 'pointer',
                        opacity: idx === 0 ? 0.3 : 1,
                        color: 'var(--color-text)',
                      }}
                    >
                      <Icon name="chevron-up" size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveStep(idx, idx + 1)}
                      disabled={idx === steps.length - 1}
                      aria-label="تحريك لأسفل"
                      style={{
                        minWidth: '44px',
                        minHeight: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        background: 'none',
                        cursor: idx === steps.length - 1 ? 'default' : 'pointer',
                        opacity: idx === steps.length - 1 ? 0.3 : 1,
                        color: 'var(--color-text)',
                      }}
                    >
                      <Icon name="chevron-down" size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      aria-label="حذف الخطوة"
                      style={{
                        minWidth: '44px',
                        minHeight: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        background: 'none',
                        color: 'var(--color-danger)',
                        cursor: 'pointer',
                      }}
                    >
                      <Icon name="trash-2" size={18} />
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

              {/* Muscle Targeting (NO nested scroll, organized by groups, summary line, 3-option segmented control, AA badges) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                  العضلات المستهدفة
                </span>

                {/* Summary Box */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-1)',
                    padding: 'var(--space-3)',
                    backgroundColor: 'var(--color-surface-2)',
                    borderRadius: 'var(--radius-control)',
                    border: '1px solid var(--color-divider)',
                  }}
                >
                  <div style={{ fontSize: 'var(--font-size-xs)' }}>
                    <strong style={{ color: 'var(--color-text)' }}>العضلات الأساسية: </strong>
                    <span style={{ color: primarySummary ? 'var(--color-danger)' : 'var(--color-text-2)', fontWeight: '600' }}>
                      {primarySummary || 'لم تحدد'}
                    </span>
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)' }}>
                    <strong style={{ color: 'var(--color-text)' }}>العضلات المساعدة: </strong>
                    <span style={{ color: secondarySummary ? 'var(--color-warning-text, #d97706)' : 'var(--color-text-2)', fontWeight: '600' }}>
                      {secondarySummary || 'لم تحدد'}
                    </span>
                  </div>
                </div>

                {/* Groups from muscle-names.json */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {muscleNamesData.groups.map((grp) => (
                    <div
                      key={grp.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-2)',
                        padding: 'var(--space-2) var(--space-3)',
                        borderRadius: 'var(--radius-control)',
                        backgroundColor: 'var(--color-surface-2)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: 'bold',
                          color: 'var(--color-text-2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-1)',
                        }}
                      >
                        <span>{grp.gym_ar}</span>
                        <bdi dir="ltr" style={{ opacity: 0.8 }}>({grp.sci_en})</bdi>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                        {grp.members.map((mId) => {
                          const mInfo = getMuscleInfo(mId)
                          const targetMatch = muscles.find((t) => t.id === mId)
                          const currentRole = targetMatch?.role
                          const isPickerOpen = activeMusclePickerId === mId

                          let border = '1px solid var(--color-divider)'
                          let bg = 'var(--color-surface)'
                          let color = 'var(--color-text)'

                          if (currentRole === 'primary') {
                            border = '1px solid var(--atlas-primary-stroke, #b91c1c)'
                            bg = 'var(--atlas-primary, #ef4444)'
                            color = '#ffffff'
                          } else if (currentRole === 'secondary') {
                            border = '1px solid var(--atlas-secondary-stroke, #d97706)'
                            bg = 'var(--atlas-secondary, #f59e0b)'
                            color = '#0b0c0e'
                          }

                          return (
                            <div
                              key={mId}
                              style={{
                                display: 'inline-flex',
                                flexDirection: 'column',
                                gap: 'var(--space-1)',
                              }}
                            >
                              <button
                                type="button"
                                data-testid={`muscle-chip-${mId}`}
                                onClick={() =>
                                  setActiveMusclePickerId(isPickerOpen ? null : mId)
                                }
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
                                  minHeight: '36px',
                                }}
                              >
                                <span>{mInfo?.gymAr || mId}</span>
                                {mInfo?.sciEn && (
                                  <bdi dir="ltr" style={{ opacity: 0.85, fontSize: '10px' }}>
                                    ({mInfo.sciEn})
                                  </bdi>
                                )}
                                {currentRole === 'primary' && (
                                  <span style={{ fontWeight: 'bold', marginInlineStart: '4px' }}>
                                    أساسية
                                  </span>
                                )}
                                {currentRole === 'secondary' && (
                                  <span style={{ fontWeight: 'bold', marginInlineStart: '4px' }}>
                                    مساعدة
                                  </span>
                                )}
                              </button>

                              {/* 3-option Segmented Control when chip tapped */}
                              {isPickerOpen && (
                                <div
                                  data-testid={`role-picker-${mId}`}
                                  style={{
                                    display: 'flex',
                                    borderRadius: 'var(--radius-control)',
                                    border: '1px solid var(--color-divider)',
                                    overflow: 'hidden',
                                    backgroundColor: 'var(--color-surface)',
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleSetMuscleRole(mId, 'primary')
                                      setActiveMusclePickerId(null)
                                    }}
                                    style={{
                                      flex: 1,
                                      padding: '4px 6px',
                                      fontSize: '11px',
                                      fontWeight: '600',
                                      border: 'none',
                                      cursor: 'pointer',
                                      backgroundColor:
                                        currentRole === 'primary'
                                          ? 'var(--atlas-primary, #ef4444)'
                                          : 'transparent',
                                      color:
                                        currentRole === 'primary'
                                          ? '#ffffff'
                                          : 'var(--color-danger, #ef4444)',
                                    }}
                                  >
                                    أساسية
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleSetMuscleRole(mId, 'secondary')
                                      setActiveMusclePickerId(null)
                                    }}
                                    style={{
                                      flex: 1,
                                      padding: '4px 6px',
                                      fontSize: '11px',
                                      fontWeight: '600',
                                      border: 'none',
                                      borderInline: '1px solid var(--color-divider)',
                                      cursor: 'pointer',
                                      backgroundColor:
                                        currentRole === 'secondary'
                                          ? 'var(--atlas-secondary, #f59e0b)'
                                          : 'transparent',
                                      color:
                                        currentRole === 'secondary'
                                          ? '#0b0c0e'
                                          : 'var(--color-warning-text, #d97706)',
                                    }}
                                  >
                                    مساعدة
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleSetMuscleRole(mId, 'none')
                                      setActiveMusclePickerId(null)
                                    }}
                                    style={{
                                      flex: 1,
                                      padding: '4px 6px',
                                      fontSize: '11px',
                                      border: 'none',
                                      cursor: 'pointer',
                                      backgroundColor: !currentRole
                                        ? 'var(--color-surface-2)'
                                        : 'transparent',
                                      color: 'var(--color-text-2)',
                                    }}
                                  >
                                    مش مستهدفة
                                  </button>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal Note (Max 500 chars with correct counter order <bdi dir="ltr">{personalNote.length} / 500</bdi>) */}
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
                    <bdi dir="ltr">{personalNote.length} / 500</bdi>
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
                    textAlign: 'start',
                    resize: 'none',
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
            </>
          )}
        </div>
      </Sheet>

      {/* Confirmation for "رجّع الأصلي" */}
      <ConfirmSheet
        isOpen={showConfirmReset}
        onCancel={() => setShowConfirmReset(false)}
        onConfirm={handleReset}
        title="تأكيد استعادة التمرين الأصلي"
        message="سيتم حذف كافة التعديلات واستعادة البيانات الأصلية للتمرين، بما في ذلك: الاسم، صورة التمرين، خطوات الأداء، استهداف العضلات، الملاحظة الشخصية، ورابط الفيديو."
        confirmLabel="نعم، رجّع الأصلي"
        cancelLabel="إلغاء"
        isDestructive
      />

      {/* Confirmation for closing with unsaved changes */}
      <ConfirmSheet
        isOpen={showConfirmClose}
        onCancel={() => setShowConfirmClose(false)}
        onConfirm={() => {
          setShowConfirmClose(false)
          onClose()
        }}
        title="تغييرات غير محفوظة"
        message="عندك تعديلات لم يتم حفظها. هل تريد الخروج وتجاهل هذه التعديلات؟"
        confirmLabel="نعم، تجاهل التعديلات"
        cancelLabel="الرجوع للتعديل"
        isDestructive
      />
    </>
  )
}
