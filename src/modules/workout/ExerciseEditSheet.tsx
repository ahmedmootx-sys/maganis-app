/**
 * src/modules/workout/ExerciseEditSheet.tsx
 *
 * Implements Task H2.2 & Task H3-B B3.4:
 * Full exercise editor sheet for overrides and custom exercises.
 * - Split into 5 collapsible sections («البيانات»، «الصورة»، «العضلات»، «الشرح»، «الفيديو والملاحظة»)
 *   with a sticky section tab bar (only one open at a time; collapsed headers show state summary).
 * - Media section supports 4 modes: «الأصلية» (if present), «من غير صورة», «صورتي أو GIF» (upload), «رابط» (external HTTPS).
 *   - Upload GIF: magic byte validation, <=2MB limit with Arabic warning, static first-frame extraction for lists.
 *   - External link: https-only, <=2048 chars, tested via Image() load with 10s timeout before saving.
 *   - Binary blobs stored exclusively in IndexedDB (maganis_media).
 * - Muscle targeting: gym slang first, scientific English on a second line in <bdi dir="ltr"> (NO brackets, R5).
 * - Auto-growing textareas (min 4 lines, max 40vh, text-align: start).
 * - Personal note counter: <bdi dir="ltr">{personalNote.length} / 500</bdi>.
 * - Step controls: 44x44px chevron buttons + delete + step numbers.
 * - Sticky footer with «حفظ التعديلات» and «إلغاء».
 * - Focus support: focusField="video" jumps to video URL, focusField="media" / "image" jumps to media section.
 */

import React, { useState, useMemo, useEffect } from 'react'
import type { Exercise, ExerciseMuscleTarget } from '../shared/types.ts'
import {
  getExerciseOverride,
  saveExerciseOverride,
  deleteExerciseOverride,
  resizeUserImage,
  validateGifMagicBytes,
  extractFirstFrame,
  validateExternalUrl,
  testExternalImageLoad,
  getCustomExerciseMedia,
  type ExerciseOverride,
  type OverrideMediaKind,
} from './exerciseOverrides.ts'
import { Sheet } from '../../ui/Sheet.tsx'
import { Button } from '../../ui/Button.tsx'
import { ConfirmSheet } from '../../ui/ConfirmSheet.tsx'
import { Icon } from '../../ui/Icon.tsx'
import { useToast } from '../../ui/Toast.tsx'
import { getMuscleInfo } from '../../utils/labels.ts'
import muscleNamesData from '../../data/muscle-names.json'

export type EditSectionKey =
  'data' | 'media' | 'muscles' | 'instructions' | 'video_notes'

export interface ExerciseEditSheetProps {
  isOpen: boolean
  onClose: () => void
  exercise: Exercise
  onSaved?: (updated: Exercise) => void
  onResetOriginal?: () => void
  /** Field to scroll to and focus once the sheet is open */
  focusField?: 'video' | 'media' | 'image' | null
}

