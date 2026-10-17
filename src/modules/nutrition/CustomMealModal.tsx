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
      : [],
  )
  const [ingredientSearch, setIngredientSearch] = useState('')

  // Create new custom food item modal/form state
  const [showAddCustomFoodForm, setShowAddCustomFoodForm] = useState(false)
  const [newFoodName, setNewFoodName] = useState('')
  const [newFoodCategory, setNewFoodCategory] =
    useState<FoodItem['categoryAr']>('بروتين ولحوم')
  const [newFoodProtein, setNewFoodProtein] = useState<string>('')
  const [newFoodCarbs, setNewFoodCarbs] = useState<string>('')
  const [newFoodFats, setNewFoodFats] = useState<string>('')
  const [newFoodCaloriesManual, setNewFoodCaloriesManual] = useState<string>('')
  const [isNewFoodManualCalories, setIsNewFoodManualCalories] =
    useState<boolean>(false)

  const nfpNum = parseFloat(newFoodProtein) || 0
  const nfcNum = parseFloat(newFoodCarbs) || 0
  const nffNum = parseFloat(newFoodFats) || 0
  const computedNewFoodCalories = Math.round(
    nfpNum * 4 + nfcNum * 4 + nffNum * 9,
  )
  const activeNewFoodCalories = isNewFoodManualCalories
    ? parseFloat(newFoodCaloriesManual) || 0
    : computedNewFoodCalories

  const newFoodCaloriesDiff =
    computedNewFoodCalories > 0
      ? Math.abs(activeNewFoodCalories - computedNewFoodCalories) /
        computedNewFoodCalories
      : 0
  const showNewFoodCaloriesWarning =
    isNewFoodManualCalories &&
    computedNewFoodCalories > 0 &&
    newFoodCaloriesDiff > 0.1

  // Direct input state
  const [directProtein, setDirectProtein] = useState<string>(
    initialMeal?.proteinGrams !== undefined
      ? String(initialMeal.proteinGrams)
      : '',
  )
  const [directCarbs, setDirectCarbs] = useState<string>(
    initialMeal?.carbsGrams !== undefined ? String(initialMeal.carbsGrams) : '',
  )
  const [directFats, setDirectFats] = useState<string>(
    initialMeal?.fatsGrams !== undefined ? String(initialMeal.fatsGrams) : '',
  )
  const [directCaloriesManual, setDirectCaloriesManual] = useState<string>(
    initialMeal?.calories !== undefined ? String(initialMeal.calories) : '',
  )
  const [isDirectManualCalories, setIsDirectManualCalories] =
    useState<boolean>(false)

  const dpNum = parseFloat(directProtein) || 0
  const dcNum = parseFloat(directCarbs) || 0
  const dfNum = parseFloat(directFats) || 0
  const computedDirectCalories = Math.round(dpNum * 4 + dcNum * 4 + dfNum * 9)
  const activeDirectCalories = isDirectManualCalories
    ? parseFloat(directCaloriesManual) || 0
    : computedDirectCalories

  const directCaloriesDiff =
    computedDirectCalories > 0
      ? Math.abs(activeDirectCalories - computedDirectCalories) /
        computedDirectCalories
      : 0
  const showDirectCaloriesWarning =
    isDirectManualCalories &&
    computedDirectCalories > 0 &&
    directCaloriesDiff > 0.1

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
        calories: Number(activeNewFoodCalories) || 0,
        protein: Number(nfpNum) || 0,
        carbs: Number(nfcNum) || 0,
        fats: Number(nffNum) || 0,
      },
    }

    saveCustomFoodItem(newFood)
    handleAddIngredientDirect(newFood.id, 100)
    setNewFoodName('')
    setNewFoodProtein('')
    setNewFoodCarbs('')
    setNewFoodFats('')
    setNewFoodCaloriesManual('')
    setIsNewFoodManualCalories(false)
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

    let finalCalories = activeDirectCalories
    let finalProtein = dpNum
    let finalCarbs = dcNum
    let finalFats = dfNum
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
        noValidate
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
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800 }}>
                  مكونات الوجبة الحالية
                </h4>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    background: 'var(--card-bg)',
                    border: '1px solid var(--line)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    color: 'var(--ink)',
                  }}
                >
                  {ingredients.length}
                </span>
              </div>
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
                  تسجيل مكوّن غذائي جديد في قائمتك
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
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '10px',
                  }}
                >
                  {/* Calories/100g */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <label style={{ fontSize: '11.5px', fontWeight: 700 }}>
                        سعرات/100 جم
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setIsNewFoodManualCalories(!isNewFoodManualCalories)
                        }
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '11px',
                          color: 'var(--accent)',
                          cursor: 'pointer',
                          padding: 0,
                          textDecoration: 'underline',
                        }}
                      >
                        {isNewFoodManualCalories ? 'حساب تلقائي' : 'تعديل يدوي'}
                      </button>
                    </div>
                    {isNewFoodManualCalories ? (
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder={String(computedNewFoodCalories)}
                        value={newFoodCaloriesManual}
                        onChange={(e) =>
                          setNewFoodCaloriesManual(
                            e.target.value.replace(/[^0-9]/g, ''),
                          )
                        }
                        style={{
                          height: '40px',
                          padding: '0 8px',
                          borderRadius: '8px',
                          border: '1px solid var(--line)',
                          textAlign: 'center',
                          fontSize: '14px',
                          fontWeight: 700,
                          background: 'var(--card-bg)',
                          color: 'var(--ink)',
                          boxSizing: 'border-box',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'var(--card-subtle)',
                          borderRadius: '8px',
                          border: '1px solid var(--line)',
                          fontSize: '14px',
                          fontWeight: 700,
                          color: 'var(--accent)',
                        }}
                      >
                        {computedNewFoodCalories}{' '}
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 400,
                            marginInlineStart: '4px',
                            color: 'var(--muted)',
                          }}
                        >
                          (تلقائي)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Protein/100g */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <label
                      style={{
                        fontSize: '11.5px',
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
                      بروتين/100 جم
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={newFoodProtein}
                      onChange={(e) =>
                        setNewFoodProtein(
                          e.target.value.replace(/[^0-9.]/g, ''),
                        )
                      }
                      placeholder="0"
                      style={{
                        height: '40px',
                        padding: '0 8px',
                        borderRadius: '8px',
                        border: '1px solid var(--line)',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: 700,
                        background: 'var(--card-bg)',
                        color: 'var(--ink)',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Carbs/100g */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <label
                      style={{
                        fontSize: '11.5px',
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
                      كارب/100 جم
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={newFoodCarbs}
                      onChange={(e) =>
                        setNewFoodCarbs(
                          e.target.value.replace(/[^0-9.]/g, ''),
                        )
                      }
                      placeholder="0"
                      style={{
                        height: '40px',
                        padding: '0 8px',
                        borderRadius: '8px',
                        border: '1px solid var(--line)',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: 700,
                        background: 'var(--card-bg)',
                        color: 'var(--ink)',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Fats/100g */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <label
                      style={{
                        fontSize: '11.5px',
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
                      دهون/100 جم
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={newFoodFats}
                      onChange={(e) =>
                        setNewFoodFats(
                          e.target.value.replace(/[^0-9.]/g, ''),
                        )
                      }
                      placeholder="0"
                      style={{
                        height: '40px',
                        padding: '0 8px',
                        borderRadius: '8px',
                        border: '1px solid var(--line)',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: 700,
                        background: 'var(--card-bg)',
                        color: 'var(--ink)',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {showNewFoodCaloriesWarning && (
                  <Callout tone="warning">
                    السعرات المدخلة تختلف بأكثر من 10% عن المحسوبة من الماكروز ({computedNewFoodCalories} سعرة).
                  </Callout>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-primary-action"
                    onClick={handleSaveNewCustomFood}
                    style={{
                      height: '40px',
                      padding: '0 16px',
                      fontSize: '13px',
                      fontWeight: 700,
                      borderRadius: '8px',
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
                      fontWeight: 600,
                      borderRadius: '8px',
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
                      {macros.calories} سعرة • {macros.protein}جم بروتين •{' '}
                      {macros.carbs}جم كارب • {macros.fats}جم دهون
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
                            handleUpdateGrams(idx, Math.max(0, ing.grams - 25))
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
                          {'\u2212'}
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={ing.grams === 0 ? '' : ing.grams}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '')
                            handleUpdateGrams(idx, val === '' ? 0 : Number(val))
                          }}
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
                            marginInlineStart: '4px',
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
                          flexShrink: 0,
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
                إضافة سريعة لمكونات أساسية
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
                    + {quick.name} ({quick.grams}جم)
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
                  ابحث في جميع الأطعمة والمكونات
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
                              ({food.per100g.calories} سعرة •{' '}
                              {food.per100g.protein}جم بروتين / 100جم)
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
                            + أضف ({food.defaultGrams || 100}جم)
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
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'var(--card-subtle)',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid var(--line)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
              }}
            >
              {/* Derived / Manual Calories */}
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <label style={{ fontSize: '12.5px', fontWeight: 700 }}>
                    السعرات (سعرة)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setIsDirectManualCalories(!isDirectManualCalories)
                    }
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '11px',
                      color: 'var(--accent)',
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline',
                    }}
                  >
                    {isDirectManualCalories ? 'حساب تلقائي' : 'تعديل يدوي'}
                  </button>
                </div>
                {isDirectManualCalories ? (
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder={String(computedDirectCalories)}
                    value={directCaloriesManual}
                    onChange={(e) =>
                      setDirectCaloriesManual(
                        e.target.value.replace(/[^0-9]/g, ''),
                      )
                    }
                    style={{
                      height: '48px',
                      padding: '0 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--line)',
                      fontSize: '15px',
                      fontWeight: 700,
                      boxSizing: 'border-box',
                      background: 'var(--card-bg)',
                      color: 'var(--ink)',
                      textAlign: 'center',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--card-bg)',
                      borderRadius: '8px',
                      border: '1.5px solid var(--line)',
                      fontSize: '16px',
                      fontWeight: 800,
                      color: 'var(--accent)',
                    }}
                  >
                    {computedDirectCalories}{' '}
                    <span
                      style={{
                        fontSize: '11.5px',
                        fontWeight: 400,
                        marginInlineStart: '4px',
                        color: 'var(--muted)',
                      }}
                    >
                      (تلقائي)
                    </span>
                  </div>
                )}
              </div>

              {/* Direct Protein */}
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
                  type="text"
                  inputMode="decimal"
                  value={directProtein}
                  onChange={(e) =>
                    setDirectProtein(e.target.value.replace(/[^0-9.]/g, ''))
                  }
                  placeholder="0"
                  style={{
                    height: '48px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--line)',
                    fontSize: '15px',
                    fontWeight: 700,
                    boxSizing: 'border-box',
                    background: 'var(--card-bg)',
                    color: 'var(--ink)',
                    textAlign: 'center',
                  }}
                />
              </div>

              {/* Direct Carbs */}
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
                  type="text"
                  inputMode="decimal"
                  value={directCarbs}
                  onChange={(e) =>
                    setDirectCarbs(e.target.value.replace(/[^0-9.]/g, ''))
                  }
                  placeholder="0"
                  style={{
                    height: '48px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--line)',
                    fontSize: '15px',
                    fontWeight: 700,
                    boxSizing: 'border-box',
                    background: 'var(--card-bg)',
                    color: 'var(--ink)',
                    textAlign: 'center',
                  }}
                />
              </div>

              {/* Direct Fats */}
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
                  type="text"
                  inputMode="decimal"
                  value={directFats}
                  onChange={(e) =>
                    setDirectFats(e.target.value.replace(/[^0-9.]/g, ''))
                  }
                  placeholder="0"
                  style={{
                    height: '48px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--line)',
                    fontSize: '15px',
                    fontWeight: 700,
                    boxSizing: 'border-box',
                    background: 'var(--card-bg)',
                    color: 'var(--ink)',
                    textAlign: 'center',
                  }}
                />
              </div>
            </div>

            {showDirectCaloriesWarning && (
              <Callout tone="warning">
                السعرات المدخلة تختلف بأكثر من 10% عن المحسوبة من الماكروز ({computedDirectCalories} سعرة).
              </Callout>
            )}
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
            إجمالي الوجبة
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
                : activeDirectCalories}{' '}
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
                  : dpNum}
                جم بروتين
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
                  : dcNum}
                جم كارب
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
                  : dfNum}
                جم دهون
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
