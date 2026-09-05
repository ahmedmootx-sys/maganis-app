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
import { EGYPTIAN_MEALS } from './egyptianMeals.ts'
import { calculateIngredientMacros, getFoodItemById } from './foodDatabase.ts'
import type {
  CustomMeal,
  DailyNutritionLog,
  EgyptianMeal,
  MealCategory,
} from './types.ts'

interface NutritionModuleProps {
  profile: UserProfile | null
  onUpdateProfile?: (profile: UserProfile) => void
}

const CATEGORY_LABELS: Record<MealCategory, string> = {
  breakfast: '🌅 الفطور المصري',
  lunch: '🍲 الغداء المصري',
  dinner: '🌙 العشاء المصري',
  snack: '🥗 خفايف وسناكس مصرية',
}

const PANTRY_STAPLES = [
  'بيض',
  'شوفان',
  'تونة',
  'جبنة قريش',
  'لبن',
  'فول',
  'أرز',
  'فراخ',
  'زبادي',
  'مكرونة',
  'بطاطس',
  'لحم مفروم',
  'عدس',
  'خيار',
  'طماطم',
  'عيش بلدي',
]

export function NutritionModule({
  profile,
  onUpdateProfile,
}: NutritionModuleProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    MealCategory | 'supermarket' | 'pantry' | 'custom'
  >('lunch')
  const [activeMealDetail, setActiveMealDetail] = useState<EgyptianMeal | null>(
    null,
  )
  const [selectedPantryIngredients, setSelectedPantryIngredients] = useState<
    string[]
  >([])
  const [pantrySearchInput, setPantrySearchInput] = useState('')
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
  const [editingCustomMeal, setEditingCustomMeal] = useState<CustomMeal | null>(
    null,
  )
  const [showMacroGuide, setShowMacroGuide] = useState(false)

  // Deleted Egyptian Meals State
  const [deletedEgyptianMealIds, setDeletedEgyptianMealIds] = useState<
    string[]
  >(() => {
    try {
      const raw = localStorage.getItem('maganis:deleted_egyptian_meals')
      if (raw) return JSON.parse(raw) as string[]
    } catch {
      // ignore
    }
    return []
  })

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

  useEffect(() => {
    try {
      localStorage.setItem(
        'maganis:deleted_egyptian_meals',
        JSON.stringify(deletedEgyptianMealIds),
      )
    } catch {
      // ignore
    }
  }, [deletedEgyptianMealIds])

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

  function handleLogMeal(meal: EgyptianMeal) {
    setDailyLog((prev) => {
      const newCalories = Math.round(prev.consumedCalories + meal.calories)
      const newProtein = Math.round(prev.consumedProtein + meal.proteinGrams)
      const newCarbs = Math.round(prev.consumedCarbs + meal.carbsGrams)
      const newFats = Math.round(prev.consumedFats + meal.fatsGrams)

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
            protein: meal.proteinGrams,
            carbs: meal.carbsGrams,
            fats: meal.fatsGrams,
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
    setDailyLog((prev) => {
      const newCalories = Math.round(prev.consumedCalories + meal.calories)
      const newProtein = Math.round(prev.consumedProtein + meal.proteinGrams)
      const newCarbs = Math.round(prev.consumedCarbs + meal.carbsGrams)
      const newFats = Math.round(prev.consumedFats + meal.fatsGrams)

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
            protein: meal.proteinGrams,
            carbs: meal.carbsGrams,
            fats: meal.fatsGrams,
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
    if (window.confirm('هل أنت متأكد من حذف هذه الوجبة المخصصة؟')) {
      setCustomMeals((prev) => prev.filter((m) => m.id !== id))
    }
  }

  function handleDeleteEgyptianMeal(mealId: string) {
    if (
      window.confirm(
        'هل تريد حذف هذه الوصفة من قائمة الوجبات المعروضة؟ (يمكنك استعادتها لاحقاً في أي وقت)',
      )
    ) {
      setDeletedEgyptianMealIds((prev) =>
        prev.includes(mealId) ? prev : [...prev, mealId],
      )
      if (activeMealDetail?.id === mealId) {
        setActiveMealDetail(null)
      }
    }
  }

  function handleRestoreDeletedEgyptianMeals() {
    if (window.confirm('هل تريد استعادة جميع الوصفات المصرية المحذوفة؟')) {
      setDeletedEgyptianMealIds([])
    }
  }

  function handleEditEgyptianMeal(meal: EgyptianMeal) {
    setEditingCustomMeal({
      id: `custom_edit_${meal.id}_${Date.now()}`,
      nameAr: `${meal.nameAr} (معدلة)`,
      category: meal.category,
      calories: meal.calories,
      proteinGrams: meal.proteinGrams,
      carbsGrams: meal.carbsGrams,
      fatsGrams: meal.fatsGrams,
      notesAr: `وصفة معدلة من: ${meal.nameAr}. المقدار الأصلي: ${meal.portionAr}`,
      isCustom: true,
      createdAt: new Date().toISOString(),
    })
    setIsCustomMealModalOpen(true)
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

  function togglePantryIngredient(item: string) {
    setSelectedPantryIngredients((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    )
  }

  const filteredMeals = useMemo(() => {
    if (!profile) return []

    // Filter out deleted recipes
    const availableEgyptianMeals = EGYPTIAN_MEALS.filter(
      (m) => !deletedEgyptianMealIds.includes(m.id),
    )

    // Supermarket filter
    if (selectedCategory === 'supermarket') {
      return availableEgyptianMeals.filter((m) => m.isBudgetSupermarket)
    }

    // Pantry ingredient filter
    if (selectedCategory === 'pantry') {
      const allSelected = [
        ...selectedPantryIngredients,
        ...(pantrySearchInput.trim() ? [pantrySearchInput.trim()] : []),
      ]

      if (allSelected.length === 0) {
        return availableEgyptianMeals
      }

      return availableEgyptianMeals.filter((m) => {
        const textToSearch = (
          m.nameAr +
          ' ' +
          m.descriptionAr +
          ' ' +
          m.ingredientsAr.join(' ')
        ).toLowerCase()

        return allSelected.some((ing) =>
          textToSearch.includes(ing.toLowerCase()),
        )
      })
    }

    // Standard category filter
    if (selectedCategory === 'custom') {
      return []
    }

    return availableEgyptianMeals.filter((m) => {
      const matchCat =
        m.category === selectedCategory ||
        (selectedCategory === 'dinner' && m.category === 'snack')
      const matchGoal = m.suitableGoals.includes(profile.primaryGoal)
      return matchCat && matchGoal
    })
  }, [
    profile,
    selectedCategory,
    selectedPantryIngredients,
    pantrySearchInput,
    deletedEgyptianMealIds,
  ])

  if (!profile || !targets) {
    return (
      <div className="card">
        <p className="muted">
          يرجى إكمال الملف الشخصي أولاً لحساب السعرات والماكروز والوجبات
          المصرية.
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
              🍎 مطبخ د. مجانص — كل مصري واعمل فورمة!
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
                : '💡 كيف أحسب الماكروز؟ (دليل مبسط)'}
            </button>
          </div>
          <div className="maganis-speech-bubble" style={{ marginTop: '8px' }}>
            <strong>نسف السعرات بالشوكة والسكينة!</strong> د. مجانص حسبلك
            الكالوريز بالجرام، كُل فول وكشري وفراخ وسوبرماركت أو صمم وجبتك
            الخاصة بدقة، بس اضغط "أكلت الوجبة" وشوف شريطك بيتملي عشان فورمتك
            تكون حديد!
          </div>
        </div>
      </div>

      {/* Body Profile & Daily Calorie Science Card */}
      <div
        className="card highlight-box"
        style={{
          marginBottom: '16px',
          background: '#ffffff',
          border: '1.5px solid #cbd5e1',
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
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              🎯 ملف جسمك واحتياجك اليومي العلمي
            </h4>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              معادلة ميفلين سانت جيور (Mifflin-St Jeor) الأدق علمياً لحساب BMR و
              TDEE
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
            background: '#f8fafc',
            padding: '10px 12px',
            borderRadius: '8px',
            marginBottom: '10px',
            border: '1px solid #e2e8f0',
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
            color: '#334155',
          }}
        >
          <div
            style={{
              background: '#f1f5f9',
              padding: '8px 10px',
              borderRadius: '6px',
            }}
          >
            <strong>الحرق الأساسي (BMR):</strong>
            <div>{targets.bmr} كالوِري (أثناء الراحة التامة)</div>
          </div>
          <div
            style={{
              background: '#f1f5f9',
              padding: '8px 10px',
              borderRadius: '6px',
            }}
          >
            <strong>استهلاكك بالنشاط (TDEE):</strong>
            <div>{targets.tdee} كالوِري (مع التمرين وحركتك)</div>
          </div>
          <div
            style={{
              background: '#fef3c7',
              color: '#92400e',
              padding: '8px 10px',
              borderRadius: '6px',
              fontWeight: 700,
            }}
          >
            <strong>الهدف النهائي:</strong>
            <div>
              {targets.targetCalories} كالوِري ({targets.goalLabelAr})
            </div>
          </div>
          <div
            style={{
              background: '#eff6ff',
              color: '#1e40af',
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

      {/* Interactive Macro Educational Guide */}
      {showMacroGuide && (
        <div
          className="card highlight-box"
          style={{
            marginBottom: '16px',
            background: '#ffffff',
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
              📖 دليل د. مجانص العلمي: ما هي الماكروز وكيف تتابعها؟
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
              marginBottom: '14px',
            }}
          >
            {/* Protein Box */}
            <div
              style={{
                background: '#eff6ff',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #bfdbfe',
              }}
            >
              <h4 style={{ margin: '0 0 6px', color: '#1d4ed8' }}>
                🥩 1. البروتين (Protein)
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: '12px',
                  color: '#1e40af',
                  lineHeight: '1.5',
                }}
              >
                • <strong>وظيفته:</strong> البناء العضلي وترميم الألياف بعد
                التمرين.
                <br />• <strong>قاعدته:</strong> 1 جم بروتين = 4 سعرات حرارية.
                <br />• <strong>أهم مصادره:</strong> صدور الفراخ، البيض، الجبنة
                القريش، التونة، اللحم، الواي بروتين.
              </p>
            </div>

            {/* Carbs Box */}
            <div
              style={{
                background: '#fefce8',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #fef08a',
              }}
            >
              <h4 style={{ margin: '0 0 6px', color: '#a16207' }}>
                🍞 2. الكاربوهيدرات (Carbs)
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: '12px',
                  color: '#854d0e',
                  lineHeight: '1.5',
                }}
              >
                • <strong>وظيفته:</strong> الوقود الأساسي لتمارين الأوزان وطاقة
                الجسم.
                <br />• <strong>قاعدته:</strong> 1 جم كارب = 4 سعرات حرارية.
                <br />• <strong>أهم مصادره:</strong> الأرز، الشوفان، البطاطس،
                المكرونة، العيش البلدي، الفاكهة.
              </p>
            </div>

            {/* Fats Box */}
            <div
              style={{
                background: '#fef2f2',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #fecaca',
              }}
            >
              <h4 style={{ margin: '0 0 6px', color: '#b91c1c' }}>
                🥑 3. الدهون الصحية (Fats)
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: '12px',
                  color: '#991b1b',
                  lineHeight: '1.5',
                }}
              >
                • <strong>وظيفتها:</strong> إنتاج الهرمونات وصحة المفاصل
                والدماغ.
                <br />• <strong>قاعدتها:</strong> 1 جم دهون = 9 سعرات حرارية.
                <br />• <strong>أهم مصادرها:</strong> زيت الزيتون، المكسرات،
                صفار البيض، زبدة الفول السوداني.
              </p>
            </div>
          </div>

          <div
            style={{
              background: '#f8fafc',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '12.5px',
              color: '#334155',
              lineHeight: '1.6',
            }}
          >
            <strong>⚡ كيف تستخدم أدوات التغذية في 3 خطوات؟</strong>
            <ol style={{ margin: '6px 0 0', paddingRight: '20px' }}>
              <li>
                <strong>اختر أو صمم وجبتك:</strong> تصفح الوجبات المصرية
                المقترحة، أو اضغط على <strong>"✨ + صمّم وجبة خاصة"</strong>{' '}
                لتحديد مكوناتك بالجرامات أو تعديل أي وصفة مصرية.
              </li>
              <li>
                <strong>سجل بضغطة زر:</strong> اضغط على{' '}
                <strong>"🍽️ أكلت الوجبة"</strong> في أي وجبة تأكلها.
              </li>
              <li>
                <strong>راقب عدادك اليومي:</strong> شاهد شريط السعرات والماكروز
                أعلاه وهو يمتلئ نحو هدفك اليومي!
              </li>
            </ol>
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
              background: '#e2e8f0',
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
              background: '#ffffff',
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
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
                background: '#f1f5f9',
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
              background: '#ffffff',
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
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
                background: '#f1f5f9',
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
              background: '#ffffff',
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
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
                background: '#f1f5f9',
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
            style={{ marginTop: '10px', fontSize: '12px', color: '#64748b' }}
          >
            الوجبات المسجلة اليوم:{' '}
            {dailyLog.loggedMeals.map((m) => m.nameAr).join(' • ')}
          </div>
        )}
      </div>

      {/* Egyptian Cuisine & Custom Meals Section */}
      <div className="card egyptian-meals-section">
        <div
          className="meals-section-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div>
            <h2>🇪🇬 الوجبات ووصفات المطبخ والمكونات المخصصة</h2>
            <p className="muted" style={{ margin: 0 }}>
              اختر وجبتك أو صمّم وجبتك الخاصة بمكوناتها وغراماتها وسجلها بضغطة
              زر.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {deletedEgyptianMealIds.length > 0 && (
              <button
                type="button"
                className="chip-btn"
                onClick={handleRestoreDeletedEgyptianMeals}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '8px',
                }}
                title="استعادة جميع الوصفات المحذوفة"
              >
                🔄 استعادة الوصفات المحذوفة ({deletedEgyptianMealIds.length})
              </button>
            )}
            <button
              type="button"
              className="button-primary small"
              onClick={() => {
                setEditingCustomMeal(null)
                setIsCustomMealModalOpen(true)
              }}
            >
              ✨ + صمّم وجبة خاصة جديدة
            </button>
          </div>
        </div>

        {/* Category & Feature Tabs */}
        <div
          className="chips-row meal-category-chips"
          style={{ flexWrap: 'wrap', gap: '6px', marginTop: '14px' }}
        >
          {/* Custom Meals Tab */}
          <button
            type="button"
            className={
              'chip-btn' + (selectedCategory === 'custom' ? ' selected' : '')
            }
            onClick={() => setSelectedCategory('custom')}
            style={{
              background:
                selectedCategory === 'custom' ? 'var(--primary)' : '#ede9fe',
              color: selectedCategory === 'custom' ? '#fff' : '#6d28d9',
              fontWeight: 700,
            }}
          >
            ✨ وجباتي الخاصة ({customMeals.length})
          </button>

          {(Object.keys(CATEGORY_LABELS) as MealCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              className={
                'chip-btn' + (selectedCategory === cat ? ' selected' : '')
              }
              onClick={() => setSelectedCategory(cat)}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}

          {/* Supermarket Ready Meals Tab */}
          <button
            type="button"
            className={
              'chip-btn' +
              (selectedCategory === 'supermarket' ? ' selected' : '')
            }
            onClick={() => setSelectedCategory('supermarket')}
            style={{
              background:
                selectedCategory === 'supermarket'
                  ? 'var(--primary)'
                  : '#fef3c7',
              color: selectedCategory === 'supermarket' ? '#fff' : '#92400e',
              fontWeight: 700,
            }}
          >
            🛒 سوبرماركت اقتصادي جاهز
          </button>

          {/* Pantry Search Tab */}
          <button
            type="button"
            className={
              'chip-btn' + (selectedCategory === 'pantry' ? ' selected' : '')
            }
            onClick={() => setSelectedCategory('pantry')}
            style={{
              background:
                selectedCategory === 'pantry' ? 'var(--primary)' : '#dcfce7',
              color: selectedCategory === 'pantry' ? '#fff' : '#166534',
              fontWeight: 700,
            }}
          >
            🍳 المتاح في البيت (اقترح لي)
          </button>
        </div>

        {/* Pantry Interactive Matcher Tool */}
        {selectedCategory === 'pantry' && (
          <div
            className="card"
            style={{
              background: '#f8fafc',
              border: '1.5px dashed #cbd5e1',
              padding: '14px',
              margin: '14px 0',
            }}
          >
            <h4 style={{ margin: '0 0 8px', fontSize: '15px' }}>
              🔍 حدد ما هو متوفر لديك في المطبخ وسيقترح عليك التطبيق الوصفات
              المناسبة:
            </h4>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                marginBottom: '10px',
              }}
            >
              {PANTRY_STAPLES.map((staple) => {
                const isSelected = selectedPantryIngredients.includes(staple)
                return (
                  <button
                    key={staple}
                    type="button"
                    onClick={() => togglePantryIngredient(staple)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: isSelected
                        ? '1.5px solid var(--primary)'
                        : '1px solid #cbd5e1',
                      background: isSelected ? 'var(--primary)' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#334155',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isSelected ? `✓ ${staple}` : `+ ${staple}`}
                  </button>
                )
              })}
            </div>
            <input
              type="text"
              placeholder="أو اكتب مكوناً آخر متاح عندك في البيت (مثل: جبن، تونة، عدس...)"
              value={pantrySearchInput}
              onChange={(e) => setPantrySearchInput(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '13px',
              }}
            />
          </div>
        )}

        {/* Custom Meals Grid */}
        {selectedCategory === 'custom' && (
          <div className="egyptian-meals-grid" style={{ marginTop: '16px' }}>
            {customMeals.length === 0 ? (
              <div
                className="card"
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '32px',
                  background: '#f8fafc',
                  border: '1.5px dashed #cbd5e1',
                }}
              >
                <h3 style={{ margin: '0 0 8px' }}>لم تضف وجبات خاصة بعد! 🥗</h3>
                <p className="muted" style={{ margin: '0 0 16px' }}>
                  يمكنك تصميم وجبتك الخاصة بتحديد جرامات المكونات (شوفان، فراخ،
                  أرز، بيض، مكسرات...) أو إدخال السعرات والماكروز يدوياً.
                </p>
                <button
                  type="button"
                  className="button-primary"
                  onClick={() => {
                    setEditingCustomMeal(null)
                    setIsCustomMealModalOpen(true)
                  }}
                >
                  ✨ أضف أول وجبة مخصصة الآن
                </button>
              </div>
            ) : (
              customMeals.map((meal) => {
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
                            background: '#ede9fe',
                            color: '#6d28d9',
                            fontSize: '11px',
                            padding: '2px 6px',
                          }}
                        >
                          ✨ وجبة خاصة •{' '}
                          {CATEGORY_LABELS[meal.category] || meal.category}
                        </span>
                      </div>
                      <span className="badge-cal">{meal.calories} كالوِري</span>
                    </div>

                    {meal.notesAr && (
                      <p className="meal-desc">{meal.notesAr}</p>
                    )}

                    {meal.ingredients && meal.ingredients.length > 0 && (
                      <div
                        style={{
                          margin: '8px 0',
                          padding: '8px',
                          background: '#f8fafc',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      >
                        <strong>المكونات:</strong>
                        <ul
                          style={{
                            margin: '4px 0 0',
                            paddingRight: '18px',
                            color: '#475569',
                          }}
                        >
                          {meal.ingredients.map((ing, i) => {
                            const food = getFoodItemById(ing.foodItemId)
                            if (!food) return null
                            const m = calculateIngredientMacros(food, ing.grams)
                            return (
                              <li key={i}>
                                {ing.grams} جم {food.nameAr} ({m.calories}{' '}
                                كالوِري • {m.protein}ج بروتين)
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
                        title="تعديل الوجبة والمكونات"
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
        )}

        {/* Egyptian Meals Cards List */}
        {selectedCategory !== 'custom' && (
          <div className="egyptian-meals-grid" style={{ marginTop: '16px' }}>
            {filteredMeals.length === 0 ? (
              <div
                className="card"
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '24px',
                }}
              >
                <p className="muted">
                  لم نجد وجبات مطابقة للمكونات المختارة. جرب اختيار مكونات أخرى!
                </p>
              </div>
            ) : (
              filteredMeals.map((meal) => {
                const isJustLogged = recentlyLoggedId === meal.id
                return (
                  <div key={meal.id} className="egyptian-meal-card card">
                    <div className="meal-card-header">
                      <div>
                        <h3 style={{ margin: '0 0 4px', fontSize: '15px' }}>
                          {meal.nameAr}
                        </h3>
                        {meal.isBudgetSupermarket && (
                          <span
                            className="chip"
                            style={{
                              background: '#fef3c7',
                              color: '#92400e',
                              fontSize: '11px',
                              padding: '2px 6px',
                            }}
                          >
                            ⚡ سريع من السوبرماركت
                          </span>
                        )}
                      </div>
                      <span className="badge-cal">{meal.calories} كالوِري</span>
                    </div>

                    <p className="meal-desc">{meal.descriptionAr}</p>

                    <div className="meal-portion-box">
                      <strong>الحصة المحسوبة:</strong> {meal.portionAr}
                    </div>

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
                      style={{
                        display: 'flex',
                        gap: '6px',
                        marginTop: '12px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <button
                        type="button"
                        className="button-primary tiny"
                        style={{
                          flex: 2,
                          background: isJustLogged ? '#22c55e' : undefined,
                          borderColor: isJustLogged ? '#22c55e' : undefined,
                        }}
                        onClick={() => handleLogMeal(meal)}
                      >
                        {isJustLogged
                          ? '✓ تم تسجيل الوجبة!'
                          : '🍽️ أكلت الوجبة (+ضيف للماكروز)'}
                      </button>
                      <button
                        type="button"
                        className="ghost tiny"
                        onClick={() => setActiveMealDetail(meal)}
                        title="طريقة التحضير"
                      >
                        📖 الوصفة
                      </button>
                      <button
                        type="button"
                        className="ghost tiny"
                        onClick={() => handleEditEgyptianMeal(meal)}
                        title="تعديل مقادير هذه الوجبة وحساب سعراتها بدقة"
                      >
                        ✏️ تعديل
                      </button>
                      <button
                        type="button"
                        className="ghost-danger tiny"
                        onClick={() => handleDeleteEgyptianMeal(meal.id)}
                        title="حذف هذه الوصفة من القائمة"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Quick Body Profile & Target Editor Modal */}
      {isProfileModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsProfileModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
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
              background: '#ffffff',
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
                borderBottom: '1px solid #e2e8f0',
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

      {/* Custom Meal Creator/Editor Modal */}
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

      {/* Meal Recipe & Tip Modal */}
      {activeMealDetail && (
        <div
          className="modal-backdrop"
          onClick={() => setActiveMealDetail(null)}
        >
          <div
            className="modal-content card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>🇪🇬 {activeMealDetail.nameAr}</h2>
              <button
                type="button"
                className="close-btn"
                onClick={() => setActiveMealDetail(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="chips-row" style={{ marginBottom: '14px' }}>
                <span className="chip highlight">
                  {activeMealDetail.calories} سعرة حرارية
                </span>
                <span className="chip protein">
                  بروتين: {activeMealDetail.proteinGrams}ج
                </span>
                <span className="chip carbs">
                  كارب: {activeMealDetail.carbsGrams}ج
                </span>
                <span className="chip fats">
                  دهون: {activeMealDetail.fatsGrams}ج
                </span>
              </div>

              <div className="recipe-section">
                <h3>🛒 المكونات والمقادير:</h3>
                <ul>
                  {activeMealDetail.ingredientsAr.map((ing, idx) => (
                    <li key={idx}>{ing}</li>
                  ))}
                </ul>
              </div>

              {activeMealDetail.recipeStepsAr && (
                <div className="recipe-section">
                  <h3>🍳 طريقة التحضير والإعداد:</h3>
                  <ol>
                    {activeMealDetail.recipeStepsAr.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {activeMealDetail.scientificTipAr && (
                <div className="scientific-tip-card card highlight-box">
                  <h4>💡 نصيحة د. مجانص العلمية:</h4>
                  <p>{activeMealDetail.scientificTipAr}</p>
                </div>
              )}
            </div>

            <div
              className="modal-footer actions-row"
              style={{ flexWrap: 'wrap', gap: '8px' }}
            >
              <button
                type="button"
                className="button-primary"
                onClick={() => {
                  handleLogMeal(activeMealDetail)
                  setActiveMealDetail(null)
                }}
              >
                🍽️ أكلت هذه الوجبة (سجلها في اليوم)
              </button>
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  const toEdit = activeMealDetail
                  setActiveMealDetail(null)
                  handleEditEgyptianMeal(toEdit)
                }}
              >
                ✏️ تعديل المقادير والماكروز
              </button>
              <button
                type="button"
                className="ghost-danger"
                onClick={() => {
                  handleDeleteEgyptianMeal(activeMealDetail.id)
                }}
              >
                🗑️ حذف من القائمة
              </button>
              <button
                type="button"
                className="ghost"
                onClick={() => setActiveMealDetail(null)}
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
