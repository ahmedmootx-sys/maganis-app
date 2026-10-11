import { useEffect, useMemo, useState } from 'react'
import { assetUrl } from '../../utils/assetUrl.ts'
import type {
  ActivityLevel,
  Goal,
  Sex,
  UserProfile,
} from '../onboarding/types.ts'
import { ACTIVITY_LEVELS, GOALS } from '../onboarding/types.ts'
import { calculateCalorieMacroTargets } from './calorieCalculator.ts'
import { CustomMealModal } from './CustomMealModal.tsx'
import { calculateIngredientMacros, getFoodItemById } from './foodDatabase.ts'
import { QuickManualMealModal } from './QuickManualMealModal.tsx'
import type { CustomMeal, DailyNutritionLog, MealCategory } from './types.ts'

interface NutritionModuleProps {
  profile: UserProfile | null
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
  const [editGoal, setEditGoal] = useState<Goal>(
    profile?.primaryGoal ?? 'hypertrophy',
  )

  useEffect(() => {
    if (profile) {
      setEditWeight(profile.body.weightKg)
      setEditHeight(profile.body.heightCm)
      setEditAge(profile.body.age)
      setEditSex(profile.body.sex)
      setEditActivity(profile.body.activityLevel)
      setEditGoal(profile.primaryGoal)
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

  function handleSaveProfileChanges(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return

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
              معادلة ميفلين سانت جيور (Mifflin-St Jeor) الأدق علمياً
            </span>
          </div>

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
            <div>{targets.tdee} كالوِري (مع حركتك وتمرينك)</div>
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
            </div>
          </div>
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
              maxWidth: '480px',
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
                marginBottom: '16px',
                borderBottom: '1px solid var(--line)',
                paddingBottom: '10px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                ⚙️ تعديل بيانات وزني وهدفي واحتياجي
              </h3>
              <button
                type="button"
                className="ghost-secondary tiny"
                onClick={() => setIsProfileModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfileChanges}>
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
                      fontSize: '12.5px',
                      fontWeight: 700,
                      marginBottom: '4px',
                    }}
                  >
                    ⚖️ الوزن (كجم):
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="300"
                    step="0.5"
                    className="field-input"
                    value={editWeight}
                    onChange={(e) => setEditWeight(Number(e.target.value))}
                    required
                    style={{ width: '100%', padding: '8px', fontWeight: 700 }}
                  />
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
                    📏 الطول (سم):
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    className="field-input"
                    value={editHeight}
                    onChange={(e) => setEditHeight(Number(e.target.value))}
                    required
                    style={{ width: '100%', padding: '8px', fontWeight: 700 }}
                  />
                </div>
              </div>

              {/* Age & Sex */}
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
                      fontSize: '12.5px',
                      fontWeight: 700,
                      marginBottom: '4px',
                    }}
                  >
                    🎂 العمر (بالسنوات):
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
                      fontSize: '12.5px',
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
              </div>

              {/* Activity Level */}
              <div style={{ marginBottom: '12px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    marginBottom: '4px',
                  }}
                >
                  ⚡ مستوى النشاط البدني:
                </label>
                <select
                  className="field-input"
                  value={editActivity}
                  onChange={(e) =>
                    setEditActivity(e.target.value as ActivityLevel)
                  }
                  style={{ width: '100%', padding: '8px' }}
                >
                  {ACTIVITY_LEVELS.map((act) => (
                    <option key={act.value} value={act.value}>
                      {act.labelAr} (معامل {act.multiplier}x)
                    </option>
                  ))}
                </select>
              </div>

              {/* Primary Goal */}
              <div style={{ marginBottom: '16px' }}>
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
                  {GOALS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.labelAr}
                    </option>
                  ))}
                </select>
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
                  ✓ حفظ وتحديث السعرات فوراً
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
