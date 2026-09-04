import { useMemo, useState } from 'react'
import { assetUrl } from '../../utils/assetUrl.ts'
import type { UserProfile } from '../onboarding/types.ts'
import { calculateCalorieMacroTargets } from './calorieCalculator.ts'
import { EGYPTIAN_MEALS } from './egyptianMeals.ts'
import type { EgyptianMeal, MealCategory } from './types.ts'

interface NutritionModuleProps {
  profile: UserProfile | null
}

const CATEGORY_LABELS: Record<MealCategory, string> = {
  breakfast: '🌅 الفطور المصري',
  lunch: '🍲 الغداء المصري',
  dinner: '🌙 العشاء المصري',
  snack: '🥗 خفايف وسناكس مصرية',
}

export function NutritionModule({ profile }: NutritionModuleProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<MealCategory>('lunch')
  const [activeMealDetail, setActiveMealDetail] = useState<EgyptianMeal | null>(
    null,
  )

  const targets = useMemo(() => {
    if (!profile) return null
    return calculateCalorieMacroTargets(profile)
  }, [profile])

  const filteredMeals = useMemo(() => {
    if (!profile) return EGYPTIAN_MEALS
    return EGYPTIAN_MEALS.filter((m) => {
      const matchCat =
        m.category === selectedCategory ||
        (selectedCategory === 'dinner' && m.category === 'snack')
      const matchGoal = m.suitableGoals.includes(profile.primaryGoal)
      return matchCat && matchGoal
    })
  }, [profile, selectedCategory])

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
            الكالوريز بالجرام، كُل فول وكشري وفراخ بلدية براحتك بس بحساب
            الماكروز، عشان نبني فورمة متخرّش المية!
          </div>
        </div>
      </div>

      {/* Header Summary */}
      <div className="card nutrition-hero-card">
        <div className="hero-header">
          <h2>🥗 قسم التغذية وحساب السعرات (المطبخ المصري)</h2>
          <span className="chip highlight">{targets.goalLabelAr}</span>
        </div>

        <div className="calorie-stats-grid">
          <div className="stat-card">
            <span className="stat-label">معدل الأيض الأساسي (BMR)</span>
            <span className="stat-value">{targets.bmr}</span>
            <span className="stat-unit">سعرة/يوم</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">احتياج النشاط (TDEE)</span>
            <span className="stat-value">{targets.tdee}</span>
            <span className="stat-unit">سعرة/يوم</span>
          </div>

          <div className="stat-card accent">
            <span className="stat-label">هدف السعرات اليومي</span>
            <span className="stat-value">{targets.targetCalories}</span>
            <span className="stat-unit">كالوِري</span>
          </div>

          <div className="stat-card water">
            <span className="stat-label">احتياج الماء اليومي</span>
            <span className="stat-value">{targets.waterLiters}</span>
            <span className="stat-unit">لتر 💧</span>
          </div>
        </div>

        {/* Macro Breakdown */}
        <div className="macros-breakdown-box">
          <h3>📊 توزيع الماكروز الدقيق (Macro Split)</h3>
          <div className="macros-bars-grid">
            <div className="macro-item protein">
              <div className="macro-info">
                <span>البروتين اليومي (هدف دقيق)</span>
                <strong>{targets.proteinGrams} جرام</strong>
              </div>
              <div className="macro-bar-track">
                <div
                  className="macro-bar-fill protein"
                  style={{ width: '100%' }}
                />
              </div>
              <span className="muted-small">
                حوالي {targets.proteinGrams * 4} سعرة (
                {Math.round(
                  ((targets.proteinGrams * 4) / targets.targetCalories) * 100,
                )}
                %)
              </span>
            </div>

            <div className="macro-item carbs">
              <div className="macro-info">
                <span>الكاربوهيدرات</span>
                <strong>{targets.carbsGrams} جرام</strong>
              </div>
              <div className="macro-bar-track">
                <div
                  className="macro-bar-fill carbs"
                  style={{ width: '100%' }}
                />
              </div>
              <span className="muted-small">
                حوالي {targets.carbsGrams * 4} سعرة (
                {Math.round(
                  ((targets.carbsGrams * 4) / targets.targetCalories) * 100,
                )}
                %)
              </span>
            </div>

            <div className="macro-item fats">
              <div className="macro-info">
                <span>الدهون الصحية</span>
                <strong>{targets.fatsGrams} جرام</strong>
              </div>
              <div className="macro-bar-track">
                <div
                  className="macro-bar-fill fats"
                  style={{ width: '100%' }}
                />
              </div>
              <span className="muted-small">
                حوالي {targets.fatsGrams * 9} سعرة (
                {Math.round(
                  ((targets.fatsGrams * 9) / targets.targetCalories) * 100,
                )}
                %)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Egyptian Cuisine Meal Generator */}
      <div className="card egyptian-meals-section">
        <div className="meals-section-header">
          <h2>🇪🇬 اقتراحات وجبات المطبخ المصري المتوازنة</h2>
          <p className="muted">
            وجبات مصرية أصيلة محسوبة البروتين والسعرات لملائمة هدفك الرياضي
            (تضخيم/تنشيف/مرونة).
          </p>
        </div>

        {/* Category Tabs */}
        <div className="chips-row meal-category-chips">
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
        </div>

        {/* Meals Cards List */}
        <div className="egyptian-meals-grid">
          {filteredMeals.map((meal) => (
            <div key={meal.id} className="egyptian-meal-card card">
              <div className="meal-card-header">
                <h3>{meal.nameAr}</h3>
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
                <span className="macro-pill fats">دهون: {meal.fatsGrams}ج</span>
              </div>

              <button
                type="button"
                className="button-primary tiny"
                style={{ marginTop: '12px', width: '100%' }}
                onClick={() => setActiveMealDetail(meal)}
              >
                📖 طريقة التحضير والنصيحة العلمية ↵
              </button>
            </div>
          ))}
        </div>
      </div>

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

              <div className="detail-section highlight-box">
                <h3>🍽️ الحصة المقترحة</h3>
                <p>
                  <strong>{activeMealDetail.portionAr}</strong>
                </p>
              </div>

              <div className="detail-section">
                <h3>🛒 المكونات المصرية المقادير</h3>
                <ul className="bullets-list">
                  {activeMealDetail.ingredientsAr.map((ing, idx) => (
                    <li key={idx}>{ing}</li>
                  ))}
                </ul>
              </div>

              {activeMealDetail.recipeStepsAr && (
                <div className="detail-section">
                  <h3>👨‍🍳 طريقة التحضير الصحية</h3>
                  <ol className="steps-list">
                    {activeMealDetail.recipeStepsAr.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {activeMealDetail.scientificTipAr && (
                <div className="detail-section source-box">
                  <h3>🔬 النصيحة الغذائية العلمية</h3>
                  <p>{activeMealDetail.scientificTipAr}</p>
                </div>
              )}
            </div>

            <div className="modal-footer actions-row">
              <button type="button" onClick={() => setActiveMealDetail(null)}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
