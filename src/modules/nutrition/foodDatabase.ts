export interface FoodItem {
  id: string
  nameAr: string
  categoryAr:
    | 'بروتين ولحوم'
    | 'نشويات وكارب'
    | 'ألبان وأجبان'
    | 'بقوليات'
    | 'دهون ومكسرات'
    | 'فواكه وخضار'
    | 'مكملات وسناكس'
  servingUnitAr: string
  defaultGrams: number
  per100g: {
    calories: number
    protein: number
    carbs: number
    fats: number
  }
}

export interface CustomMealIngredient {
  foodItemId: string
  grams: number
}

export interface CustomMeal {
  id: string
  nameAr: string
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  notesAr?: string
  ingredients?: CustomMealIngredient[]
  totalGrams?: number
  calories: number
  proteinGrams: number
  carbsGrams: number
  fatsGrams: number
  isCustom: true
  createdAt: string
}

export const FOOD_DATABASE: FoodItem[] = [
  // --- بروتين ولحوم ---
  {
    id: 'chicken-breast-cooked',
    nameAr: 'صدور دجاج مشوية / مسلوقة',
    categoryAr: 'بروتين ولحوم',
    servingUnitAr: 'جرام',
    defaultGrams: 150,
    per100g: { calories: 165, protein: 31, carbs: 0, fats: 3.6 },
  },
  {
    id: 'chicken-breast-raw',
    nameAr: 'صدور دجاج نيئة',
    categoryAr: 'بروتين ولحوم',
    servingUnitAr: 'جرام',
    defaultGrams: 150,
    per100g: { calories: 120, protein: 22.5, carbs: 0, fats: 2.5 },
  },
  {
    id: 'lean-beef-ground',
    nameAr: 'لحم بقري مفروم قليل الدهن (90% صافي)',
    categoryAr: 'بروتين ولحوم',
    servingUnitAr: 'جرام',
    defaultGrams: 150,
    per100g: { calories: 215, protein: 26, carbs: 0, fats: 12 },
  },
  {
    id: 'tuna-water',
    nameAr: 'تونة معلبة مصفاة بالماء (دايت)',
    categoryAr: 'بروتين ولحوم',
    servingUnitAr: 'جرام (علبة ~140ج)',
    defaultGrams: 140,
    per100g: { calories: 116, protein: 25.5, carbs: 0, fats: 1 },
  },
  {
    id: 'tuna-oil',
    nameAr: 'تونة معلبة بالزيت مصفاة',
    categoryAr: 'بروتين ولحوم',
    servingUnitAr: 'جرام (علبة ~140ج)',
    defaultGrams: 140,
    per100g: { calories: 185, protein: 26, carbs: 0, fats: 9 },
  },
  {
    id: 'tilapia-fish',
    nameAr: 'سمك بلطي مشوي',
    categoryAr: 'بروتين ولحوم',
    servingUnitAr: 'جرام',
    defaultGrams: 200,
    per100g: { calories: 128, protein: 26, carbs: 0, fats: 2.7 },
  },
  {
    id: 'salmon-cooked',
    nameAr: 'سمك سلمون مشوي',
    categoryAr: 'بروتين ولحوم',
    servingUnitAr: 'جرام',
    defaultGrams: 150,
    per100g: { calories: 206, protein: 22, carbs: 0, fats: 12.3 },
  },
  {
    id: 'egg-whole',
    nameAr: 'بيض كامل مسلوق / مقلي (بيضة ~50ج)',
    categoryAr: 'بروتين ولحوم',
    servingUnitAr: 'جرام (البيضة 50ج)',
    defaultGrams: 100, // 2 eggs
    per100g: { calories: 143, protein: 12.6, carbs: 0.7, fats: 9.5 },
  },
  {
    id: 'egg-whites',
    nameAr: 'بياض بيض (بدون صفار)',
    categoryAr: 'بروتين ولحوم',
    servingUnitAr: 'جرام (بياض بيضة ~33ج)',
    defaultGrams: 100,
    per100g: { calories: 52, protein: 10.9, carbs: 0.7, fats: 0.2 },
  },

  // --- ألبان وأجبان ومكملات ---
  {
    id: 'cottage-cheese',
    nameAr: 'جبنة قريش فلاحي مصرية',
    categoryAr: 'ألبان وأجبان',
    servingUnitAr: 'جرام',
    defaultGrams: 150,
    per100g: { calories: 98, protein: 11.5, carbs: 3.4, fats: 4.3 },
  },
  {
    id: 'greek-yogurt-plain',
    nameAr: 'زبادي يوناني سادة قليل الدسم',
    categoryAr: 'ألبان وأجبان',
    servingUnitAr: 'جرام',
    defaultGrams: 170,
    per100g: { calories: 73, protein: 10, carbs: 3.8, fats: 1.9 },
  },
  {
    id: 'plain-yogurt',
    nameAr: 'زبادي بلدي كامل الدسم',
    categoryAr: 'ألبان وأجبان',
    servingUnitAr: 'جرام (علبة ~105ج)',
    defaultGrams: 105,
    per100g: { calories: 61, protein: 3.5, carbs: 4.7, fats: 3.3 },
  },
  {
    id: 'milk-whole',
    nameAr: 'حليب بقري كامل الدسم',
    categoryAr: 'ألبان وأجبان',
    servingUnitAr: 'ملل/جرام (كوب ~200ج)',
    defaultGrams: 200,
    per100g: { calories: 62, protein: 3.2, carbs: 4.8, fats: 3.3 },
  },
  {
    id: 'milk-skimmed',
    nameAr: 'حليب خالي الدسم',
    categoryAr: 'ألبان وأجبان',
    servingUnitAr: 'ملل/جرام (كوب ~200ج)',
    defaultGrams: 200,
    per100g: { calories: 35, protein: 3.4, carbs: 5, fats: 0.1 },
  },
  {
    id: 'whey-protein',
    nameAr: 'مسحوق واي بروتين (سكوب ~30ج)',
    categoryAr: 'مكملات وسناكس',
    servingUnitAr: 'جرام (سكوب = 30ج)',
    defaultGrams: 30,
    per100g: { calories: 385, protein: 78, carbs: 7.5, fats: 4.5 },
  },

  // --- نشويات وكارب ---
  {
    id: 'cooked-white-rice',
    nameAr: 'أرز أبيض مصري مسلوق',
    categoryAr: 'نشويات وكارب',
    servingUnitAr: 'جرام',
    defaultGrams: 200,
    per100g: { calories: 130, protein: 2.7, carbs: 28, fats: 0.3 },
  },
  {
    id: 'cooked-basmati-rice',
    nameAr: 'أرز بسمتي مسلوق',
    categoryAr: 'نشويات وكارب',
    servingUnitAr: 'جرام',
    defaultGrams: 200,
    per100g: { calories: 121, protein: 3, carbs: 25.2, fats: 0.4 },
  },
  {
    id: 'raw-oats',
    nameAr: 'شوفان حبة كاملة خام',
    categoryAr: 'نشويات وكارب',
    servingUnitAr: 'جرام',
    defaultGrams: 50,
    per100g: { calories: 389, protein: 16.9, carbs: 66.3, fats: 6.9 },
  },
  {
    id: 'boiled-potato',
    nameAr: 'بطاطس مسلوقة / مهروسة',
    categoryAr: 'نشويات وكارب',
    servingUnitAr: 'جرام',
    defaultGrams: 200,
    per100g: { calories: 87, protein: 1.9, carbs: 20.1, fats: 0.1 },
  },
  {
    id: 'sweet-potato',
    nameAr: 'بطاطا حلوة مشوية',
    categoryAr: 'نشويات وكارب',
    servingUnitAr: 'جرام',
    defaultGrams: 200,
    per100g: { calories: 86, protein: 1.6, carbs: 20.1, fats: 0.1 },
  },
  {
    id: 'cooked-pasta',
    nameAr: 'مكرونة مسلوقة',
    categoryAr: 'نشويات وكارب',
    servingUnitAr: 'جرام',
    defaultGrams: 180,
    per100g: { calories: 158, protein: 5.8, carbs: 30.9, fats: 0.9 },
  },
  {
    id: 'baladi-bread',
    nameAr: 'عيش بلدي مصري بالردة (رغيف ~90ج)',
    categoryAr: 'نشويات وكارب',
    servingUnitAr: 'جرام (الرغيف 90ج)',
    defaultGrams: 90,
    per100g: { calories: 245, protein: 8.5, carbs: 50, fats: 1.2 },
  },
  {
    id: 'brown-toast',
    nameAr: 'توست بني حبوب كاملة (شريحة ~30ج)',
    categoryAr: 'نشويات وكارب',
    servingUnitAr: 'جرام (شريحة = 30ج)',
    defaultGrams: 60, // 2 slices
    per100g: { calories: 247, protein: 9, carbs: 45, fats: 3.5 },
  },

  // --- بقوليات ---
  {
    id: 'cooked-fava-beans',
    nameAr: 'فول مدمس مسلوق (بدون زيت)',
    categoryAr: 'بقوليات',
    servingUnitAr: 'جرام',
    defaultGrams: 150,
    per100g: { calories: 110, protein: 7.6, carbs: 19.5, fats: 0.5 },
  },
  {
    id: 'cooked-lentils',
    nameAr: 'عدس أصفر / أسود مطبوخ',
    categoryAr: 'بقوليات',
    servingUnitAr: 'جرام',
    defaultGrams: 150,
    per100g: { calories: 116, protein: 9, carbs: 20, fats: 0.4 },
  },
  {
    id: 'cooked-chickpeas',
    nameAr: 'حمص شام مسلوق',
    categoryAr: 'بقوليات',
    servingUnitAr: 'جرام',
    defaultGrams: 100,
    per100g: { calories: 164, protein: 8.9, carbs: 27.4, fats: 2.6 },
  },

  // --- دهون ومكسرات ---
  {
    id: 'olive-oil',
    nameAr: 'زيت زيتون بكر ممتاز',
    categoryAr: 'دهون ومكسرات',
    servingUnitAr: 'جرام (ملعقة طعام = 10ج)',
    defaultGrams: 10,
    per100g: { calories: 884, protein: 0, carbs: 0, fats: 100 },
  },
  {
    id: 'peanut-butter',
    nameAr: 'زبدة فول سوداني طبيعية 100%',
    categoryAr: 'دهون ومكسرات',
    servingUnitAr: 'جرام (ملعقة = 15ج)',
    defaultGrams: 20,
    per100g: { calories: 588, protein: 25, carbs: 20, fats: 50 },
  },
  {
    id: 'mixed-nuts',
    nameAr: 'مكسرات نيئة (لوز وكاجو وعين جمل)',
    categoryAr: 'دهون ومكسرات',
    servingUnitAr: 'جرام (قبضة يد = 30ج)',
    defaultGrams: 30,
    per100g: { calories: 607, protein: 20, carbs: 20, fats: 54 },
  },
  {
    id: 'chia-seeds',
    nameAr: 'بذور الشيا',
    categoryAr: 'دهون ومكسرات',
    servingUnitAr: 'جرام',
    defaultGrams: 15,
    per100g: { calories: 486, protein: 16.5, carbs: 42.1, fats: 30.7 },
  },

  // --- فواكه وخضار ومحليات ---
  {
    id: 'honey-raw',
    nameAr: 'عسل نحل طبيعي',
    categoryAr: 'فواكه وخضار',
    servingUnitAr: 'جرام (ملعقة = 15ج)',
    defaultGrams: 15,
    per100g: { calories: 304, protein: 0.3, carbs: 82.4, fats: 0 },
  },
  {
    id: 'banana-fresh',
    nameAr: 'موز طازج (موزة متوسطة ~110ج)',
    categoryAr: 'فواكه وخضار',
    servingUnitAr: 'جرام',
    defaultGrams: 110,
    per100g: { calories: 89, protein: 1.1, carbs: 22.8, fats: 0.3 },
  },
  {
    id: 'dates-fresh',
    nameAr: 'تمر / بلح مجدول (حبة ~20ج)',
    categoryAr: 'فواكه وخضار',
    servingUnitAr: 'جرام (3 حبات = 60ج)',
    defaultGrams: 60,
    per100g: { calories: 277, protein: 1.8, carbs: 75, fats: 0.2 },
  },
  {
    id: 'apple-fresh',
    nameAr: 'تفاح طازج',
    categoryAr: 'فواكه وخضار',
    servingUnitAr: 'جرام (تفاحة ~150ج)',
    defaultGrams: 150,
    per100g: { calories: 52, protein: 0.3, carbs: 13.8, fats: 0.2 },
  },
  {
    id: 'tomato-fresh',
    nameAr: 'طماطم طازجة',
    categoryAr: 'فواكه وخضار',
    servingUnitAr: 'جرام',
    defaultGrams: 100,
    per100g: { calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2 },
  },
  {
    id: 'cucumber-fresh',
    nameAr: 'خيار طازج',
    categoryAr: 'فواكه وخضار',
    servingUnitAr: 'جرام',
    defaultGrams: 100,
    per100g: { calories: 15, protein: 0.7, carbs: 3.6, fats: 0.1 },
  },
  {
    id: 'broccoli-cooked',
    nameAr: 'بروكلي مسلوق / على البخار',
    categoryAr: 'فواكه وخضار',
    servingUnitAr: 'جرام',
    defaultGrams: 100,
    per100g: { calories: 35, protein: 2.4, carbs: 7.2, fats: 0.4 },
  },
]

