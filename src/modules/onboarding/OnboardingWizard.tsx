import { useState } from 'react'
import { assetUrl } from '../../utils/assetUrl.ts'
import type { ProfileStore } from './profileStore'
import { ACTIVITY_LEVELS, GOALS, INJURY_TAGS } from './types'
import type { ActivityLevel, Goal, ProfileCore, UserProfile } from './types'
import {
  validateBody,
  validateDays,
  validateGoals,
  validateMedical,
  validateProfile,
} from './validate'
import { Callout } from '../../components/Callout.tsx'
import { IconCheck } from '../../components/Icons.tsx'

interface FormState {
  goals: Goal[]
  primaryGoal: Goal | null
  trainingDaysPerWeek: number | null
  hasIssues: boolean | null
  injuryTags: string[]
  notes: string
  sex: 'male' | 'female' | null
  age: string
  heightCm: string
  weightKg: string
  activityLevel: ActivityLevel | null
}

const EMPTY_FORM: FormState = {
  goals: [],
  primaryGoal: null,
  trainingDaysPerWeek: null,
  hasIssues: null,
  injuryTags: [],
  notes: '',
  sex: null,
  age: '',
  heightCm: '',
  weightKg: '',
  activityLevel: null,
}

const STEP_TITLES = [
  'اختر هدفك',
  'أيام التمرين أسبوعياً',
  'التقييم الطبي',
  'بيانات الجسم',
  'مراجعة وتأكيد',
]

const STEP_COUNT = STEP_TITLES.length

function formFromProfile(profile: UserProfile): FormState {
  return {
    goals: [...profile.goals],
    primaryGoal: profile.primaryGoal,
    trainingDaysPerWeek: profile.trainingDaysPerWeek,
    hasIssues: profile.medical.hasIssues,
    injuryTags: [...profile.medical.injuryTags],
    notes: profile.medical.notes,
    sex: profile.body.sex,
    age: String(profile.body.age),
    heightCm: String(profile.body.heightCm),
    weightKg: String(profile.body.weightKg),
    activityLevel: profile.body.activityLevel,
  }
}

function buildProfile(form: FormState): ProfileCore {
  return {
    goals: [...form.goals],
    primaryGoal: form.primaryGoal as Goal,
    trainingDaysPerWeek: form.trainingDaysPerWeek as number,
    medical: {
      hasIssues: form.hasIssues as boolean,
      injuryTags: [...form.injuryTags],
      notes: form.notes,
    },
    body: {
      sex: form.sex as 'male' | 'female',
      age: Number(form.age),
      heightCm: Number(form.heightCm),
      weightKg: Number(form.weightKg),
      activityLevel: form.activityLevel as ActivityLevel,
    },
  }
}

function isFormShape(value: unknown): value is Partial<FormState> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function ReviewSummary({ form }: { form: FormState }) {
  const goalLabels = form.goals
    .map((g) => GOALS.find((x) => x.value === g)?.labelAr ?? g)
    .join('، ')
  const primary = GOALS.find((x) => x.value === form.primaryGoal)?.labelAr
  const activity = ACTIVITY_LEVELS.find((x) => x.value === form.activityLevel)
  return (
    <ul className="summary-list" data-testid="review-summary">
      <li>
        <span>الأهداف</span>
        <strong>
          {goalLabels}
          {form.goals.length > 1 ? ' (أهداف مركبة)' : ''}
        </strong>
      </li>
      <li>
        <span>الهدف الأساسي</span>
        <strong>{primary ?? '—'}</strong>
      </li>
      <li>
        <span>أيام التمرين</span>
        <strong>{form.trainingDaysPerWeek ?? '—'} أيام أسبوعياً</strong>
      </li>
      <li>
        <span>الحالة الصحية</span>
        <strong>
          {form.hasIssues === null
            ? '—'
            : form.hasIssues
              ? form.injuryTags.length > 0
                ? form.injuryTags.join('، ')
                : 'يوجد — راجع الملاحظات'
              : 'لا توجد إصابات مسجلة'}
        </strong>
      </li>
      {form.hasIssues === true && form.notes.trim() !== '' && (
        <li>
          <span>ملاحظات طبية</span>
          <strong>{form.notes}</strong>
        </li>
      )}
      <li>
        <span>الجنس</span>
        <strong>
          {form.sex === 'male' ? 'ذكر' : form.sex === 'female' ? 'أنثى' : '—'}
        </strong>
      </li>
      <li>
        <span>العمر / الطول / الوزن</span>
        <strong dir="ltr" style={{ textAlign: 'left' }}>
          {form.age || '—'} yr / {form.heightCm || '—'} cm /{' '}
          {form.weightKg || '—'} kg
        </strong>
      </li>
      <li>
        <span>مستوى النشاط</span>
        <strong>
          {activity ? `${activity.labelAr} (×${activity.multiplier})` : '—'}
        </strong>
      </li>
    </ul>
  )
}

