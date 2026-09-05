import { useState, useMemo } from 'react'
import {
  FOOD_DATABASE,
  calculateCustomMealTotals,
  calculateIngredientMacros,
  getFoodItemById,
  type CustomMeal,
  type CustomMealIngredient,
} from './foodDatabase.ts'
import type { MealCategory } from './types.ts'

interface CustomMealModalProps {
  initialMeal?: CustomMeal | null
  onSave: (meal: CustomMeal) => void
  onClose: () => void
}

export function CustomMealModal({
  initialMeal,
  onSave,
  onClose,
}: CustomMealModalProps) {
  const [mode, setMode] = useState<'ingredients' | 'direct'>(
    initialMeal?.ingredients && initialMeal.ingredients.length > 0
      ? 'ingredients'
      : 'ingredients',
  )

  const [nameAr, setNameAr] = useState(initialMeal?.nameAr || '')
  const [category, setCategory] = useState<MealCategory>(
    initialMeal?.category || 'lunch',
  )
  const [notesAr, setNotesAr] = useState(initialMeal?.notesAr || '')

  // Ingredients builder state
  const [ingredients, setIngredients] = useState<CustomMealIngredient[]>(
    initialMeal?.ingredients || [
      { foodItemId: 'chicken-breast-cooked', grams: 150 },
      { foodItemId: 'cooked-white-rice', grams: 200 },
    ],
  )
  const [selectedFoodIdToAdd, setSelectedFoodIdToAdd] =
    useState<string>('olive-oil')
  const [gramsToAdd, setGramsToAdd] = useState<number>(10)
  const [ingredientSearch, setIngredientSearch] = useState('')

  // Direct input state
  const [directCalories, setDirectCalories] = useState<number>(
    initialMeal?.calories || 450,
  )
  const [directProtein, setDirectProtein] = useState<number>(
    initialMeal?.proteinGrams || 35,
  )
  const [directCarbs, setDirectCarbs] = useState<number>(
    initialMeal?.carbsGrams || 50,
  )
  const [directFats, setDirectFats] = useState<number>(
    initialMeal?.fatsGrams || 10,
  )

  // Calculated totals from ingredients
  const calculatedTotals = useMemo(() => {
    return calculateCustomMealTotals(ingredients)
  }, [ingredients])

  // Filtered foods for adding
  const filteredFoods = useMemo(() => {
    if (!ingredientSearch.trim()) return FOOD_DATABASE
    const q = ingredientSearch.toLowerCase()
    return FOOD_DATABASE.filter(
      (f) =>
        f.nameAr.toLowerCase().includes(q) ||
        f.categoryAr.toLowerCase().includes(q),
    )
  }, [ingredientSearch])

  function handleAddIngredient() {
    if (!selectedFoodIdToAdd || gramsToAdd <= 0) return
    setIngredients((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.foodItemId === selectedFoodIdToAdd,
      )
      if (existingIdx >= 0) {
        const updated = [...prev]
        updated[existingIdx] = {
          ...updated[existingIdx],
          grams: updated[existingIdx].grams + gramsToAdd,
        }
        return updated
      }
      return [...prev, { foodItemId: selectedFoodIdToAdd, grams: gramsToAdd }]
    })
  }

  function handleRemoveIngredient(index: number) {
    setIngredients((prev) => prev.filter((_, idx) => idx !== index))
  }

  function handleUpdateGrams(index: number, newGrams: number) {
    if (newGrams < 0) return
    setIngredients((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], grams: newGrams }
      return updated
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nameAr.trim()) {
      alert('يرجى إدخال اسم الوجبة')
      return
    }

    let finalCalories = directCalories
    let finalProtein = directProtein
    let finalCarbs = directCarbs
    let finalFats = directFats
    let finalIngredients: CustomMealIngredient[] | undefined = undefined

    if (mode === 'ingredients') {
      if (ingredients.length === 0) {
        alert('يرجى إضافة مكون واحد على الأقل للوجبة')
        return
      }
      finalCalories = calculatedTotals.calories
      finalProtein = calculatedTotals.proteinGrams
      finalCarbs = calculatedTotals.carbsGrams
      finalFats = calculatedTotals.fatsGrams
      finalIngredients = ingredients
    }

    const customMeal: CustomMeal = {
      id: initialMeal?.id || `custom-meal-${Date.now()}`,
      nameAr: nameAr.trim(),
      category: category,
      notesAr: notesAr.trim() || undefined,
      ingredients: finalIngredients,
      totalGrams:
        mode === 'ingredients' ? calculatedTotals.totalGrams : undefined,
      calories: Math.round(finalCalories),
      proteinGrams: Math.round(finalProtein * 10) / 10,
      carbsGrams: Math.round(finalCarbs * 10) / 10,
      fatsGrams: Math.round(finalFats * 10) / 10,
      isCustom: true,
      createdAt: initialMeal?.createdAt || new Date().toISOString(),
    }

    onSave(customMeal)
    onClose()
  }

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
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
          maxWidth: '540px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#ffffff',
          borderRadius: '16px',
          padding: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '12px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
            {initialMeal
              ? '✏️ تعديل الوجبة الخاصة'
              : '✨ إضافة وجبة خاصة وحساب الماكروز'}
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
          {/* Meal Name */}
          <div style={{ marginBottom: '14px' }}>
            <label
              style={{
                display: 'block',
                fontWeight: 700,
                fontSize: '13.5px',
                marginBottom: '6px',
              }}
            >
              اسم الوجبة: <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              className="field-input"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="مثال: غداء الضخامة (فراخ وأرز وبطاطس)"
              required
              style={{ width: '100%', padding: '10px', borderRadius: '8px' }}
            />
          </div>

          {/* Category */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontWeight: 700,
                fontSize: '13.5px',
                marginBottom: '6px',
              }}
            >
              نوع الوجبة:
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
                    fontSize: '12.5px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    border: '1.5px solid',
                    borderColor:
                      category === catKey ? 'var(--primary)' : '#cbd5e1',
                    background:
                      category === catKey ? 'rgba(249, 87, 0, 0.1)' : '#f8fafc',
                    color: category === catKey ? 'var(--primary)' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  {catLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Calculation Mode Switcher */}
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              padding: '4px',
              borderRadius: '10px',
              marginBottom: '16px',
            }}
          >
            <button
              type="button"
              onClick={() => setMode('ingredients')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                background: mode === 'ingredients' ? '#ffffff' : 'transparent',
                color: mode === 'ingredients' ? 'var(--primary)' : '#64748b',
                boxShadow:
                  mode === 'ingredients' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              ⚖️ حاسبة المكونات (بالجرام)
            </button>
            <button
              type="button"
              onClick={() => setMode('direct')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                background: mode === 'direct' ? '#ffffff' : 'transparent',
                color: mode === 'direct' ? 'var(--primary)' : '#64748b',
                boxShadow:
                  mode === 'direct' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              ✍️ إدخال الماكروز المباشر
            </button>
          </div>

          {/* MODE 1: INGREDIENTS BUILDER */}
          {mode === 'ingredients' && (
            <div
              style={{
                background: '#f8fafc',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                marginBottom: '16px',
              }}
            >
              <h4
                style={{
                  margin: '0 0 10px 0',
                  fontSize: '14px',
                  color: '#1e293b',
                }}
              >
                🥗 مكونات الوجبة (احسب بالجرام):
              </h4>

              {/* Ingredients List */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginBottom: '14px',
                }}
              >
                {ingredients.map((ing, idx) => {
                  const food = getFoodItemById(ing.foodItemId)
                  if (!food) return null
                  const macros = calculateIngredientMacros(food, ing.grams)

                  return (
                    <div
                      key={`${ing.foodItemId}-${idx}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#ffffff',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        gap: '8px',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '13px' }}>
                          {food.nameAr}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                          {macros.calories} سعرة • {macros.protein}ج بروتين •{' '}
                          {macros.carbs}ج كارب • {macros.fats}ج دهون
                        </div>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <input
                          type="number"
                          min="1"
                          max="2000"
                          step="5"
                          value={ing.grams}
                          onChange={(e) =>
                            handleUpdateGrams(idx, Number(e.target.value))
                          }
                          style={{
                            width: '65px',
                            padding: '4px 6px',
                            textAlign: 'center',
                            borderRadius: '6px',
                            border: '1px solid #94a3b8',
                            fontSize: '13px',
                            fontWeight: 700,
                          }}
                        />
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          جم
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(idx)}
                          style={{
                            background: '#fee2e2',
                            color: '#b91c1c',
                            border: 'none',
                            borderRadius: '6px',
                            width: '26px',
                            height: '26px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                          }}
                          title="حذف المكون"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Add New Ingredient Bar */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '10px',
                  borderRadius: '10px',
                  border: '1.5px dashed var(--primary)',
                }}
              >
                <div
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 700,
                    marginBottom: '8px',
                    color: '#0f172a',
                  }}
                >
                  + إضافة مكوّن سريع أو اختر من القائمة:
                </div>

                {/* Quick Staples Chips */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '5px',
                    marginBottom: '10px',
                  }}
                >
                  {[
                    {
                      id: 'chicken-breast-cooked',
                      name: '🍗 فراخ',
                      grams: 150,
                    },
                    { id: 'cooked-white-rice', name: '🍚 أرز', grams: 200 },
                    { id: 'raw-rolled-oats', name: '🥣 شوفان', grams: 60 },
                    { id: 'whole-eggs-boiled', name: '🥚 بيضتين', grams: 100 },
                    { id: 'canned-tuna-drained', name: '🐟 تونة', grams: 140 },
                    {
                      id: 'cottage-cheese-kareesh',
                      name: '🧀 جبنة قريش',
                      grams: 150,
                    },
                    { id: 'boiled-potatoes', name: '🥔 بطاطس', grams: 200 },
                    {
                      id: 'whey-protein-isolate',
                      name: '🥤 سكوب بروتين',
                      grams: 30,
                    },
                    { id: 'olive-oil', name: '🫒 زيت زيتون', grams: 10 },
                  ].map((quick) => (
                    <button
                      key={quick.id}
                      type="button"
                      onClick={() => {
                        setSelectedFoodIdToAdd(quick.id)
                        setGramsToAdd(quick.grams)
                        setIngredients((prev) => {
                          const existingIdx = prev.findIndex(
                            (i) => i.foodItemId === quick.id,
                          )
                          if (existingIdx >= 0) {
                            const updated = [...prev]
                            updated[existingIdx] = {
                              ...updated[existingIdx],
                              grams: updated[existingIdx].grams + quick.grams,
                            }
                            return updated
                          }
                          return [
                            ...prev,
                            { foodItemId: quick.id, grams: quick.grams },
                          ]
                        })
                      }}
                      style={{
                        padding: '4px 8px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        cursor: 'pointer',
                        color: '#334155',
                      }}
                    >
                      + {quick.name} ({quick.grams}ج)
                    </button>
                  ))}
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <input
                    type="text"
                    placeholder="🔍 ابحث في المكونات (فراخ، بيض، أرز، شوفان، تونة...)"
                    value={ingredientSearch}
                    onChange={(e) => {
                      const val = e.target.value
                      setIngredientSearch(val)
                      const q = val.toLowerCase().trim()
                      if (q) {
                        const firstMatch = FOOD_DATABASE.find(
                          (f) =>
                            f.nameAr.toLowerCase().includes(q) ||
                            f.categoryAr.toLowerCase().includes(q),
                        )
                        if (firstMatch) {
                          setSelectedFoodIdToAdd(firstMatch.id)
                          setGramsToAdd(firstMatch.defaultGrams)
                        }
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '13px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      marginBottom: '6px',
                    }}
                  />
                  <select
                    className="field-input"
                    value={selectedFoodIdToAdd}
                    onChange={(e) => {
                      const id = e.target.value
                      setSelectedFoodIdToAdd(id)
                      const item = getFoodItemById(id)
                      if (item) setGramsToAdd(item.defaultGrams)
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      fontSize: '13px',
                      borderRadius: '6px',
                    }}
                  >
                    {filteredFoods.map((food) => (
                      <option key={food.id} value={food.id}>
                        [{food.categoryAr}] {food.nameAr} (
                        {food.per100g.calories} ك/100ج - {food.per100g.protein}ج
                        بروتين)
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ fontSize: '12.5px', fontWeight: 600 }}>
                      الكمية:
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="2000"
                      step="5"
                      value={gramsToAdd}
                      onChange={(e) => setGramsToAdd(Number(e.target.value))}
                      style={{
                        width: '75px',
                        padding: '6px',
                        textAlign: 'center',
                        borderRadius: '6px',
                        border: '1px solid #94a3b8',
                        fontWeight: 700,
                      }}
                    />
                    <span style={{ fontSize: '12px' }}>جم</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: 'var(--primary)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    + أضف المكون المحدد للوجبة
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: DIRECT MACROS INPUT */}
          {mode === 'direct' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                background: '#f8fafc',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                marginBottom: '16px',
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
                  🔥 السعرات (Calories):
                </label>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  className="field-input"
                  value={directCalories}
                  onChange={(e) => setDirectCalories(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px', fontWeight: 700 }}
                  required
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12.5px',
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
                  max="500"
                  step="0.5"
                  className="field-input"
                  value={directProtein}
                  onChange={(e) => setDirectProtein(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px', fontWeight: 700 }}
                  required
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12.5px',
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
                  value={directCarbs}
                  onChange={(e) => setDirectCarbs(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px', fontWeight: 700 }}
                  required
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    marginBottom: '4px',
                    color: '#dc2626',
                  }}
                >
                  🥑 الدهون الصحية (جم):
                </label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  step="0.5"
                  className="field-input"
                  value={directFats}
                  onChange={(e) => setDirectFats(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px', fontWeight: 700 }}
                  required
                />
              </div>
            </div>
          )}

          {/* LIVE SUMMARY TOTALS BOX */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0f172a, #1e293b)',
              color: '#ffffff',
              padding: '14px',
              borderRadius: '12px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                fontSize: '12.5px',
                color: '#94a3b8',
                marginBottom: '4px',
              }}
            >
              📊 الماكروز الإجمالية المحسوبة للوجبة:
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div
                style={{ fontSize: '20px', fontWeight: 900, color: '#F95700' }}
              >
                {mode === 'ingredients'
                  ? calculatedTotals.calories
                  : directCalories}{' '}
                <span style={{ fontSize: '13px', color: '#cbd5e1' }}>
                  سعرة حرارية
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                <span style={{ color: '#60a5fa' }}>
                  🥩{' '}
                  {mode === 'ingredients'
                    ? calculatedTotals.proteinGrams
                    : directProtein}
                  ج بروتين
                </span>
                <span style={{ color: '#facc15' }}>
                  🍞{' '}
                  {mode === 'ingredients'
                    ? calculatedTotals.carbsGrams
                    : directCarbs}
                  ج كارب
                </span>
                <span style={{ color: '#f87171' }}>
                  🥑{' '}
                  {mode === 'ingredients'
                    ? calculatedTotals.fatsGrams
                    : directFats}
                  ج دهون
                </span>
              </div>
            </div>
          </div>

          {/* Notes Input */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12.5px',
                fontWeight: 700,
                marginBottom: '4px',
              }}
            >
              ملاحظات أو طريقة التحضير (اختياري):
            </label>
            <textarea
              className="field-input"
              value={notesAr}
              onChange={(e) => setNotesAr(e.target.value)}
              placeholder="مثال: شوح الدجاج في ملعقة زيت زيتون وضع الأرز مع طبق سلطة خضراء."
              rows={2}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '8px',
                fontSize: '12.5px',
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              className="button-primary"
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '14px',
                fontWeight: 800,
              }}
            >
              💾 حفظ الوجبة في مطبخي
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={onClose}
              style={{ padding: '12px 18px', fontSize: '14px' }}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
