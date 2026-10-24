import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import type {
  CustomExercise,
  Difficulty,
  Equipment,
  MeasurementType,
  MuscleGroup,
  ExerciseMuscleTarget,
} from '../shared/types.ts'
import {
  DIFFICULTY_LABELS,
  EQUIPMENT_LABELS,
  MUSCLE_GROUP_LABELS,
} from '../shared/types.ts'
import { sanitizeInput } from '../../lib/sanitizer.ts'
import { MUSCLE_ATLAS } from './muscleAtlasData.ts'
import { resolveExerciseMuscles } from './legacyMuscleMapper.ts'
import {
  TopBar,
  Select,
  FileField,
  Button,
  Segmented,
  ConfirmSheet,
} from '../../ui/index.ts'
import { IconClose } from '../../components/Icons.tsx'
import muscleNamesData from '../../data/muscle-names.json'
import {
  getMuscleGymName,
  getMuscleGroup,
  type MuscleNameEntry,
} from './muscleNames.ts'
import { AnatomyMuscleMap } from './AnatomyMuscleMap.tsx'
import { plural } from '../../utils/plural.ts'

const MUSCLE_SELECT_OPTIONS = (
  muscleNamesData.muscles as MuscleNameEntry[]
).map((m) => {
  const grp = getMuscleGroup(m.group)
  return {
    value: m.id,
    label: m.gym_ar,
    labelAr: m.gym_ar,
    labelEn: m.sci_en,
    secondary: m.sci_en,
    description: grp?.gym_ar || m.group,
  }
})

export interface CustomExerciseBuilderProps {
  initialExercise?: CustomExercise
  onSave: (exercise: CustomExercise) => void
  onCancel?: () => void
}

const MUSCLE_OPTIONS = Object.entries(MUSCLE_GROUP_LABELS) as [
  MuscleGroup,
  string,
][]
const DIFFICULTY_OPTIONS = Object.entries(DIFFICULTY_LABELS) as [
  Difficulty,
  string,
][]
const EQUIPMENT_OPTIONS = Object.entries(EQUIPMENT_LABELS) as [
  Equipment,
  string,
][]

const MEASUREMENT_SEGMENTED_OPTIONS: {
  value: 'reps' | 'duration'
  labelAr: string
  helperAr: string
}[] = [
  {
    value: 'reps',
    labelAr: 'تكرارات',
    helperAr: 'حساب التمرين بعدد المجموعات والتكرارات لكل مجموعة',
  },
  {
    value: 'duration',
    labelAr: 'وقت',
    helperAr: 'حساب التمرين بمدة الثبات بالثواني أو الدقائق (مثل البلانك)',
  },
]

function uniqueId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  }
}

