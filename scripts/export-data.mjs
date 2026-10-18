import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { EXERCISES } from '../src/modules/workout/exercises.ts'
import { FOOD_DATABASE } from '../src/modules/nutrition/foodDatabase.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const docsDir = path.join(rootDir, 'docs')

// Read flags
const flagsRaw = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/exercise-flags.json'), 'utf8'))
const flags = flagsRaw.exercises || flagsRaw

// 1. Export Exercises JSON
const exercisesExport = EXERCISES.map(ex => {
  const flag = flags[ex.id] || null
  return {
    id: ex.id,
    nameAr: ex.nameAr,
    nameEn: ex.name,
    category: ex.category,
    equipment: ex.equipment,
    difficulty: ex.difficulty,
    primaryMuscles: ex.targetMusclesAr?.slice(0, 1) || [],
    secondaryMuscles: ex.targetMusclesAr?.slice(1) || [],
    subMuscles: ex.targetSubMusclesAr || [],
    highRisk: Boolean(flag && flag.flagType === 'high_risk'),
    riskReasonAr: flag?.riskReasonAr || null,
    saferAlternatives: flag?.saferAlternatives || [],
    imagesCount: ex.images?.length || 2,
    hasGif: Boolean(ex.gifUrl),
  }
})

fs.writeFileSync(path.join(docsDir, 'library-export.json'), JSON.stringify(exercisesExport, null, 2), 'utf8')
console.log(`✓ Exported ${exercisesExport.length} exercises to docs/library-export.json`)

// 2. Export Exercises CSV
const csvEscape = (val) => {
  if (val === null || val === undefined) return '""'
  const str = String(val).replace(/"/g, '""')
  return `"${str}"`
}

const exCsvHeaders = [
  'id',
  'nameAr',
  'nameEn',
  'category',
  'equipment',
  'difficulty',
  'primaryMuscles',
  'secondaryMuscles',
  'subMuscles',
  'highRisk',
  'riskReasonAr',
]

const exCsvRows = [exCsvHeaders.join(',')]
for (const ex of exercisesExport) {
  const row = [
    csvEscape(ex.id),
    csvEscape(ex.nameAr),
    csvEscape(ex.nameEn),
    csvEscape(ex.category),
    csvEscape(ex.equipment),
    csvEscape(ex.difficulty),
    csvEscape(ex.primaryMuscles.join('; ')),
    csvEscape(ex.secondaryMuscles.join('; ')),
    csvEscape(ex.subMuscles.join('; ')),
    csvEscape(ex.highRisk ? 'true' : 'false'),
    csvEscape(ex.riskReasonAr || ''),
  ]
  exCsvRows.push(row.join(','))
}
fs.writeFileSync(path.join(docsDir, 'library-export.csv'), '\uFEFF' + exCsvRows.join('\n'), 'utf8')
console.log(`✓ Exported ${exercisesExport.length} exercises to docs/library-export.csv`)

// 3. Export Foods CSV
const foodHeaders = [
  'id',
  'nameAr',
  'categoryAr',
  'servingUnitAr',
  'defaultGrams',
  'calories_per100g',
  'protein_per100g',
  'carbs_per100g',
  'fats_per100g',
]

const foodRows = [foodHeaders.join(',')]
for (const food of FOOD_DATABASE) {
  const row = [
    csvEscape(food.id),
    csvEscape(food.nameAr),
    csvEscape(food.categoryAr),
    csvEscape(food.servingUnitAr),
    csvEscape(food.defaultGrams),
    csvEscape(food.per100g.calories),
    csvEscape(food.per100g.protein),
    csvEscape(food.per100g.carbs),
    csvEscape(food.per100g.fats),
  ]
  foodRows.push(row.join(','))
}
fs.writeFileSync(path.join(docsDir, 'foods-export.csv'), '\uFEFF' + foodRows.join('\n'), 'utf8')
console.log(`✓ Exported ${FOOD_DATABASE.length} foods to docs/foods-export.csv`)

// 4. Export Owner Profile Dump
const ownerProfileDump = {
  version: 1,
  exportedAt: new Date().toISOString(),
  profile: {
    id: 'owner-prod-verified',
    name: 'أحمد',
    primaryGoal: 'hypertrophy',
    goals: ['hypertrophy'],
    bodyGoal: 'gain',
    trainingStyle: ['weights'],
    trainingDaysPerWeek: 4,
    splitType: 'upper_lower',
    experienceLevel: 'intermediate',
    equipmentAvailable: ['barbell', 'dumbbell', 'machine', 'cables', 'bodyweight'],
    body: {
      sex: 'male',
      age: 28,
      heightCm: 178,
      weightKg: 80,
      activityLevel: 'moderate',
      lifestyle: 2,
      pace: 'standard',
    },
    medical: {
      hasIssues: true,
      injuryTags: ['الكتف'],
      notes: 'التهاب أوتار خفيف في الكتف الأيمن، تجنب الأوزان الحرة فوق الرأس بأوزان ثقيلة',
    },
    limitations: [
      {
        region: 'shoulder',
        severity: 'moderate',
        notes: 'التهاب أوتار خفيف، استبدال الضغط الحر خلف الرقبة بضغط دمبل أمامي',
      },
    ],
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  nutritionPlan: {
    formula: 'Mifflin-St Jeor (1990)',
    bmr: 1770,
    eat: 324,
    tdee: 2094,
    targetCalories: 2326,
    adjustmentType: 'surplus',
    adjustmentAmount: 232,
    macros: {
      proteinGrams: 144,
      proteinPerKg: 1.8,
      fatsGrams: 65,
      carbsGrams: 292,
    },
    reference: 'Morton et al. BJSM 2018',
  },
}

fs.writeFileSync(
  path.join(docsDir, 'owner-profile-dump.json'),
  JSON.stringify(ownerProfileDump, null, 2),
  'utf8',
)
console.log(`✓ Exported owner profile dump to docs/owner-profile-dump.json`)

