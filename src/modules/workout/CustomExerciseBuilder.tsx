import { useState, useMemo, type ChangeEvent } from 'react'
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
import {
  MUSCLE_ATLAS,
  MUSCLE_REGIONS_AR,
  type MuscleRegion,
} from './muscleAtlasData.ts'
import { resolveExerciseMuscles } from './legacyMuscleMapper.ts'
import { AnatomyMuscleMap } from './AnatomyMuscleMap.tsx'

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

  // Initial head-level muscles
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

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

    const targetNames = currentMuscles.map(
      (m) => MUSCLE_ATLAS[m.id]?.nameAr || m.id,
    )

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
      muscles: currentMuscles,
      targetMusclesAr: targetNames,
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

      {/* Head-Level Muscle Targeting System */}
      <div
        className="field"
        style={{
          background: 'var(--card-subtle)',
          padding: '14px',
          borderRadius: '12px',
          border: '1px solid var(--line)',
        }}
      >
        <div style={{ marginBottom: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--ink)' }}>
            🧬 تحديد العضلات والرؤوس التشريحية المستهدفة
          </h3>
          <p className="muted-small" style={{ margin: '2px 0 0' }}>
            اختر الرؤوس العضلية المستهدفة بدقة تشريحية (الرئيسية والمساعدة)
          </p>
        </div>

        {/* 1. Primary Muscles Picker */}
        <div style={{ marginBottom: '14px' }}>
          <label
            style={{
              display: 'block',
              fontWeight: 800,
              color: '#E53935',
              fontSize: '13px',
              marginBottom: '6px',
            }}
          >
            🎯 العضلة / الرأس الأساسي (Primary Target) *
          </label>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              marginBottom: '8px',
            }}
          >
            {primaryMuscleIds.map((id) => (
              <span
                key={id}
                style={{
                  background: '#E53935',
                  color: '#fff',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {MUSCLE_ATLAS[id]?.nameAr || id}
                <button
                  type="button"
                  onClick={() => handleTogglePrimary(id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: '12px',
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          <select
            onChange={(e) => {
              if (e.target.value) {
                handleTogglePrimary(e.target.value)
                e.target.value = ''
              }
            }}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '13px',
              borderRadius: '8px',
            }}
          >
            <option value="">+ اضغط لإضافة رأس عضلي رئيسي...</option>
            {(
              [
                'chest',
                'shoulders',
                'arms',
                'back',
                'core',
                'legs',
              ] as MuscleRegion[]
            ).map((reg) => (
              <optgroup key={reg} label={MUSCLE_REGIONS_AR[reg]}>
                {Object.values(MUSCLE_ATLAS)
                  .filter((m) => m.region === reg)
                  .map((m) => (
                    <option
                      key={m.id}
                      value={m.id}
                      disabled={primaryMuscleIds.includes(m.id)}
                    >
                      {m.nameAr} ({m.nameEn})
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* 2. Secondary Muscles Picker */}
        <div style={{ marginBottom: '14px' }}>
          <label
            style={{
              display: 'block',
              fontWeight: 800,
              color: '#d97706',
              fontSize: '13px',
              marginBottom: '6px',
            }}
          >
            ⚡ العضلات المساعدة (Secondary Involvement)
          </label>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              marginBottom: '8px',
            }}
          >
            {secondaryMuscleIds.length === 0 ? (
              <span className="muted-small">لم يتم تحديد عضلات مساعدة بعد</span>
            ) : (
              secondaryMuscleIds.map((id) => (
                <span
                  key={id}
                  style={{
                    background: '#FDD835',
                    color: '#000',
                    border: '1px solid #F9A825',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {MUSCLE_ATLAS[id]?.nameAr || id}
                  <button
                    type="button"
                    onClick={() => handleToggleSecondary(id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#000',
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: '12px',
                      lineHeight: 1,
                    }}
                  >
                    ✕
                  </button>
                </span>
              ))
            )}
          </div>

          <select
            onChange={(e) => {
              if (e.target.value) {
                handleToggleSecondary(e.target.value)
                e.target.value = ''
              }
            }}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '13px',
              borderRadius: '8px',
            }}
          >
            <option value="">+ اضغط لإضافة عضلة مساعدة...</option>
            {(
              [
                'chest',
                'shoulders',
                'arms',
                'back',
                'core',
                'legs',
              ] as MuscleRegion[]
            ).map((reg) => (
              <optgroup key={reg} label={MUSCLE_REGIONS_AR[reg]}>
                {Object.values(MUSCLE_ATLAS)
                  .filter((m) => m.region === reg)
                  .map((m) => (
                    <option
                      key={m.id}
                      value={m.id}
                      disabled={secondaryMuscleIds.includes(m.id)}
                    >
                      {m.nameAr} ({m.nameEn})
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Live Anatomy Map Preview */}
        <div
          style={{
            marginTop: '12px',
            borderTop: '1px solid var(--line)',
            paddingTop: '10px',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--muted)',
              display: 'block',
              marginBottom: '6px',
            }}
          >
            👁️ معاينة مباشرة للخريطة التشريحية:
          </span>
          <AnatomyMuscleMap
            muscles={currentMuscles}
            category={category}
            exerciseName={nameAr || 'تمرين مخصص'}
            isFullView={false}
          />
        </div>
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