export interface OnboardingWizardProps {
  store: ProfileStore
  initialProfile: UserProfile | null
  onSaved: (profile: UserProfile) => void
  onCancel?: () => void
}

export function OnboardingWizard({
  store,
  initialProfile,
  onSaved,
  onCancel,
}: OnboardingWizardProps) {
  const [boot] = useState(() => {
    if (initialProfile) {
      return {
        askResume: false,
        step: 0,
        form: formFromProfile(initialProfile),
      }
    }
    const draft = store.loadDraft()
    if (
      draft &&
      draft.stepIndex >= 0 &&
      draft.stepIndex < STEP_COUNT &&
      isFormShape(draft.data)
    ) {
      return {
        askResume: true,
        step: draft.stepIndex,
        form: { ...EMPTY_FORM, ...draft.data } as FormState,
      }
    }
    return { askResume: false, step: 0, form: EMPTY_FORM }
  })

  const [askResume, setAskResume] = useState(boot.askResume)
  const [step, setStep] = useState(boot.step)
  const [form, setForm] = useState<FormState>(boot.form)
  const [errors, setErrors] = useState<string[]>([])
  const [saveError, setSaveError] = useState<string | null>(null)

  function stepErrors(): string[] {
    switch (step) {
      case 0:
        return validateGoals(form.goals, form.primaryGoal)
      case 1:
        return validateDays(form.trainingDaysPerWeek)
      case 2:
        return validateMedical({
          hasIssues: form.hasIssues,
          injuryTags: form.injuryTags,
          notes: form.notes,
        })
      case 3:
        return validateBody(form)
      default: {
        const result = validateProfile(buildProfile(form))
        return result.ok ? [] : result.errors
      }
    }
  }

  function goToStep(next: number) {
    setErrors([])
    setSaveError(null)
    if (next >= 0 && next < STEP_COUNT) {
      store.saveDraft({ stepIndex: next, data: { ...form } })
      setStep(next)
    }
  }

  function handleSave() {
    const result = validateProfile(buildProfile(form))
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    try {
      const record = store.saveProfile(result.profile)
      store.clearDraft()
      onSaved(record)
    } catch (error) {
      setSaveError(
        'تعذر حفظ بياناتك (قد تكون مساحة التخزين ممتلئة أو محجوبة). ' +
          'إجاباتك لم تُفقد — حاول مرة أخرى. التفاصيل: ' +
          String(error),
      )
    }
  }

  function handleNext() {
    const found = stepErrors()
    setErrors(found)
    if (found.length > 0) return
    if (step === STEP_COUNT - 1) {
      handleSave()
      return
    }
    goToStep(step + 1)
  }

  if (askResume) {
    return (
      <section
        className="card resume-card"
        data-testid="resume-card"
        style={{ maxWidth: '640px', margin: '20px auto', padding: '20px' }}
      >
        <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800 }}>
          توقفت في منتصف التهيئة؟
        </h2>
        <p
          className="muted"
          style={{ margin: '0 0 16px 0', fontSize: '14px', lineHeight: 1.6 }}
        >
          حفظنا تقدمك تلقائياً على جهازك. يمكنك المتابعة من حيث توقفت أو البدء
          من جديد.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            className="btn-primary-action full-width"
            data-testid="resume-btn"
            onClick={() => setAskResume(false)}
            style={{ height: '48px', fontWeight: 800 }}
          >
            متابعة من حيث توقفت
          </button>
          <button
            type="button"
            className="ghost full-width"
            data-testid="discard-btn"
            onClick={() => {
              store.clearDraft()
              setForm(EMPTY_FORM)
              setStep(0)
              setErrors([])
              setAskResume(false)
            }}
            style={{ height: '44px' }}
          >
            البدء من جديد
          </button>
        </div>
      </section>
    )
  }

  return (
    <section
      className="card wizard"
      data-testid="wizard"
      style={{ maxWidth: '640px', margin: '0 auto', padding: '16px' }}
    >
      {/* Coach Greeting Banner */}
      <div className="maganis-coach-card" style={{ marginBottom: '16px' }}>
        <div className="maganis-coach-avatar-wrapper">
          <img
            src={assetUrl('branding/maganis-welcome-transparent.png')}
            alt="د. مجانص"
            className="maganis-transparent-mascot"
          />
          <span className="maganis-coach-badge">د. مجانص</span>
        </div>
        <div className="maganis-coach-body">
          <h3 className="maganis-coach-title">
            يا أسطى العضلات وفورمة الساحل!
          </h3>
          <div className="maganis-speech-bubble">
            <strong>يا هلا بالبطل!</strong> د. مجانص معاك على الخط.. هنظبط جسمك
            بالميزان والمسطرة، علم صافي ومفيش فتي، عشان نبني فورمة قوية وصحية!
          </div>
        </div>
      </div>

      {/* Progress & Step Counter */}
      <div
        className="progress"
        data-testid="progress"
        data-step={step + 1}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${STEP_COUNT}, 1fr)`,
          gap: '6px',
          marginBottom: '14px',
        }}
      >
        {Array.from({ length: STEP_COUNT }, (_, i) => (
          <span
            key={i}
            className={'progress-bar' + (i <= step ? ' done' : '')}
            style={{
              height: '5px',
              borderRadius: '999px',
              background: i <= step ? 'var(--accent)' : 'var(--line)',
              transition: 'background 0.25s ease',
            }}
          />
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '16px',
        }}
      >
        <h2
          data-testid="step-title"
          style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}
        >
          {STEP_TITLES[step]}
        </h2>
        <span
          className="step-counter muted"
          style={{ fontSize: '13px', fontWeight: 600 }}
        >
          الخطوة {step + 1} من {STEP_COUNT}
        </span>
      </div>

      {/* Step 0: Goal Selection */}
      {step === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div
            className="options"
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            {GOALS.map((goal) => {
              const isSelected = form.goals.includes(goal.value)
              return (
                <button
                  key={goal.value}
                  type="button"
                  className={'option-btn' + (isSelected ? ' selected' : '')}
                  data-testid={`goal-${goal.value}`}
                  aria-pressed={isSelected}
                  onClick={() => {
                    setForm((prev) => {
                      const selected = prev.goals.includes(goal.value)
                        ? prev.goals.filter((g) => g !== goal.value)
                        : [...prev.goals, goal.value]
                      const primaryGoal =
                        selected.length === 1 ? selected[0] : null
                      return { ...prev, goals: selected, primaryGoal }
                    })
                    setErrors([])
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '4px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: isSelected
                      ? '2px solid var(--accent)'
                      : '1.5px solid var(--line)',
                    background: isSelected
                      ? 'var(--accent-soft)'
                      : 'var(--card-subtle)',
                    cursor: 'pointer',
                    textAlign: 'right',
                    width: '100%',
                    boxSizing: 'border-box',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                      alignItems: 'center',
                    }}
                  >
                    <strong
                      style={{
                        fontSize: '15px',
                        color: isSelected ? 'var(--accent)' : 'var(--ink)',
                      }}
                    >
                      {goal.labelAr}
                    </strong>
                    {isSelected && (
                      <IconCheck size={18} color="var(--accent)" />
                    )}
                  </div>
                  <span
                    className="hint"
                    style={{ fontSize: '13px', color: 'var(--muted)' }}
                  >
                    {goal.hintAr}
                  </span>
                </button>
              )
            })}
          </div>

          {form.goals.length > 1 && (
            <div className="field" style={{ marginTop: '8px' }}>
              <p
                style={{
                  fontSize: '13.5px',
                  fontWeight: 700,
                  margin: '0 0 8px 0',
                }}
              >
                اخترت أهدافاً مركبة — حدد الهدف الأساسي:
              </p>
              <div
                className="chips"
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                {form.goals.map((g) => {
                  const info = GOALS.find((x) => x.value === g)
                  const isPrimary = form.primaryGoal === g
                  return (
                    <button
                      key={g}
                      type="button"
                      className={'chip-btn' + (isPrimary ? ' selected' : '')}
                      data-testid={`primary-${g}`}
                      aria-pressed={isPrimary}
                      onClick={() => {
                        setForm((prev) => ({ ...prev, primaryGoal: g }))
                        setErrors([])
                      }}
                      style={{
                        height: '42px',
                        padding: '0 16px',
                        borderRadius: '21px',
                        border: isPrimary
                          ? '2px solid var(--accent)'
                          : '1px solid var(--line)',
                        background: isPrimary
                          ? 'var(--accent)'
                          : 'var(--card-bg)',
                        color: isPrimary ? '#fff' : 'var(--ink)',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {info?.labelAr ?? g}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 1: Training Days Per Week */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p
            className="muted"
            style={{ fontSize: '13.5px', margin: '0 0 8px 0' }}
          >
            كم يوماً في الأسبوع تستطيع الالتزام بالتمرين؟
          </p>
          <div
            className="options"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
              width: '100%',
            }}
          >
            {[2, 3, 4, 5, 6].map((d) => {
              const isSelected = form.trainingDaysPerWeek === d
              return (
                <button
                  key={d}
                  type="button"
                  className={
                    'option-btn day-btn' + (isSelected ? ' selected' : '')
                  }
                  data-testid={`day-${d}`}
                  aria-pressed={isSelected}
                  onClick={() => {
                    setForm((prev) => ({ ...prev, trainingDaysPerWeek: d }))
                    setErrors([])
                  }}
                  style={{
                    height: '52px',
                    borderRadius: '12px',
                    border: isSelected
                      ? '2px solid var(--accent)'
                      : '1.5px solid var(--line)',
                    background: isSelected
                      ? 'var(--accent)'
                      : 'var(--card-subtle)',
                    color: isSelected ? '#fff' : 'var(--ink)',
                    fontSize: '18px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {d}
                </button>
              )
            })}
          </div>
          <div
            style={{
              textAlign: 'center',
              color: 'var(--muted)',
              fontSize: '12.5px',
              marginTop: '4px',
            }}
          >
            أيام أسبوعياً
          </div>
        </div>
      )}

      {/* Step 2: Medical Assessment */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <p
              style={{
                fontSize: '14px',
                fontWeight: 700,
                margin: '0 0 10px 0',
              }}
            >
              هل تعاني من أي إصابات سابقة أو مشاكل في المفاصل؟
            </p>
            <div
              className="radio-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
              }}
            >
              <button
                type="button"
                className={
                  'option-btn' + (form.hasIssues === true ? ' selected' : '')
                }
                data-testid="medical-yes"
                aria-pressed={form.hasIssues === true}
                onClick={() => {
                  setForm((prev) => ({ ...prev, hasIssues: true }))
                  setErrors([])
                }}
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  border:
                    form.hasIssues === true
                      ? '2px solid var(--accent)'
                      : '1.5px solid var(--line)',
                  background:
                    form.hasIssues === true
                      ? 'var(--accent-soft)'
                      : 'var(--card-subtle)',
                  color:
                    form.hasIssues === true ? 'var(--accent)' : 'var(--ink)',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: 'pointer',
                }}
              >
                نعم
              </button>
              <button
                type="button"
                className={
                  'option-btn' + (form.hasIssues === false ? ' selected' : '')
                }
                data-testid="medical-no"
                aria-pressed={form.hasIssues === false}
                onClick={() => {
                  setForm((prev) => ({
                    ...prev,
                    hasIssues: false,
                    injuryTags: [],
                  }))
                  setErrors([])
                }}
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  border:
                    form.hasIssues === false
                      ? '2px solid var(--accent)'
                      : '1.5px solid var(--line)',
                  background:
                    form.hasIssues === false
                      ? 'var(--accent-soft)'
                      : 'var(--card-subtle)',
                  color:
                    form.hasIssues === false ? 'var(--accent)' : 'var(--ink)',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: 'pointer',
                }}
              >
                لا
              </button>
            </div>
          </div>

          {form.hasIssues === true && (
            <>
              <div className="field">
                <p
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 700,
                    margin: '0 0 8px 0',
                  }}
                >
                  حدد موضع الإصابة أو المشكلة (يمكن اختيار أكثر من واحد):
                </p>
                <div
                  className="chips"
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  {INJURY_TAGS.map((tag) => {
                    const isSelected = form.injuryTags.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        className={'chip-btn' + (isSelected ? ' selected' : '')}
                        aria-pressed={isSelected}
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            injuryTags: prev.injuryTags.includes(tag)
                              ? prev.injuryTags.filter((t) => t !== tag)
                              : [...prev.injuryTags, tag],
                          }))
                          setErrors([])
                        }}
                        style={{
                          height: '40px',
                          padding: '0 14px',
                          borderRadius: '20px',
                          border: isSelected
                            ? '1.5px solid var(--accent)'
                            : '1px solid var(--line)',
                          background: isSelected
                            ? 'var(--accent-soft)'
                            : 'var(--card-bg)',
                          color: isSelected ? 'var(--accent)' : 'var(--ink)',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div
                className="field"
                style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
              >
                <label
                  htmlFor="medical-notes"
                  style={{ fontSize: '13.5px', fontWeight: 700 }}
                >
                  ملاحظات إضافية (اختياري)
                </label>
                <textarea
                  id="medical-notes"
                  data-testid="medical-notes"
                  rows={3}
                  value={form.notes}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="اكتب أي تفاصيل أخرى عن حالتك الصحية..."
                  style={{
                    width: '100%',
                    borderRadius: '10px',
                    border: '1.5px solid var(--line)',
                    padding: '10px 14px',
                    fontSize: '14px',
                    background: 'var(--card-bg)',
                    color: 'var(--ink)',
                    boxSizing: 'border-box',
                    resize: 'none',
                  }}
                />
              </div>
            </>
          )}

          <div style={{ marginTop: '4px' }}>
            <Callout variant="warning">
              ملاحظة مهمة: مجانص ليس بديلاً عن الطبيب. إجاباتك تُستخدم فقط
              لتكييف التمارين مع حالتك، وإذا كان لديك أي إصابة أو حالة صحية
              فاستشر طبيبك قبل البدء.
            </Callout>
          </div>
        </div>
      )}

      {/* Step 3: Body Metrics */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Sex */}
          <div className="field">
            <p
              style={{
                fontSize: '13.5px',
                fontWeight: 700,
                margin: '0 0 8px 0',
              }}
            >
              الجنس:
            </p>
            <div
              className="radio-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
              }}
            >
              <button
                type="button"
                className={
                  'option-btn' + (form.sex === 'male' ? ' selected' : '')
                }
                data-testid="sex-male"
                aria-pressed={form.sex === 'male'}
                onClick={() => {
                  setForm((prev) => ({ ...prev, sex: 'male' }))
                  setErrors([])
                }}
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  border:
                    form.sex === 'male'
                      ? '2px solid var(--accent)'
                      : '1.5px solid var(--line)',
                  background:
                    form.sex === 'male'
                      ? 'var(--accent-soft)'
                      : 'var(--card-subtle)',
                  color: form.sex === 'male' ? 'var(--accent)' : 'var(--ink)',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: 'pointer',
                }}
              >
                ذكر
              </button>
              <button
                type="button"
                className={
                  'option-btn' + (form.sex === 'female' ? ' selected' : '')
                }
                data-testid="sex-female"
                aria-pressed={form.sex === 'female'}
                onClick={() => {
                  setForm((prev) => ({ ...prev, sex: 'female' }))
                  setErrors([])
                }}
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  border:
                    form.sex === 'female'
                      ? '2px solid var(--accent)'
                      : '1.5px solid var(--line)',
                  background:
                    form.sex === 'female'
                      ? 'var(--accent-soft)'
                      : 'var(--card-subtle)',
                  color: form.sex === 'female' ? 'var(--accent)' : 'var(--ink)',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: 'pointer',
                }}
              >
                أنثى
              </button>
            </div>
          </div>

          {/* Age, Height, Weight in a row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
            }}
          >
            <div
              className="field"
              style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
            >
              <label
                htmlFor="age"
                style={{ fontSize: '13px', fontWeight: 700 }}
              >
                العمر (سنة)
              </label>
              <input
                id="age"
                type="number"
                min={10}
                max={90}
                data-testid="age"
                value={form.age}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, age: e.target.value }))
                }
                style={{
                  height: '48px',
                  width: '100%',
                  borderRadius: '10px',
                  border: '1.5px solid var(--line)',
                  padding: '0 10px',
                  fontSize: '15px',
                  background: 'var(--card-bg)',
                  color: 'var(--ink)',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div
              className="field"
              style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
            >
              <label
                htmlFor="height"
                style={{ fontSize: '13px', fontWeight: 700 }}
              >
                الطول (سم)
              </label>
              <input
                id="height"
                type="number"
                min={100}
                max={250}
                data-testid="height"
                value={form.heightCm}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, heightCm: e.target.value }))
                }
                style={{
                  height: '48px',
                  width: '100%',
                  borderRadius: '10px',
                  border: '1.5px solid var(--line)',
                  padding: '0 10px',
                  fontSize: '15px',
                  background: 'var(--card-bg)',
                  color: 'var(--ink)',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div
              className="field"
              style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
            >
              <label
                htmlFor="weight"
                style={{ fontSize: '13px', fontWeight: 700 }}
              >
                الوزن (كجم)
              </label>
              <input
                id="weight"
                type="number"
                min={30}
                max={300}
                data-testid="weight"
                value={form.weightKg}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, weightKg: e.target.value }))
                }
                style={{
                  height: '48px',
                  width: '100%',
                  borderRadius: '10px',
                  border: '1.5px solid var(--line)',
                  padding: '0 10px',
                  fontSize: '15px',
                  background: 'var(--card-bg)',
                  color: 'var(--ink)',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Activity Level */}
          <div className="field">
            <p
              style={{
                fontSize: '13.5px',
                fontWeight: 700,
                margin: '0 0 8px 0',
              }}
            >
              مستوى النشاط اليومي:
            </p>
            <div
              className="options"
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              {ACTIVITY_LEVELS.map((lvl) => {
                const isSelected = form.activityLevel === lvl.value
                return (
                  <button
                    key={lvl.value}
                    type="button"
                    className={'option-btn' + (isSelected ? ' selected' : '')}
                    data-testid={`activity-${lvl.value}`}
                    aria-pressed={isSelected}
                    onClick={() => {
                      setForm((prev) => ({ ...prev, activityLevel: lvl.value }))
                      setErrors([])
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '4px',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: isSelected
                        ? '2px solid var(--accent)'
                        : '1.5px solid var(--line)',
                      background: isSelected
                        ? 'var(--accent-soft)'
                        : 'var(--card-subtle)',
                      cursor: 'pointer',
                      textAlign: 'right',
                      width: '100%',
                      boxSizing: 'border-box',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        alignItems: 'center',
                      }}
                    >
                      <strong
                        style={{
                          fontSize: '14.5px',
                          color: isSelected ? 'var(--accent)' : 'var(--ink)',
                        }}
                      >
                        {lvl.labelAr}
                      </strong>
                      <span
                        dir="ltr"
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: isSelected ? 'var(--accent)' : 'var(--muted)',
                          background: isSelected
                            ? 'rgba(var(--accent-rgb), 0.15)'
                            : 'var(--card-bg)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        ×{lvl.multiplier}
                      </span>
                    </div>
                    <span
                      className="hint"
                      style={{ fontSize: '12.5px', color: 'var(--muted)' }}
                    >
                      {lvl.hintAr}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Review & Summary */}
      {step === 4 && <ReviewSummary form={form} />}

      {/* Errors */}
      {errors.length > 0 && (
        <div
          style={{ marginTop: '16px' }}
          data-testid="step-errors"
          role="alert"
        >
          <Callout variant="error">
            <ul style={{ margin: 0, paddingInlineStart: '18px' }}>
              {errors.map((message, i) => (
                <li key={i}>{message}</li>
              ))}
            </ul>
          </Callout>
        </div>
      )}

      {saveError && (
        <div
          style={{ marginTop: '16px' }}
          data-testid="save-error"
          role="alert"
        >
          <Callout variant="error">{saveError}</Callout>
        </div>
      )}

      {/* Navigation Buttons */}
      <div
        className="wizard-nav"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          marginTop: '24px',
        }}
      >
        <button
          type="button"
          className="btn-primary-action full-width"
          data-testid="next-btn"
          onClick={handleNext}
          style={{ height: '48px', fontSize: '15px', fontWeight: 800 }}
        >
          {step === STEP_COUNT - 1 ? 'حفظ والبدء' : 'التالي'}
        </button>

        {step > 0 ? (
          <button
            type="button"
            className="ghost-secondary full-width"
            data-testid="back-btn"
            onClick={() => goToStep(step - 1)}
            style={{ height: '44px', fontSize: '14px' }}
          >
            رجوع
          </button>
        ) : onCancel ? (
          <button
            type="button"
            className="ghost-secondary full-width"
            data-testid="cancel-btn"
            onClick={onCancel}
            style={{ height: '44px', fontSize: '14px' }}
          >
            إلغاء
          </button>
        ) : null}
      </div>
    </section>
  )
}
