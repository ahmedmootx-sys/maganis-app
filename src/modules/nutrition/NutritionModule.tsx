import { useEffect, useMemo, useState } from 'react'
import { assetUrl } from '../../utils/assetUrl.ts'
import type {
  ActivityLevel,
  Goal,
  Sex,
  UserProfile,
} from '../onboarding/types.ts'
import { ACTIVITY_LEVELS, GOALS } from '../onboarding/types.ts'
import type { BodyLogEntry } from '../shared/types.ts'
import { calculateCalorieMacroTargets } from './calorieCalculator.ts'
import { CustomMealModal } from './CustomMealModal.tsx'
import { calculateIngredientMacros, getFoodItemById } from './foodDatabase.ts'
import {
  calibrateTDEE,
  validateNutritionInput,
  type FormulaChoice,
  type LifestyleLevel,
  type NutritionPace,
  type WorkoutBlockInput,
} from './nutritionEngine.ts'
import { QuickManualMealModal } from './QuickManualMealModal.tsx'
import type { CustomMeal, DailyNutritionLog, MealCategory } from './types.ts'

interface NutritionModuleProps {
  profile: UserProfile | null
  bodyLog?: BodyLogEntry[]
  onAddBodyWeight?: (entry: BodyLogEntry) => void
  onUpdateProfile?: (profile: UserProfile) => void
}

const CATEGORY_LABELS: Record<MealCategory, string> = {
  breakfast: '🌅 فطور',
  lunch: '🍲 غداء',
  dinner: '🌙 عشاء',
  snack: '🥗 سناك وخفايف',
}