export const ExerciseEditSheet: React.FC<ExerciseEditSheetProps> = ({
  isOpen,
  onClose,
  exercise,
  onSaved,
  onResetOriginal,
  focusField = null,
}) => {
  let showToast: ReturnType<typeof useToast>['showToast'] | undefined
  try {
    const toastCtx = useToast()
    showToast = toastCtx.showToast
  } catch {
    // outside ToastProvider in isolated test environments
  }

  const existingOverride = useMemo(
    () =>
      isOpen
        ? getExerciseOverride(exercise.id)
        : getExerciseOverride(exercise.id),
    [exercise.id, isOpen],
  )

  const [showOriginal, setShowOriginal] = useState(false)
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  const [showConfirmClose, setShowConfirmClose] = useState(false)
  const [activeMusclePickerId, setActiveMusclePickerId] = useState<
    string | null
  >(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Section State: only one open at a time
  const [activeSection, setActiveSection] = useState<EditSectionKey>(() => {
    if (focusField === 'video') return 'video_notes'
    if (focusField === 'media' || focusField === 'image') return 'media'
    return 'data'
  })

  // Form State: Data
  const [nameAr, setNameAr] = useState('')
  const [nameEn, setNameEn] = useState('')

  // Form State: Media
  // Mode: 'original' | 'none' | 'custom' | 'external'
  const [mediaMode, setMediaMode] = useState<
    'original' | 'none' | 'custom' | 'external'
  >('original')
  const [mediaKind, setMediaKind] = useState<OverrideMediaKind>('upload-image')
  const [customImageBlob, setCustomImageBlob] = useState<string>('')
  const [customGifFirstFrame, setCustomGifFirstFrame] = useState<string>('')
  const [externalUrl, setExternalUrl] = useState<string>('')
  const [externalUrlStatus, setExternalUrlStatus] = useState<
    'idle' | 'testing' | 'valid' | 'invalid'
  >('idle')

  // Form State: Instructions
  const [benefitAr, setBenefitAr] = useState('')
  const [mechanicsAr, setMechanicsAr] = useState('')
  const [steps, setSteps] = useState<string[]>([])
  const [newStepText, setNewStepText] = useState('')

  // Form State: Muscles
  const [muscles, setMuscles] = useState<ExerciseMuscleTarget[]>([])

  // Form State: Video & Notes
  const [personalNote, setPersonalNote] = useState('')
  const [videoUrl, setVideoUrl] = useState('')

  const hasCatalogMedia = useMemo(() => {
    return Boolean(
      exercise.media ||
      exercise.imageUrl ||
      exercise.image ||
      exercise.thumbnailUrl ||
      exercise.gifUrl,
    )
  }, [exercise])

  // Sync state when opened
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('')
      setShowOriginal(false)
      setActiveMusclePickerId(null)
      setIsSaving(false)

      const ov = existingOverride
      setNameAr(ov?.nameAr ?? exercise.nameAr ?? '')
      setNameEn(ov?.nameEn ?? exercise.nameEn ?? exercise.name ?? '')

      // Sync media mode
      const cachedMedia = getCustomExerciseMedia(exercise.id)
      if (ov?.imageMode === 'none') {
        setMediaMode('none')
        setCustomImageBlob('')
        setCustomGifFirstFrame('')
        setExternalUrl('')
      } else if (ov?.media) {
        if (
          ov.media.kind === 'upload-image' ||
          ov.media.kind === 'upload-gif'
        ) {
          setMediaMode('custom')
          setMediaKind(ov.media.kind)
          setCustomImageBlob(cachedMedia?.dataUrl || ov.customImageBlob || '')
          setCustomGifFirstFrame(cachedMedia?.firstFrameUrl || '')
          setExternalUrl('')
        } else if (
          ov.media.kind === 'external-image' ||
          ov.media.kind === 'external-gif'
        ) {
          setMediaMode('external')
          setMediaKind(ov.media.kind)
          setExternalUrl(ov.media.url || '')
          setCustomImageBlob('')
          setCustomGifFirstFrame('')
        }
      } else if (
        ov?.imageMode === 'custom' &&
        (ov.customImageBlob || cachedMedia?.dataUrl)
      ) {
        setMediaMode('custom')
        setMediaKind('upload-image')
        setCustomImageBlob(cachedMedia?.dataUrl || ov.customImageBlob || '')
        setCustomGifFirstFrame('')
        setExternalUrl('')
      } else {
        setMediaMode('original')
        setCustomImageBlob('')
        setCustomGifFirstFrame('')
        setExternalUrl('')
      }

      setBenefitAr(
        ov?.benefitAr ?? exercise.benefitAr ?? exercise.benefit ?? '',
      )
      setMechanicsAr(
        ov?.mechanicsAr ?? exercise.mechanicsAr ?? exercise.mechanics ?? '',
      )

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

      // Handle focusField navigation
      if (focusField === 'video') {
        setActiveSection('video_notes')
      } else if (focusField === 'media' || focusField === 'image') {
        setActiveSection('media')
      } else {
        setActiveSection('data')
      }
    }
  }, [isOpen, exercise, existingOverride, focusField])

  // Jump to field requested
  useEffect(() => {
    if (!isOpen) return

    if (focusField === 'video') {
      setActiveSection('video_notes')
      const timer = window.setTimeout(() => {
        const el = document.getElementById('edit-video-url')
        if (el) {
          el.scrollIntoView({ block: 'center' })
          ;(el as HTMLInputElement).focus({ preventScroll: true })
        }
      }, 150)
      return () => window.clearTimeout(timer)
    }

    if (focusField === 'media' || focusField === 'image') {
      setActiveSection('media')
      const timer = window.setTimeout(() => {
        const el = document.getElementById('edit-section-media')
        if (el) {
          el.scrollIntoView({ block: 'start' })
        }
      }, 150)
      return () => window.clearTimeout(timer)
    }
  }, [isOpen, focusField])

  const isDirty = useMemo(() => {
    const ov = existingOverride
    const origNameAr = ov?.nameAr ?? exercise.nameAr ?? ''
    const origNameEn = ov?.nameEn ?? exercise.nameEn ?? exercise.name ?? ''
    const origImageMode = ov?.imageMode ?? 'original'
    const origBenefitAr =
      ov?.benefitAr ?? exercise.benefitAr ?? exercise.benefit ?? ''
    const origMechanicsAr =
      ov?.mechanicsAr ?? exercise.mechanicsAr ?? exercise.mechanics ?? ''
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
    if (benefitAr !== origBenefitAr) return true
    if (mechanicsAr !== origMechanicsAr) return true
    if (personalNote !== origPersonalNote) return true
    if (videoUrl !== origVideoUrl) return true
    if (JSON.stringify(steps) !== JSON.stringify(origSteps)) return true
    if (JSON.stringify(muscles) !== JSON.stringify(origMuscles)) return true

    if (mediaMode === 'none' && origImageMode !== 'none') return true
    if (mediaMode === 'original' && origImageMode !== 'original') return true
    if (mediaMode === 'custom') {
      if (customImageBlob && customImageBlob !== ov?.customImageBlob)
        return true
    }
    if (mediaMode === 'external') {
      if (externalUrl && externalUrl !== ov?.media?.url) return true
    }

    return false
  }, [
    nameAr,
    nameEn,
    mediaMode,
    customImageBlob,
    externalUrl,
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
  const handleSetMuscleRole = (
    muscleId: string,
    role: 'primary' | 'secondary' | 'none',
  ) => {
    if (role === 'none') {
      setMuscles(muscles.filter((m) => m.id !== muscleId))
    } else {
      const exists = muscles.some((m) => m.id === muscleId)
      if (exists) {
        setMuscles(muscles.map((m) => (m.id === muscleId ? { ...m, role } : m)))
      } else {
        setMuscles([...muscles, { id: muscleId, role }])
      }
    }
  }

  // File Picker for custom image / GIF (Task H2.2)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setErrorMsg('')
    try {
      const isGif = await validateGifMagicBytes(file)
      if (isGif) {
        if (file.size > 2 * 1024 * 1024) {
          setErrorMsg('الـ GIF كبير، استخدم رابط بدل الرفع')
          return
        }
        const reader = new FileReader()
        reader.onload = async () => {
          const dataUrl = reader.result as string
          const firstFrame = await extractFirstFrame(file)
          setCustomImageBlob(dataUrl)
          setCustomGifFirstFrame(firstFrame)
          setMediaKind('upload-gif')
          setMediaMode('custom')
          setErrorMsg('')
        }
        reader.readAsDataURL(file)
      } else {
        const resized = await resizeUserImage(file)
        setCustomImageBlob(resized)
        setCustomGifFirstFrame('')
        setMediaKind('upload-image')
        setMediaMode('custom')
        setErrorMsg('')
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'فشل في معالجة ملف الصورة')
    }
  }

  const handleSave = async () => {
    setErrorMsg('')
    setIsSaving(true)

    try {
      // Validate external link if chosen
      if (mediaMode === 'external') {
        const urlValidation = validateExternalUrl(externalUrl)
        if (!urlValidation.valid) {
          setErrorMsg(urlValidation.error || 'الرابط غير صالح')
          setIsSaving(false)
          setActiveSection('media')
          return
        }

        const canLoad = await testExternalImageLoad(externalUrl, 10000)
        if (!canLoad) {
          setErrorMsg(
            'تعذر تحميل الصورة من الرابط، اتأكد من الرابط أو الاتصال بالإنترنت',
          )
          setIsSaving(false)
          setActiveSection('media')
          return
        }
      }

      let imageModeValue: 'original' | 'none' | 'custom' = 'original'
      let mediaOverrideObj: ExerciseOverride['media'] = undefined
      let mediaPayload:
        { dataUrl?: string; firstFrameUrl?: string } | undefined = undefined

      if (mediaMode === 'none') {
        imageModeValue = 'none'
      } else if (mediaMode === 'custom') {
        imageModeValue = 'custom'
        mediaOverrideObj = {
          kind: mediaKind,
          blobKey: exercise.id,
          updatedAt: Date.now(),
        }
        mediaPayload = {
          dataUrl: customImageBlob,
          firstFrameUrl:
            mediaKind === 'upload-gif' ? customGifFirstFrame : undefined,
        }
      } else if (mediaMode === 'external') {
        imageModeValue = 'custom'
        const isGif =
          externalUrl.toLowerCase().includes('.gif') ||
          externalUrl.toLowerCase().includes('format=gif')
        mediaOverrideObj = {
          kind: isGif ? 'external-gif' : 'external-image',
          url: externalUrl.trim(),
          updatedAt: Date.now(),
        }
      }

      const overrideData: ExerciseOverride = {
        exerciseId: exercise.id,
        nameAr: nameAr.trim() || undefined,
        nameEn: nameEn.trim() || undefined,
        imageMode: imageModeValue,
        media: mediaOverrideObj,
        benefitAr: benefitAr.trim() || undefined,
        mechanicsAr: mechanicsAr.trim() || undefined,
        howToStepsAr: steps.length > 0 ? steps : undefined,
        muscles: muscles.length > 0 ? muscles : undefined,
        personalNote: personalNote.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
      }

      await saveExerciseOverride(overrideData, mediaPayload)

      onSaved?.({
        ...exercise,
        nameAr: overrideData.nameAr || exercise.nameAr,
        nameEn: overrideData.nameEn || exercise.nameEn,
        benefitAr: overrideData.benefitAr || exercise.benefitAr,
        mechanicsAr: overrideData.mechanicsAr || exercise.mechanicsAr,
        howToStepsAr: overrideData.howToStepsAr || exercise.howToStepsAr,
        muscles: overrideData.muscles || exercise.muscles,
      })

      if (showToast) {
        showToast({
          message: 'تم حفظ تعديلات التمرين بنجاح',
          duration: 3000,
        })
      }

      onClose()
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'حدث خطأ أثناء حفظ التعديلات')
    } finally {
      setIsSaving(false)
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
                howToStepsAr:
                  prevOverride.howToStepsAr || exercise.howToStepsAr,
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
    const maxHeight =
      typeof window !== 'undefined' ? window.innerHeight * 0.4 : 320
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`
  }

  // Summaries for collapsed section headers
  const dataSummary = nameAr.trim() || exercise.nameAr
  const mediaSummary = useMemo(() => {
    if (mediaMode === 'none') return 'من غير صورة'
    if (mediaMode === 'custom') {
      return mediaKind === 'upload-gif' ? 'ملف GIF مخصص' : 'صورة مخصصة'
    }
    if (mediaMode === 'external') {
      return externalUrl ? 'رابط خارجي' : 'لم يحدد'
    }
    return 'الأصلية'
  }, [mediaMode, mediaKind, externalUrl])

  const musclesSummary = primarySummary
    ? `أساسية: ${primarySummary}`
    : 'لم تحدد'
  const instructionsSummary = `${steps.length} خطوات`
  const videoNotesSummary = videoUrl
    ? 'يوجد فيديو شرح'
    : personalNote
      ? 'توجد ملاحظة'
      : 'فارغ'

  const sections: Array<{
    key: EditSectionKey
    title: string
    summary: string
  }> = [
    { key: 'data', title: 'البيانات', summary: dataSummary },
    { key: 'media', title: 'الصورة', summary: mediaSummary },
    { key: 'muscles', title: 'العضلات', summary: musclesSummary },
    { key: 'instructions', title: 'الشرح', summary: instructionsSummary },
    {
      key: 'video_notes',
      title: 'الفيديو والملاحظة',
      summary: videoNotesSummary,
    },
  ]

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
              style={{ flex: 1, minHeight: '44px' }}
            >
              إلغاء
            </Button>
            <Button
              variant="primary"
              data-testid="btn-save-edit"
              onClick={handleSave}
              disabled={isSaving}
              style={{ flex: 2, minHeight: '44px' }}
            >
              {isSaving ? 'جارِ الحفظ...' : 'حفظ التعديلات'}
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
            <span
              style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
              }}
            >
              {showOriginal
                ? 'عرض البيانات الأصلية (للمعاينة فقط)'
                : 'تعديل بيانات التمرين'}
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
                minHeight: '36px',
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
                <strong
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-2)',
                  }}
                >
                  الاسم بالعربي:
                </strong>
                <div>{exercise.nameAr}</div>
              </div>
              {exercise.nameEn && (
                <div>
                  <strong
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-2)',
                    }}
                  >
                    الاسم بالإنجليزي:
                  </strong>
                  <div>
                    <bdi dir="ltr">{exercise.nameEn}</bdi>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Sticky Section Bar (B3.4) */}
              <div
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                  background: 'var(--color-surface)',
                  padding: '4px 0 8px 0',
                  borderBottom: '1px solid var(--color-divider)',
                  display: 'flex',
                  gap: '6px',
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                }}
              >
                {sections.map((sec) => {
                  const isActive = activeSection === sec.key
                  return (
                    <button
                      key={sec.key}
                      type="button"
                      onClick={() => setActiveSection(sec.key)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-control)',
                        border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                        backgroundColor: isActive
                          ? 'var(--color-accent-tint, rgba(255, 107, 0, 0.12))'
                          : 'var(--color-surface-2)',
                        color: isActive
                          ? 'var(--color-accent-text, #ff6b00)'
                          : 'var(--color-text)',
                        fontSize: '13px',
                        fontWeight: isActive ? 700 : 500,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        minHeight: '36px',
                        flexShrink: 0,
                      }}
                    >
                      {sec.title}
                    </button>
                  )
                })}
              </div>

              {/* 1. SECTION: البيانات (Data) */}
              <div
                style={{
                  border: '1px solid var(--color-divider)',
                  borderRadius: 'var(--radius-card)',
                  overflow: 'hidden',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setActiveSection(activeSection === 'data' ? 'data' : 'data')
                  }
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: 'none',
                    background:
                      activeSection === 'data'
                        ? 'var(--color-surface-2)'
                        : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'right',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>
                      البيانات الأساسية
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'var(--color-text-2)',
                        marginTop: '2px',
                      }}
                    >
                      {dataSummary}
                    </span>
                  </div>
                  <Icon
                    name={
                      activeSection === 'data' ? 'chevron-up' : 'chevron-down'
                    }
                    size={18}
                  />
                </button>

                {activeSection === 'data' && (
                  <div
                    style={{
                      padding: 'var(--space-3)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-3)',
                      borderTop: '1px solid var(--color-divider)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-1)',
                      }}
                    >
                      <label
                        htmlFor="edit-name-ar"
                        style={{
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 'var(--font-weight-semibold)',
                        }}
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

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-1)',
                      }}
                    >
                      <label
                        htmlFor="edit-name-en"
                        style={{
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 'var(--font-weight-semibold)',
                        }}
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
                  </div>
                )}
              </div>

              {/* 2. SECTION: الصورة (Media) - Task H2.2 */}
              <div
                id="edit-section-media"
                style={{
                  border: '1px solid var(--color-divider)',
                  borderRadius: 'var(--radius-card)',
                  overflow: 'hidden',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setActiveSection(
                      activeSection === 'media' ? 'media' : 'media',
                    )
                  }
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: 'none',
                    background:
                      activeSection === 'media'
                        ? 'var(--color-surface-2)'
                        : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'right',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>
                      صورة التمرين
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'var(--color-text-2)',
                        marginTop: '2px',
                      }}
                    >
                      {mediaSummary}
                    </span>
                  </div>
                  <Icon
                    name={
                      activeSection === 'media' ? 'chevron-up' : 'chevron-down'
                    }
                    size={18}
                  />
                </button>

                {activeSection === 'media' && (
                  <div
                    style={{
                      padding: 'var(--space-3)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-3)',
                      borderTop: '1px solid var(--color-divider)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: 'var(--space-2)',
                        flexWrap: 'wrap',
                      }}
                    >
                      {hasCatalogMedia && (
                        <button
                          type="button"
                          data-testid="img-mode-original"
                          onClick={() => setMediaMode('original')}
                          style={{
                            flex: 1,
                            minWidth: '70px',
                            minHeight: 'var(--touch-target-min)',
                            borderRadius: 'var(--radius-control)',
                            border: `1px solid ${mediaMode === 'original' ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                            backgroundColor:
                              mediaMode === 'original'
                                ? 'var(--color-accent-tint)'
                                : 'var(--color-surface)',
                            color:
                              mediaMode === 'original'
                                ? 'var(--color-accent-text)'
                                : 'var(--color-text)',
                            fontWeight: 'var(--font-weight-semibold)',
                            cursor: 'pointer',
                          }}
                        >
                          الأصلية
                        </button>
                      )}

                      <button
                        type="button"
                        data-testid="img-mode-none"
                        onClick={() => setMediaMode('none')}
                        style={{
                          flex: 1,
                          minWidth: '70px',
                          minHeight: 'var(--touch-target-min)',
                          borderRadius: 'var(--radius-control)',
                          border: `1px solid ${mediaMode === 'none' ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                          backgroundColor:
                            mediaMode === 'none'
                              ? 'var(--color-accent-tint)'
                              : 'var(--color-surface)',
                          color:
                            mediaMode === 'none'
                              ? 'var(--color-accent-text)'
                              : 'var(--color-text)',
                          fontWeight: 'var(--font-weight-semibold)',
                          cursor: 'pointer',
                        }}
                      >
                        من غير صورة
                      </button>

                      <button
                        type="button"
                        data-testid="img-mode-custom"
                        onClick={() => setMediaMode('custom')}
                        style={{
                          flex: 1,
                          minWidth: '70px',
                          minHeight: 'var(--touch-target-min)',
                          borderRadius: 'var(--radius-control)',
                          border: `1px solid ${mediaMode === 'custom' ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                          backgroundColor:
                            mediaMode === 'custom'
                              ? 'var(--color-accent-tint)'
                              : 'var(--color-surface)',
                          color:
                            mediaMode === 'custom'
                              ? 'var(--color-accent-text)'
                              : 'var(--color-text)',
                          fontWeight: 'var(--font-weight-semibold)',
                          cursor: 'pointer',
                        }}
                      >
                        صورتي أو GIF
                      </button>

                      <button
                        type="button"
                        data-testid="img-mode-external"
                        onClick={() => setMediaMode('external')}
                        style={{
                          flex: 1,
                          minWidth: '70px',
                          minHeight: 'var(--touch-target-min)',
                          borderRadius: 'var(--radius-control)',
                          border: `1px solid ${mediaMode === 'external' ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                          backgroundColor:
                            mediaMode === 'external'
                              ? 'var(--color-accent-tint)'
                              : 'var(--color-surface)',
                          color:
                            mediaMode === 'external'
                              ? 'var(--color-accent-text)'
                              : 'var(--color-text)',
                          fontWeight: 'var(--font-weight-semibold)',
                          cursor: 'pointer',
                        }}
                      >
                        رابط
                      </button>
                    </div>

                    {/* Mode: Custom file upload */}
                    {mediaMode === 'custom' && (
                      <div
                        style={{
                          marginTop: 'var(--space-2)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 'var(--space-2)',
                        }}
                      >
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          data-testid="custom-file-input"
                          onChange={handleFileChange}
                          style={{ fontSize: 'var(--font-size-sm)' }}
                        />
                        <span
                          style={{
                            fontSize: '11px',
                            color: 'var(--color-text-2)',
                          }}
                        >
                          يقبل صور JPEG/PNG/WebP (يتم تصغيرها تلقائياً) أو ملف
                          GIF متحرك (حد أقصى 2 ميجابايت).
                        </span>

                        {customImageBlob && (
                          <div
                            style={{
                              marginTop: 'var(--space-2)',
                              textAlign: 'center',
                              position: 'relative',
                              display: 'inline-block',
                              margin: '0 auto',
                            }}
                          >
                            <img
                              src={customImageBlob}
                              alt="معاينة الصورة"
                              data-testid="preview-custom-image"
                              style={{
                                maxWidth: '200px',
                                maxHeight: '200px',
                                borderRadius: 'var(--radius-control)',
                                border: '1px solid var(--color-divider)',
                                objectFit: 'contain',
                                display: 'block',
                              }}
                            />
                            <button
                              type="button"
                              data-testid="btn-remove-custom-image"
                              onClick={() => {
                                setCustomImageBlob('')
                                setCustomGifFirstFrame('')
                              }}
                              style={{
                                marginTop: '6px',
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-danger)',
                                fontSize: '12px',
                                cursor: 'pointer',
                              }}
                            >
                              حذف الصورة المخصصة
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Mode: External link */}
                    {mediaMode === 'external' && (
                      <div
                        style={{
                          marginTop: 'var(--space-2)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 'var(--space-2)',
                        }}
                      >
                        <label
                          htmlFor="edit-external-url"
                          style={{
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 'var(--font-weight-semibold)',
                          }}
                        >
                          رابط صورة أو GIF
                        </label>
                        <input
                          id="edit-external-url"
                          data-testid="input-external-media-url"
                          type="url"
                          dir="ltr"
                          placeholder="https://example.com/demo.gif"
                          value={externalUrl}
                          onChange={(e) => {
                            setExternalUrl(e.target.value)
                            setExternalUrlStatus('idle')
                          }}
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
                        <span
                          style={{
                            fontSize: '11px',
                            color: 'var(--color-text-2)',
                          }}
                        >
                          لازم الرابط يبدأ بـ https:// (يعمل أونلاين فقط ولا يتم
                          نسخه لجهازك).
                        </span>

                        {externalUrl && (
                          <div
                            style={{
                              marginTop: 'var(--space-2)',
                              textAlign: 'center',
                              margin: '0 auto',
                            }}
                          >
                            <img
                              src={externalUrl}
                              alt="معاينة الرابط الخارجي"
                              referrerPolicy="no-referrer"
                              loading="lazy"
                              onError={() => setExternalUrlStatus('invalid')}
                              onLoad={() => setExternalUrlStatus('valid')}
                              style={{
                                maxWidth: '200px',
                                maxHeight: '200px',
                                borderRadius: 'var(--radius-control)',
                                border: '1px solid var(--color-divider)',
                                objectFit: 'contain',
                                display: 'block',
                              }}
                            />
                            {externalUrlStatus === 'invalid' && (
                              <span
                                style={{
                                  fontSize: '12px',
                                  color: 'var(--color-danger)',
                                  marginTop: '4px',
                                  display: 'block',
                                }}
                              >
                                تعذر تحميل الصورة من الرابط، اتأكد من الرابط أو
                                الاتصال بالإنترنت
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. SECTION: العضلات (Muscles) - B3.4 */}
              <div
                style={{
                  border: '1px solid var(--color-divider)',
                  borderRadius: 'var(--radius-card)',
                  overflow: 'hidden',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setActiveSection(
                      activeSection === 'muscles' ? 'muscles' : 'muscles',
                    )
                  }
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: 'none',
                    background:
                      activeSection === 'muscles'
                        ? 'var(--color-surface-2)'
                        : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'right',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>
                      العضلات المستهدفة
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'var(--color-text-2)',
                        marginTop: '2px',
                      }}
                    >
                      {musclesSummary}
                    </span>
                  </div>
                  <Icon
                    name={
                      activeSection === 'muscles'
                        ? 'chevron-up'
                        : 'chevron-down'
                    }
                    size={18}
                  />
                </button>

                {activeSection === 'muscles' && (
                  <div
                    style={{
                      padding: 'var(--space-3)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-3)',
                      borderTop: '1px solid var(--color-divider)',
                    }}
                  >
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
                        <strong style={{ color: 'var(--color-text)' }}>
                          العضلات الأساسية:{' '}
                        </strong>
                        <span
                          style={{
                            color: primarySummary
                              ? 'var(--color-danger)'
                              : 'var(--color-text-2)',
                            fontWeight: '600',
                          }}
                        >
                          {primarySummary || 'لم تحدد'}
                        </span>
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)' }}>
                        <strong style={{ color: 'var(--color-text)' }}>
                          العضلات المساعدة:{' '}
                        </strong>
                        <span
                          style={{
                            color: secondarySummary
                              ? 'var(--color-warning-text, #d97706)'
                              : 'var(--color-text-2)',
                            fontWeight: '600',
                          }}
                        >
                          {secondarySummary || 'لم تحدد'}
                        </span>
                      </div>
                    </div>

                    {/* Muscle Groups: gym slang first, English on 2nd line, NO brackets (R5, B3.4) */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-3)',
                      }}
                    >
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
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px',
                            }}
                          >
                            <span
                              style={{
                                fontSize: 'var(--font-size-xs)',
                                fontWeight: 'bold',
                                color: 'var(--color-text)',
                              }}
                            >
                              {grp.gym_ar}
                            </span>
                            <bdi
                              dir="ltr"
                              style={{
                                fontSize: '11px',
                                opacity: 0.8,
                                color: 'var(--color-text-2)',
                              }}
                            >
                              {grp.sci_en}
                            </bdi>
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: 'var(--space-2)',
                            }}
                          >
                            {grp.members.map((mId) => {
                              const mInfo = getMuscleInfo(mId)
                              const targetMatch = muscles.find(
                                (t) => t.id === mId,
                              )
                              const currentRole = targetMatch?.role
                              const isPickerOpen = activeMusclePickerId === mId

                              let border = '1px solid var(--color-divider)'
                              let bg = 'var(--color-surface)'
                              let color = 'var(--color-text)'

                              if (currentRole === 'primary') {
                                border =
                                  '1px solid var(--atlas-primary-stroke, #b91c1c)'
                                bg = 'var(--atlas-primary, #ef4444)'
                                color = '#ffffff'
                              } else if (currentRole === 'secondary') {
                                border =
                                  '1px solid var(--atlas-secondary-stroke, #d97706)'
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
                                      setActiveMusclePickerId(
                                        isPickerOpen ? null : mId,
                                      )
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
                                      flexDirection: 'column',
                                      alignItems: 'flex-start',
                                      minHeight: '44px',
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                      }}
                                    >
                                      <span>{mInfo?.gymAr || mId}</span>
                                      {currentRole === 'primary' && (
                                        <span style={{ fontWeight: 'bold' }}>
                                          أساسية
                                        </span>
                                      )}
                                      {currentRole === 'secondary' && (
                                        <span style={{ fontWeight: 'bold' }}>
                                          مساعدة
                                        </span>
                                      )}
                                    </div>
                                    {mInfo?.sciEn && (
                                      <bdi
                                        dir="ltr"
                                        style={{
                                          opacity: 0.85,
                                          fontSize: '10px',
                                          marginTop: '1px',
                                        }}
                                      >
                                        {mInfo.sciEn}
                                      </bdi>
                                    )}
                                  </button>

                                  {/* 3-option Segmented Control */}
                                  {isPickerOpen && (
                                    <div
                                      data-testid={`role-picker-${mId}`}
                                      style={{
                                        display: 'flex',
                                        borderRadius: 'var(--radius-control)',
                                        border:
                                          '1px solid var(--color-divider)',
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
                                          padding: '6px 8px',
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
                                          minHeight: '36px',
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
                                          padding: '6px 8px',
                                          fontSize: '11px',
                                          fontWeight: '600',
                                          border: 'none',
                                          borderInline:
                                            '1px solid var(--color-divider)',
                                          cursor: 'pointer',
                                          backgroundColor:
                                            currentRole === 'secondary'
                                              ? 'var(--atlas-secondary, #f59e0b)'
                                              : 'transparent',
                                          color:
                                            currentRole === 'secondary'
                                              ? '#0b0c0e'
                                              : 'var(--color-warning-text, #d97706)',
                                          minHeight: '36px',
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
                                          padding: '6px 8px',
                                          fontSize: '11px',
                                          border: 'none',
                                          cursor: 'pointer',
                                          backgroundColor: !currentRole
                                            ? 'var(--color-surface-2)'
                                            : 'transparent',
                                          color: 'var(--color-text-2)',
                                          minHeight: '36px',
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
                )}
              </div>

              {/* 4. SECTION: الشرح (Instructions) */}
              <div
                style={{
                  border: '1px solid var(--color-divider)',
                  borderRadius: 'var(--radius-card)',
                  overflow: 'hidden',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setActiveSection(
                      activeSection === 'instructions'
                        ? 'instructions'
                        : 'instructions',
                    )
                  }
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: 'none',
                    background:
                      activeSection === 'instructions'
                        ? 'var(--color-surface-2)'
                        : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'right',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>
                      الشرح والخطوات
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'var(--color-text-2)',
                        marginTop: '2px',
                      }}
                    >
                      {instructionsSummary}
                    </span>
                  </div>
                  <Icon
                    name={
                      activeSection === 'instructions'
                        ? 'chevron-up'
                        : 'chevron-down'
                    }
                    size={18}
                  />
                </button>

                {activeSection === 'instructions' && (
                  <div
                    style={{
                      padding: 'var(--space-3)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-3)',
                      borderTop: '1px solid var(--color-divider)',
                    }}
                  >
                    {/* Benefit */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-1)',
                      }}
                    >
                      <label
                        htmlFor="edit-benefit"
                        style={{
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 'var(--font-weight-semibold)',
                        }}
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

                    {/* Mechanics */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-1)',
                      }}
                    >
                      <label
                        htmlFor="edit-mechanics"
                        style={{
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 'var(--font-weight-semibold)',
                        }}
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

                    {/* Steps */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-2)',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 'var(--font-weight-semibold)',
                        }}
                      >
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
                          <span
                            style={{
                              flex: 1,
                              fontSize: 'var(--font-size-sm)',
                              lineHeight: '1.5',
                            }}
                          >
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
                              cursor:
                                idx === steps.length - 1
                                  ? 'default'
                                  : 'pointer',
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

                      <div
                        style={{
                          display: 'flex',
                          gap: 'var(--space-2)',
                          marginTop: 'var(--space-1)',
                        }}
                      >
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
                        <Button
                          variant="secondary"
                          onClick={handleAddStep}
                          style={{ minHeight: '44px' }}
                        >
                          إضافة
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. SECTION: الفيديو والملاحظة (Video & Notes) */}
              <div
                style={{
                  border: '1px solid var(--color-divider)',
                  borderRadius: 'var(--radius-card)',
                  overflow: 'hidden',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setActiveSection(
                      activeSection === 'video_notes'
                        ? 'video_notes'
                        : 'video_notes',
                    )
                  }
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: 'none',
                    background:
                      activeSection === 'video_notes'
                        ? 'var(--color-surface-2)'
                        : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'right',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>
                      فيديو الشرح والملاحظة
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'var(--color-text-2)',
                        marginTop: '2px',
                      }}
                    >
                      {videoNotesSummary}
                    </span>
                  </div>
                  <Icon
                    name={
                      activeSection === 'video_notes'
                        ? 'chevron-up'
                        : 'chevron-down'
                    }
                    size={18}
                  />
                </button>

                {activeSection === 'video_notes' && (
                  <div
                    style={{
                      padding: 'var(--space-3)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-3)',
                      borderTop: '1px solid var(--color-divider)',
                    }}
                  >
                    {/* Video URL */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-1)',
                      }}
                    >
                      <label
                        htmlFor="edit-video-url"
                        style={{
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 'var(--font-weight-semibold)',
                        }}
                      >
                        رابط فيديو شرح (يوتيوب أو فيميو أو رابط مباشر)
                      </label>
                      <input
                        id="edit-video-url"
                        data-testid="input-video-url"
                        type="url"
                        dir="ltr"
                        autoFocus={focusField === 'video'}
                        placeholder="https://youtu.be/..."
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

                    {/* Personal Note */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-1)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <label
                          htmlFor="edit-personal-note"
                          style={{
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 'var(--font-weight-semibold)',
                          }}
                        >
                          ملاحظة شخصية
                        </label>
                        <span
                          style={{
                            fontSize: 'var(--font-size-xs)',
                            color:
                              personalNote.length > 500
                                ? 'var(--color-danger)'
                                : 'var(--color-text-2)',
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
                  </div>
                )}
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