export function getFoodItemById(id: string): FoodItem | undefined {
  return FOOD_DATABASE.find((item) => item.id === id)
}

export function calculateIngredientMacros(
  foodItem: FoodItem,
  grams: number,
): { calories: number; protein: number; carbs: number; fats: number } {
  const ratio = Math.max(0, grams) / 100
  return {
    calories: Math.round(foodItem.per100g.calories * ratio),
    protein: Math.round(foodItem.per100g.protein * ratio * 10) / 10,
    carbs: Math.round(foodItem.per100g.carbs * ratio * 10) / 10,
    fats: Math.round(foodItem.per100g.fats * ratio * 10) / 10,
  }
}

export function calculateCustomMealTotals(
  ingredients: CustomMealIngredient[],
): {
  totalGrams: number
  calories: number
  proteinGrams: number
  carbsGrams: number
  fatsGrams: number
} {
  let totalGrams = 0
  let calories = 0
  let proteinGrams = 0
  let carbsGrams = 0
  let fatsGrams = 0

  ingredients.forEach((ing) => {
    const food = getFoodItemById(ing.foodItemId)
    if (!food) return
    const macros = calculateIngredientMacros(food, ing.grams)
    totalGrams += ing.grams
    calories += macros.calories
    proteinGrams += macros.protein
    carbsGrams += macros.carbs
    fatsGrams += macros.fats
  })

  return {
    totalGrams,
    calories: Math.round(calories),
    proteinGrams: Math.round(proteinGrams * 10) / 10,
    carbsGrams: Math.round(carbsGrams * 10) / 10,
    fatsGrams: Math.round(fatsGrams * 10) / 10,
  }
}