export function NutritionModule({
  profile,
  bodyLog,
  onAddBodyWeight,
  onUpdateProfile,
}: NutritionModuleProps) {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<
    MealCategory | 'all'
  >('all')
  const [recentlyLoggedId, setRecentlyLoggedId] = useState<string | null>(null)

  // Custom Meals State
  const [customMeals, setCustomMeals] = useState<CustomMeal[]>(() => {
    try {
      const raw = localStorage.getItem('maganis:custom_meals')
      if (raw) return JSON.parse(raw) as CustomMeal[]
    } catch {
      // ignore
    }
    return []
  })
  const [isCustomMealModalOpen, setIsCustomMealModalOpen] = useState(false)
  const [isQuickManualModalOpen, setIsQuickManualModalOpen] = useState(false)
  const [editingCustomMeal, setEditingCustomMeal] = useState<CustomMeal | null>(
    null,
  )
  const [showMacroGuide, setShowMacroGuide] = useState(false)

  // Profile Editor Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isImperial, setIsImperial] = useState(false)
  const [editWeight, setEditWeight] = useState<number>(
    profile?.body?.weightKg ?? 70,
  )
  const [editHeight, setEditHeight] = useState<number>(
    profile?.body?.heightCm ?? 170,
  )
  const [editAge, setEditAge] = useState<number>(profile?.body?.age ?? 25)
  const [editSex, setEditSex] = useState<Sex>(profile?.body?.sex ?? 'male')
  const [editActivity, setEditActivity] = useState<ActivityLevel>(
    profile?.body?.activityLevel ?? 'moderate',
  )
  const [editBodyFat, setEditBodyFat] = useState<number | undefined>(
    profile?.body?.bodyFatPercent,
  )
  const [editLifestyle, setEditLifestyle] = useState<LifestyleLevel>(
    profile?.body?.lifestyle ?? 2,
  )
  const [editWorkoutBlocks, setEditWorkoutBlocks] = useState<
    WorkoutBlockInput[]
  >(
    profile?.body?.workoutBlocks ?? [
      {
        type: 'resistance',
        sessionsPerWeek: 4,
        minutesPerSession: 60,
        intensity: 'moderate',
      },
    ],
  )
  const [editGoal, setEditGoal] = useState<Goal>(
    profile?.primaryGoal ?? 'hypertrophy',
  )
  const [editPace, setEditPace] = useState<NutritionPace>(
    profile?.body?.pace ?? 'standard',
  )
  const [editFormulaOverride, setEditFormulaOverride] = useState<FormulaChoice>(
    profile?.body?.formulaOverride ?? 'auto',
  )
  const [editProteinOverride, setEditProteinOverride] = useState<
    number | undefined
  >(profile?.body?.proteinPerKgOverride)
  const [showAdvancedInModal, setShowAdvancedInModal] = useState(false)
  const [modalError, setModalError] = useState('')

  // Explanation & Calibration Modal State
  const [showExplanation, setShowExplanation] = useState(false)
  const [isCalibrationModalOpen, setIsCalibrationModalOpen] = useState(false)
  const [quickWeight, setQuickWeight] = useState('')
  const [quickWeightDate, setQuickWeightDate] = useState(
    () => new Date().toISOString().split('T')[0],
  )
  const [calibrationFeedback, setCalibrationFeedback] = useState('')

  useEffect(() => {
    if (profile) {
      setEditWeight(profile.body.weightKg)
      setEditHeight(profile.body.heightCm)
      setEditAge(profile.body.age)
      setEditSex(profile.body.sex)
      setEditActivity(profile.body.activityLevel)
      setEditBodyFat(profile.body.bodyFatPercent)
      setEditLifestyle(profile.body.lifestyle ?? 2)
      setEditWorkoutBlocks(
        profile.body.workoutBlocks ?? [
          {
            type: 'resistance',
            sessionsPerWeek: 4,
            minutesPerSession: 60,
            intensity: 'moderate',
          },
        ],
      )
      setEditGoal(profile.primaryGoal)
      setEditPace(profile.body.pace ?? 'standard')
      setEditFormulaOverride(profile.body.formulaOverride ?? 'auto')
      setEditProteinOverride(profile.body.proteinPerKgOverride)
    }
  }, [profile])

  useEffect(() => {
    try {
      localStorage.setItem('maganis:custom_meals', JSON.stringify(customMeals))
    } catch {
      // ignore
    }
  }, [customMeals])

  const todayKey = useMemo(() => new Date().toISOString().split('T')[0], [])
  const storageKey = `maganis:daily_nutrition_${todayKey}`

  // Daily tracker state
  const [dailyLog, setDailyLog] = useState<DailyNutritionLog>(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        return JSON.parse(raw) as DailyNutritionLog
      }
    } catch {
      // ignore
    }
    return {
      date: todayKey,
      consumedCalories: 0,
      consumedProtein: 0,
      consumedCarbs: 0,
      consumedFats: 0,
      loggedMeals: [],
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(dailyLog))
    } catch {
      // ignore
    }
  }, [dailyLog, storageKey])

  const targets = useMemo(() => {
    if (!profile) return null
    return calculateCalorieMacroTargets(profile)
  }, [profile])

  function handleLogDirectMeal(meal: {
    id: string
    nameAr: string
    calories: number
    protein: number
    carbs: number
    fats: number
  }) {
    setDailyLog((prev) => {
      const newCalories = Math.round(prev.consumedCalories + meal.calories)
      const newProtein = Math.round(prev.consumedProtein + meal.protein)
      const newCarbs = Math.round(prev.consumedCarbs + meal.carbs)
      const newFats = Math.round(prev.consumedFats + meal.fats)

      return {
        ...prev,
        consumedCalories: newCalories,
        consumedProtein: newProtein,
        consumedCarbs: newCarbs,
        consumedFats: newFats,
        loggedMeals: [
          ...prev.loggedMeals,
          {
            mealId: meal.id,
            nameAr: meal.nameAr,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fats: meal.fats,
            timestamp: Date.now(),
          },
        ],
      }
    })

    setRecentlyLoggedId(meal.id)
    setTimeout(() => {
      setRecentlyLoggedId(null)
    }, 2000)
  }

  function handleLogCustomMeal(meal: CustomMeal) {
    handleLogDirectMeal({
      id: meal.id,
      nameAr: meal.nameAr,
      calories: meal.calories,
      protein: meal.proteinGrams,
      carbs: meal.carbsGrams,
      fats: meal.fatsGrams,
    })
  }

  function handleSaveCustomMeal(meal: CustomMeal) {
    setCustomMeals((prev) => {
      const exists = prev.some((m) => m.id === meal.id)
      if (exists) {
        return prev.map((m) => (m.id === meal.id ? meal : m))
      }
      return [meal, ...prev]
    })
    setIsCustomMealModalOpen(false)
    setEditingCustomMeal(null)
  }

  function handleDeleteCustomMeal(id: string) {
    if (window.confirm('هل أنت متأكد من حذف هذه الوجبة؟')) {
      setCustomMeals((prev) => prev.filter((m) => m.id !== id))
    }
  }

  const calibrationData = useMemo(() => {
    if (!targets || !bodyLog || bodyLog.length < 8) return null
    const intakeLogs: { date: string; calories: number }[] = []
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith('maganis:daily_nutrition_')) {
          const raw = localStorage.getItem(k)
          if (raw) {
            const parsed = JSON.parse(raw)
            if (parsed.date && parsed.consumedCalories > 0) {
              intakeLogs.push({
                date: parsed.date,
                calories: parsed.consumedCalories,
              })
            }
          }
        }
      }
    } catch {
      // ignore
    }

    const plannedAdj = targets.engineResult
      ? targets.engineResult.adjustmentKcal
      : 0
    return calibrateTDEE({
      currentTDEE: targets.tdee,
      currentTarget: targets.targetCalories,
      plannedAdjustment: plannedAdj,
      weightLogs: bodyLog,
      intakeLogs,
    })
  }, [targets, bodyLog])

  function handleQuickWeightSave() {
    const w = parseFloat(quickWeight)
    if (isNaN(w) || w < 30 || w > 350) {
      setCalibrationFeedback('يرجى إدخال وزن صحيح بين 30 و 350 كجم.')
      return
    }
    if (onAddBodyWeight) {
      onAddBodyWeight({ date: quickWeightDate, weightKg: w })
      setCalibrationFeedback('✓ تم حفظ الوزن بنجاح في سجلك الصحي.')
      setQuickWeight('')
    }
  }

  function handleApplyCalibration(newTarget: number) {
    if (!profile || !onUpdateProfile) return
    const updated: UserProfile = {
      ...profile,
      updatedAt: Date.now(),
    }
    onUpdateProfile(updated)
    setCalibrationFeedback(
      `✓ تم تطبيق الهدف المعاير (${newTarget} كالوِري) بنجاح!`,
    )
    setIsCalibrationModalOpen(false)
  }

  function handleSaveProfileChanges(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return

    const validation = validateNutritionInput({
      sex: editSex,
      age: Number(editAge),
      weightKg: Number(editWeight),
      heightCm: Number(editHeight),
      bodyFatPercent: editBodyFat ? Number(editBodyFat) : undefined,
      lifestyle: editLifestyle,
      workoutBlocks: editWorkoutBlocks,
      goal:
        editGoal === 'hypertrophy'
          ? 'gain'
          : editGoal === 'cut'
            ? 'lose'
            : 'maintain',
      pace: editPace,
      formulaOverride: editFormulaOverride,
      proteinPerKgOverride: editProteinOverride
        ? Number(editProteinOverride)
        : undefined,
    })

    if (!validation.isValid) {
      setModalError(Object.values(validation.errorsAr)[0])
      return
    }
    setModalError('')

    const updatedProfile: UserProfile = {
      ...profile,
      primaryGoal: editGoal,
      body: {
        ...profile.body,
        sex: editSex,
        weightKg: Number(editWeight) || profile.body.weightKg,
        heightCm: Number(editHeight) || profile.body.heightCm,
        age: Number(editAge) || profile.body.age,
        activityLevel: editActivity,
        bodyFatPercent: editBodyFat ? Number(editBodyFat) : undefined,
        lifestyle: editLifestyle,
        workoutBlocks: editWorkoutBlocks,
        pace: editPace,
        formulaOverride: editFormulaOverride,
        proteinPerKgOverride: editProteinOverride
          ? Number(editProteinOverride)
          : undefined,
      },
      updatedAt: Date.now(),
    }

    if (onUpdateProfile) {
      onUpdateProfile(updatedProfile)
    }
    setIsProfileModalOpen(false)
  }

  function handleResetDailyLog() {
    if (window.confirm('هل تريد تصفير عداد السعرات والماكروز لهذا اليوم؟')) {
      const resetState: DailyNutritionLog = {
        date: todayKey,
        consumedCalories: 0,
        consumedProtein: 0,
        consumedCarbs: 0,
        consumedFats: 0,
        loggedMeals: [],
      }
      setDailyLog(resetState)
      try {
        localStorage.setItem(storageKey, JSON.stringify(resetState))
      } catch {
        // ignore
      }
    }
  }

  const filteredCustomMeals = useMemo(() => {
    if (selectedCategoryFilter === 'all') return customMeals
    return customMeals.filter((m) => m.category === selectedCategoryFilter)
  }, [customMeals, selectedCategoryFilter])

  if (!profile || !targets) {
    return (
      <div className="card">
        <p className="muted">
          يرجى إكمال الملف الشخصي أولاً لحساب السعرات والماكروز.
        </p>
      </div>
    )
  }

  const calPercent = Math.min(
    100,
    Math.round((dailyLog.consumedCalories / targets.targetCalories) * 100),
  )
  const proteinPercent = Math.min(
    100,
    Math.round((dailyLog.consumedProtein / targets.proteinGrams) * 100),
  )
  const carbsPercent = Math.min(
    100,
    Math.round((dailyLog.consumedCarbs / targets.carbsGrams) * 100),
  )
  const fatsPercent = Math.min(
    100,
    Math.round((dailyLog.consumedFats / targets.fatsGrams) * 100),
  )

  const currentGoalObj = GOALS.find((g) => g.value === profile.primaryGoal)
  const currentActivityObj = ACTIVITY_LEVELS.find(
    (a) => a.value === profile.body.activityLevel,
  )

  return (
    <div className="nutrition-module" data-testid="nutrition-module">
      {/* Dr. Maganis Coach Header */}
      <div className="maganis-coach-card" style={{ marginBottom: '16px' }}>
        <div className="maganis-coach-avatar-wrapper">
          <img
            src={assetUrl('branding/maganis-nutrition-transparent.png')}
            alt="د. مجانص والتغذية"
            className="maganis-transparent-mascot"
          />
          <span className="maganis-coach-badge">د. مجانص</span>
        </div>
        <div className="maganis-coach-body">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '6px',
            }}
          >
            <h3 className="maganis-coach-title" style={{ margin: 0 }}>
              🍎 مطبخ د. مجانص — متابعة السعرات والماكروز
            </h3>
            <button
              type="button"
              className="chip highlight"
              onClick={() => setShowMacroGuide((prev) => !prev)}
              style={{
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '12px',
                padding: '4px 10px',
                border: '1px solid var(--primary)',
              }}
            >
              {showMacroGuide
                ? '✕ إخفاء الدليل التعليمي'
                : '💡 كيف أحسب الماكروز؟'}
            </button>
          </div>
          <div className="maganis-speech-bubble" style={{ marginTop: '8px' }}>
            <strong>سجّل وجباتك بلمسة واحدة!</strong> اكتب سعرات وماكروز وجبتك
            مباشرة، أو صمّمها بالجرام من حاسبة المكونات. شريطك بيتملي أمامك حتى
            توصل لهدفك وتعمل فورمة حديد!
          </div>
        </div>
      </div>

      {/* Outdated Profile Notice Banner */}
      {profile &&
        (!profile.body.lifestyle ||
          !profile.body.workoutBlocks ||
          profile.body.workoutBlocks.length === 0) && (
          <div
            style={{
              background: 'rgba(249, 115, 22, 0.12)',
              border: '1.5px solid var(--accent)',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <strong style={{ color: 'var(--accent)', fontSize: '13.5px' }}>
                💡 استكمال بيانات الحساب العلمي الدقيق:
              </strong>
              <p
                style={{
                  margin: '4px 0 0',
                  fontSize: '12px',
                  color: 'var(--ink)',
                }}
              >
                لتفعيل حساب معدل الأيض ومعامل النشاط اليومي وتفاصيل جلسات
                التمرين بدقة 100% بنظام 2026، اضغط هنا لاستكمال بياناتك.
              </p>
            </div>
            <button
              type="button"
              className="button-primary small"
              onClick={() => setIsProfileModalOpen(true)}
            >
              ✨ استكمال البيانات الآن
            </button>
          </div>
        )}

      {/* Body Profile & Daily Calorie Science Card */}
      <div
        className="card highlight-box"
        style={{
          marginBottom: '16px',
          border: '1.5px solid var(--line)',
          padding: '14px 16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '10px',
          }}
        >
          <div>
            <h4
              style={{
                margin: 0,
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              🎯 ملف جسمك واحتياجك اليومي العلمي
            </h4>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
              {targets.engineResult
                ? targets.engineResult.explanationAr.formula
                : 'معادلة ميفلين سانت جيور (Mifflin-St Jeor)'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="chip-btn"
              onClick={() => setIsProfileModalOpen(true)}
              style={{
                background: 'var(--primary)',
                color: '#ffffff',
                border: 'none',
                padding: '6px 12px',
                fontWeight: 700,
                fontSize: '12.5px',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              ✏️ تعديل بيانات وزني وهدفي
            </button>
            <button
              type="button"
              className="button-secondary small"
              onClick={() => setIsCalibrationModalOpen(true)}
            >
              ⚖️ معايرة السعرات الذكية
            </button>
          </div>
        </div>

        {/* Profile Metrics Row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '12.5px',
            background: 'var(--card-subtle)',
            padding: '10px 12px',
            borderRadius: '8px',
            marginBottom: '10px',
            border: '1px solid var(--line)',
          }}
        >
          <span>
            ⚖️ <strong>الوزن:</strong> {profile.body.weightKg} كجم
          </span>
          <span>•</span>
          <span>
            📏 <strong>الطول:</strong> {profile.body.heightCm} سم
          </span>
          <span>•</span>
          <span>
            🎂 <strong>السن:</strong> {profile.body.age} سنة
          </span>
          {profile.body.bodyFatPercent && (
            <>
              <span>•</span>
              <span>
                💧 <strong>نسبة الدهون:</strong> {profile.body.bodyFatPercent}%
              </span>
            </>
          )}
          <span>•</span>
          <span>
            ⚡ <strong>النشاط:</strong> {currentActivityObj?.labelAr || 'متوسط'}
          </span>
          <span>•</span>
          <span>
            🏆 <strong>الهدف:</strong> {currentGoalObj?.labelAr || 'تضخيم'}
          </span>
        </div>

        {/* Calculation Details */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '8px',
            fontSize: '12px',
          }}
        >
          <div
            style={{
              background: 'var(--card-subtle)',
              padding: '8px 10px',
              borderRadius: '6px',
            }}
          >
            <strong>الحرق الأساسي (BMR):</strong>
            <div>{targets.bmr} كالوِري (أثناء الراحة)</div>
          </div>
          <div
            style={{
              background: 'var(--card-subtle)',
              padding: '8px 10px',
              borderRadius: '6px',
            }}
          >
            <strong>استهلاكك بالنشاط (TDEE):</strong>
            <div>
              {targets.tdee} كالوِري{' '}
              {targets.engineResult?.tdeeRange && (
                <span
                  style={{
                    fontSize: '10.5px',
                    color: 'var(--muted)',
                    display: 'block',
                  }}
                >
                  نطاق: {targets.engineResult.tdeeRange.min} -{' '}
                  {targets.engineResult.tdeeRange.max}
                </span>
              )}
            </div>
          </div>
          <div
            style={{
              background: 'var(--accent-soft)',
              color: 'var(--accent)',
              border: '1px solid rgba(249, 87, 0, 0.3)',
              padding: '8px 10px',
              borderRadius: '6px',
              fontWeight: 700,
            }}
          >
            <strong>الهدف اليومي:</strong>
            <div>
              {targets.targetCalories} كالوِري ({targets.goalLabelAr})
            </div>
          </div>
          <div
            style={{
              background: 'var(--card-subtle)',
              color: 'var(--ink)',
              border: '1px solid var(--line)',
              padding: '8px 10px',
              borderRadius: '6px',
              fontWeight: 700,
            }}
          >
            <strong>البروتين المستهدف:</strong>
            <div>
              {targets.proteinGrams} جم (
              {(targets.proteinGrams / profile.body.weightKg).toFixed(1)}{' '}
              جم/كجم)
              {targets.engineResult?.protein && (
                <span
                  style={{
                    fontSize: '10.5px',
                    color: 'var(--muted)',
                    display: 'block',
                  }}
                >
                  نطاق: {targets.engineResult.protein.rangeMin} -{' '}
                  {targets.engineResult.protein.rangeMax} جم
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible 'كيف حسبناها؟' Button */}
        <div style={{ marginTop: '10px' }}>
          <button
            type="button"
            className="button-secondary small"
            onClick={() => setShowExplanation(!showExplanation)}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {showExplanation
              ? '▲ إخفاء تفاصيل المعادلات العلمية'
              : '🔍 كيف حسبناها؟ (التفاصيل والمعادلات العلمية 2026)'}
          </button>
        </div>

        {/* Detailed Scientific Explanation Panel */}
        {showExplanation && targets.engineResult && (
          <div
            style={{
              marginTop: '10px',
              padding: '12px 14px',
              borderRadius: '8px',
              background: 'var(--card-bg)',
              border: '1px solid var(--line)',
            }}
          >
            <h5
              style={{
                margin: '0 0 8px 0',
                fontSize: '13px',
                color: 'var(--ink)',
              }}
            >
              🔬 تفاصيل المعادلات العلمية لحساب خطتك:
            </h5>
            <ul
              style={{
                margin: 0,
                paddingRight: '16px',
                fontSize: '12px',
                lineHeight: '1.75',
                color: 'var(--ink)',
              }}
            >
              <li>
                <strong>المعادلة:</strong>{' '}
                {targets.engineResult.explanationAr.formula}
              </li>
              <li>
                <strong>الحرق القاعدي (BMR):</strong>{' '}
                {targets.engineResult.explanationAr.bmrText}
              </li>
              <li>
                <strong>معامل نمط الحياة:</strong>{' '}
                {targets.engineResult.explanationAr.lifestyleText}
              </li>
              <li>
                <strong>حرق التمرين الفعلي (EAT):</strong>{' '}
                {targets.engineResult.explanationAr.eatText}
              </li>
              <li>
                <strong>نطاق الاستهلاك (TDEE):</strong>{' '}
                {targets.engineResult.explanationAr.tdeeRangeText}
              </li>
              <li>
                <strong>المعدل الأسبوعي:</strong>{' '}
                {targets.engineResult.explanationAr.rateText}
              </li>
              <li>
                <strong>تعديل السعرات:</strong>{' '}
                {targets.engineResult.explanationAr.adjustmentText}
              </li>
              <li>
                <strong>أساس احتساب البروتين:</strong>{' '}
                {targets.engineResult.explanationAr.proteinBasisText}
              </li>
            </ul>
            <div
              style={{
                marginTop: '10px',
                padding: '8px 10px',
                borderRadius: '6px',
                background: 'var(--card-subtle)',
                fontSize: '11px',
                color: 'var(--muted)',
                lineHeight: '1.5',
              }}
            >
              💡 <em>مرجع رياضي:</em> تشير الدراسات إلى أن مكاسب البناء العضلي
              تصل إلى ذروتها حول 1.6 جم/كجم (Morton et al., BJSM 2018)، والزيادة
              عن ذلك آمنة للأصحاء ولكنها اختيارية.
            </div>
            {targets.engineResult.warningsAr.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                {targets.engineResult.warningsAr.map((w, idx) => (
                  <div
                    key={idx}
                    style={{
                      color: 'var(--accent)',
                      fontSize: '11.5px',
                      marginTop: '4px',
                    }}
                  >
                    ⚠️ {w}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Safety Disclaimer */}
        <div
          style={{
            marginTop: '10px',
            padding: '8px 10px',
            borderRadius: '6px',
            background: 'var(--card-subtle)',
            fontSize: '11px',
            color: 'var(--muted)',
            lineHeight: '1.5',
            border: '1px dashed var(--line)',
          }}
        >
          ⚠️ <strong>إخلاء مسؤولية طبي وأمان:</strong> جميع الأرقام والخطط
          الغذائية هي تقديرات حسابية إرشادية مستندة للأدبيات الرياضية وليست
          استشارة طبية. في حالات الحمل، الرضاعة، الأمراض المزمنة، أو تاريخ
          اضطرابات الأكل، يُرجى استشارة طبيب أو أخصائي تغذية متخصص.
        </div>
      </div>

      {/* Interactive Macro Guide */}
      {showMacroGuide && (
        <div
          className="card highlight-box"
          style={{
            marginBottom: '16px',
            border: '2px solid #3b82f6',
            padding: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: '16px',
                color: '#1e3a8a',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              📖 دليل الماكروز العلمي
            </h3>
            <button
              type="button"
              className="ghost-secondary tiny"
              onClick={() => setShowMacroGuide(false)}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '10px',
            }}
          >
            <div
              style={{
                background: '#eff6ff',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #bfdbfe',
              }}
            >
              <h4 style={{ margin: '0 0 6px', color: '#1d4ed8' }}>
                🥩 البروتين (Protein)
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: '12px',
                  color: '#1e40af',
                  lineHeight: '1.5',
                }}
              >
                1 جم بروتين = 4 سعرات حرارية. مسؤول عن بناء وترميم الألياف
                العضلية.
              </p>
            </div>
            <div
              style={{
                background: '#fefce8',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #fef08a',
              }}
            >
              <h4 style={{ margin: '0 0 6px', color: '#a16207' }}>
                🍞 الكاربوهيدرات (Carbs)
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: '12px',
                  color: '#854d0e',
                  lineHeight: '1.5',
                }}
              >
                1 جم كارب = 4 سعرات حرارية. مصدر الطاقة الأول لتمارين الأوزان.
              </p>
            </div>
            <div
              style={{
                background: '#fef2f2',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #fecaca',
              }}
            >
              <h4 style={{ margin: '0 0 6px', color: '#b91c1c' }}>
                🥑 الدهون الصحية (Fats)
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: '12px',
                  color: '#991b1b',
                  lineHeight: '1.5',
                }}
              >
                1 جم دهون = 9 سعرات حرارية. ضرورية لصحة الهرمونات والمفاصل.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Daily Macro Tracker Bar */}
      <div
        className="card highlight-box"
        style={{ marginBottom: '16px', border: '2px solid var(--primary)' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '12px',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '17px' }}>
              📊 متتبع التغذية اليومي (اليوم: {todayKey})
            </h3>
            <span className="muted-small">
              سجل وجباتك بضغطة زر وشاهد نسبة اكتمال احتياجك
            </span>
          </div>
          {dailyLog.consumedCalories > 0 && (
            <button
              type="button"
              className="ghost-danger tiny"
              onClick={handleResetDailyLog}
              title="تصفير العداد لليوم"
            >
              🔄 تصفير عداد اليوم
            </button>
          )}
        </div>

        {/* Calories Progress Bar */}
        <div style={{ marginBottom: '14px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              marginBottom: '4px',
            }}
          >
            <span>
              🔥 <strong>السعرات الحرارية:</strong> {dailyLog.consumedCalories}{' '}
              / {targets.targetCalories} كالوِري
            </span>
            <strong
              style={{
                color: calPercent >= 100 ? '#22c55e' : 'var(--primary)',
              }}
            >
              {calPercent}%
            </strong>
          </div>
          <div
            style={{
              height: '10px',
              background: 'var(--line)',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${calPercent}%`,
                height: '100%',
                background:
                  calPercent >= 100
                    ? '#22c55e'
                    : 'linear-gradient(90deg, #F95700, #ff8a3d)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* 3 Macro Bars (Protein, Carbs, Fats) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '10px',
          }}
        >
          {/* Protein */}
          <div
            style={{
              background: 'var(--card-subtle)',
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid var(--line)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12.5px',
                marginBottom: '4px',
              }}
            >
              <span style={{ fontWeight: 700, color: '#3b82f6' }}>
                🥩 البروتين
              </span>
              <strong>{proteinPercent}%</strong>
            </div>
            <div
              style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}
            >
              {dailyLog.consumedProtein} / {targets.proteinGrams} جم
            </div>
            <div
              style={{
                height: '6px',
                background: 'var(--line)',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${proteinPercent}%`,
                  height: '100%',
                  background: '#3b82f6',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div
            style={{
              background: 'var(--card-subtle)',
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid var(--line)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12.5px',
                marginBottom: '4px',
              }}
            >
              <span style={{ fontWeight: 700, color: '#eab308' }}>
                🍞 الكارب
              </span>
              <strong>{carbsPercent}%</strong>
            </div>
            <div
              style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}
            >
              {dailyLog.consumedCarbs} / {targets.carbsGrams} جم
            </div>
            <div
              style={{
                height: '6px',
                background: 'var(--line)',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${carbsPercent}%`,
                  height: '100%',
                  background: '#eab308',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Fats */}
          <div
            style={{
              background: 'var(--card-subtle)',
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid var(--line)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12.5px',
                marginBottom: '4px',
              }}
            >
              <span style={{ fontWeight: 700, color: '#ef4444' }}>
                🥑 الدهون
              </span>
              <strong>{fatsPercent}%</strong>
            </div>
            <div
              style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}
            >
              {dailyLog.consumedFats} / {targets.fatsGrams} جم
            </div>
            <div
              style={{
                height: '6px',
                background: 'var(--line)',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${fatsPercent}%`,
                  height: '100%',
                  background: '#ef4444',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>

        {dailyLog.loggedMeals.length > 0 && (
          <div
            style={{
              marginTop: '10px',
              fontSize: '12px',
              color: 'var(--muted)',
            }}
          >
            الوجبات المسجلة اليوم:{' '}
            {dailyLog.loggedMeals.map((m) => m.nameAr).join(' • ')}
          </div>
        )}
      </div>

      {/* Main Custom Meals Action Section */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '14px',
          }}
        >
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: '18px' }}>
              🥗 وجباتي المخصصة
            </h2>
            <p className="muted" style={{ margin: 0 }}>
              سجّل أي وجبة وتناولها بضغطة زر مع احتساب دقيق للسعرات والماكروز.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="button-primary small"
              onClick={() => setIsQuickManualModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #f95700, #ff8a3d)',
              }}
            >
              ⚡ + تسجيل وجبة سريعة
            </button>
            <button
              type="button"
              className="button-secondary small"
              onClick={() => {
                setEditingCustomMeal(null)
                setIsCustomMealModalOpen(true)
              }}
            >
              ✨ + تصميم وجبة بالمكونات
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div
          className="chips-row"
          style={{ flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}
        >
          <button
            type="button"
            className={
              'chip-btn' + (selectedCategoryFilter === 'all' ? ' selected' : '')
            }
            onClick={() => setSelectedCategoryFilter('all')}
          >
            📋 كل الوجبات ({customMeals.length})
          </button>
          {(Object.keys(CATEGORY_LABELS) as MealCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              className={
                'chip-btn' + (selectedCategoryFilter === cat ? ' selected' : '')
              }
              onClick={() => setSelectedCategoryFilter(cat)}
            >
              {CATEGORY_LABELS[cat]} (
              {customMeals.filter((m) => m.category === cat).length})
            </button>
          ))}
        </div>

        {/* Custom Meals Grid */}
        <div className="egyptian-meals-grid">
          {filteredCustomMeals.length === 0 ? (
            <div
              className="card"
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '36px 16px',
                background: 'var(--card-subtle)',
                border: '1.5px dashed var(--line)',
                borderRadius: '12px',
              }}
            >
              <h3 style={{ margin: '0 0 8px' }}>لم تضف وجبات بعد! 🍽️</h3>
              <p
                className="muted"
                style={{ margin: '0 auto 16px', maxWidth: '440px' }}
              >
                يمكنك الآن تسجيل أي وجبة تأكلها بالسعرات والماكروز مباشرة عبر زر{' '}
                <strong>"⚡ تسجيل وجبة سريعة"</strong>، أو تصميمها بالجرام من
                حاسبة المكونات.
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  className="button-primary"
                  onClick={() => setIsQuickManualModalOpen(true)}
                >
                  ⚡ سجّل أول وجبة سريعة الآن
                </button>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => {
                    setEditingCustomMeal(null)
                    setIsCustomMealModalOpen(true)
                  }}
                >
                  ✨ صمّم وجبة بحاسبة الجرامات
                </button>
              </div>
            </div>
          ) : (
            filteredCustomMeals.map((meal) => {
              const isJustLogged = recentlyLoggedId === meal.id
              return (
                <div key={meal.id} className="egyptian-meal-card card">
                  <div className="meal-card-header">
                    <div>
                      <h3 style={{ margin: '0 0 4px', fontSize: '15px' }}>
                        {meal.nameAr}
                      </h3>
                      <span
                        className="chip"
                        style={{
                          background: 'var(--accent-soft)',
                          color: 'var(--accent)',
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '999px',
                        }}
                      >
                        {CATEGORY_LABELS[meal.category] || meal.category}
                      </span>
                    </div>
                    <span className="badge-cal">{meal.calories} كالوِري</span>
                  </div>

                  {meal.notesAr && <p className="meal-desc">{meal.notesAr}</p>}

                  {meal.ingredients && meal.ingredients.length > 0 && (
                    <div
                      style={{
                        margin: '8px 0',
                        padding: '8px',
                        background: 'var(--card-subtle)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        border: '1px solid var(--line)',
                      }}
                    >
                      <strong>المكونات:</strong>
                      <ul
                        style={{
                          margin: '4px 0 0',
                          paddingRight: '18px',
                          color: 'var(--muted)',
                        }}
                      >
                        {meal.ingredients.map((ing, i) => {
                          const food = getFoodItemById(ing.foodItemId)
                          if (!food) return null
                          const m = calculateIngredientMacros(food, ing.grams)
                          return (
                            <li key={i}>
                              {ing.grams} جم {food.nameAr} ({m.calories} كالوِري
                              • {m.protein}ج بروتين)
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}

                  <div className="meal-macros-mini">
                    <span className="macro-pill protein">
                      بروتين: {meal.proteinGrams}ج
                    </span>
                    <span className="macro-pill carbs">
                      كارب: {meal.carbsGrams}ج
                    </span>
                    <span className="macro-pill fats">
                      دهون: {meal.fatsGrams}ج
                    </span>
                  </div>

                  <div
                    style={{ display: 'flex', gap: '6px', marginTop: '12px' }}
                  >
                    <button
                      type="button"
                      className="button-primary tiny"
                      style={{
                        flex: 2,
                        background: isJustLogged ? '#22c55e' : undefined,
                        borderColor: isJustLogged ? '#22c55e' : undefined,
                      }}
                      onClick={() => handleLogCustomMeal(meal)}
                    >
                      {isJustLogged
                        ? '✓ تم تسجيل الوجبة!'
                        : '🍽️ أكلت الوجبة (+ضيف للماكروز)'}
                    </button>
                    <button
                      type="button"
                      className="ghost tiny"
                      onClick={() => {
                        setEditingCustomMeal(meal)
                        setIsCustomMealModalOpen(true)
                      }}
                      title="تعديل الوجبة"
                    >
                      ✏️ تعديل
                    </button>
                    <button
                      type="button"
                      className="ghost-danger tiny"
                      onClick={() => handleDeleteCustomMeal(meal.id)}
                      title="حذف الوجبة"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Quick Manual Meal Modal */}
      {isQuickManualModalOpen && (
        <QuickManualMealModal
          onLogMealDirect={handleLogDirectMeal}
          onSaveToCustomMeals={handleSaveCustomMeal}
          onClose={() => setIsQuickManualModalOpen(false)}
        />
      )}

      {/* Custom Meal Modal (with ingredients and custom food creator) */}
      {isCustomMealModalOpen && (
        <CustomMealModal
          initialMeal={editingCustomMeal}
          onSave={handleSaveCustomMeal}
          onClose={() => {
            setIsCustomMealModalOpen(false)
            setEditingCustomMeal(null)
          }}
        />
      )}

      {/* Profile Edit Modal */}
      {isProfileModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsProfileModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '560px',
              borderRadius: '16px',
              padding: '20px',
              maxHeight: '92vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
                borderBottom: '1px solid var(--line)',
                paddingBottom: '10px',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                  ⚙️ إعدادات الحساب العلمي للسعرات والماكروز
                </h3>
                <span style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                  نظام 2026 الدقيق (BMR + METs + EAT + LBM)
                </span>
              </div>
              <button
                type="button"
                className="ghost-secondary tiny"
                onClick={() => setIsProfileModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div
                style={{
                  background: 'var(--danger-soft)',
                  color: 'var(--danger)',
                  padding: '10px',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  border: '1px solid var(--danger-line)',
                }}
              >
                ⚠️ {modalError}
              </div>
            )}

            <form onSubmit={handleSaveProfileChanges}>
              {/* Unit Toggle */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    background: 'var(--card-subtle)',
                    borderRadius: '8px',
                    padding: '2px',
                    border: '1px solid var(--line)',
                  }}
                >
                  <button
                    type="button"
                    className={`tiny ${!isImperial ? 'button-primary' : 'ghost'}`}
                    onClick={() => setIsImperial(false)}
                    style={{ borderRadius: '6px' }}
                  >
                    متري (كجم / سم)
                  </button>
                  <button
                    type="button"
                    className={`tiny ${isImperial ? 'button-primary' : 'ghost'}`}
                    onClick={() => setIsImperial(true)}
                    style={{ borderRadius: '6px' }}
                  >
                    إمبراطوري (باوند / بوصة)
                  </button>
                </div>
              </div>

              {/* Weight & Height */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  marginBottom: '12px',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      marginBottom: '4px',
                    }}
                  >
                    ⚖️ الوزن ({isImperial ? 'باوند lbs' : 'كجم'}):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="field-input"
                    value={
                      isImperial
                        ? Number((editWeight * 2.20462).toFixed(1))
                        : editWeight
                    }
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0
                      setEditWeight(
                        isImperial ? Number((val / 2.20462).toFixed(1)) : val,
                      )
                    }}
                    required
                    style={{ width: '100%', padding: '8px', fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      marginBottom: '4px',
                    }}
                  >
                    📏 الطول ({isImperial ? 'بوصة in' : 'سم'}):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    className="field-input"
                    value={
                      isImperial
                        ? Number((editHeight / 2.54).toFixed(1))
                        : editHeight
                    }
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0
                      setEditHeight(
                        isImperial ? Number((val * 2.54).toFixed(1)) : val,
                      )
                    }}
                    required
                    style={{ width: '100%', padding: '8px', fontWeight: 700 }}
                  />
                </div>
              </div>

              {/* Age, Sex & Optional Body Fat */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '10px',
                  marginBottom: '12px',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      marginBottom: '4px',
                    }}
                  >
                    🎂 العمر:
                  </label>
                  <input
                    type="number"
                    min="12"
                    max="100"
                    className="field-input"
                    value={editAge}
                    onChange={(e) => setEditAge(Number(e.target.value))}
                    required
                    style={{ width: '100%', padding: '8px', fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      marginBottom: '4px',
                    }}
                  >
                    👤 الجنس:
                  </label>
                  <select
                    className="field-input"
                    value={editSex}
                    onChange={(e) => setEditSex(e.target.value as Sex)}
                    style={{ width: '100%', padding: '8px' }}
                  >
                    <option value="male">ذكر (Male)</option>
                    <option value="female">أنثى (Female)</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      marginBottom: '4px',
                    }}
                  >
                    💧 دهون الجسم % (اختياري):
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="65"
                    step="0.5"
                    className="field-input"
                    value={editBodyFat ?? ''}
                    placeholder="مثال: 18"
                    onChange={(e) =>
                      setEditBodyFat(
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    style={{ width: '100%', padding: '8px' }}
                  />
                </div>
              </div>

              {/* Lifestyle (excluding workouts) */}
              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    marginBottom: '4px',
                  }}
                >
                  🚶 نمط نشاطك اليومي (خارج أوقات التمرين):
                </label>
                <select
                  className="field-input"
                  value={editLifestyle}
                  onChange={(e) =>
                    setEditLifestyle(Number(e.target.value) as LifestyleLevel)
                  }
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value={1}>
                    1 = مكتبي / طالب (خامل غالباً، معامل 1.20)
                  </option>
                  <option value={2}>
                    2 = حركة يومية خفيفة مع مشي متقطع (معامل 1.35)
                  </option>
                  <option value={3}>
                    3 = وقوف وحركة نشطة أغلب اليوم (معامل 1.50)
                  </option>
                  <option value={4}>
                    4 = عمل بدني شاق ومجهود مستمر (معامل 1.65)
                  </option>
                </select>
              </div>

              {/* Workout Blocks (up to 3) */}
              <div
                style={{
                  background: 'var(--card-subtle)',
                  padding: '12px',
                  borderRadius: '10px',
                  marginBottom: '14px',
                  border: '1px solid var(--line)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <label style={{ fontSize: '12.5px', fontWeight: 800 }}>
                    🏋️ جلسات التمارين الرياضية (حساب حرق EAT):
                  </label>
                  {editWorkoutBlocks.length < 3 && (
                    <button
                      type="button"
                      className="button-secondary tiny"
                      onClick={() =>
                        setEditWorkoutBlocks([
                          ...editWorkoutBlocks,
                          {
                            type: 'cardio',
                            sessionsPerWeek: 3,
                            minutesPerSession: 30,
                            intensity: 'moderate',
                          },
                        ])
                      }
                    >
                      + إضافة نشاط آخر
                    </button>
                  )}
                </div>

                {editWorkoutBlocks.map((block, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.2fr 1fr 1fr 1.2fr auto',
                      gap: '6px',
                      alignItems: 'center',
                      marginBottom: '8px',
                      background: 'var(--card-bg)',
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid var(--line)',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: '10px',
                          display: 'block',
                          color: 'var(--muted)',
                        }}
                      >
                        النوع
                      </span>
                      <select
                        className="field-input"
                        value={block.type}
                        onChange={(e) => {
                          const updated = [...editWorkoutBlocks]
                          updated[idx] = {
                            ...updated[idx],
                            type: e.target.value as 'resistance' | 'cardio',
                          }
                          setEditWorkoutBlocks(updated)
                        }}
                        style={{
                          width: '100%',
                          padding: '4px',
                          fontSize: '11px',
                        }}
                      >
                        <option value="resistance">حديد ومقاومة</option>
                        <option value="cardio">كارديو وجري</option>
                      </select>
                    </div>

                    <div>
                      <span
                        style={{
                          fontSize: '10px',
                          display: 'block',
                          color: 'var(--muted)',
                        }}
                      >
                        أيام/أسبوع
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="7"
                        className="field-input"
                        value={block.sessionsPerWeek}
                        onChange={(e) => {
                          const updated = [...editWorkoutBlocks]
                          updated[idx] = {
                            ...updated[idx],
                            sessionsPerWeek: Number(e.target.value),
                          }
                          setEditWorkoutBlocks(updated)
                        }}
                        style={{
                          width: '100%',
                          padding: '4px',
                          fontSize: '11px',
                        }}
                      />
                    </div>

                    <div>
                      <span
                        style={{
                          fontSize: '10px',
                          display: 'block',
                          color: 'var(--muted)',
                        }}
                      >
                        دقيقة/جلسة
                      </span>
                      <input
                        type="number"
                        min="15"
                        max="180"
                        step="5"
                        className="field-input"
                        value={block.minutesPerSession}
                        onChange={(e) => {
                          const updated = [...editWorkoutBlocks]
                          updated[idx] = {
                            ...updated[idx],
                            minutesPerSession: Number(e.target.value),
                          }
                          setEditWorkoutBlocks(updated)
                        }}
                        style={{
                          width: '100%',
                          padding: '4px',
                          fontSize: '11px',
                        }}
                      />
                    </div>

                    <div>
                      <span
                        style={{
                          fontSize: '10px',
                          display: 'block',
                          color: 'var(--muted)',
                        }}
                      >
                        الشدة
                      </span>
                      <select
                        className="field-input"
                        value={block.intensity}
                        onChange={(e) => {
                          const updated = [...editWorkoutBlocks]
                          updated[idx] = {
                            ...updated[idx],
                            intensity: e.target.value as
                              'light' | 'moderate' | 'hard',
                          }
                          setEditWorkoutBlocks(updated)
                        }}
                        style={{
                          width: '100%',
                          padding: '4px',
                          fontSize: '11px',
                        }}
                      >
                        <option value="light">خفيفة</option>
                        <option value="moderate">متوسطة</option>
                        <option value="hard">شاقة وعالية</option>
                      </select>
                    </div>

                    {editWorkoutBlocks.length > 1 && (
                      <button
                        type="button"
                        className="ghost-danger tiny"
                        onClick={() =>
                          setEditWorkoutBlocks(
                            editWorkoutBlocks.filter((_, i) => i !== idx),
                          )
                        }
                        title="حذف"
                        style={{ marginTop: '12px' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Goal & Pace */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr',
                  gap: '10px',
                  marginBottom: '14px',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      marginBottom: '4px',
                    }}
                  >
                    🏆 الهدف الأساسي:
                  </label>
                  <select
                    className="field-input"
                    value={editGoal}
                    onChange={(e) => setEditGoal(e.target.value as Goal)}
                    style={{ width: '100%', padding: '8px' }}
                  >
                    <option value="hypertrophy">
                      بناء عضلات وتضخيم (فائض سعرات)
                    </option>
                    <option value="cut">تنشيف وخسارة دهون (عجز سعرات)</option>
                    <option value="calisthenics">
                      كاليستينكس (سعرات المحافظة)
                    </option>
                    <option value="flexibility">
                      صحة ومرونة (سعرات المحافظة)
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      marginBottom: '4px',
                    }}
                  >
                    ⚡ وتيرة الهدف (Pace):
                  </label>
                  <select
                    className="field-input"
                    value={editPace}
                    onChange={(e) =>
                      setEditPace(e.target.value as NutritionPace)
                    }
                    style={{ width: '100%', padding: '8px' }}
                  >
                    <option value="slow">هادئة وتدريجية (Slow)</option>
                    <option value="standard">قياسية ومعتدلة (Standard)</option>
                    <option value="fast">سريعة ومكثفة (Fast)</option>
                  </select>
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <div style={{ marginBottom: '14px' }}>
                <button
                  type="button"
                  className="ghost tiny"
                  onClick={() => setShowAdvancedInModal(!showAdvancedInModal)}
                  style={{ textDecoration: 'underline', color: 'var(--muted)' }}
                >
                  {showAdvancedInModal
                    ? '▲ إخفاء الخيارات المتقدمة'
                    : '⚙️ خيارات متقدمة (تحديد المعادلة والبروتين يدوياً)'}
                </button>

                {showAdvancedInModal && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '10px',
                      borderRadius: '8px',
                      background: 'var(--card-subtle)',
                      border: '1px solid var(--line)',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '11.5px',
                          marginBottom: '3px',
                        }}
                      >
                        معادلة BMR:
                      </label>
                      <select
                        className="field-input"
                        value={editFormulaOverride}
                        onChange={(e) =>
                          setEditFormulaOverride(
                            e.target.value as FormulaChoice,
                          )
                        }
                        style={{
                          width: '100%',
                          padding: '6px',
                          fontSize: '12px',
                        }}
                      >
                        <option value="auto">
                          تلقائي (Katch عند توفر الدهون وإلا Mifflin)
                        </option>
                        <option value="mifflin">
                          Mifflin-St Jeor (معيار الوزن والطول)
                        </option>
                        <option value="katch">
                          Katch-McArdle (معيار الكتلة اللادهنية LBM)
                        </option>
                      </select>
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '11.5px',
                          marginBottom: '3px',
                        }}
                      >
                        معامل بروتين يدوي (1.4 - 2.4 جم/كجم):
                      </label>
                      <input
                        type="number"
                        min="1.4"
                        max="2.4"
                        step="0.1"
                        className="field-input"
                        value={editProteinOverride ?? ''}
                        placeholder="تلقائي حسب الهدف والكتلة"
                        onChange={(e) =>
                          setEditProteinOverride(
                            e.target.value ? Number(e.target.value) : undefined,
                          )
                        }
                        style={{
                          width: '100%',
                          padding: '6px',
                          fontSize: '12px',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  type="button"
                  className="ghost"
                  onClick={() => setIsProfileModalOpen(false)}
                >
                  إلغاء
                </button>
                <button type="submit" className="button-primary">
                  ✓ تطبيق وحساب السعرات العلمية فوراً
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Calibration Modal */}
      {isCalibrationModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsCalibrationModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '520px',
              borderRadius: '16px',
              padding: '20px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
                borderBottom: '1px solid var(--line)',
                paddingBottom: '10px',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                  ⚖️ تسجيل الوزن ومعايرة السعرات (Calibration Loop)
                </h3>
                <span style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                  تعديل السعرات النظرية بناءً على ميل تغير وزنك الفعلي
                </span>
              </div>
              <button
                type="button"
                className="ghost-secondary tiny"
                onClick={() => setIsCalibrationModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <p
              className="muted"
              style={{ fontSize: '12px', marginTop: 0, lineHeight: '1.6' }}
            >
              المعادلات النظرية تعطي دقة ±10%. حلقة المعايرة الرياضية تراقب وزنك
              خلال 14-21 يوماً لحساب الحرق المشاهد الحقيقي وضبط سعراتك بدقة
              تامة.
            </p>

            {/* Quick Weight Form */}
            <div
              style={{
                background: 'var(--card-subtle)',
                padding: '12px',
                borderRadius: '10px',
                marginBottom: '16px',
                border: '1px solid var(--line)',
              }}
            >
              <h4 style={{ margin: '0 0 8px 0', fontSize: '13px' }}>
                ➕ تسجيل وزن سريع لليوم:
              </h4>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-end',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: '110px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      color: 'var(--muted)',
                    }}
                  >
                    الوزن (كجم):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="field-input"
                    value={quickWeight}
                    onChange={(e) => setQuickWeight(e.target.value)}
                    placeholder="مثال: 72.5"
                    style={{ width: '100%', padding: '6px' }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: '110px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      color: 'var(--muted)',
                    }}
                  >
                    التاريخ:
                  </label>
                  <input
                    type="date"
                    className="field-input"
                    value={quickWeightDate}
                    onChange={(e) => setQuickWeightDate(e.target.value)}
                    style={{ width: '100%', padding: '6px' }}
                  />
                </div>
                <button
                  type="button"
                  className="button-primary small"
                  onClick={handleQuickWeightSave}
                >
                  حفظ الوزن
                </button>
              </div>
              {calibrationFeedback && (
                <p
                  style={{
                    margin: '6px 0 0',
                    fontSize: '12px',
                    color: 'var(--accent)',
                    fontWeight: 700,
                  }}
                >
                  {calibrationFeedback}
                </p>
              )}
            </div>

            {/* Calibration Status Box */}
            <div
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid var(--line)',
                background: 'var(--card-bg)',
              }}
            >
              <h4 style={{ margin: '0 0 8px 0', fontSize: '13px' }}>
                📊 حالة حلقة المعايرة:
              </h4>
              {calibrationData && calibrationData.canCalibrate ? (
                <div>
                  <div
                    style={{
                      color: '#16a34a',
                      fontSize: '12px',
                      fontWeight: 700,
                      marginBottom: '6px',
                    }}
                  >
                    ✓ تتوفر بيانات كافية ({calibrationData.logsCount} أوزان على
                    مدى {calibrationData.daysSpan} يوماً).
                  </div>
                  <ul
                    style={{
                      margin: 0,
                      paddingRight: '18px',
                      fontSize: '12px',
                      lineHeight: '1.7',
                    }}
                  >
                    <li>
                      <strong>معدل تغير الوزن الفعلي (Slope):</strong>{' '}
                      {calibrationData.slopeKgPerWeek} كجم/أسبوع
                    </li>
                    <li>
                      <strong>الحرق اليومي المشاهد (TDEE Obs):</strong>{' '}
                      {calibrationData.tdeeObserved} كالوِري
                    </li>
                    <li>
                      <strong>الحرق المعاير الجديد (TDEE New):</strong>{' '}
                      {calibrationData.tdeeNew} كالوِري
                    </li>
                    <li>
                      <strong>الهدف اليومي المعاير:</strong>{' '}
                      {calibrationData.newTargetCalories} كالوِري (
                      {calibrationData.changeKcal &&
                      calibrationData.changeKcal > 0
                        ? `+${calibrationData.changeKcal}`
                        : calibrationData.changeKcal}{' '}
                      كالوِري)
                    </li>
                  </ul>
                  <p
                    style={{
                      fontSize: '11px',
                      color: 'var(--muted)',
                      marginTop: '8px',
                    }}
                  >
                    {calibrationData.reasonAr}
                  </p>
                  <div style={{ marginTop: '12px' }}>
                    <button
                      type="button"
                      className="button-primary small"
                      onClick={() =>
                        handleApplyCalibration(
                          calibrationData.newTargetCalories!,
                        )
                      }
                    >
                      ✓ اعتماد وتطبيق الهدف المعاير (
                      {calibrationData.newTargetCalories} كالوِري)
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--muted)',
                    lineHeight: '1.6',
                  }}
                >
                  <p style={{ margin: 0 }}>
                    ℹ️{' '}
                    {calibrationData
                      ? calibrationData.reasonAr
                      : 'يتطلب حساب المعايرة تسجيل 8 أوزان على الأقل خلال أسبوعين إلى 3 أسابيع.'}
                  </p>
                  <p style={{ margin: '6px 0 0', fontSize: '11px' }}>
                    الأوزان المسجلة حالياً: {bodyLog ? bodyLog.length : 0}{' '}
                    تسجيلات.
                  </p>
                </div>
              )}
            </div>

            <div
              className="modal-footer actions-row"
              style={{ marginTop: '14px' }}
            >
              <button
                type="button"
                className="ghost"
                onClick={() => setIsCalibrationModalOpen(false)}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
