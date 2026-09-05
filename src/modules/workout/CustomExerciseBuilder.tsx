import { useState, type ChangeEvent } from 'react'
import type {
  CustomExercise,
  Difficulty,
  Equipment,
  MeasurementType,
  MuscleGroup,
} from '../shared/types.ts'
import {
  DIFFICULTY_LABELS,
  EQUIPMENT_LABELS,
  MUSCLE_GROUP_LABELS,
} from '../shared/types.ts'
import { sanitizeInput } from '../../lib/sanitizer.ts'

interface CustomExerciseBuilderProps {
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

const MEASUREMENT_TYPES: {
  value: MeasurementType
  labelAr: string
  hintAr: string
}[] = [
  { value: 'reps', labelAr: 'بالعداد / التكرار', hintAr: 'مثال: 10-12 تكرار' },
  {
    value: 'duration',
    labelAr: 'بالوقت (ثواني)',
    hintAr: 'مثال: ثبات 45 ثانية',
  },
  {
    value: 'bodyweight',
    labelAr: 'بوزن الجسم',
    hintAr: 'تمرين يعتمد على ثقل الجسم',
  },
  {
    value: 'weight',
    labelAr: 'أوزان حرة / آلات',
    hintAr: 'تمرين يحسب بالوزن (كجم)',
  },
]

function uniqueId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  }
}

