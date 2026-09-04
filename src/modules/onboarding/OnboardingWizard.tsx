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
        <strong>
          {form.age || '—'} سنة / {form.heightCm || '—'} سم /{' '}
          {form.weightKg || '—'} كجم
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

interface OnboardingWizardProps {
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
      <section className="card resume-card" data-testid="resume-card">
        <h2>توقفت في منتصف التهيئة؟</h2>
        <p className="muted">
          حفظنا تقدمك تلقائياً على جهازك. يمكنك المتابعة من حيث توقفت أو البدء
          من جديد.
        </p>
        <div className="actions-row">
          <button
            type="button"
            data-testid="resume-btn"
            onClick={() => setAskResume(false)}
          >
            متابعة من حيث توقفت
          </button>
          <button
            type="button"
            className="ghost"
            data-testid="discard-btn"
            onClick={() => {
              store.clearDraft()
              setForm(EMPTY_FORM)
              setStep(0)
              setErrors([])
              setAskResume(false)
            }}
          >
            البدء من جديد
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="card wizard" data-testid="wizard">
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
            💪 يا أسطى العضلات وفورمة الساحل!
          </h3>
          <div className="maganis-speech-bubble">
            <strong>يا هلا بالوحش!</strong> د. مجانص معاك على الخط.. هنظبط جسمك
            بالميزان والمسطرة، علم صافي ومفيش فتي، عشان نسف الدهون ونبني فورمة
            تخرّج نار!
          </div>
        </div>
      </div>

      <div className="progress" data-testid="progress" data-step={step + 1}>
        {Array.from({ length: STEP_COUNT }, (_, i) => (
          <span
            key={i}
            className={'progress-bar' + (i <= step ? ' done' : '')}
          />
        ))}
      </div>
      <h2 data-testid="step-title">{STEP_TITLES[step]}</h2>
      <p className="step-counter muted">
        الخطوة {step + 1} من {STEP_COUNT}
      </p>

      {step === 0 && (
        <div>
          <div className="options">
            {GOALS.map((goal) => (
              <button
                key={goal.value}
                type="button"
                className={
                  'option-btn' +
                  (form.goals.includes(goal.value) ? ' selected' : '')
                }
                data-testid={`goal-${goal.value}`}
                aria-pressed={form.goals.includes(goal.value)}
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
              >
                <strong>{goal.labelAr}</strong>
                <span className="hint">{goal.hintAr}</span>
              </button>
            ))}
          </div>
          {form.goals.length > 1 && (
            <div className="field">
              <p>اخترت أهدافاً مركبة — حدد الهدف الأساسي:</p>
              <div className="chips">
                {form.goals.map((g) => {
                  const info = GOALS.find((x) => x.value === g)
                  return (
                    <button
                      key={g}
                      type="button"
                      className={
                        'chip-btn' + (form.primaryGoal === g ? ' selected' : '')
                      }
                      data-testid={`primary-${g}`}
                      aria-pressed={form.primaryGoal === g}
                      onClick={() => {
                        setForm((prev) => ({ ...prev, primaryGoal: g }))
                        setErrors([])
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

      {step === 1 && (
        <div className="options">
          {[2, 3, 4, 5, 6].map((d) => (
            <button
              key={d}
              type="button"
              className={
                'option-btn day-btn' +
                (form.trainingDaysPerWeek === d ? ' selected' : '')
              }
              data-testid={`day-${d}`}
              aria-pressed={form.trainingDaysPerWeek === d}
              onClick={() => {
                setForm((prev) => ({ ...prev, trainingDaysPerWeek: d }))
                setErrors([])
              }}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="radio-row">
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
            >
              لا
            </button>
          </div>
          {form.hasIssues === true && (
            <>
              <div className="field">
                <p>حدد موضع الإصابة أو المشكلة (يمكن اختيار أكثر من واحد):</p>
                <div className="chips">
                  {INJURY_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={
                        'chip-btn' +
                        (form.injuryTags.includes(tag) ? ' selected' : '')
                      }
                      aria-pressed={form.injuryTags.includes(tag)}
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          injuryTags: prev.injuryTags.includes(tag)
                            ? prev.injuryTags.filter((t) => t !== tag)
                            : [...prev.injuryTags, tag],
                        }))
                        setErrors([])
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label htmlFor="medical-notes">ملاحظات إضافية (اختياري)</label>
                <textarea
                  id="medical-notes"
                  data-testid="medical-notes"
                  rows={3}
                  value={form.notes}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                />
              </div>
            </>
          )}
          <p className="disclaimer">
            ملاحظة مهمة: مجانص ليس بديلاً عن الطبيب. إجاباتك تُستخدم فقط لتكييف
            التمارين مع حالتك، وإذا كان لديك أي إصابة أو حالة صحية فاستشر طبيبك
            قبل البدء.
          </p>
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="field">
            <p>الجنس:</p>
            <div className="radio-row">
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
              >
                أنثى
              </button>
            </div>
          </div>
          <div className="field">
            <label htmlFor="age">العمر (بالسنوات)</label>
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
            />
          </div>
          <div className="field">
            <label htmlFor="height">الطول (سم)</label>
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
            />
          </div>
          <div className="field">
            <label htmlFor="weight">الوزن (كجم)</label>
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
            />
          </div>
          <div className="field">
            <p>مستوى النشاط اليومي:</p>
            <div className="options">
              {ACTIVITY_LEVELS.map((lvl) => (
                <button
                  key={lvl.value}
                  type="button"
                  className={
                    'option-btn' +
                    (form.activityLevel === lvl.value ? ' selected' : '')
                  }
                  data-testid={`activity-${lvl.value}`}
                  aria-pressed={form.activityLevel === lvl.value}
                  onClick={() => {
                    setForm((prev) => ({ ...prev, activityLevel: lvl.value }))
                    setErrors([])
                  }}
                >
                  <strong>
                    {lvl.labelAr} (×{lvl.multiplier})
                  </strong>
                  <span className="hint">{lvl.hintAr}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 4 && <ReviewSummary form={form} />}

      {errors.length > 0 && (
        <div className="error-list" data-testid="step-errors" role="alert">
          <ul>
            {errors.map((message, i) => (
              <li key={i}>{message}</li>
            ))}
          </ul>
        </div>
      )}
      {saveError && (
        <div className="banner-error" data-testid="save-error" role="alert">
          {saveError}
        </div>
      )}

      <div className="wizard-nav">
        {step > 0 ? (
          <button
            type="button"
            data-testid="back-btn"
            onClick={() => goToStep(step - 1)}
          >
            رجوع
          </button>
        ) : onCancel ? (
          <button type="button" data-testid="cancel-btn" onClick={onCancel}>
            إلغاء
          </button>
        ) : (
          <span />
        )}
        <button type="button" data-testid="next-btn" onClick={handleNext}>
          {step === STEP_COUNT - 1 ? 'حفظ والبدء' : 'التالي'}
        </button>
      </div>
    </section>
  )
}
