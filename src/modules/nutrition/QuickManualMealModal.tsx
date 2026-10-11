import { useState } from 'react'
import type { CustomMeal, MealCategory } from './types.ts'

interface QuickManualMealModalProps {
  onLogMealDirect: (meal: {
    id: string
    nameAr: string
    calories: number
    protein: number
    carbs: number
    fats: number
  }) => void
  onSaveToCustomMeals?: (meal: CustomMeal) => void
  onClose: () => void
}

export function QuickManualMealModal({
  onLogMealDirect,
  onSaveToCustomMeals,
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

    onLogMealDirect({
      id: mealId,
      nameAr: trimmedName,
      calories: Math.max(0, Math.round(Number(calories) || 0)),
      protein: Math.max(0, Math.round((Number(protein) || 0) * 10) / 10),
      carbs: Math.max(0, Math.round((Number(carbs) || 0) * 10) / 10),
      fats: Math.max(0, Math.round((Number(fats) || 0) * 10) / 10),
    })

    if (saveAsPermanent && onSaveToCustomMeals) {
      onSaveToCustomMeals({
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
    <div
      className="modal-backdrop"
      onClick={onClose}
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
            paddingBottom: '12px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
            ⚡ تسجيل وجبة سريعة بالسعرات والماكروز
          </h2>
          <button
            type="button"
            className="ghost-secondary tiny"
            onClick={onClose}
            style={{ fontSize: '18px', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label
              style={{
                display: 'block',
                fontWeight: 700,
                fontSize: '13px',
                marginBottom: '4px',
              }}
            >
              اسم الوجبة:
            </label>
            <input
              type="text"
              className="field-input"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="مثال: غداء خارجي، وجبة بعد التمرين، عشاء خفيف..."
              required
              style={{ width: '100%', padding: '10px' }}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label
              style={{
                display: 'block',
                fontWeight: 700,
                fontSize: '13px',
                marginBottom: '4px',
              }}
            >
              تصنيف الوجبة:
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '6px',
              }}
            >
              {(
                [
                  ['breakfast', '🌅 فطور'],
                  ['lunch', '🍲 غداء'],
                  ['dinner', '🌙 عشاء'],
                  ['snack', '🥗 سناك'],
                ] as const
              ).map(([catKey, catLabel]) => (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setCategory(catKey)}
                  style={{
                    padding: '8px 4px',
                    fontSize: '12px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    border:
                      category === catKey
                        ? '2px solid var(--accent)'
                        : '1px solid var(--line)',
                    background:
                      category === catKey ? 'var(--accent)' : 'var(--card-bg)',
                    color: category === catKey ? '#ffffff' : 'var(--ink)',
                    cursor: 'pointer',
                  }}
                >
                  {catLabel}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
              background: 'var(--card-subtle)',
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid var(--line)',
              marginBottom: '14px',
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
                🔥 السعرات (كالوِري):
              </label>
              <input
                type="number"
                min="0"
                max="5000"
                className="field-input"
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                style={{ width: '100%', padding: '8px', fontWeight: 700 }}
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  marginBottom: '4px',
                  color: '#2563eb',
                }}
              >
                🥩 البروتين (جم):
              </label>
              <input
                type="number"
                min="0"
                max="400"
                step="0.5"
                className="field-input"
                value={protein}
                onChange={(e) => setProtein(Number(e.target.value))}
                style={{ width: '100%', padding: '8px', fontWeight: 700 }}
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  marginBottom: '4px',
                  color: '#ca8a04',
                }}
              >
                🍞 الكاربوهيدرات (جم):
              </label>
              <input
                type="number"
                min="0"
                max="500"
                step="0.5"
                className="field-input"
                value={carbs}
                onChange={(e) => setCarbs(Number(e.target.value))}
                style={{ width: '100%', padding: '8px', fontWeight: 700 }}
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  marginBottom: '4px',
                  color: '#dc2626',
                }}
              >
                🥑 الدهون (جم):
              </label>
              <input
                type="number"
                min="0"
                max="250"
                step="0.5"
                className="field-input"
                value={fats}
                onChange={(e) => setFats(Number(e.target.value))}
                style={{ width: '100%', padding: '8px', fontWeight: 700 }}
                required
              />
            </div>
          </div>

          <div
            style={{
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <input
              type="checkbox"
              id="savePermanentCheck"
              checked={saveAsPermanent}
              onChange={(e) => setSaveAsPermanent(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label
              htmlFor="savePermanentCheck"
              style={{ fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              💾 احفظ هذه الوجبة أيضاً في قائمة وجباتي الدائمة للرجوع إليها
              لاحقاً
            </label>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="submit"
              className="button-primary"
              style={{ flex: 1, padding: '12px', fontWeight: 800 }}
            >
              🍽️ تسجيل في متتبع اليوم
            </button>
            <button
              type="button"
              className="ghost"
              onClick={onClose}
              style={{ padding: '12px 16px' }}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
