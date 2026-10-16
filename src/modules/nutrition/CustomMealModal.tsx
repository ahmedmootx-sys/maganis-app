import { useState, useMemo } from 'react'
import {
  getAllFoodItems,
  saveCustomFoodItem,
  calculateCustomMealTotals,
  calculateIngredientMacros,
  getFoodItemById,
  type CustomMeal,
  type CustomMealIngredient,
  type FoodItem,
} from './foodDatabase.ts'
import type { MealCategory } from './types.ts'
import { Select, Sheet, Callout, Button } from '../../ui/index.ts'
import { IconTrash } from '../../components/Icons.tsx'

export interface CustomMealModalProps {
  initialMeal?: CustomMeal | null
  onSave: (meal: CustomMeal) => void
  onClose: () => void
}

const CATEGORIES: { key: MealCategory; label: string }[] = [
  { key: 'breakfast', label: 'فطور' },
  { key: 'lunch', label: 'غداء' },
  { key: 'dinner', label: 'عشاء' },
  { key: 'snack', label: 'سناك' },
]

const QUICK_STAPLES = [
  { id: 'chicken-breast-cooked', name: 'صدور فراخ', grams: 150 },
  { id: 'cooked-white-rice', name: 'أرز مطبوخ', grams: 200 },
  { id: 'raw-oats', name: 'شوفان', grams: 60 },
  { id: 'egg-whole', name: 'بيض مسلوق', grams: 100 },
  { id: 'tuna-water', name: 'تونة مصفاة', grams: 140 },
  { id: 'cottage-cheese', name: 'جبنة قريش', grams: 150 },
  { id: 'boiled-potato', name: 'بطاطس مسلوقة', grams: 200 },
  { id: 'whey-protein', name: 'واي بروتين', grams: 30 },
  { id: 'olive-oil', name: 'زيت زيتون', grams: 10 },
]

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
  const [formError, setFormError] = useState<string | null>(null)
  const [foodFormError, setFoodFormError] = useState<string | null>(null)

  // Ingredients builder state
  const [ingredients, setIngredients] = useState<CustomMealIngredient[]>(
    initialMeal?.ingredients && initialMeal.ingredients.length > 0
      ? initialMeal.ingredients
      : [
          { foodItemId: 'chicken-breast-cooked', grams: 150 },
          { foodItemId: 'cooked-white-rice', grams: 200 },
        ],
  )
  const [ingredientSearch, setIngredientSearch] = useState('')

  // Create new custom food item modal/form state
  const [showAddCustomFoodForm, setShowAddCustomFoodForm] = useState(false)
  const [newFoodName, setNewFoodName] = useState('')
  const [newFoodCategory, setNewFoodCategory] =
    useState<FoodItem['categoryAr']>('بروتين ولحوم')
  const [newFoodCalories, setNewFoodCalories] = useState<number>(150)
  const [newFoodProtein, setNewFoodProtein] = useState<number>(20)
  const [newFoodCarbs, setNewFoodCarbs] = useState<number>(5)
  const [newFoodFats, setNewFoodFats] = useState<number>(3)

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

  // Load all available foods (predefined + user custom foods)
  const allFoods = useMemo(() => {
    return getAllFoodItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAddCustomFoodForm])

  // Filtered foods for searching
  const searchResults = useMemo(() => {
    if (!ingredientSearch.trim()) return []
    const q = ingredientSearch.toLowerCase().trim()
    return allFoods
      .filter(
        (f) =>
          f.nameAr.toLowerCase().includes(q) ||
          f.categoryAr.toLowerCase().includes(q),
      )
      .slice(0, 8)
  }, [ingredientSearch, allFoods])

  // Calculated totals from ingredients
  const calculatedTotals = useMemo(() => {
    return calculateCustomMealTotals(ingredients)
  }, [ingredients])

  function handleAddIngredientDirect(foodId: string, grams: number) {
    setIngredients((prev) => {
      const existingIdx = prev.findIndex((i) => i.foodItemId === foodId)
      if (existingIdx >= 0) {
        const updated = [...prev]
        updated[existingIdx] = {
          ...updated[existingIdx],
          grams: updated[existingIdx].grams + grams,
        }
        return updated
      }
      return [...prev, { foodItemId: foodId, grams }]
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

  function handleSaveNewCustomFood(e: React.FormEvent) {
    e.preventDefault()
    setFoodFormError(null)
    if (!newFoodName.trim()) {
      setFoodFormError('يرجى إدخال اسم المكوّن الغذائي')
      return
    }

    const newFood: FoodItem = {
      id: `custom-food-${Date.now()}`,
      nameAr: newFoodName.trim(),
      categoryAr: newFoodCategory,
      servingUnitAr: 'جرام',
      defaultGrams: 100,
      per100g: {
        calories: Number(newFoodCalories) || 0,
        protein: Number(newFoodProtein) || 0,
        carbs: Number(newFoodCarbs) || 0,
        fats: Number(newFoodFats) || 0,
      },
    }

    saveCustomFoodItem(newFood)
    handleAddIngredientDirect(newFood.id, 100)
    setNewFoodName('')
    setShowAddCustomFoodForm(false)
    setIngredientSearch('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!nameAr.trim()) {
      setFormError('يرجى إدخال اسم الوجبة')
      return
    }

    let finalCalories = directCalories
    let finalProtein = directProtein
    let finalCarbs = directCarbs
    let finalFats = directFats
    let finalIngredients: CustomMealIngredient[] | undefined = undefined

    if (mode === 'ingredients') {
      if (ingredients.length === 0) {
        setFormError('يرجى إضافة مكون واحد على الأقل للوجبة')
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
    <Sheet
      isOpen={true}
      onClose={onClose}
      title={
        initialMeal ? 'تعديل الوجبة الخاصة' : 'تصميم وجبة خاصة وحساب الماكروز'
      }
      footer={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Button
            type="submit"
            form="custom-meal-form"
            variant="primary"
            size="lg"
            className="full-width"
            style={{ height: '48px', fontSize: '15px', fontWeight: 800 }}
          >
            حفظ الوجبة في وجباتي
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="md"
            className="full-width"
            onClick={onClose}
            style={{ height: '44px', fontSize: '14px' }}
          >
            إلغاء
          </Button>
        </div>
      }
    >
      <form
        id="custom-meal-form"
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '8px 0 16px',
        }}
      >
        {formError && <Callout tone="danger">{formError}</Callout>}

        {/* Meal Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            htmlFor="custom-meal-name"
            style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}
          >
            اسم الوجبة <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            id="custom-meal-name"
            type="text"
            className="field-input"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            placeholder="مثال: غداء الضخامة (فراخ وأرز وسلطة)"
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

        {/* Category */}
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

        {/* Mode Switcher */}
        <div
          className="segmented"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4px',
          }}
        >
          <button
            type="button"
            className={`segmented__item ${mode === 'ingredients' ? 'segmented__item--active' : ''}`}
            onClick={() => setMode('ingredients')}
            style={{ minHeight: '40px', fontSize: '13.5px' }}
          >
            المكونات بالجرام
          </button>
          <button
            type="button"
            className={`segmented__item ${mode === 'direct' ? 'segmented__item--active' : ''}`}
            onClick={() => setMode('direct')}
            style={{ minHeight: '40px', fontSize: '13.5px' }}
          >
            الماكروز مباشرة
          </button>
        </div>

        {/* Mode 1: Ingredients Builder */}
        {mode === 'ingredients' && (
          <div
            style={{
              background: 'var(--card-subtle)',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid var(--line)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800 }}>
                مكونات الوجبة الحالية ({ingredients.length}):
              </h4>
              <button
                type="button"
                className="chip-btn"
                onClick={() => setShowAddCustomFoodForm((prev) => !prev)}
                style={{
                  fontSize: '12px',
                  padding: '6px 12px',
                  background: showAddCustomFoodForm
                    ? 'var(--accent)'
                    : 'var(--card-bg)',
                  color: showAddCustomFoodForm ? '#fff' : 'var(--accent)',
                  border: '1px solid var(--accent)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  borderRadius: '20px',
                }}
              >
                {showAddCustomFoodForm
                  ? 'إغلاق النموذج'
                  : 'مكوّن غذائي خاص جديد'}
              </button>
            </div>

            {/* Add Custom Food Form */}
            {showAddCustomFoodForm && (
              <div
                style={{
                  background: 'var(--card-bg)',
                  border: '1.5px dashed var(--accent)',
                  padding: '14px',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {foodFormError && (
                  <Callout tone="danger">{foodFormError}</Callout>
                )}
                <div style={{ fontSize: '13px', fontWeight: 800 }}>
                  تسجيل مكوّن غذائي جديد في قائمتك:
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <label style={{ fontSize: '12px', fontWeight: 700 }}>
                      اسم الطعام
                    </label>
                    <input
                      type="text"
                      value={newFoodName}
                      onChange={(e) => setNewFoodName(e.target.value)}
                      placeholder="مثال: بروتين بار"
                      style={{
                        height: '44px',
                        width: '100%',
                        borderRadius: '8px',
                        border: '1px solid var(--line)',
                        padding: '0 10px',
                        fontSize: '13.5px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <Select
                      id="new-food-category-select"
                      label="التصنيف الغذائي"
                      value={newFoodCategory}
                      onChange={(val) =>
                        setNewFoodCategory(val as FoodItem['categoryAr'])
                      }
                      options={[
                        'بروتين ولحوم',
                        'نشويات وكارب',
                        'ألبان وأجبان',
                        'بقوليات',
                        'دهون ومكسرات',
                        'فواكه وخضار',
                        'مكملات وسناكس',
                      ]}
                      sheetTitle="اختر التصنيف الغذائي"
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '6px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <label style={{ fontSize: '11px', fontWeight: 700 }}>
                      سعرات/100ج
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newFoodCalories}
                      onChange={(e) =>
                        setNewFoodCalories(Number(e.target.value))
                      }
                      style={{
                        height: '40px',
                        padding: '0 6px',
                        borderRadius: '6px',
                        border: '1px solid var(--line)',
                        textAlign: 'center',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <label
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--ink)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span
                        className="macro-marker macro-marker--protein"
                        aria-hidden="true"
                      />
                      بروتين/100ج
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={newFoodProtein}
                      onChange={(e) =>
                        setNewFoodProtein(Number(e.target.value))
                      }
                      style={{
                        height: '40px',
                        padding: '0 6px',
                        borderRadius: '6px',
                        border: '1px solid var(--line)',
                        textAlign: 'center',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <label
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--ink)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span
                        className="macro-marker macro-marker--carbs"
                        aria-hidden="true"
                      />
                      كارب/100ج
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={newFoodCarbs}
                      onChange={(e) => setNewFoodCarbs(Number(e.target.value))}
                      style={{
                        height: '40px',
                        padding: '0 6px',
                        borderRadius: '6px',
                        border: '1px solid var(--line)',
                        textAlign: 'center',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <label
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--ink)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span
                        className="macro-marker macro-marker--fats"
                        aria-hidden="true"
                      />
                      دهون/100ج
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={newFoodFats}
                      onChange={(e) => setNewFoodFats(Number(e.target.value))}
                      style={{
                        height: '40px',
                        padding: '0 6px',
                        borderRadius: '6px',
                        border: '1px solid var(--line)',
                        textAlign: 'center',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-primary-action"
                    onClick={handleSaveNewCustomFood}
                    style={{
                      height: '40px',
                      padding: '0 16px',
                      fontSize: '13px',
                    }}
                  >
                    حفظ وإضافة للوجبة
                  </button>
                  <button
                    type="button"
                    className="ghost-secondary"
                    onClick={() => setShowAddCustomFoodForm(false)}
                    style={{
                      height: '40px',
                      padding: '0 14px',
                      fontSize: '13px',
                    }}
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}

            {/* Current Ingredients List */}
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              {ingredients.map((ing, idx) => {
                const food = getFoodItemById(ing.foodItemId)
                if (!food) return null
                const macros = calculateIngredientMacros(food, ing.grams)

                return (
                  <div
                    key={`${ing.foodItemId}-${idx}`}
                    className="list-row"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      background: 'var(--color-surface)',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-card)',
                      border: '1px solid var(--color-divider)',
                      gap: '8px',
                    }}
                  >
                    {/* Line 1: full-width name */}
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: '14.5px',
                        color: 'var(--color-text)',
                        width: '100%',
                      }}
                    >
                      {food.nameAr}
                    </div>

                    {/* Line 2: macros (small, may wrap) */}
                    <div
                      style={{
                        fontSize: '12.5px',
                        color: 'var(--color-text-2)',
                        lineHeight: 1.4,
                        wordBreak: 'break-word',
                      }}
                    >
                      {macros.calories} سعرة • {macros.protein}ج بروتين •{' '}
                      {macros.carbs}ج كارب • {macros.fats}ج دهون
                    </div>

                    {/* Line 3: stepper ( - , input , + , unit ) and a 44x44 trash IconButton (Lucide) */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        paddingTop: '6px',
                        borderTop: '1px solid var(--color-divider)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateGrams(idx, Math.max(5, ing.grams - 25))
                          }
                          aria-label="تقليل الكمية"
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: 'var(--radius-control)',
                            border: '1px solid var(--color-divider)',
                            background: 'var(--color-surface-2)',
                            color: 'var(--color-text)',
                            fontSize: '16px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="2000"
                          step="5"
                          value={ing.grams}
                          onChange={(e) =>
                            handleUpdateGrams(idx, Number(e.target.value))
                          }
                          aria-label={`كمية ${food.nameAr} بالجرام`}
                          className="field-input"
                          style={{
                            width: '68px',
                            height: '36px',
                            padding: '0 6px',
                            textAlign: 'center',
                            borderRadius: 'var(--radius-control)',
                            border: '1px solid var(--color-divider)',
                            fontSize: '14px',
                            fontWeight: 700,
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateGrams(idx, ing.grams + 25)}
                          aria-label="زيادة الكمية"
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: 'var(--radius-control)',
                            border: '1px solid var(--color-divider)',
                            background: 'var(--color-surface-2)',
                            color: 'var(--color-text)',
                            fontSize: '16px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          +
                        </button>
                        <span
                          style={{
                            fontSize: '12.5px',
                            color: 'var(--color-text-2)',
                            marginInlineStart: '2px',
                          }}
                        >
                          جم
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(idx)}
                        aria-label={`حذف ${food.nameAr}`}
                        style={{
                          background: 'var(--color-danger-bg)',
                          color: 'var(--color-danger)',
                          border: 'none',
                          borderRadius: 'var(--radius-control)',
                          width: '44px',
                          height: '44px',
                          minWidth: '44px',
                          minHeight: '44px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                        }}
                        title="حذف المكون"
                      >
                        <IconTrash size={20} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Quick Staples & Search */}
            <div
              style={{
                background: 'var(--card-bg)',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid var(--line)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--ink)',
                }}
              >
                إضافة سريعة لمكونات أساسية:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {QUICK_STAPLES.map((quick) => (
                  <button
                    key={quick.id}
                    type="button"
                    onClick={() =>
                      handleAddIngredientDirect(quick.id, quick.grams)
                    }
                    style={{
                      padding: '6px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      border: '1px solid var(--line)',
                      background: 'var(--card-subtle)',
                      cursor: 'pointer',
                      color: 'var(--ink)',
                    }}
                  >
                    + {quick.name} ({quick.grams}ج)
                  </button>
                ))}
              </div>

              {/* Search */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  marginTop: '4px',
                }}
              >
                <label style={{ fontSize: '12.5px', fontWeight: 700 }}>
                  ابحث في جميع الأطعمة والمكونات:
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="اكتب اسم الطعام (فراخ، أرز، شوفان، بيض...)"
                    value={ingredientSearch}
                    onChange={(e) => setIngredientSearch(e.target.value)}
                    style={{
                      height: '44px',
                      width: '100%',
                      padding: '0 12px',
                      fontSize: '13.5px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--line)',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Search Results */}
                {ingredientSearch.trim() && (
                  <div
                    style={{
                      marginTop: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      maxHeight: '180px',
                      overflowY: 'auto',
                    }}
                  >
                    {searchResults.length === 0 ? (
                      <div
                        style={{
                          padding: '10px',
                          fontSize: '12.5px',
                          color: 'var(--muted)',
                          textAlign: 'center',
                        }}
                      >
                        لم نجد طعاماً بهذا الاسم. يمكنك الضغط على "مكوّن غذائي
                        خاص جديد" أعلاه لإضافته!
                      </div>
                    ) : (
                      searchResults.map((food) => (
                        <div
                          key={food.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: 'var(--card-subtle)',
                            border: '1px solid var(--line)',
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: '13px' }}>
                              {food.nameAr}
                            </strong>
                            <span
                              style={{
                                fontSize: '11.5px',
                                color: 'var(--muted)',
                                marginRight: '6px',
                              }}
                            >
                              ({food.per100g.calories} كالوِري •{' '}
                              {food.per100g.protein}ج بروتين / 100ج)
                            </span>
                          </div>
                          <button
                            type="button"
                            className="btn-primary-action tiny"
                            onClick={() => {
                              handleAddIngredientDirect(
                                food.id,
                                food.defaultGrams || 100,
                              )
                              setIngredientSearch('')
                            }}
                            style={{
                              height: '32px',
                              padding: '0 10px',
                              fontSize: '12px',
                            }}
                          >
                            + أضف ({food.defaultGrams || 100}ج)
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mode 2: Direct Input */}
        {mode === 'direct' && (
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
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
            >
              <label style={{ fontSize: '12.5px', fontWeight: 700 }}>
                السعرات
              </label>
              <input
                type="number"
                min="0"
                max="5000"
                value={directCalories}
                onChange={(e) => setDirectCalories(Number(e.target.value))}
                style={{
                  height: '48px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--line)',
                  fontSize: '15px',
                  fontWeight: 700,
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
            >
              <label
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
                type="number"
                min="0"
                max="500"
                step="0.5"
                value={directProtein}
                onChange={(e) => setDirectProtein(Number(e.target.value))}
                style={{
                  height: '48px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--line)',
                  fontSize: '15px',
                  fontWeight: 700,
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
            >
              <label
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
                type="number"
                min="0"
                max="500"
                step="0.5"
                value={directCarbs}
                onChange={(e) => setDirectCarbs(Number(e.target.value))}
                style={{
                  height: '48px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--line)',
                  fontSize: '15px',
                  fontWeight: 700,
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
            >
              <label
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
                type="number"
                min="0"
                max="300"
                step="0.5"
                value={directFats}
                onChange={(e) => setDirectFats(Number(e.target.value))}
                style={{
                  height: '48px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--line)',
                  fontSize: '15px',
                  fontWeight: 700,
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>
          </div>
        )}

        {/* Live Summary Totals Box */}
        <div
          style={{
            background: 'var(--card-subtle)',
            border: '1.5px solid var(--line)',
            padding: '14px',
            borderRadius: '12px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              color: 'var(--muted)',
              marginBottom: '4px',
              fontWeight: 600,
            }}
          >
            الماكروز الإجمالية المحسوبة للوجبة:
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
              style={{
                fontSize: '20px',
                fontWeight: 900,
                color: 'var(--accent)',
              }}
            >
              {mode === 'ingredients'
                ? calculatedTotals.calories
                : directCalories}{' '}
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                سعرة حرارية
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                fontSize: '13px',
                fontWeight: 700,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: 'var(--ink)',
                }}
              >
                <span
                  className="macro-marker macro-marker--protein"
                  aria-hidden="true"
                />
                {mode === 'ingredients'
                  ? calculatedTotals.proteinGrams
                  : directProtein}
                ج بروتين
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: 'var(--ink)',
                }}
              >
                <span
                  className="macro-marker macro-marker--carbs"
                  aria-hidden="true"
                />
                {mode === 'ingredients'
                  ? calculatedTotals.carbsGrams
                  : directCarbs}
                ج كارب
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: 'var(--ink)',
                }}
              >
                <span
                  className="macro-marker macro-marker--fats"
                  aria-hidden="true"
                />
                {mode === 'ingredients'
                  ? calculatedTotals.fatsGrams
                  : directFats}
                ج دهون
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 700 }}>
            ملاحظات أو طريقة التحضير (اختياري)
          </label>
          <textarea
            value={notesAr}
            onChange={(e) => setNotesAr(e.target.value)}
            placeholder="مثال: صدور دجاج متبلة مع أرز بسمتي وسلطة خضراء..."
            rows={2}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1.5px solid var(--line)',
              fontSize: '13.5px',
              background: 'var(--card-bg)',
              color: 'var(--ink)',
              boxSizing: 'border-box',
              resize: 'none',
            }}
          />
        </div>
      </form>
    </Sheet>
  )
}