export function CustomExerciseBuilder({
  initialExercise,
  onSave,
  onCancel,
}: CustomExerciseBuilderProps) {
  const [nameAr, setNameAr] = useState(initialExercise?.nameAr ?? '')
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
    initialExercise?.measurementType ?? 'reps',
  )
  const [imageUrl, setImageUrl] = useState(initialExercise?.imageUrl ?? '')
  const [mechanicsAr, setMechanicsAr] = useState(
    initialExercise?.mechanicsAr ?? '',
  )
  const [targetMusclesAr, setTargetMusclesAr] = useState(
    initialExercise?.targetMusclesAr?.join('، ') ?? '',
  )
  const [benefitAr, setBenefitAr] = useState(initialExercise?.benefitAr ?? '')
  const [howToStepsRaw, setHowToStepsRaw] = useState(
    initialExercise?.howToStepsAr?.join('\n') ?? '',
  )
  const [error, setError] = useState('')

  function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 4 * 1024 * 1024) {
      setError('حجم الصورة/GIF يجب ألا يتجاوز 4 ميجابايت')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setImageUrl(event.target.result)
        setError('')
      }
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const trimmed = sanitizeInput(nameAr)
    if (!trimmed) {
      setError('اسم التمرين مطلوب')
      return
    }

    const steps = howToStepsRaw
      .split('\n')
      .map((s) => sanitizeInput(s))
      .filter((s) => s.length > 0)

    const muscles = targetMusclesAr
      .split('،')
      .flatMap((s) => s.split(','))
      .map((s) => sanitizeInput(s))
      .filter((s) => s.length > 0)

    const exercise: CustomExercise = {
      id: initialExercise?.id || uniqueId(),
      nameAr: trimmed,
      descriptionAr: sanitizeInput(descriptionAr),
      category,
      difficulty,
      equipment,
      measurementType,
      imageUrl: sanitizeInput(imageUrl) || undefined,
      mechanicsAr: sanitizeInput(mechanicsAr) || undefined,
      targetMusclesAr: muscles.length > 0 ? muscles : undefined,
      benefitAr: sanitizeInput(benefitAr) || undefined,
      howToStepsAr: steps.length > 0 ? steps : undefined,
      isCustom: true,
    }

    onSave(exercise)
  }

  return (
    <form
      className="card custom-exercise"
      onSubmit={handleSubmit}
      data-testid="custom-exercise-form"
    >
      <h2>
        {initialExercise
          ? '✏️ تعديل التمرين المخصص'
          : '✨ إضافة تمرين مخصص جديد'}
      </h2>

      {error && (
        <div className="error-list">
          <ul>
            <li>{error}</li>
          </ul>
        </div>
      )}

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
          dir="rtl"
        />
      </div>

      <div className="field">
        <label htmlFor="ce-desc">الوصف العام</label>
        <textarea
          id="ce-desc"
          placeholder="شرح مختصر للتمرين ووظيفته..."
          value={descriptionAr}
          onChange={(e) => setDescriptionAr(e.target.value)}
          dir="rtl"
          rows={2}
        />
      </div>

      <div className="field">
        <label>نوع القياس (Measurement Type) *</label>
        <div className="radio-row grid-2">
          {MEASUREMENT_TYPES.map((m) => (
            <button
              key={m.value}
              type="button"
              className={
                'option-btn' + (measurementType === m.value ? ' selected' : '')
              }
              onClick={() => setMeasurementType(m.value)}
            >
              <strong>{m.labelAr}</strong>
              <span className="hint">{m.hintAr}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>صورة أو GIF متحرك للتمرين (رفع ملف أو رابط URL)</label>
        <div className="image-upload-box">
          <input
            type="file"
            accept="image/*,.gif"
            onChange={handleFileUpload}
            id="ce-file-input"
            style={{ marginBottom: '8px' }}
          />
          <input
            type="url"
            placeholder="أو ضع رابط الصورة / GIF هنا (https://...)"
            value={imageUrl.startsWith('data:') ? '' : imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            dir="ltr"
          />
          {imageUrl && (
            <div className="image-preview">
              <p className="muted">معاينة الشكل المتحرك/الصورة:</p>
              <img
                src={imageUrl}
                alt="معاينة التمرين"
                style={{ maxHeight: '180px', borderRadius: '8px' }}
              />
              <button
                type="button"
                className="ghost-danger tiny"
                style={{ marginTop: '6px' }}
                onClick={() => setImageUrl('')}
              >
                حذف الصورة
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="field-grid-2">
        <div className="field">
          <label htmlFor="ce-category">المجموعة العضلية</label>
          <select
            id="ce-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as MuscleGroup)}
          >
            {MUSCLE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="ce-difficulty">المستوى</label>
          <select
            id="ce-difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          >
            {DIFFICULTY_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="ce-equipment">المعدّات</label>
        <select
          id="ce-equipment"
          value={equipment}
          onChange={(e) => setEquipment(e.target.value as Equipment)}
        >
          {EQUIPMENT_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="ce-mechanics">
          ميكانيكا الحركة (Movement Mechanics)
        </label>
        <input
          id="ce-mechanics"
          type="text"
          placeholder="مثال: دفع أفقي مع ثني المرفقين بزاوية 45 درجة..."
          value={mechanicsAr}
          onChange={(e) => setMechanicsAr(e.target.value)}
          dir="rtl"
        />
      </div>

      <div className="field">
        <label htmlFor="ce-muscles">العضلات المستهدفة (مفصولة بـ "،")</label>
        <input
          id="ce-muscles"
          type="text"
          placeholder="مثال: العضلة الصدرية الكبرى، العضلة الترقوية، الترايسبس"
          value={targetMusclesAr}
          onChange={(e) => setTargetMusclesAr(e.target.value)}
          dir="rtl"
        />
      </div>

      <div className="field">
        <label htmlFor="ce-benefit">الفوائد العلمية للتمرين</label>
        <textarea
          id="ce-benefit"
          placeholder="شرح الفائدة العلمية أو التأثير الوظيفي للتمرين..."
          value={benefitAr}
          onChange={(e) => setBenefitAr(e.target.value)}
          dir="rtl"
          rows={2}
        />
      </div>

      <div className="field">
        <label htmlFor="ce-steps">
          خطوات الأداء الصحيحة (كل خطوة في سطر منفصل)
        </label>
        <textarea
          id="ce-steps"
          placeholder="1. استلقِ على المقعد المسطح...&#10;2. انزل بالوزن ببطء...&#10;3. ادفع بقوة مع الزفير..."
          value={howToStepsRaw}
          onChange={(e) => setHowToStepsRaw(e.target.value)}
          dir="rtl"
          rows={4}
        />
      </div>

      <div className="actions-row">
        <button type="submit">💾 حفظ التمرين المخصص</button>
        {onCancel && (
          <button type="button" className="ghost" onClick={onCancel}>
            إلغاء
          </button>
        )}
      </div>
    </form>
  )
}
