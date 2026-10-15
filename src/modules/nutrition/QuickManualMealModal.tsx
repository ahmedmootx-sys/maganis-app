import { useState } from 'react'
import type { CustomMeal, MealCategory } from './types.ts'
import { Sheet } from '../../components/Sheet.tsx'

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
  { key: 'snack', label: 'وجبة خفيفة' },
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
  const [calories, setCalories] = useState<number>(450)
  const [protein, setProtein] = useState<number>(35)
  const [carbs, setCarbs] = useState<number>(50)
  const [fats, setFats] = useState<number>(10)
  const [category, setCategory] = useState<MealCategory>('lunch')
  const [saveAsPermanent, setSaveAsPermanent] = useState(true)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedName = nameAr.trim() || 'وجبة يدوية'
    const mealId = `manual-meal-${Date.now()}`

    const mealPayload = {
      id: mealId,
      nameAr: trimmedName,
      calories: Math.max(0, Math.round(Number(calories) || 0)),
      protein: Math.max(0, Math.round((Number(protein) || 0) * 10) / 10),
      carbs: Math.max(0, Math.round((Number(carbs) || 0) * 10) / 10),
      fats: Math.max(0, Math.round((Number(fats) || 0) * 10) / 10),
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
        calories: Math.max(0, Math.round(Number(calories) || 0)),
        proteinGrams: Math.max(0, Math.round((Number(protein) || 0) * 10) / 10),
        carbsGrams: Math.max(0, Math.round((Number(carbs) || 0) * 10) / 10),
        fatsGrams: Math.max(0, Math.round((Number(fats) || 0) * 10) / 10),
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
            placeholder="مثال: غداء خارجي، وجبة بعد التمرين..."
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
            <label
              htmlFor="quick-meal-cal"
              style={{ fontSize: '12.5px', fontWeight: 700 }}
            >
              السعرات (كالوِري)
            </label>
            <input
              id="quick-meal-cal"
              type="number"
              min="0"
              max="5000"
              value={calories}
              onChange={(e) => setCalories(Number(e.target.value))}
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
              required
            />
          </div>

          {/* Protein */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor="quick-meal-pro"
              style={{ fontSize: '12.5px', fontWeight: 700, color: '#3b82f6' }}
            >
              البروتين (جم)
            </label>
            <input
              id="quick-meal-pro"
              type="number"
              min="0"
              max="400"
              step="0.5"
              value={protein}
              onChange={(e) => setProtein(Number(e.target.value))}
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
              required
            />
          </div>

          {/* Carbs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor="quick-meal-carb"
              style={{ fontSize: '12.5px', fontWeight: 700, color: '#eab308' }}
            >
              الكاربوهيدرات (جم)
            </label>
            <input
              id="quick-meal-carb"
              type="number"
              min="0"
              max="500"
              step="0.5"
              value={carbs}
              onChange={(e) => setCarbs(Number(e.target.value))}
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
              required
            />
          </div>

          {/* Fats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor="quick-meal-fat"
              style={{ fontSize: '12.5px', fontWeight: 700, color: '#ef4444' }}
            >
              الدهون (جم)
            </label>
            <input
              id="quick-meal-fat"
              type="number"
              min="0"
              max="250"
              step="0.5"
              value={fats}
              onChange={(e) => setFats(Number(e.target.value))}
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
              required
            />
          </div>
        </div>

        {/* Save to Permanent Meals Checkbox */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '4px 0',
          }}
        >
          <input
            type="checkbox"
            id="savePermanentCheck"
            checked={saveAsPermanent}
            onChange={(e) => setSaveAsPermanent(e.target.checked)}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
          <label
            htmlFor="savePermanentCheck"
            style={{ fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}
          >
            حفظ هذه الوجبة في قائمة وجباتي الدائمة للرجوع إليها لاحقاً
          </label>
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
          <button
            type="submit"
            className="btn-primary-action full-width"
            style={{ height: '48px', fontSize: '15px', fontWeight: 800 }}
          >
            تسجيل في متتبع اليوم
          </button>
          <button
            type="button"
            className="ghost-secondary full-width"
            onClick={onClose}
            style={{ height: '44px', fontSize: '14px' }}
          >
            إلغاء
          </button>
        </div>
      </form>
    </Sheet>
  )
}