/** Helper component for auto-growing textarea */
function AutoGrowTextarea({
  id,
  value,
  onChange,
  placeholder,
  minRows = 4,
  'aria-label': ariaLabel,
}: {
  id?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  minRows?: number
  'aria-label'?: string
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.max(el.scrollHeight, minRows * 26)}px`
  }, [minRows])

  useEffect(() => {
    adjustHeight()
  }, [value, adjustHeight])

  return (
    <textarea
      ref={textareaRef}
      id={id}
      value={value}
      onChange={(e) => {
        onChange(e)
        adjustHeight()
      }}
      placeholder={placeholder}
      dir="rtl"
      aria-label={ariaLabel}
      className="auto-grow-textarea field-input"
      style={{
        width: '100%',
        minHeight: `${minRows * 26}px`,
        resize: 'none',
        overflow: 'hidden' /* clip-ok: auto-growing textarea */,
        lineHeight: '1.5',
        boxSizing: 'border-box',
        padding: '10px 12px',
        textAlign: 'start',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word',
      }}
    />
  )
}

export function CustomExerciseBuilder({
  initialExercise,
  onSave,
  onCancel,
}: CustomExerciseBuilderProps) {
  const [nameAr, setNameAr] = useState(initialExercise?.nameAr ?? '')
  const [nameEn, setNameEn] = useState(initialExercise?.name ?? '')
  const [descriptionAr, setDescriptionAr] = useState(
    initialExercise?.descriptionAr ?? '',
  )
  const [category, setCategory] = useState<MuscleGroup | ''>(
    initialExercise?.category ?? '',
  )
  const [difficulty, setDifficulty] = useState<Difficulty | ''>(
    initialExercise?.difficulty ?? '',
  )
  const [equipment, setEquipment] = useState<Equipment | ''>(
    initialExercise?.equipment ?? '',
  )
  const [measurementType, setMeasurementType] = useState<'reps' | 'duration'>(
    () => {
      const mt = initialExercise?.measurementType
      return mt === 'duration' ? 'duration' : 'reps'
    },
  )
  const [imageUrl, setImageUrl] = useState(initialExercise?.imageUrl ?? '')
  const [mechanicsAr, setMechanicsAr] = useState(
    initialExercise?.mechanicsAr ?? '',
  )

  // Head-level muscles
  const initialResolved = useMemo(() => {
    return resolveExerciseMuscles(initialExercise || {})
  }, [initialExercise])

  const [primaryMuscleIds, setPrimaryMuscleIds] = useState<string[]>(() => {
    return initialResolved.muscles
      .filter((m) => m.role === 'primary')
      .map((m) => m.id)
  })

  const [secondaryMuscleIds, setSecondaryMuscleIds] = useState<string[]>(() => {
    return initialResolved.muscles
      .filter((m) => m.role === 'secondary')
      .map((m) => m.id)
  })

  const [benefitAr, setBenefitAr] = useState(initialExercise?.benefitAr ?? '')
  const [howToStepsRaw, setHowToStepsRaw] = useState(
    initialExercise?.howToStepsAr?.join('\n') ?? '',
  )
  const [commonMistakesRaw, setCommonMistakesRaw] = useState(
    initialExercise?.commonMistakes?.join('\n') ?? '',
  )
  const [breathing, setBreathing] = useState(initialExercise?.breathing ?? '')
  const [error, setError] = useState('')
  const [mediaError, setMediaError] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // Dirty detection for cancel confirmation
  const isDirty = useMemo(() => {
    if (initialExercise) {
      return (
        nameAr !== (initialExercise.nameAr ?? '') ||
        nameEn !== (initialExercise.name ?? '') ||
        category !== (initialExercise.category ?? '') ||
        difficulty !== (initialExercise.difficulty ?? '') ||
        equipment !== (initialExercise.equipment ?? '') ||
        imageUrl !== (initialExercise.imageUrl ?? '')
      )
    }
    return Boolean(
      nameAr ||
        nameEn ||
        descriptionAr ||
        category ||
        difficulty ||
        equipment ||
        primaryMuscleIds.length > 0 ||
        secondaryMuscleIds.length > 0 ||
        imageUrl ||
        mechanicsAr ||
        benefitAr ||
        howToStepsRaw ||
        commonMistakesRaw ||
        breathing,
    )
  }, [
    initialExercise,
    nameAr,
    nameEn,
    descriptionAr,
    category,
    difficulty,
    equipment,
    primaryMuscleIds,
    secondaryMuscleIds,
    imageUrl,
    mechanicsAr,
    benefitAr,
    howToStepsRaw,
    commonMistakesRaw,
    breathing,
  ])

  function handleCancelClick() {
    if (isDirty) {
      setShowCancelConfirm(true)
    } else {
      onCancel?.()
    }
  }

  function handleTogglePrimary(id: string) {
    if (primaryMuscleIds.includes(id)) {
      setPrimaryMuscleIds((prev) => prev.filter((m) => m !== id))
    } else {
      setError('')
      setPrimaryMuscleIds((prev) => [...prev, id])
      setSecondaryMuscleIds((prev) => prev.filter((m) => m !== id))
    }
  }

  function handleToggleSecondary(id: string) {
    if (secondaryMuscleIds.includes(id)) {
      setSecondaryMuscleIds((prev) => prev.filter((m) => m !== id))
    } else {
      setError('')
      setSecondaryMuscleIds((prev) => [...prev, id])
      setPrimaryMuscleIds((prev) => prev.filter((m) => m !== id))
    }
  }

  const currentMuscles: ExerciseMuscleTarget[] = useMemo(() => {
    return [
      ...primaryMuscleIds.map((id) => ({ id, role: 'primary' as const })),
      ...secondaryMuscleIds.map((id) => ({ id, role: 'secondary' as const })),
    ]
  }, [primaryMuscleIds, secondaryMuscleIds])

  // Count items for steps and mistakes
  const stepsList = useMemo(() => {
    return howToStepsRaw
      .split('\n')
      .map((s) => sanitizeInput(s))
      .filter((s) => s.length > 0)
  }, [howToStepsRaw])

  const mistakesList = useMemo(() => {
    return commonMistakesRaw
      .split('\n')
      .map((s) => sanitizeInput(s))
      .filter((s) => s.length > 0)
  }, [commonMistakesRaw])

  const trimmedName = sanitizeInput(nameAr)
  const canSave = Boolean(trimmedName && category && primaryMuscleIds.length > 0)

  const saveDisabledReason = useMemo(() => {
    if (!trimmedName) return 'أدخل اسم التمرين للحفظ'
    if (!category) return 'اختر المجموعة العضلية للحفظ'
    if (primaryMuscleIds.length === 0)
      return 'اختر عضلة رئيسية واحدة على الأقل للحفظ'
    return ''
  }, [trimmedName, category, primaryMuscleIds])

  async function handleSaveCopyLocally() {
    if (!imageUrl.startsWith('https://')) return
    setIsDownloading(true)
    setMediaError('')
    try {
      const res = await fetch(imageUrl)
      if (!res.ok) throw new Error('Fetch failed')
      const blob = await res.blob()
      if (blob.size > 3 * 1024 * 1024) {
        setMediaError('حجم الصورة/GIF يجب ألا يتجاوز 3 ميجابايت')
        setIsDownloading(false)
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageUrl(reader.result as string)
        setIsDownloading(false)
      }
      reader.onerror = () => {
        setMediaError('تعذر قراءة الصورة بعد التحميل')
        setIsDownloading(false)
      }
      reader.readAsDataURL(blob)
    } catch {
      setMediaError('تعذر حفظ نسخة محلية بسبب قيود الموقع الخارجي (CORS)')
      setIsDownloading(false)
    }
  }

  function proceedSave() {
    const targetNames = currentMuscles.map(
      (m) => MUSCLE_ATLAS[m.id]?.nameAr || m.id,
    )

    const exercise: CustomExercise = {
      id: initialExercise?.id || uniqueId(),
      name: sanitizeInput(nameEn) || undefined,
      nameAr: trimmedName,
      descriptionAr: sanitizeInput(descriptionAr),
      category: category as MuscleGroup,
      difficulty: (difficulty as Difficulty) || 'beginner',
      equipment: (equipment as Equipment) || 'bodyweight',
      measurementType: measurementType as MeasurementType,
      imageUrl: sanitizeInput(imageUrl) || undefined,
      mechanicsAr: sanitizeInput(mechanicsAr) || undefined,
      muscles: currentMuscles,
      targetMusclesAr: targetNames,
      benefitAr: sanitizeInput(benefitAr) || undefined,
      howToStepsAr: stepsList.length > 0 ? stepsList : undefined,
      commonMistakes: mistakesList.length > 0 ? mistakesList : undefined,
      breathing: sanitizeInput(breathing) || undefined,
      isCustom: true,
    }

    onSave(exercise)
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()

    if (!trimmedName) {
      setError('اسم التمرين مطلوب')
      return
    }

    if (!category) {
      setError('يرجى اختيار المجموعة العضلية')
      return
    }

    if (primaryMuscleIds.length === 0) {
      setError('يجب تحديد عضلة رئيسية واحدة على الأقل لهذا التمرين')
      return
    }

    // Media link validation
    if (imageUrl && !imageUrl.startsWith('data:')) {
      if (!imageUrl.startsWith('https://')) {
        setError('لازم رابط الصورة يبدأ بـ https:// عشان يفتح بأمان')
        return
      }
      // Test that image loads before saving
      const img = new Image()
      img.onload = () => {
        proceedSave()
      }
      img.onerror = () => {
        setError('تعذر تحميل الصورة من الرابط المحدد. يرجى التحقق من الرابط.')
      }
      img.src = imageUrl
      return
    }

    proceedSave()
  }

  const selectedMeasurement = MEASUREMENT_SEGMENTED_OPTIONS.find(
    (m) => m.value === measurementType,
  )

  const isRemoteUrl =
    imageUrl.startsWith('http://') || imageUrl.startsWith('https://')

  return (
    <div
      className="fullscreen-route exercise-form-screen"
      dir="rtl"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* TopBar with Back */}
      <TopBar
        title={
          initialExercise ? 'تعديل التمرين المخصص' : 'إضافة تمرين مخصص جديد'
        }
        onBack={handleCancelClick}
      />

      <form
        onSubmit={handleSubmit}
        noValidate
        data-testid="custom-exercise-form"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          padding: '16px 16px 120px',
          maxWidth: '720px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {error && (
          <div
            style={{
              background: 'var(--danger-soft)',
              color: 'var(--danger)',
              border: '1px solid var(--danger-line)',
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: '13.5px',
              fontWeight: 700,
            }}
          >
            {error}
          </div>
        )}

        {/* Section 1: الأساسيات */}
        <section className="screen-section">
          <div className="section-title">
            <span>الأساسيات</span>
          </div>
          <div
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '16px',
            }}
          >
            <div className="field">
              <label htmlFor="ce-name">اسم التمرين *</label>
              <input
                id="ce-name"
                type="text"
                placeholder="مثال: تمرين ضغط مائل بقبضة واسعة"
                value={nameAr}
                onChange={(e) => {
                  setNameAr(e.target.value)
                  setError('')
                }}
                className="field-input"
                dir="rtl"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="ce-name-en">الاسم بالإنجليزية (اختياري)</label>
              <input
                id="ce-name-en"
                type="text"
                placeholder="e.g. Incline Wide Grip Bench Press"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="field-input"
                dir="ltr"
              />
            </div>

            <div className="field">
              <label htmlFor="ce-desc">الوصف العام</label>
              <AutoGrowTextarea
                id="ce-desc"
                placeholder="شرح مختصر للتمرين ووظيفته الحركية..."
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                minRows={4}
              />
            </div>
          </div>
        </section>

        {/* Section 2: نوع القياس */}
        <section className="screen-section">
          <div className="section-title">
            <span>نوع القياس</span>
          </div>
          <div
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              padding: '16px',
            }}
          >
            <Segmented
              options={MEASUREMENT_SEGMENTED_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.labelAr,
              }))}
              value={measurementType}
              onChange={(val) => setMeasurementType(val as 'reps' | 'duration')}
            />

            {selectedMeasurement && (
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--muted)',
                  padding: '4px 2px',
                  lineHeight: '1.4',
                }}
              >
                {selectedMeasurement.helperAr}
              </div>
            )}
          </div>
        </section>

        {/* Section 3: التصنيف والمعدات */}
        <section className="screen-section">
          <div className="section-title">
            <span>التصنيف والمعدات</span>
          </div>
          <div
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '16px',
            }}
          >
            <div className="field">
              <Select
                id="ce-category"
                label="المجموعة العضلية *"
                placeholder="اختر"
                value={category}
                onChange={(val) => {
                  setCategory(val as MuscleGroup)
                  setError('')
                }}
                options={MUSCLE_OPTIONS.map(([value, label]) => ({
                  value,
                  labelAr: label,
                }))}
                sheetTitle="اختر المجموعة العضلية"
              />
            </div>

            <div className="field">
              <Select
                id="ce-difficulty"
                label="المستوى"
                placeholder="اختر"
                value={difficulty}
                onChange={(val) => setDifficulty(val as Difficulty)}
                options={DIFFICULTY_OPTIONS.map(([value, label]) => ({
                  value,
                  labelAr: label,
                }))}
                sheetTitle="اختر المستوى"
              />
            </div>

            <div className="field">
              <Select
                id="ce-equipment"
                label="المعدّات"
                placeholder="اختر"
                value={equipment}
                onChange={(val) => setEquipment(val as Equipment)}
                options={EQUIPMENT_OPTIONS.map(([value, label]) => ({
                  value,
                  labelAr: label,
                }))}
                sheetTitle="اختر نوع المعدات"
              />
            </div>
          </div>
        </section>

        {/* Section 4: الوسائط */}
        <section className="screen-section">
          <div className="section-title">
            <span>الوسائط (صورة أو GIF)</span>
          </div>
          <div
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '16px',
            }}
          >
            <div className="field">
              <FileField
                id="ce-file-input"
                label="رفع ملف صورة أو GIF (بحد أقصى 3 ميجابايت)"
                accept="image/*,.gif"
                buttonText="اختر ملف من جهازك"
                readAs="dataURL"
                onFileLoaded={(dataUrl: string) => {
                  setImageUrl(dataUrl)
                  setMediaError('')
                  setError('')
                }}
                onChange={(file) => {
                  if (!file && imageUrl.startsWith('data:')) {
                    setImageUrl('')
                  } else if (file && file.size > 3 * 1024 * 1024) {
                    setMediaError('حجم الصورة/GIF يجب ألا يتجاوز 3 ميجابايت')
                  }
                }}
              />
            </div>

            <div className="field">
              <label htmlFor="ce-image-url">أو ضع رابط صورة / GIF مباشر</label>
              <input
                id="ce-image-url"
                type="url"
                placeholder="https://example.com/exercise.gif"
                value={imageUrl.startsWith('data:') ? '' : imageUrl}
                onChange={(e) => {
                  const val = e.target.value
                  setImageUrl(val)
                  setMediaError('')
                  if (val.startsWith('http://')) {
                    setMediaError('لازم الرابط يبدأ بـ https:// عشان يفتح بأمان')
                  }
                }}
                className="field-input"
                dir="ltr"
              />
              {isRemoteUrl && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '6px',
                    gap: '8px',
                  }}
                >
                  <span
                    className="chip chip--accent"
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontWeight: 700,
                    }}
                  >
                    يحتاج إنترنت
                  </span>
                  {imageUrl.startsWith('https://') && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleSaveCopyLocally}
                      disabled={isDownloading}
                      style={{ fontSize: '11px', height: '28px', padding: '0 8px' }}
                    >
                      {isDownloading ? 'جارٍ الحفظ...' : 'حفظ نسخة على الجهاز'}
                    </Button>
                  )}
                </div>
              )}
            </div>

            {mediaError && (
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--danger)',
                  fontWeight: 600,
                  marginTop: '2px',
                }}
              >
                {mediaError}
              </div>
            )}

            {imageUrl && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  alignItems: 'center',
                  background: 'var(--card-subtle)',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid var(--line)',
                }}
              >
                <img
                  src={imageUrl}
                  alt="معاينة التمرين"
                  style={{
                    maxHeight: '160px',
                    borderRadius: '8px',
                    objectFit: 'contain',
                  }}
                />
                <button
                  type="button"
                  className="ghost-danger tiny full-width"
                  onClick={() => {
                    setImageUrl('')
                    setMediaError('')
                  }}
                >
                  حذف الصورة
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Section 5: التقنية والأداء */}
        <section className="screen-section">
          <div className="section-title">
            <span>التقنية والأداء</span>
          </div>
          <div
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '16px',
            }}
          >
            <div className="field">
              <label htmlFor="ce-mechanics">ميكانيكا الحركة</label>
              <AutoGrowTextarea
                id="ce-mechanics"
                placeholder="مثال: وصف طريقة حركة المفاصل واتجاه الدفع أو السحب"
                value={mechanicsAr}
                onChange={(e) => setMechanicsAr(e.target.value)}
                minRows={4}
              />
            </div>

            <div className="field">
              <label htmlFor="ce-benefit">الفوائد</label>
              <AutoGrowTextarea
                id="ce-benefit"
                placeholder="مثال: زيادة القوة وبناء الكتلة العضلية للمجموعة المستهدفة"
                value={benefitAr}
                onChange={(e) => setBenefitAr(e.target.value)}
                minRows={4}
              />
            </div>

            <div className="field">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '4px',
                }}
              >
                <label htmlFor="ce-steps" style={{ margin: 0 }}>
                  خطوات الأداء الصحيحة
                </label>
                <span style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                  {plural(stepsList.length, 'خطوة')}
                </span>
              </div>
              <AutoGrowTextarea
                id="ce-steps"
                placeholder="اكتب كل خطوة في سطر منفصل..."
                value={howToStepsRaw}
                onChange={(e) => setHowToStepsRaw(e.target.value)}
                minRows={4}
              />
            </div>

            <div className="field">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '4px',
                }}
              >
                <label htmlFor="ce-mistakes" style={{ margin: 0 }}>
                  الأخطاء الشائعة
                </label>
                <span style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                  {plural(mistakesList.length, 'خطأ')}
                </span>
              </div>
              <AutoGrowTextarea
                id="ce-mistakes"
                placeholder="اكتب كل خطأ في سطر منفصل..."
                value={commonMistakesRaw}
                onChange={(e) => setCommonMistakesRaw(e.target.value)}
                minRows={4}
              />
            </div>

            <div className="field">
              <label htmlFor="ce-breathing">طريقة التنفس</label>
              <input
                id="ce-breathing"
                type="text"
                placeholder="مثال: شهيق في اتجاه المقاومة وزفير عند بذل القوة"
                value={breathing}
                onChange={(e) => setBreathing(e.target.value)}
                className="field-input"
                dir="rtl"
              />
            </div>
          </div>
        </section>

        {/* Section 6: العضلات المستهدفة */}
        <section className="screen-section">
          <div className="section-title">
            <span>العضلات المستهدفة</span>
          </div>
          <div
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              padding: '16px',
            }}
          >
            {/* Primary Muscles Picker */}
            <div className="field">
              <label style={{ color: '#E53935', fontWeight: 700 }}>
                العضلة الأساسية *
              </label>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginBottom: '4px',
                }}
              >
                {primaryMuscleIds.length === 0 ? (
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    لم يتم تحديد عضلة أساسية بعد
                  </span>
                ) : (
                  primaryMuscleIds.map((id) => (
                    <span
                      key={id}
                      style={{
                        background: '#E53935',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>{getMuscleGymName(id)}</span>
                      <button
                        type="button"
                        onClick={() => handleTogglePrimary(id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#fff',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'inline-flex',
                        }}
                        aria-label="إزالة العضلة"
                      >
                        <IconClose size={14} />
                      </button>
                    </span>
                  ))
                )}
              </div>

              <Select
                id="ce-primary-muscle-picker"
                value=""
                placeholder="اختر عضلة أساسية..."
                onChange={(val) => {
                  if (val) handleTogglePrimary(val)
                }}
                options={MUSCLE_SELECT_OPTIONS.map((opt) => ({
                  ...opt,
                  disabled: primaryMuscleIds.includes(opt.value),
                }))}
                sheetTitle="اختر العضلة الأساسية"
              />
            </div>

            {/* Secondary Muscles Picker */}
            <div className="field">
              <label style={{ color: '#d97706', fontWeight: 700 }}>
                العضلات المساعدة
              </label>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginBottom: '4px',
                }}
              >
                {secondaryMuscleIds.length === 0 ? (
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    لم يتم تحديد عضلات مساعدة
                  </span>
                ) : (
                  secondaryMuscleIds.map((id) => (
                    <span
                      key={id}
                      style={{
                        background: '#FEF3C7',
                        color: '#92400E',
                        border: '1px solid #FCD34D',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>{getMuscleGymName(id)}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleSecondary(id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#92400E',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'inline-flex',
                        }}
                        aria-label="إزالة العضلة"
                      >
                        <IconClose size={14} />
                      </button>
                    </span>
                  ))
                )}
              </div>

              <Select
                id="ce-secondary-muscle-picker"
                value=""
                placeholder="اختر عضلات مساعدة..."
                onChange={(val) => {
                  if (val) handleToggleSecondary(val)
                }}
                options={MUSCLE_SELECT_OPTIONS.map((opt) => ({
                  ...opt,
                  disabled: secondaryMuscleIds.includes(opt.value),
                }))}
                sheetTitle="اختر العضلات المساعدة"
              />
            </div>

            {/* Atlas Preview */}
            <div style={{ marginTop: '12px' }}>
              <div
                style={{
                  fontSize: '12.5px',
                  fontWeight: 600,
                  marginBottom: '6px',
                  color: 'var(--muted)',
                }}
              >
                معاينة الأطلس العضلي
              </div>
              <AnatomyMuscleMap muscles={currentMuscles} isFullView={false} />
            </div>
          </div>
        </section>

        {/* Sticky bar: primary "حفظ التمرين", outlined secondary "إلغاء" side by side */}
        <div
          className="sticky-bottom-bar"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '12px 16px',
            background: 'var(--surface-1)',
            borderTop: '1px solid var(--line)',
          }}
        >
          {saveDisabledReason && (
            <div
              style={{
                fontSize: '12px',
                color: 'var(--muted)',
                textAlign: 'center',
              }}
            >
              {saveDisabledReason}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="large"
              disabled={!canSave}
              style={{ flex: 1 }}
            >
              حفظ التمرين
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="secondary"
                fullWidth
                size="large"
                onClick={handleCancelClick}
                style={{ flex: 1 }}
              >
                إلغاء
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Cancel Confirmation Sheet */}
      <ConfirmSheet
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={() => {
          setShowCancelConfirm(false)
          onCancel?.()
        }}
        title="تجاهل التغييرات؟"
        message="هل تريد إلغاء التعديل؟ سيتم فقد أي بيانات أو تغييرات غير محفوظة."
        confirmLabel="تجاهل والخروج"
        cancelLabel="متابعة التعديل"
        isDestructive={true}
      />
    </div>
  )
}

export default CustomExerciseBuilder
