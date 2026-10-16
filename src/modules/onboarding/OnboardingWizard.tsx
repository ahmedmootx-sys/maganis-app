import { useState, useEffect, useMemo } from 'react'
import { assetUrl } from '../../utils/assetUrl.ts'
import type { ProfileStore } from './profileStore'
import { ACTIVITY_LEVELS, GOALS } from './types'
import type {
  ActivityLevel,
  Goal,
  ProfileCore,
  Sex,
  UserProfile,
} from './types'
import {
  WizardProgress,
  Button,
  OptionList,
  Field,
  Segmented,
  Callout,
  KeyValueList,
  Chips,
} from '../../ui'
import { fmtNumber } from '../../utils/bidi.ts'

export interface OnboardingWizardProps {
  store: ProfileStore
  initialProfile?: UserProfile | null
  onSaved: (profile: UserProfile) => void
  onCancel?: () => void
}

interface FormState {
  primaryGoal: Goal | null
  trainingDaysPerWeek: number | null
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  trainingLocation: 'gym' | 'home' | 'both'
  name: string
  hasIssues: boolean | null
  injuryNotes: string
  sex: Sex | null
  age: string
  heightCm: string
  weightKg: string
  activityLevel: ActivityLevel | null
}

const DEFAULT_FORM: FormState = {
  primaryGoal: 'hypertrophy',
  trainingDaysPerWeek: 4,
  experienceLevel: 'beginner',
  trainingLocation: 'gym',
  name: '',
  hasIssues: false,
  injuryNotes: '',
  sex: 'male',
  age: '25',
  heightCm: '175',
  weightKg: '75',
  activityLevel: 'moderate',
}

const DRAFT_STORAGE_KEY = 'maganis:onboarding_draft'

