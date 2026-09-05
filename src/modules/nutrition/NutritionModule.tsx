import { useEffect, useMemo, useState } from 'react'
import { assetUrl } from '../../utils/assetUrl.ts'
import type { UserProfile } from '../onboarding/types.ts'
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

export function NutritionModule({ profile }: NutritionModuleProps) {
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
    if (!profile) return EGYPTIAN_MEALS

    // Supermarket filter
    if (selectedCategory === 'supermarket') {
      return EGYPTIAN_MEALS.filter((m) => m.isBudgetSupermarket)
    }

    // Pantry ingredient filter
    if (selectedCategory === 'pantry') {
      const allSelected = [
        ...selectedPantryIngredients,
        ...(pantrySearchInput.trim() ? [pantrySearchInput.trim()] : []),
      ]

      if (allSelected.length === 0) {
        return EGYPTIAN_MEALS
      }

      return EGYPTIAN_MEALS.filter((m) => {
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

    return EGYPTIAN_MEALS.filter((m) => {
      const matchCat =
        m.category === selectedCategory ||
        (selectedCategory === 'dinner' && m.category === 'snack')
      const matchGoal = m.suitableGoals.includes(profile.primaryGoal)
      return matchCat && matchGoal
    })
  }, [profile, selectedCategory, selectedPantryIngredients, pantrySearchInput])

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

  return (
    <div className="nutrition-module" data-testid="nutrition-module">
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
          <h3 className="maganis-coach-title">
            🍎 مطبخ د. مجانص — كل مصري واعمل فورمة!
          </h3>
          <div className="maganis-speech-bubble">
            <strong>نسف السعرات بالشوكة والسكينة!</strong> د. مجانص حسبلك
            الكالوريز بالجرام، كُل فول وكشري وفراخ وسوبرماركت أو صمم وجبتك
            الخاصة بدقة، بس اضغط "أكلت الوجبة" وشوف شريطك بيتملي عشان فورمتك
            تكون حديد!
          </div>
        </div>
      </div>

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
                      style={{ display: 'flex', gap: '8px', marginTop: '12px' }}
                    >
                      <button
                        type="button"
                        className="button-primary tiny"
                        style={{
                          flex: 1,
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
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

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

            <div className="modal-footer actions-row">
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
