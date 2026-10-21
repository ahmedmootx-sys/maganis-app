import { useState } from 'react'
import type { CustomMeal, MealCategory } from './types.ts'
import { Sheet } from '../../components/Sheet.tsx'
import { Button, Checkbox } from '../../ui'

export interface QuickManualMealModalProps {
  isOpen?: boolean
  onLogMealDirect?: (meal: {
    id: string
    nameAr: string
    calories: number
    protein: number
    carbs: number
    fats: number
  }) => void
  onLogDirect?: (meal: {
    id: string
    nameAr: string
    calories: number
    protein: number
    carbs: number
    fats: number
  }) => void
  onSaveToCustomMeals?: (meal: CustomMeal) => void
  onSaveMeal?: (meal: CustomMeal) => void
  onClose: () => void
}

const CATEGORIES: { key: MealCategory; label: string }[] = [
  { key: 'breakfast', label: 'فطور' },
  { key: 'lunch', label: 'غداء' },
  { key: 'dinner', label: 'عشاء' },
  { key: 'snack', label: 'سناك' },
]

export function QuickManualMealModal({
  isOpen = true,
  onLogMealDirect,
  onLogDirect,
  onSaveToCustomMeals,
  onSaveMeal,
  onClose,
}: QuickManualMealModalProps) {
  const [nameAr, setNameAr] = useState('')
  const [protein, setProtein] = useState<string>('')
  const [carbs, setCarbs] = useState<string>('')
  const [fats, setFats] = useState<string>('')
  const [manualCalories, setManualCalories] = useState<string>('')
  const [isManualCalories, setIsManualCalories] = useState<boolean>(false)
  const [category, setCategory] = useState<MealCategory>('lunch')
  const [saveAsPermanent, setSaveAsPermanent] = useState(true)

  const pNum = parseFloat(protein) || 0
  const cNum = parseFloat(carbs) || 0
  const fNum = parseFloat(fats) || 0
  const derivedCalories = Math.round(pNum * 4 + cNum * 4 + fNum * 9)
  const activeCalories = isManualCalories
    ? parseFloat(manualCalories) || 0
    : derivedCalories

  const caloriesDiff =
    derivedCalories > 0
      ? Math.abs(activeCalories - derivedCalories) / derivedCalories
      : 0
  const showCaloriesWarning =
    isManualCalories && derivedCalories > 0 && caloriesDiff > 0.1

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedName = nameAr.trim() || 'وجبة يدوية'
    const mealId = `manual-meal-${Date.now()}`

    const mealPayload = {
      id: mealId,
      nameAr: trimmedName,
      calories: Math.max(0, Math.round(activeCalories)),
      protein: Math.max(0, Math.round(pNum * 10) / 10),
      carbs: Math.max(0, Math.round(cNum * 10) / 10),
      fats: Math.max(0, Math.round(fNum * 10) / 10),
    }

    if (onLogMealDirect) {
      onLogMealDirect(mealPayload)
    } else if (onLogDirect) {
      onLogDirect(mealPayload)
    }

    const saveFn = onSaveToCustomMeals || onSaveMeal
    if (saveAsPermanent && saveFn) {
      saveFn({
        id: mealId,
        nameAr: trimmedName,
        category,
        calories: mealPayload.calories,
        proteinGrams: mealPayload.protein,
        carbsGrams: mealPayload.carbs,
        fatsGrams: mealPayload.fats,
        isCustom: true,
        createdAt: new Date().toISOString(),
      })
    }

    onClose()
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="تسجيل وجبة سريعة بالسعرات والماكروز"
    >
      <form
        noValidate
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '8px 0 24px',
        }}
      >
        {/* Meal Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            htmlFor="quick-meal-name"
            style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}
          >
            اسم الوجبة
          </label>
          <input
            id="quick-meal-name"
            type="text"
            className="field-input"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            placeholder="أدخل اسم الوجبة..."
            required
            style={{
              height: '48px',
              width: '100%',
              borderRadius: '10px',
              border: '1.5px solid var(--line)',
              padding: '0 14px',
              fontSize: '15px',
              background: 'var(--card-bg)',
              color: 'var(--ink)',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Meal Category */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}
          >
            تصنيف الوجبة
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '6px',
            }}
          >
            {CATEGORIES.map(({ key, label }) => {
              const isSelected = category === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  style={{
                    height: '42px',
                    fontSize: '13px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    border: isSelected
                      ? '2px solid var(--accent)'
                      : '1px solid var(--line)',
                    background: isSelected
                      ? 'var(--accent)'
                      : 'var(--card-subtle)',
                    color: isSelected ? '#ffffff' : 'var(--ink)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Macros & Calories Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            background: 'var(--card-subtle)',
            padding: '14px',
            borderRadius: '12px',
            border: '1px solid var(--line)',
          }}
        >
          {/* Calories */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <label
                htmlFor="quick-meal-cal"
                style={{ fontSize: '12.5px', fontWeight: 700 }}
              >
                السعرات (سعرة)
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsManualCalories((prev) => !prev)
                  if (!isManualCalories)
                    setManualCalories(String(derivedCalories || ''))
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {isManualCalories ? 'حساب تلقائي' : 'تعديل يدوي'}
              </button>
            </div>
            <input
              id="quick-meal-cal"
              type="text"
              inputMode="decimal"
              value={isManualCalories ? manualCalories : derivedCalories || ''}
              readOnly={!isManualCalories}
              placeholder="السعرات"
              onChange={(e) => setManualCalories(e.target.value)}
              style={{
                height: '48px',
                width: '100%',
                borderRadius: '8px',
                border: '1.5px solid var(--line)',
                padding: '0 12px',
                fontSize: '16px',
                fontWeight: 700,
                background: isManualCalories
                  ? 'var(--card-bg)'
                  : 'var(--card-subtle)',
                color: 'var(--ink)',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Protein */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor="quick-meal-pro"
              style={{
                fontSize: '12.5px',
                fontWeight: 700,
                color: 'var(--ink)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span
                className="macro-marker macro-marker--protein"
                aria-hidden="true"
              />
              البروتين (جم)
            </label>
            <input
              id="quick-meal-pro"
              type="text"
              inputMode="decimal"
              value={protein}
              placeholder="البروتين"
              onChange={(e) => setProtein(e.target.value)}
              style={{
                height: '48px',
                width: '100%',
                borderRadius: '8px',
                border: '1.5px solid var(--line)',
                padding: '0 12px',
                fontSize: '16px',
                fontWeight: 700,
                background: 'var(--card-bg)',
                color: 'var(--ink)',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Carbs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor="quick-meal-carb"
              style={{
                fontSize: '12.5px',
                fontWeight: 700,
                color: 'var(--ink)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span
                className="macro-marker macro-marker--carbs"
                aria-hidden="true"
              />
              الكاربوهيدرات (جم)
            </label>
            <input
              id="quick-meal-carb"
              type="text"
              inputMode="decimal"
              value={carbs}
              placeholder="الكارب"
              onChange={(e) => setCarbs(e.target.value)}
              style={{
                height: '48px',
                width: '100%',
                borderRadius: '8px',
                border: '1.5px solid var(--line)',
                padding: '0 12px',
                fontSize: '16px',
                fontWeight: 700,
                background: 'var(--card-bg)',
                color: 'var(--ink)',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Fats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor="quick-meal-fat"
              style={{
                fontSize: '12.5px',
                fontWeight: 700,
                color: 'var(--ink)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span
                className="macro-marker macro-marker--fats"
                aria-hidden="true"
              />
              الدهون (جم)
            </label>
            <input
              id="quick-meal-fat"
              type="text"
              inputMode="decimal"
              value={fats}
              placeholder="الدهون"
              onChange={(e) => setFats(e.target.value)}
              style={{
                height: '48px',
                width: '100%',
                borderRadius: '8px',
                border: '1.5px solid var(--line)',
                padding: '0 12px',
                fontSize: '16px',
                fontWeight: 700,
                background: 'var(--card-bg)',
                color: 'var(--ink)',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {showCaloriesWarning && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-warning-bg, #fffbeb)',
              color: 'var(--color-warning-text, #b45309)',
              border: '1px solid var(--color-warning-border, #fcd34d)',
              fontSize: '12.5px',
              lineHeight: 1.5,
            }}
          >
            تنبيه: السعرات المدخلة يدوياً ({activeCalories}) تختلف بأكثر من 10%
            عن المحسوبة من الماكروز ({derivedCalories} سعرة).
          </div>
        )}

        {/* Save to Permanent Meals Checkbox */}
        <div style={{ padding: '4px 0' }}>
          <Checkbox
            id="savePermanentCheck"
            checked={saveAsPermanent}
            onChange={(val) => setSaveAsPermanent(val)}
            label="حفظ هذه الوجبة في قائمة وجباتي الدائمة للرجوع إليها لاحقاً"
          />
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginTop: '8px',
          }}
        >
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            style={{ height: '48px', fontSize: '15px', fontWeight: 800 }}
          >
            تسجيل في متتبع اليوم
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="md"
            fullWidth
            onClick={onClose}
            style={{ height: '44px', fontSize: '14px' }}
          >
            إلغاء
          </Button>
        </div>
      </form>
    </Sheet>
  )
}