export function OnboardingWizard({
  store,
  initialProfile,
  onSaved,
  onCancel,
}: OnboardingWizardProps) {
  // Load saved draft or initialize from profile
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (initialProfile) return 1
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (typeof parsed?.step === 'number' && parsed.step >= 1 && parsed.step <= 6) {
          return parsed.step
        }
      }
    } catch {
      // ignore
    }
    return 1
  })

  const [form, setForm] = useState<FormState>(() => {
    if (initialProfile) {
      return {
        primaryGoal: initialProfile.primaryGoal,
        trainingDaysPerWeek: initialProfile.trainingDaysPerWeek,
        experienceLevel: initialProfile.experienceLevel ?? 'beginner',
        trainingLocation: initialProfile.trainingLocation ?? 'gym',
        name: initialProfile.name ?? '',
        hasIssues: initialProfile.medical.hasIssues,
        injuryNotes:
          initialProfile.medical.notes ||
          initialProfile.medical.injuryTags.join('، '),
        sex: initialProfile.body.sex,
        age: String(initialProfile.body.age),
        heightCm: String(initialProfile.body.heightCm),
        weightKg: String(initialProfile.body.weightKg),
        activityLevel: initialProfile.body.activityLevel,
      }
    }
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.form) {
          return { ...DEFAULT_FORM, ...parsed.form }
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_FORM
  })

  // Persist draft on changes
  useEffect(() => {
    if (!initialProfile) {
      try {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({ step: currentStep, form }),
        )
      } catch {
        // ignore
      }
    }
  }, [currentStep, form, initialProfile])

  const updateForm = (patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }))
  }

  // --- Step Validations ---
  const isStep1Valid = form.primaryGoal !== null

  const isStep2Valid =
    form.trainingDaysPerWeek !== null &&
    form.trainingDaysPerWeek >= 2 &&
    form.trainingDaysPerWeek <= 6

  const isStep3Valid =
    form.hasIssues !== null &&
    (form.hasIssues === false || form.injuryNotes.trim().length > 0)

  const ageNum = Number(form.age)
  const heightNum = Number(form.heightCm)
  const weightNum = Number(form.weightKg)

  const isStep4Valid =
    form.sex !== null &&
    Number.isInteger(ageNum) &&
    ageNum >= 14 &&
    ageNum <= 90 &&
    Number.isFinite(heightNum) &&
    heightNum >= 120 &&
    heightNum <= 230 &&
    Number.isFinite(weightNum) &&
    weightNum >= 30 &&
    weightNum <= 250

  const isStep5Valid = form.activityLevel !== null

  const isCurrentStepValid = useMemo(() => {
    switch (currentStep) {
      case 1:
        return isStep1Valid
      case 2:
        return isStep2Valid
      case 3:
        return isStep3Valid
      case 4:
        return isStep4Valid
      case 5:
        return isStep5Valid
      case 6:
        return true
      default:
        return false
    }
  }, [
    currentStep,
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
    isStep4Valid,
    isStep5Valid,
  ])

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1)
      window.scrollTo(0, 0)
    } else {
      handleFinalSave()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
      window.scrollTo(0, 0)
    } else if (onCancel) {
      onCancel()
    }
  }

  const handleFinalSave = () => {
    const injuryTags = form.hasIssues && form.injuryNotes.trim()
      ? [form.injuryNotes.trim()]
      : []

    const core: ProfileCore = {
      name: form.name.trim() || undefined,
      experienceLevel: form.experienceLevel,
      trainingLocation: form.trainingLocation,
      goals: form.primaryGoal ? [form.primaryGoal] : ['hypertrophy'],
      primaryGoal: form.primaryGoal ?? 'hypertrophy',
      trainingDaysPerWeek: form.trainingDaysPerWeek ?? 4,
      weekStartDay: 6, // default Saturday
      medical: {
        hasIssues: Boolean(form.hasIssues),
        injuryTags,
        notes: form.injuryNotes.trim(),
      },
      body: {
        sex: form.sex ?? 'male',
        age: Number(form.age) || 25,
        heightCm: Number(form.heightCm) || 175,
        weightKg: Number(form.weightKg) || 75,
        activityLevel: form.activityLevel ?? 'moderate',
      },
    }

    const saved = store.saveProfile(core)
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY)
    } catch {
      // ignore
    }
    onSaved(saved)
  }

  return (
    <div
      className="wizard-fullscreen-container"
      data-testid="wizard"
      dir="rtl"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
      }}
    >
      {/* Top: WizardProgress ONLY (No header, no theme toggle, no tagline) */}
      <div style={{ padding: '16px 20px 8px' }}>
        <WizardProgress currentStep={currentStep} totalSteps={6} />
      </div>

      {/* Main Question Body */}
      <div
        className="wizard-step-body"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 20px 96px',
          maxWidth: '540px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Step 1: ما هدفك؟ */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img
                src={assetUrl('branding/maganis-mascot-inner.png')}
                alt="د. مجانص"
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '16px',
                  objectFit: 'contain',
                  border: '1px solid var(--color-divider)',
                  background: 'var(--color-surface)',
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  fontSize: '13.5px',
                  lineHeight: '1.5',
                  color: 'var(--color-text-2)',
                }}
              >
                يا هلا بالوحش! د. مجانص معاك على الخط.. هنظبط جسمك ونبنيلك برنامج
                تدريبي وتغذية علمية تفجّر بيها فورمة أحلامك!
              </div>
            </div>

            <h1
              style={{
                fontSize: '22px',
                fontWeight: 700,
                margin: '8px 0 0',
                color: 'var(--color-text)',
              }}
            >
              ما هدفك؟
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-text-2)',
                margin: 0,
              }}
            >
              اختر الهدف التدريبي والبدني الأساسي الذي تريد التركيز عليه
            </p>

            <OptionList
              options={GOALS.map((g) => ({
                value: g.value,
                title: g.labelAr,
                subtitle: g.hintAr,
              }))}
              value={form.primaryGoal ?? undefined}
              onChange={(val) => updateForm({ primaryGoal: val as Goal })}
            />
          </div>
        )}

        {/* Step 2: تدريبك */}
        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h1
              style={{
                fontSize: '22px',
                fontWeight: 700,
                margin: '4px 0 0',
                color: 'var(--color-text)',
              }}
            >
              تدريبك
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-text-2)',
                margin: 0,
              }}
            >
              حدد أيام التدريب أسبوعياً وتفضيلاتك التدريبية
            </p>

            <div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}
              >
                أيام التمرين في الأسبوع
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '8px',
                }}
              >
                {[2, 3, 4, 5, 6].map((days) => {
                  const isSelected = form.trainingDaysPerWeek === days
                  return (
                    <Chips
                      key={days}
                      selected={isSelected}
                      onClick={() => updateForm({ trainingDaysPerWeek: days })}
                      style={{
                        height: '44px',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '15px',
                        width: '100%',
                      }}
                    >
                      {days} {days <= 4 ? 'أيام' : 'أيام'}
                    </Chips>
                  )
                })}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}
              >
                خبرة التدريب
              </div>
              <Segmented
                options={[
                  { value: 'beginner', label: 'مبتدئ' },
                  { value: 'intermediate', label: 'متوسط' },
                  { value: 'advanced', label: 'متقدم' },
                ]}
                value={form.experienceLevel}
                onChange={(val) =>
                  updateForm({
                    experienceLevel: val as
                      | 'beginner'
                      | 'intermediate'
                      | 'advanced',
                  })
                }
              />
            </div>

            <div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}
              >
                مكان التدريب
              </div>
              <Segmented
                options={[
                  { value: 'gym', label: 'جيم' },
                  { value: 'home', label: 'منزل' },
                  { value: 'both', label: 'الاثنان' },
                ]}
                value={form.trainingLocation}
                onChange={(val) =>
                  updateForm({
                    trainingLocation: val as 'gym' | 'home' | 'both',
                  })
                }
              />
            </div>

            <Field
              label="الاسم (اختياري)"
              placeholder="اكتب اسمك الأول..."
              value={form.name}
              onChange={(e) => updateForm({ name: e.target.value })}
            />
          </div>
        )}

        {/* Step 3: صحتك */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h1
              style={{
                fontSize: '22px',
                fontWeight: 700,
                margin: '4px 0 0',
                color: 'var(--color-text)',
              }}
            >
              صحتك
            </h1>
            <p
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--color-text)',
                margin: 0,
              }}
            >
              هل لديك إصابة أو حالة صحية تؤثر على التمرين؟
            </p>

            <Segmented
              options={[
                { value: 'no', label: 'لا' },
                { value: 'yes', label: 'نعم' },
              ]}
              value={
                form.hasIssues === null ? '' : form.hasIssues ? 'yes' : 'no'
              }
              onChange={(val) => updateForm({ hasIssues: val === 'yes' })}
            />

            {form.hasIssues === true && (
              <Field
                label="تفاصيل الحالة أو الإصابة"
                placeholder="مثال: ألم في أسفل الظهر، إصابة بالكتف، تمزق غضروفي..."
                value={form.injuryNotes}
                onChange={(e) => updateForm({ injuryNotes: e.target.value })}
                error={
                  form.injuryNotes.trim().length === 0
                    ? 'يرجى كتابة تفاصيل الإصابة لمساعدتنا في تخصيص برنامجك'
                    : undefined
                }
              />
            )}

            <Callout variant="info" title="إخلاء مسؤولية طبية">
              هذا التطبيق أداة استرشادية ولا يغني عن استشارة الطبيب المختص أو
              أخصائي العلاج الطبيعي قبل ممارسة التمارين الرياضية.
            </Callout>
          </div>
        )}

        {/* Step 4: جسمك */}
        {currentStep === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h1
              style={{
                fontSize: '22px',
                fontWeight: 700,
                margin: '4px 0 0',
                color: 'var(--color-text)',
              }}
            >
              جسمك
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-text-2)',
                margin: 0,
              }}
            >
              بياناتك البدنية لحساب معدل الأيض والاحتياج الأساسي بدقة
            </p>

            <div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}
              >
                الجنس
              </div>
              <Segmented
                options={[
                  { value: 'male', label: 'ذكر' },
                  { value: 'female', label: 'أنثى' },
                ]}
                value={form.sex ?? 'male'}
                onChange={(val) => updateForm({ sex: val as Sex })}
              />
            </div>

            <Field
              label="العمر"
              unit="سنة"
              inputMode="numeric"
              placeholder="مثال: 25"
              value={form.age}
              onChange={(e) => updateForm({ age: e.target.value })}
              error={
                form.age && (ageNum < 14 || ageNum > 90)
                  ? 'العمر يجب أن يكون بين 14 و90 سنة'
                  : undefined
              }
            />

            <Field
              label="الطول"
              unit="سم"
              inputMode="numeric"
              placeholder="مثال: 175"
              value={form.heightCm}
              onChange={(e) => updateForm({ heightCm: e.target.value })}
              error={
                form.heightCm && (heightNum < 120 || heightNum > 230)
                  ? 'الطول يجب أن يكون بين 120 و230 سم'
                  : undefined
              }
            />

            <Field
              label="الوزن"
              unit="كجم"
              inputMode="decimal"
              placeholder="مثال: 75"
              value={form.weightKg}
              onChange={(e) => updateForm({ weightKg: e.target.value })}
              error={
                form.weightKg && (weightNum < 30 || weightNum > 250)
                  ? 'الوزن يجب أن يكون بين 30 و250 كجم'
                  : undefined
              }
            />
          </div>
        )}

        {/* Step 5: نشاطك اليومي */}
        {currentStep === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h1
              style={{
                fontSize: '22px',
                fontWeight: 700,
                margin: '4px 0 0',
                color: 'var(--color-text)',
              }}
            >
              نشاطك اليومي
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-text-2)',
                margin: 0,
              }}
            >
              مستوى حركتك ونشاطك خارج أوقات التمرين لحساب السعرات
            </p>

            <OptionList
              options={ACTIVITY_LEVELS.map((a) => ({
                value: a.value,
                title: a.labelAr,
                subtitle: `${a.hintAr} (×${fmtNumber(a.multiplier)})`,
              }))}
              value={form.activityLevel ?? undefined}
              onChange={(val) =>
                updateForm({ activityLevel: val as ActivityLevel })
              }
            />
          </div>
        )}

        {/* Step 6: مراجعة */}
        {currentStep === 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img
                src={assetUrl('branding/maganis-mascot-inner.png')}
                alt="د. مجانص"
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '16px',
                  objectFit: 'contain',
                  border: '1px solid var(--color-divider)',
                  background: 'var(--color-surface)',
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  fontSize: '13.5px',
                  lineHeight: '1.5',
                  color: 'var(--color-text-2)',
                }}
              >
                كافة بياناتك جاهزة! اضغط على أي سطر لتعديله إذا رغبت، أو ابدأ
                رحلتك الرياضية فوراً.
              </div>
            </div>

            <h1
              style={{
                fontSize: '22px',
                fontWeight: 700,
                margin: '8px 0 0',
                color: 'var(--color-text)',
              }}
            >
              مراجعة
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-text-2)',
                margin: 0,
              }}
            >
              راجع إجاباتك قبل إنشاء البرنامج التدريبي
            </p>

            <KeyValueList
              items={[
                {
                  key: 'الهدف',
                  value:
                    GOALS.find((g) => g.value === form.primaryGoal)?.labelAr ??
                    '—',
                  onClick: () => setCurrentStep(1),
                },
                {
                  key: 'أيام التمرين',
                  value: `${form.trainingDaysPerWeek} أيام أسبوعياً`,
                  onClick: () => setCurrentStep(2),
                },
                {
                  key: 'خبرة التدريب',
                  value:
                    form.experienceLevel === 'beginner'
                      ? 'مبتدئ'
                      : form.experienceLevel === 'intermediate'
                        ? 'متوسط'
                        : 'متقدم',
                  onClick: () => setCurrentStep(2),
                },
                {
                  key: 'مكان التدريب',
                  value:
                    form.trainingLocation === 'gym'
                      ? 'جيم'
                      : form.trainingLocation === 'home'
                        ? 'منزل'
                        : 'الاثنان',
                  onClick: () => setCurrentStep(2),
                },
                {
                  key: 'الصحة والإصابات',
                  value: form.hasIssues
                    ? form.injuryNotes || 'يوجد ملاحظات'
                    : 'سليم ولا توجد إصابات',
                  onClick: () => setCurrentStep(3),
                },
                {
                  key: 'الجنس',
                  value: form.sex === 'male' ? 'ذكر' : 'أنثى',
                  onClick: () => setCurrentStep(4),
                },
                {
                  key: 'العمر',
                  value: `${form.age} سنة`,
                  onClick: () => setCurrentStep(4),
                },
                {
                  key: 'الطول',
                  value: `${form.heightCm} سم`,
                  onClick: () => setCurrentStep(4),
                },
                {
                  key: 'الوزن',
                  value: `${form.weightKg} كجم`,
                  onClick: () => setCurrentStep(4),
                },
                {
                  key: 'النشاط اليومي',
                  value:
                    ACTIVITY_LEVELS.find((a) => a.value === form.activityLevel)
                      ?.labelAr ?? '—',
                  onClick: () => setCurrentStep(5),
                },
              ]}
            />
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar with Primary and Tertiary Actions */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-divider)',
          padding: '12px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxWidth: '540px',
          margin: '0 auto',
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
          {currentStep > 1 && (
            <Button
              variant="subtle"
              size="lg"
              onClick={handleBack}
              style={{ flex: '0 0 100px' }}
            >
              رجوع
            </Button>
          )}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!isCurrentStepValid}
            onClick={handleNext}
          >
            {currentStep === 6 ? 'حفظ والبدء' : 'التالي'}
          </Button>
        </div>

        {/* Clean Arabic-only footer line with zero Latin words */}
        <div
          style={{
            textAlign: 'center',
            fontSize: '12px',
            color: 'var(--color-text-2)',
            paddingTop: '2px',
          }}
        >
          يعمل بدون إنترنت، وبياناتك محفوظة على جهازك فقط.
        </div>
      </div>
    </div>
  )
}
