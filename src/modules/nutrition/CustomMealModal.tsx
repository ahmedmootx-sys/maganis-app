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
import { Select } from '../../components/Select'

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
    if (!newFoodName.trim()) {
      alert('يرجى إدخال اسم المكوّن الغذائي')
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
    // Add to current meal immediately
    handleAddIngredientDirect(newFood.id, 100)
    // Reset form
    setNewFoodName('')
    setShowAddCustomFoodForm(false)
    setIngredientSearch('')
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

  const QUICK_STAPLES = [
    { id: 'chicken-breast-cooked', name: '🍗 صدور فراخ', grams: 150 },
    { id: 'cooked-white-rice', name: '🍚 أرز مطبوخ', grams: 200 },
    { id: 'raw-oats', name: '🥣 شوفان', grams: 60 },
    { id: 'egg-whole', name: '🥚 بيض مسلوق', grams: 100 },
    { id: 'tuna-water', name: '🐟 تونة مصفاة', grams: 140 },
    { id: 'cottage-cheese', name: '🧀 جبنة قريش', grams: 150 },
    { id: 'boiled-potato', name: '🥔 بطاطس مسلوقة', grams: 200 },
    { id: 'whey-protein', name: '🥤 واي بروتين', grams: 30 },
    { id: 'olive-oil', name: '🫒 زيت زيتون', grams: 10 },
  ]

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
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
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
            borderBottom: '1px solid var(--line)',
            paddingBottom: '12px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
            {initialMeal
              ? '✏️ تعديل الوجبة الخاصة'
              : '✨ تصميم وجبة خاصة وحساب الماكروز'}
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
              placeholder="مثال: غداء الضخامة (فراخ وأرز وسلطة)"
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
              ).map(([catKey, catLabel]) => {
                const isSelected = category === catKey
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    style={{
                      padding: '8px 4px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      borderRadius: '8px',
                      border: isSelected
                        ? '2px solid var(--accent)'
                        : '1px solid var(--line)',
                      background: isSelected
                        ? 'var(--accent)'
                        : 'var(--card-bg)',
                      color: isSelected ? '#ffffff' : 'var(--ink)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {catLabel}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Mode Switcher */}
          <div
            style={{
              display: 'flex',
              background: 'var(--card-subtle)',
              padding: '4px',
              borderRadius: '10px',
              marginBottom: '16px',
              border: '1px solid var(--line)',
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
                background:
                  mode === 'ingredients' ? 'var(--card-bg)' : 'transparent',
                color:
                  mode === 'ingredients' ? 'var(--accent)' : 'var(--muted)',
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
                background:
                  mode === 'direct' ? 'var(--card-bg)' : 'transparent',
                color: mode === 'direct' ? 'var(--accent)' : 'var(--muted)',
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
                background: 'var(--card-subtle)',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid var(--line)',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                  flexWrap: 'wrap',
                  gap: '6px',
                }}
              >
                <h4 style={{ margin: 0, fontSize: '14px' }}>
                  🥗 مكونات الوجبة الحالية ({ingredients.length}):
                </h4>
                <button
                  type="button"
                  className="chip-btn"
                  onClick={() => setShowAddCustomFoodForm((prev) => !prev)}
                  style={{
                    fontSize: '12px',
                    padding: '4px 10px',
                    background: showAddCustomFoodForm
                      ? 'var(--accent)'
                      : 'var(--card-bg)',
                    color: showAddCustomFoodForm ? '#fff' : 'var(--accent)',
                    border: '1px solid var(--accent)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {showAddCustomFoodForm
                    ? '✕ إغلاق النموذج'
                    : '➕ مكوّن غذائي خاص جديد'}
                </button>
              </div>

              {/* Add Custom Food Form */}
              {showAddCustomFoodForm && (
                <div
                  style={{
                    background: 'var(--card-bg)',
                    border: '1.5px dashed var(--accent)',
                    padding: '12px',
                    borderRadius: '10px',
                    marginBottom: '14px',
                  }}
                >
                  <h5 style={{ margin: '0 0 8px', fontSize: '13.5px' }}>
                    ✨ تسجيل طعام أو مكوّن غذائي جديد في قائمتك:
                  </h5>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      marginBottom: '8px',
                    }}
                  >
                    <div>
                      <label style={{ fontSize: '12px', display: 'block' }}>
                        اسم الطعام (مثال: بروتين بار):
                      </label>
                      <input
                        type="text"
                        className="field-input"
                        value={newFoodName}
                        onChange={(e) => setNewFoodName(e.target.value)}
                        placeholder="اسم المكوّن"
                        style={{ width: '100%', padding: '6px 8px' }}
                      />
                    </div>
                    <div style={{ width: '100%' }}>
                      <Select
                        id="new-food-category-select"
                        label="التصنيف الغذائي:"
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
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(90px, 1fr))',
                      gap: '6px',
                      marginBottom: '10px',
                    }}
                  >
                    <div>
                      <label style={{ fontSize: '11px', display: 'block' }}>
                        سعرات /100ج:
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="field-input"
                        value={newFoodCalories}
                        onChange={(e) =>
                          setNewFoodCalories(Number(e.target.value))
                        }
                        style={{ width: '100%', padding: '4px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', display: 'block' }}>
                        بروتين /100ج:
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        className="field-input"
                        value={newFoodProtein}
                        onChange={(e) =>
                          setNewFoodProtein(Number(e.target.value))
                        }
                        style={{ width: '100%', padding: '4px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', display: 'block' }}>
                        كارب /100ج:
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        className="field-input"
                        value={newFoodCarbs}
                        onChange={(e) =>
                          setNewFoodCarbs(Number(e.target.value))
                        }
                        style={{ width: '100%', padding: '4px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', display: 'block' }}>
                        دهون /100ج:
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        className="field-input"
                        value={newFoodFats}
                        onChange={(e) => setNewFoodFats(Number(e.target.value))}
                        style={{ width: '100%', padding: '4px' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="button-primary tiny"
                      onClick={handleSaveNewCustomFood}
                    >
                      ✓ حفظ وإضافة للوجبة الآن
                    </button>
                    <button
                      type="button"
                      className="ghost tiny"
                      onClick={() => setShowAddCustomFoodForm(false)}
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {/* Current Ingredients List */}
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
                        background: 'var(--card-bg)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--line)',
                        gap: '8px',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '13px' }}>
                          {food.nameAr}
                        </div>
                        <div
                          style={{ fontSize: '11.5px', color: 'var(--muted)' }}
                        >
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
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateGrams(idx, Math.max(5, ing.grams - 25))
                          }
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 700,
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
                          style={{
                            width: '60px',
                            padding: '4px',
                            textAlign: 'center',
                            borderRadius: '6px',
                            border: '1px solid var(--line)',
                            fontSize: '13px',
                            fontWeight: 700,
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateGrams(idx, ing.grams + 25)}
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 700,
                          }}
                        >
                          +
                        </button>
                        <span
                          style={{ fontSize: '12px', color: 'var(--muted)' }}
                        >
                          جم
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(idx)}
                          style={{
                            background: 'var(--danger-soft)',
                            color: 'var(--danger)',
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

              {/* Add Ingredients: Quick Staples */}
              <div
                style={{
                  background: 'var(--card-bg)',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid var(--line)',
                }}
              >
                <div
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 700,
                    marginBottom: '8px',
                  }}
                >
                  ⚡ إضافة سريعة لمكونات أساسية:
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '5px',
                    marginBottom: '12px',
                  }}
                >
                  {QUICK_STAPLES.map((quick) => (
                    <button
                      key={quick.id}
                      type="button"
                      onClick={() =>
                        handleAddIngredientDirect(quick.id, quick.grams)
                      }
                      style={{
                        padding: '4px 8px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        borderRadius: '6px',
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

                {/* Search Bar for all foods */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      marginBottom: '4px',
                    }}
                  >
                    🔍 ابحث في جميع الأطعمة والمكونات:
                  </label>
                  <input
                    type="text"
                    placeholder="اكتب اسم الطعام (فراخ، لحم، بيض، أرز، شوفان، عدس، تونة، موز...)"
                    value={ingredientSearch}
                    onChange={(e) => setIngredientSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '13px',
                      borderRadius: '6px',
                      border: '1px solid var(--line)',
                    }}
                  />

                  {/* Search Results Display */}
                  {ingredientSearch.trim() && (
                    <div
                      style={{
                        marginTop: '8px',
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
                            padding: '8px',
                            fontSize: '12px',
                            color: 'var(--muted)',
                            textAlign: 'center',
                          }}
                        >
                          لم نجد طعاماً بهذا الاسم. يمكنك الضغط على "➕ مكوّن
                          غذائي خاص جديد" أعلاه لإضافته!
                        </div>
                      ) : (
                        searchResults.map((food) => (
                          <div
                            key={food.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              background: 'var(--card-subtle)',
                              border: '1px solid var(--line)',
                            }}
                          >
                            <div>
                              <strong style={{ fontSize: '12.5px' }}>
                                {food.nameAr}
                              </strong>
                              <span
                                style={{
                                  fontSize: '11px',
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
                              className="button-primary tiny"
                              onClick={() => {
                                handleAddIngredientDirect(
                                  food.id,
                                  food.defaultGrams || 100,
                                )
                                setIngredientSearch('')
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

          {/* MODE 2: DIRECT MACROS INPUT */}
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
              placeholder="مثال: صدور دجاج متبلة مع أرز بسمتي وسلطة خضراء."
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
              💾 حفظ الوجبة في وجباتي
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
