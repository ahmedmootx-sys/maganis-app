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
import { TopBar, Select, FileField, Button, Segmented } from '../../ui/index.ts'
import { IconClose } from '../../components/Icons.tsx'
import atlasGroups from '../../data/atlas-groups.json'
import atlasMuscles from '../../data/atlas_muscles.json'

const ATLAS_MUSCLE_MAP = new Map<
  string,
  { id: string; ar: string; en: string }
>(
  (atlasMuscles.muscles as Array<{ id: string; ar: string; en: string }>).map(
    (m) => [m.id, m],
  ),
)

const ATLAS_SELECT_OPTIONS = (
  atlasGroups.groups as Array<{ key: string; ar: string; muscles: string[] }>
).flatMap((g) =>
  g.muscles.map((mId) => {
    const m = ATLAS_MUSCLE_MAP.get(mId)
    return {
      value: mId,
      labelAr: m?.ar || mId,
      labelEn: m?.en || '',
      description: g.ar,
    }
  }),
)

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
  value: MeasurementType
  labelAr: string
  helperAr: string
}[] = [
  {
    value: 'reps',
    labelAr: 'بالعدّات والتكرار',
    helperAr: 'حساب التمرين بعدد المجموعات والتكرارات لكل مجموعة',
  },
  {
    value: 'duration',
    labelAr: 'بالوقت',
    helperAr: 'حساب التمرين بمدة الثبات بالثواني أو الدقائق (مثل البلانك)',
  },
  {
    value: 'bodyweight',
    labelAr: 'بوزن الجسم',
    helperAr: 'تمرين يعتمد كلياً على ثقل الجسم ومقاومة الجاذبية',
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
  minRows = 2,
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
    el.style.height = `${Math.max(el.scrollHeight, minRows * 24)}px`
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
        minHeight: `${minRows * 28}px`,
        resize: 'none',
        overflow: 'hidden',
        lineHeight: '1.5',
        boxSizing: 'border-box',
        padding: '10px 12px',
        borderRadius: '10px',
        border: '1px solid var(--input-border)',
        background: 'var(--input-bg)',
        color: 'var(--ink)',
        fontSize: '14px',
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
  const [category, setCategory] = useState<MuscleGroup>(
    initialExercise?.category ?? 'chest',
  )
  const [difficulty, setDifficulty] = useState<Difficulty>(
    initialExercise?.difficulty ?? 'beginner',
  )
  const [equipment, setEquipment] = useState<Equipment>(
    initialExercise?.equipment ?? 'bodyweight',
  )
  const [measurementType, setMeasurementType] = useState<MeasurementType>(
    () => {
      const mt = initialExercise?.measurementType
      return mt === 'duration' || mt === 'bodyweight' ? mt : 'reps'
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
    const p = initialResolved.muscles
      .filter((m) => m.role === 'primary')
      .map((m) => m.id)
    return p.length > 0 ? p : ['pec_clavicular']
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

  function handleTogglePrimary(id: string) {
    if (primaryMuscleIds.includes(id)) {
      if (primaryMuscleIds.length === 1) {
        setError('يجب تحديد عضلة رئيسية واحدة على الأقل')
        return
      }
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

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()

    const trimmed = sanitizeInput(nameAr)
    if (!trimmed) {
      setError('اسم التمرين مطلوب')
      return
    }

    if (primaryMuscleIds.length === 0) {
      setError('يجب تحديد عضلة رئيسية واحدة على الأقل لهذا التمرين')
      return
    }

    const steps = howToStepsRaw
      .split('\n')
      .map((s) => sanitizeInput(s))
      .filter((s) => s.length > 0)

    const mistakes = commonMistakesRaw
      .split('\n')
      .map((s) => sanitizeInput(s))
      .filter((s) => s.length > 0)

    const targetNames = currentMuscles.map(
      (m) => MUSCLE_ATLAS[m.id]?.nameAr || m.id,
    )

    const exercise: CustomExercise = {
      id: initialExercise?.id || uniqueId(),
      name: sanitizeInput(nameEn) || undefined,
      nameAr: trimmed,
      descriptionAr: sanitizeInput(descriptionAr),
      category,
      difficulty,
      equipment,
      measurementType,
      imageUrl: sanitizeInput(imageUrl) || undefined,
      mechanicsAr: sanitizeInput(mechanicsAr) || undefined,
      muscles: currentMuscles,
      targetMusclesAr: targetNames,
      benefitAr: sanitizeInput(benefitAr) || undefined,
      howToStepsAr: steps.length > 0 ? steps : undefined,
      commonMistakes: mistakes.length > 0 ? mistakes : undefined,
      breathing: sanitizeInput(breathing) || undefined,
      isCustom: true,
    }

    onSave(exercise)
  }

  const selectedMeasurement = MEASUREMENT_SEGMENTED_OPTIONS.find(
    (m) => m.value === measurementType,
  )

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
        onBack={onCancel}
      />

      <form
        onSubmit={handleSubmit}
        noValidate
        data-testid="custom-exercise-form"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          padding: '16px 16px 100px',
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
                minRows={2}
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
              onChange={(val) => setMeasurementType(val as MeasurementType)}
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

        {/* Section 3: التصنيف */}
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
                label="المجموعة العضلية"
                value={category}
                onChange={(val) => setCategory(val as MuscleGroup)}
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
                label="رفع ملف صورة أو GIF"
                accept="image/*,.gif"
                buttonText="اختر ملف من جهازك"
                readAs="dataURL"
                onFileLoaded={(dataUrl: string) => {
                  setImageUrl(dataUrl)
                  setError('')
                }}
                onChange={(file) => {
                  if (!file && imageUrl.startsWith('data:')) {
                    setImageUrl('')
                  } else if (file && file.size > 4 * 1024 * 1024) {
                    setError('حجم الصورة/GIF يجب ألا يتجاوز 4 ميجابايت')
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
                onChange={(e) => setImageUrl(e.target.value)}
                className="field-input"
                dir="ltr"
              />
            </div>

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
                  onClick={() => setImageUrl('')}
                >
                  حذف الصورة
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Section 5: التقنية */}
        <section className="screen-section">
          <div className="section-title">
            <span>التقنية والأداء العلمي</span>
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
                placeholder="مثال: دفع أفقي مع ثني المرفقين بزاوية 45 درجة..."
                value={mechanicsAr}
                onChange={(e) => setMechanicsAr(e.target.value)}
                minRows={2}
              />
            </div>

            <div className="field">
              <label htmlFor="ce-benefit">الفوائد العلمية للتمرين</label>
              <AutoGrowTextarea
                id="ce-benefit"
                placeholder="شرح الفائدة العلمية أو التأثير الوظيفي للتمرين..."
                value={benefitAr}
                onChange={(e) => setBenefitAr(e.target.value)}
                minRows={2}
              />
            </div>

            <div className="field">
              <label htmlFor="ce-steps">خطوات الأداء الصحيحة</label>
              <span
                style={{
                  fontSize: '11.5px',
                  color: 'var(--muted)',
                  marginBottom: '4px',
                }}
              >
                خطوة في كل سطر
              </span>
              <AutoGrowTextarea
                id="ce-steps"
                placeholder="1. استلقِ على المقعد المسطح مع تثبيت القدمين&#10;2. انزل بالوزن ببطء وتحكم إلى منتصف الصدر&#10;3. ادفع بقوة مع الزفير للعودة لنقطة البداية"
                value={howToStepsRaw}
                onChange={(e) => setHowToStepsRaw(e.target.value)}
                minRows={4}
              />
            </div>

            <div className="field">
              <label htmlFor="ce-mistakes">الأخطاء الشائعة</label>
              <span
                style={{
                  fontSize: '11.5px',
                  color: 'var(--muted)',
                  marginBottom: '4px',
                }}
              >
                خطأ في كل سطر
              </span>
              <AutoGrowTextarea
                id="ce-mistakes"
                placeholder="تقوس الظهر الزائد&#10;النزول السريع غير المتحكم فيه"
                value={commonMistakesRaw}
                onChange={(e) => setCommonMistakesRaw(e.target.value)}
                minRows={2}
              />
            </div>

            <div className="field">
              <label htmlFor="ce-breathing">طريقة التنفس</label>
              <input
                id="ce-breathing"
                type="text"
                placeholder="شهيق أثناء النزول، وزفير بقوة أثناء الدفع"
                value={breathing}
                onChange={(e) => setBreathing(e.target.value)}
                className="field-input"
                dir="rtl"
              />
            </div>
          </div>
        </section>

        {/* Section 6: العضلات المستهدفة (Pickers restyled, old live atlas preview hidden) */}
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
              <label style={{ color: '#E53935' }}>
                العضلة / الرأس الأساسي (Primary Target) *
              </label>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginBottom: '4px',
                }}
              >
                {primaryMuscleIds.map((id) => (
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
                    <span>
                      {ATLAS_MUSCLE_MAP.get(id)?.ar ||
                        MUSCLE_ATLAS[id]?.nameAr ||
                        id}
                    </span>
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
                ))}
              </div>

              <Select
                id="ce-primary-muscle-picker"
                value=""
                placeholder="+ اضغط لإضافة رأس عضلي رئيسي..."
                onChange={(val) => {
                  if (val) handleTogglePrimary(val)
                }}
                options={ATLAS_SELECT_OPTIONS.map((opt) => ({
                  ...opt,
                  disabled: primaryMuscleIds.includes(opt.value),
                }))}
                sheetTitle="اختر رأس عضلي رئيسي (16 منطقة تشريحية)"
              />
            </div>

            {/* Secondary Muscles Picker */}
            <div className="field">
              <label style={{ color: '#d97706' }}>
                العضلات المساعدة (Secondary Involvement)
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
                      <span>
                        {ATLAS_MUSCLE_MAP.get(id)?.ar ||
                          MUSCLE_ATLAS[id]?.nameAr ||
                          id}
                      </span>
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
                placeholder="+ اضغط لإضافة عضلة مساعدة..."
                onChange={(val) => {
                  if (val) handleToggleSecondary(val)
                }}
                options={ATLAS_SELECT_OPTIONS.map((opt) => ({
                  ...opt,
                  disabled: secondaryMuscleIds.includes(opt.value),
                }))}
                sheetTitle="اختر عضلة مساعدة (16 منطقة تشريحية)"
              />
            </div>

            {/* Note: Live atlas preview hidden per Task B instructions (Task C replaces it) */}
          </div>
        </section>

        {/* Sticky bar: primary "حفظ التمرين", tertiary "إلغاء" */}
        <div
          className="sticky-bottom-bar"
          style={{ display: 'flex', gap: '8px' }}
        >
          <Button type="submit" variant="primary" fullWidth size="large">
            حفظ التمرين
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="tertiary"
              fullWidth
              size="large"
              onClick={onCancel}
            >
              إلغاء
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

export default CustomExerciseBuilder
