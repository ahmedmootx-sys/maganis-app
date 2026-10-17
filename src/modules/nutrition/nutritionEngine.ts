import type { UserProfile } from '../onboarding/types.ts'
import { fmtDate } from '../../utils/bidi.ts'

/**
 * Evidence-Based Nutrition & Calorie/Macro Calculation Engine
 * Pure functions only — no DOM dependencies.
 *
 * Scientific references:
 * - Mifflin et al. (1990) Am J Clin Nutr (Mifflin-St Jeor BMR equation)
 * - Katch & McArdle (1996) (Katch-McArdle BMR equation based on LBM)
 * - Ainsworth et al. (2011) Med Sci Sports Exerc (Compendium of Physical Activities MET values)
 * - Morton et al. (2018) Br J Sports Med (Protein intake plateau at ~1.6 g/kg)
 * - Boer (1984) (Lean body mass estimation without body fat %)
 */

export type Sex = 'male' | 'female'
export type LifestyleLevel = 1 | 2 | 3 | 4 | 5
export type WorkoutType = 'resistance' | 'cardio'
export type WorkoutIntensity = 'light' | 'moderate' | 'hard'
export type NutritionGoal = 'gain' | 'maintain' | 'lose'
export type NutritionPace = 'slow' | 'standard' | 'fast'
export type FormulaChoice = 'auto' | 'mifflin' | 'katch'

export interface WorkoutBlockInput {
  type: WorkoutType
  sessionsPerWeek: number
  minutesPerSession: number
  intensity: WorkoutIntensity
  durationMinutes?: number
}

export interface NutritionEngineInput {
  sex: Sex
  age: number
  weightKg: number
  heightCm: number
  bodyFatPercent?: number
  lifestyle: LifestyleLevel
  workoutBlocks: WorkoutBlockInput[]
  goal: NutritionGoal
  pace?: NutritionPace
  formulaOverride?: FormulaChoice
  proteinPerKgOverride?: number
}

export interface MacroDetail {
  grams: number
  calories: number
  percentOfCalories: number
  gramsPerKg: number
}

export interface NutritionCalculationResult {
  bmr: number
  formulaUsed: 'mifflin' | 'katch'
  lbmKg?: number
  lbmBasis: 'measured_bf' | 'boer' | 'none'
  lifestyleFactor: number
  eatDailyKcal: number
  tdee: number
  tdeeRange: { min: number; max: number }
  goal: NutritionGoal
  pace: NutritionPace
  ratePercentOfBW: number
  adjustmentKcal: number
  rawTargetCalories: number
  targetCalories: number
  displayCalories: number
  floorBound: boolean
  floorKcal: number
  protein: MacroDetail & {
    rangeMin: number
    rangeMax: number
    basis: 'body_weight' | 'lean_mass'
    isCapApplied: boolean
  }
  fat: MacroDetail & {
    isFloorApplied: boolean
    isCapApplied: boolean
  }
  carbs: MacroDetail
  waterLiters: number
  warningsAr: string[]
  explanationAr: {
    formula: string
    bmrText: string
    lifestyleText: string
    eatText: string
    tdeeRangeText: string
    rateText: string
    adjustmentText: string
    proteinBasisText: string
  }
}

export interface WeightLogEntry {
  date: string // YYYY-MM-DD
  weightKg: number
}

export interface IntakeLogEntry {
  date: string // YYYY-MM-DD
  calories: number
}

export interface CalibrationResult {
  canCalibrate: boolean
  reasonAr: string
  daysSpan?: number
  logsCount?: number
  slopeKgPerWeek?: number
  avgLoggedIntake?: number
  usedLoggedIntake?: boolean
  tdeeObserved?: number
  tdeeNew?: number
  newTargetCalories?: number
  changeKcal?: number
}

// --- MET Table (2011 Compendium of Physical Activities) ---
export const MET_TABLE: Record<
  WorkoutType,
  Record<WorkoutIntensity, number>
> = {
  resistance: {
    light: 3.5,
    moderate: 5.0,
    hard: 6.0,
  },
  cardio: {
    light: 4.0,
    moderate: 7.0,
    hard: 10.0,
  },
}

export interface LifestyleOption {
  level: LifestyleLevel
  value: LifestyleLevel
  factor: number
  multiplier: number
  titleAr: string
  labelAr: string
  descriptionAr: string
}

export const LIFESTYLE_FACTORS: Record<LifestyleLevel, number> = {
  1: 1.2, // desk / sedentary
  2: 1.35, // light active / some walking
  3: 1.5, // moderate active / on feet most of day
  4: 1.65, // very active / continuous physical effort
  5: 1.8, // heavy manual labor / exceptional physical effort
}

export const LIFESTYLE_OPTIONS: LifestyleOption[] = [
  {
    level: 1,
    value: 1,
    factor: 1.2,
    multiplier: 1.2,
    titleAr: 'مكتبي أو طالب (خامل غالباً)',
    labelAr: '1 = مكتبي أو طالب (خامل غالباً)',
    descriptionAr: 'معظم اليوم جلوس بلا حركة تذكر طوال ساعات اليوم',
  },
  {
    level: 2,
    value: 2,
    factor: 1.35,
    multiplier: 1.35,
    titleAr: 'حركة يومية خفيفة مع مشي متقطع',
    labelAr: '2 = حركة يومية خفيفة مع مشي متقطع',
    descriptionAr: 'أعمال مكتبية أو منزلية مع فترات مشي متقطعة أو تنقل خفيف',
  },
  {
    level: 3,
    value: 3,
    factor: 1.5,
    multiplier: 1.5,
    titleAr: 'وقوف وحركة نشطة أغلب اليوم',
    labelAr: '3 = وقوف وحركة نشطة أغلب اليوم',
    descriptionAr: 'وظيفة تتطلب الوقوف أو المشي المستمر كالتعليم أو المبيعات',
  },
  {
    level: 4,
    value: 4,
    factor: 1.65,
    multiplier: 1.65,
    titleAr: 'عمل بدني شاق ومجهود مستمر',
    labelAr: '4 = عمل بدني شاق ومجهود مستمر',
    descriptionAr: 'نشاط بدني مكثف طوال اليوم كالبناء أو التحميل أو التوصيل',
  },
  {
    level: 5,
    value: 5,
    factor: 1.8,
    multiplier: 1.8,
    titleAr: 'مجهود بدني شاق واستثنائي طوال اليوم',
    labelAr: '5 = مجهود بدني شاق واستثنائي طوال اليوم',
    descriptionAr: 'أعمال شاقة للغاية وحركة متواصلة مجهدة طوال ساعات اليوم',
  },
]

/**
 * Canonical mapping from legacy 5 activity levels to 5 daily lifestyle levels (excluding exercise).
 */
export function mapLegacyActivityToLifestyle(
  level: string | undefined,
): LifestyleLevel {
  switch (level) {
    case 'sedentary':
      return 1
    case 'light':
      return 2
    case 'moderate':
      return 3
    case 'active':
      return 4
    case 'very_active':
      return 5
    default:
      return 2
  }
}

/**
 * Backward compatibility: maps lifestyle level back to legacy activity level key.
 */
export function mapLifestyleToLegacyActivity(
  level: LifestyleLevel,
): 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' {
  switch (level) {
    case 1:
      return 'sedentary'
    case 2:
      return 'light'
    case 3:
      return 'moderate'
    case 4:
      return 'active'
    case 5:
      return 'very_active'
    default:
      return 'moderate'
  }
}

// --- Validation ---
export function validateNutritionInput(input: Partial<NutritionEngineInput>): {
  isValid: boolean
  errorsAr: Record<string, string>
} {
  const errorsAr: Record<string, string> = {}

  if (!input.sex || (input.sex !== 'male' && input.sex !== 'female')) {
    errorsAr.sex = 'يرجى تحديد الجنس (ذكر أو أنثى).'
  }

  if (typeof input.age !== 'number' || isNaN(input.age)) {
    errorsAr.age = 'يرجى إدخال العمر.'
  } else if (input.age <= 0 || input.age > 120) {
    errorsAr.age = 'العمر غير منطقي (يجب أن يكون بين 1 و 120 سنة).'
  }

  if (typeof input.weightKg !== 'number' || isNaN(input.weightKg)) {
    errorsAr.weightKg = 'يرجى إدخال الوزن بالكيلوجرام.'
  } else if (input.weightKg < 30 || input.weightKg > 350) {
    errorsAr.weightKg = 'الوزن يجب أن يكون بين 30 و 350 كجم.'
  }

  if (typeof input.heightCm !== 'number' || isNaN(input.heightCm)) {
    errorsAr.heightCm = 'يرجى إدخال الطول بالسنتيمتر.'
  } else if (input.heightCm < 100 || input.heightCm > 250) {
    errorsAr.heightCm = 'الطول يجب أن يكون بين 100 و 250 سم.'
  }

  if (
    typeof input.bodyFatPercent === 'number' &&
    !isNaN(input.bodyFatPercent)
  ) {
    if (input.bodyFatPercent < 3 || input.bodyFatPercent > 70) {
      errorsAr.bodyFatPercent = 'نسبة الدهون يجب أن تكون بين 3% و 70%.'
    }
  }

  if (input.lifestyle && ![1, 2, 3, 4, 5].includes(input.lifestyle)) {
    errorsAr.lifestyle = 'يرجى اختيار نمط النشاط اليومي بين 1 و 5.'
  }

  if (input.workoutBlocks && input.workoutBlocks.length > 3) {
    errorsAr.workoutBlocks = 'الحد الأقصى لجلسات التمرين اليومية هو 3 فئات.'
  }

  // Safety checks
  if (input.age !== undefined && input.age < 18 && input.goal === 'lose') {
    errorsAr.goal =
      'استشر طبيباً مختصاً — يمنع فرض عجز سعرات حرارية لمن هم دون سن 18 عاماً لضمان النمو الصحي.'
  }

  if (
    input.weightKg !== undefined &&
    input.heightCm !== undefined &&
    input.weightKg > 0 &&
    input.heightCm > 0
  ) {
    const bmi = input.weightKg / (input.heightCm / 100) ** 2
    if (bmi < 18.5 && input.goal === 'lose') {
      errorsAr.goal =
        'مؤشر كتلة جسمك أقل من 18.5 (نحافة) — لا يمكن اتباع نظام لتخفيض الوزن حفاظاً على صحتك.'
    }
  }

  if (
    input.proteinPerKgOverride !== undefined &&
    !isNaN(input.proteinPerKgOverride)
  ) {
    if (input.proteinPerKgOverride < 1.4 || input.proteinPerKgOverride > 2.4) {
      errorsAr.proteinPerKgOverride =
        'معامل البروتين المخصص يجب أن يكون بين 1.4 و 2.4 جم/كجم.'
    }
  }

  return {
    isValid: Object.keys(errorsAr).length === 0,
    errorsAr,
  }
}

// --- BMR Calculation ---
export function calculateBMR(
  sex: Sex,
  weightKg: number,
  heightCm: number,
  age: number,
  bodyFatPercent?: number,
  formulaOverride: FormulaChoice = 'auto',
): { bmr: number; formulaUsed: 'mifflin' | 'katch'; lbmKg?: number } {
  const hasBf =
    typeof bodyFatPercent === 'number' &&
    !isNaN(bodyFatPercent) &&
    bodyFatPercent > 0

  const useKatch =
    formulaOverride === 'katch' || (formulaOverride === 'auto' && hasBf)

  if (useKatch && hasBf) {
    const lbmKg = weightKg * (1 - bodyFatPercent! / 100)
    const bmr = 370 + 21.6 * lbmKg
    return {
      bmr,
      formulaUsed: 'katch',
      lbmKg,
    }
  }

  // Mifflin-St Jeor
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  const bmr = sex === 'male' ? base + 5 : base - 161
  return {
    bmr,
    formulaUsed: 'mifflin',
  }
}

// --- EAT (Exercise Activity Thermogenesis) ---
export function calculateEAT(
  weightKg: number,
  workoutBlocks: WorkoutBlockInput[],
): number {
  if (!workoutBlocks || workoutBlocks.length === 0) return 0

  let totalDailyEAT = 0
  for (const block of workoutBlocks) {
    const met = MET_TABLE[block.type]?.[block.intensity] ?? 5.0
    const minutes = block.minutesPerSession ?? block.durationMinutes ?? 60
    const sessions = block.sessionsPerWeek ?? 4
    // EAT = (MET - 1) * kg * (minutes/60) * 1.10 * sessions/7
    const blockDaily =
      (met - 1) * weightKg * (minutes / 60) * 1.1 * (sessions / 7)
    totalDailyEAT += blockDaily
  }

  return totalDailyEAT
}

// --- Lean Body Mass Estimation (Boer Formula) ---
export function calculateBoerLBM(
  sex: Sex,
  weightKg: number,
  heightCm: number,
): number {
  if (sex === 'male') {
    return 0.407 * weightKg + 0.267 * heightCm - 19.2
  }
  return 0.252 * weightKg + 0.473 * heightCm - 48.3
}

// --- Main Calculator Function ---
export function calculateNutritionTargets(
  input: NutritionEngineInput,
): NutritionCalculationResult {
  const validation = validateNutritionInput(input)
  if (!validation.isValid) {
    const firstError = Object.values(validation.errorsAr)[0]
    throw new Error(firstError)
  }

  const {
    sex,
    age,
    weightKg,
    heightCm,
    bodyFatPercent,
    lifestyle,
    workoutBlocks = [],
    goal,
    pace = 'standard',
    formulaOverride = 'auto',
    proteinPerKgOverride,
  } = input

  const warningsAr: string[] = []

  // 1. BMR
  const {
    bmr: rawBmr,
    formulaUsed,
    lbmKg: measuredLbm,
  } = calculateBMR(
    sex,
    weightKg,
    heightCm,
    age,
    bodyFatPercent,
    formulaOverride,
  )
  const bmr = rawBmr

  // 2. TDEE
  const lifestyleFactor = LIFESTYLE_FACTORS[lifestyle] ?? 1.35
  const eatDailyKcal = calculateEAT(weightKg, workoutBlocks)
  const tdee = bmr * lifestyleFactor + eatDailyKcal
  const tdeeRange = {
    min: Math.round(tdee * 0.9),
    max: Math.round(tdee * 1.1),
  }

  // 3. Calorie Target (Rate-based, 7700 kcal per kg)
  let ratePercentOfBW = 0
  let adjustmentKcal = 0
  let rawTarget = tdee
  let floorBound = false

  const floorKcal = Math.max(bmr, sex === 'male' ? 1500 : 1200)

  if (goal === 'gain') {
    // slow: 0.25%, standard: 0.40%, fast: 0.60%
    ratePercentOfBW = pace === 'slow' ? 0.25 : pace === 'fast' ? 0.6 : 0.4
    const rawSurplus = (ratePercentOfBW / 100) * weightKg * (7700 / 7)
    // clamped to [150, 20% of TDEE]
    const maxSurplus = 0.2 * tdee
    adjustmentKcal = Math.min(Math.max(rawSurplus, 150), maxSurplus)
    rawTarget = tdee + adjustmentKcal
  } else if (goal === 'lose') {
    // Is lean? M < 12%, F < 20%
    const isLean =
      typeof bodyFatPercent === 'number' &&
      !isNaN(bodyFatPercent) &&
      (sex === 'male' ? bodyFatPercent < 12 : bodyFatPercent < 20)

    let requestedRate = pace === 'slow' ? 0.5 : pace === 'fast' ? 1.0 : 0.75
    if (isLean && requestedRate > 0.5) {
      requestedRate = 0.5
      warningsAr.push(
        'نسبة دهونك منخفضة بالفعل؛ تم ضبط وتيرة التنشيف تلقائياً على 0.5% أسبوعياً كحد أقصى لمنع خسارة الكتلة العضلية.',
      )
    }
    ratePercentOfBW = requestedRate
    const rawDeficit = (ratePercentOfBW / 100) * weightKg * (7700 / 7)
    // clamped to <= 25% of TDEE
    const maxDeficit = 0.25 * tdee
    adjustmentKcal = -Math.min(rawDeficit, maxDeficit)
    rawTarget = tdee + adjustmentKcal

    if (rawTarget < floorKcal) {
      rawTarget = floorKcal
      floorBound = true
      warningsAr.push(
        'هذا المعدل عنيف جداً بالنسبة لحجم جسمك، تم رفع السعرات إلى الحد الأدنى الآمن للحفاظ على صحتك ومعدل حرقك الأساسي.',
      )
    }
  } else {
    // maintain
    ratePercentOfBW = 0
    adjustmentKcal = 0
    rawTarget = tdee
  }

  const targetCalories = rawTarget

  // 4. Protein calculation
  const bmi = weightKg / (heightCm / 100) ** 2
  const hasBf =
    typeof bodyFatPercent === 'number' &&
    !isNaN(bodyFatPercent) &&
    bodyFatPercent > 0

  const isHighBmiOrBf =
    bmi >= 27 ||
    (hasBf && (sex === 'male' ? bodyFatPercent! >= 25 : bodyFatPercent! >= 35))

  let effectiveLbm = measuredLbm
  let lbmBasis: 'measured_bf' | 'boer' | 'none' = 'none'

  if (isHighBmiOrBf) {
    if (hasBf) {
      effectiveLbm = weightKg * (1 - bodyFatPercent! / 100)
      lbmBasis = 'measured_bf'
    } else {
      effectiveLbm = calculateBoerLBM(sex, weightKg, heightCm)
      lbmBasis = 'boer'
    }
  }

  const massForProtein = isHighBmiOrBf ? effectiveLbm! : weightKg
  const proteinBasis: 'body_weight' | 'lean_mass' = isHighBmiOrBf
    ? 'lean_mass'
    : 'body_weight'

  let baseProteinPerKg: number
  if (
    typeof proteinPerKgOverride === 'number' &&
    !isNaN(proteinPerKgOverride)
  ) {
    baseProteinPerKg = proteinPerKgOverride
  } else if (proteinBasis === 'lean_mass') {
    // g/kg LBM: gain 2.0, maintain 2.0, lose 2.4
    baseProteinPerKg = goal === 'lose' ? 2.4 : 2.0
  } else {
    // g/kg BW: gain 1.8, maintain 1.8, lose 2.2
    baseProteinPerKg = goal === 'lose' ? 2.2 : 1.8
  }

  let rawProteinGrams = baseProteinPerKg * massForProtein

  // Caps: <= 35% of calories and <= 250 g
  const proteinCalorieCap = (0.35 * targetCalories) / 4
  let isProteinCapApplied = false

  if (rawProteinGrams > proteinCalorieCap) {
    rawProteinGrams = proteinCalorieCap
    isProteinCapApplied = true
  }
  if (rawProteinGrams > 250) {
    rawProteinGrams = 250
    isProteinCapApplied = true
  }

  const proteinGrams = Math.round(rawProteinGrams)
  const proteinRangeMin = Math.round((baseProteinPerKg - 0.2) * massForProtein)
  const proteinRangeMax = Math.round((baseProteinPerKg + 0.2) * massForProtein)

  // 5. Fat calculation: 25% of calories / 9
  let rawFatGrams = (0.25 * targetCalories) / 9
  const fatFloor =
    0.8 * (proteinBasis === 'lean_mass' ? effectiveLbm! : weightKg)
  let isFatFloorApplied = false
  let isFatCapApplied = false

  if (rawFatGrams < fatFloor) {
    rawFatGrams = fatFloor
    isFatFloorApplied = true
  }

  if (proteinBasis === 'body_weight') {
    const fatCap = 1.5 * weightKg
    if (rawFatGrams > fatCap) {
      rawFatGrams = fatCap
      isFatCapApplied = true
    }
  }

  const fatsGrams = Math.round(rawFatGrams)

  // 6. Carbs calculation: remaining calories / 4
  const proteinKcal = proteinGrams * 4
  const fatKcal = fatsGrams * 9
  const remainingKcal = Math.max(0, targetCalories - (proteinKcal + fatKcal))
  const carbsGrams = Math.round(remainingKcal / 4)

  const carbsPerKg = carbsGrams / weightKg
  if (carbsPerKg > 7.0) {
    warningsAr.push(
      'كمية الكربوهيدرات مرتفعة جداً (> 7 جم/كجم)، قد يصعب تناول هذا الحجم من الطعام. يُقترح نقل جزء من السعرات إلى الدهون الصحية لتسهيل الأكل.',
    )
  }

  const totalTrainingSessions = workoutBlocks.reduce(
    (acc, b) => acc + (b.sessionsPerWeek || 0),
    0,
  )
  if (carbsPerKg < 3.0 && totalTrainingSessions >= 4) {
    warningsAr.push(
      'كمية الكربوهيدرات منخفضة (< 3 جم/كجم) مع معدل تمرين مرتفع (4+ أيام)، قد يؤثر ذلك على طاقتك واستشفائك العضلي.',
    )
  }

  // 7. Reconciled Display Calories = 4P + 4C + 9F
  const reconciledCalories = proteinGrams * 4 + carbsGrams * 4 + fatsGrams * 9

  const proteinDetail: NutritionCalculationResult['protein'] = {
    grams: proteinGrams,
    calories: proteinGrams * 4,
    percentOfCalories: Math.round(
      ((proteinGrams * 4) / reconciledCalories) * 100,
    ),
    gramsPerKg: Number((proteinGrams / weightKg).toFixed(2)),
    rangeMin: proteinRangeMin,
    rangeMax: proteinRangeMax,
    basis: proteinBasis,
    isCapApplied: isProteinCapApplied,
  }

  const fatDetail: NutritionCalculationResult['fat'] = {
    grams: fatsGrams,
    calories: fatsGrams * 9,
    percentOfCalories: Math.round(((fatsGrams * 9) / reconciledCalories) * 100),
    gramsPerKg: Number((fatsGrams / weightKg).toFixed(2)),
    isFloorApplied: isFatFloorApplied,
    isCapApplied: isFatCapApplied,
  }

  const carbsDetail: MacroDetail = {
    grams: carbsGrams,
    calories: carbsGrams * 4,
    percentOfCalories: Math.round(
      ((carbsGrams * 4) / reconciledCalories) * 100,
    ),
    gramsPerKg: Number((carbsGrams / weightKg).toFixed(2)),
  }

  const waterLiters = Number((weightKg * 0.035).toFixed(1))

  // Explanation strings (كيف حسبناها؟)
  const formulaLabel =
    formulaUsed === 'katch'
      ? `كاتش-ماكاردل (Katch-McArdle) اعتماداً على الكتلة اللادهنية (${effectiveLbm?.toFixed(1)} كجم)`
      : 'ميفلين-سانت جور (Mifflin-St Jeor)'

  const lifestyleLabels: Record<LifestyleLevel, string> = {
    1: 'مكتبي / قليل الحركة (معامل 1.20)',
    2: 'حركة يومية خفيفة ومشياً (معامل 1.35)',
    3: 'وقوف وحركة أغلب اليوم (معامل 1.50)',
    4: 'عمل بدني شاق ومجهود دائم (معامل 1.65)',
    5: 'مجهود بدني شاق واستثنائي طوال اليوم (معامل 1.80)',
  }

  const explanationAr = {
    formula: formulaLabel,
    bmrText: `${Math.round(bmr)} كالوِري (الحرق القاعدي في الراحة التامة)`,
    lifestyleText: lifestyleLabels[lifestyle],
    eatText: `${Math.round(eatDailyKcal)} كالوِري/يومياً كمتوسط حرق لجلساتك الرياضية`,
    tdeeRangeText: `${tdeeRange.min} إلى ${tdeeRange.max} كالوِري (المتوسط: ${Math.round(tdee)})`,
    rateText:
      goal === 'maintain'
        ? 'تثبيت الوزن'
        : `${ratePercentOfBW}% من وزن الجسم أسبوعياً (${pace === 'slow' ? 'هادئ' : pace === 'fast' ? 'سريع' : 'معتدل'})`,
    adjustmentText:
      goal === 'gain'
        ? `+${Math.round(adjustmentKcal)} كالوِري (فائض لبناء الأنسجة)`
        : goal === 'lose'
          ? `${Math.round(adjustmentKcal)} كالوِري (عجز لحرق الدهون)`
          : '0 (سعرات المحافظة)',
    proteinBasisText:
      proteinBasis === 'lean_mass'
        ? `محسوب على الكتلة العضلية اللادهنية (${effectiveLbm?.toFixed(1)} كجم) بمعدل ${baseProteinPerKg} جم/كجم LBM`
        : `محسوب على وزن الجسم الإجمالي (${weightKg} كجم) بمعدل ${baseProteinPerKg} جم/كجم`,
  }

  return {
    bmr: Math.round(bmr),
    formulaUsed,
    lbmKg: effectiveLbm ? Number(effectiveLbm.toFixed(1)) : undefined,
    lbmBasis,
    lifestyleFactor,
    eatDailyKcal: Math.round(eatDailyKcal),
    tdee: Math.round(tdee),
    tdeeRange,
    goal,
    pace,
    ratePercentOfBW,
    adjustmentKcal: Math.round(adjustmentKcal),
    rawTargetCalories: Math.round(rawTarget),
    targetCalories: Math.round(targetCalories),
    displayCalories: reconciledCalories,
    floorBound,
    floorKcal: Math.round(floorKcal),
    protein: proteinDetail,
    fat: fatDetail,
    carbs: carbsDetail,
    waterLiters,
    warningsAr,
    explanationAr,
  }
}

// --- Calibration Loop ---
/**
 * Calibrates TDEE based on 14-21 days of weight logs and food intake logs.
 * Slope = least-squares linear regression (kg/week).
 * TDEE_obs = avgLoggedIntake - slope * 1100.
 * TDEE_new = 0.6 * TDEE_obs + 0.4 * TDEE_current.
 * Max change: +/-250 kcal.
 */
export function calibrateTDEE(params: {
  currentTDEE: number
  currentTarget: number
  plannedAdjustment: number
  weightLogs: WeightLogEntry[]
  intakeLogs?: IntakeLogEntry[]
  minBmrFloor?: number
}): CalibrationResult {
  const {
    currentTDEE,
    currentTarget,
    plannedAdjustment,
    weightLogs,
    intakeLogs = [],
    minBmrFloor = 1200,
  } = params

  if (!weightLogs || weightLogs.length < 8) {
    return {
      canCalibrate: false,
      reasonAr: `تحتاج إلى 8 تسجيلات وزن على الأقل خلال أسبوعين إلى 3 أسابيع (المسجل حالياً: ${weightLogs ? weightLogs.length : 0}).`,
    }
  }

  // Sort weight logs ascending by date
  const sortedWeights = [...weightLogs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  const firstDate = new Date(sortedWeights[0].date).getTime()
  const lastDate = new Date(
    sortedWeights[sortedWeights.length - 1].date,
  ).getTime()
  const daysSpan = Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24))

  if (daysSpan < 14) {
    return {
      canCalibrate: false,
      reasonAr: `يجب أن تمتد تسجيلات الوزن على مدى 14 يوماً على الأقل لضمان الدقة الرياضية (المدى الحالي: ${daysSpan} يوماً).`,
      daysSpan,
      logsCount: sortedWeights.length,
    }
  }

  // Linear Regression (Least-Squares)
  // x in weeks (0, x_i)
  const n = sortedWeights.length
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0

  for (const entry of sortedWeights) {
    const dayDiff =
      (new Date(entry.date).getTime() - firstDate) / (1000 * 60 * 60 * 24)
    const weeks = dayDiff / 7
    const weight = entry.weightKg

    sumX += weeks
    sumY += weight
    sumXY += weeks * weight
    sumX2 += weeks * weeks
  }

  const denominator = n * sumX2 - sumX * sumX
  if (Math.abs(denominator) < 1e-6) {
    return {
      canCalibrate: false,
      reasonAr: 'تعذر حساب ميل خط الوزن، يرجى التحقق من تواريخ التسجيلات.',
      daysSpan,
      logsCount: n,
    }
  }

  const slopeKgPerWeek = (n * sumXY - sumX * sumY) / denominator

  // Check slope sanity
  if (Math.abs(slopeKgPerWeek) > 1.5) {
    return {
      canCalibrate: false,
      reasonAr: `معدل تغير الوزن المسجل (${slopeKgPerWeek.toFixed(2)} كجم/أسبوع) غير منطقي بيولوجياً (> 1.5 كجم/أسبوع). يرجى مراجعة وتدقيق أوزانك المسجلة.`,
      daysSpan,
      logsCount: n,
      slopeKgPerWeek: Number(slopeKgPerWeek.toFixed(2)),
    }
  }

  // Intake check: >= 80% of days logged?
  let avgLoggedIntake = currentTarget
  let usedLoggedIntake = false

  if (intakeLogs && intakeLogs.length > 0) {
    const intakeMap = new Map<string, number>()
    for (const item of intakeLogs) {
      if (item.calories > 0) {
        intakeMap.set(item.date, item.calories)
      }
    }

    const loggedCount = intakeMap.size
    const requiredDays = Math.ceil(daysSpan * 0.8)

    if (loggedCount >= requiredDays && loggedCount > 0) {
      let totalCalories = 0
      for (const val of intakeMap.values()) {
        totalCalories += val
      }
      avgLoggedIntake = totalCalories / loggedCount
      usedLoggedIntake = true
    }
  }

  // TDEE_obs = avgLoggedIntake - slope * 1100
  const tdeeObserved = avgLoggedIntake - slopeKgPerWeek * 1100
  // TDEE_new = 0.6 * TDEE_obs + 0.4 * currentTDEE
  const tdeeNew = 0.6 * tdeeObserved + 0.4 * currentTDEE

  // Raw new target
  let newTarget = tdeeNew + plannedAdjustment
  if (newTarget < minBmrFloor) {
    newTarget = minBmrFloor
  }

  // Clamp change to max +/-250 kcal/day
  const delta = newTarget - currentTarget
  const clampedDelta = Math.max(-250, Math.min(250, delta))
  const finalNewTarget = Math.round(currentTarget + clampedDelta)

  return {
    canCalibrate: true,
    reasonAr: usedLoggedIntake
      ? 'تم حساب المعايرة بناءً على سجل سعراتك الفعلي ومعدل تغير وزنك الواقعي.'
      : 'تم حساب المعايرة بافتراض التزامك بالسعرات المستهدفة نظراً لعدم تسجيل 80% من أيام التغذية.',
    daysSpan,
    logsCount: n,
    slopeKgPerWeek: Number(slopeKgPerWeek.toFixed(2)),
    avgLoggedIntake: Math.round(avgLoggedIntake),
    usedLoggedIntake,
    tdeeObserved: Math.round(tdeeObserved),
    tdeeNew: Math.round(tdeeNew),
    newTargetCalories: finalNewTarget,
    changeKcal: Math.round(clampedDelta),
  }
}

// --- Safe calculation that returns null when any core input is missing ---
export function calculateNutritionTargetsSafe(
  input: Partial<NutritionEngineInput> | null | undefined,
): NutritionCalculationResult | null {
  if (
    !input ||
    !input.sex ||
    !input.age ||
    input.age <= 0 ||
    !input.weightKg ||
    input.weightKg <= 0 ||
    !input.heightCm ||
    input.heightCm <= 0
  ) {
    return null
  }
  try {
    return calculateNutritionTargets(input as NutritionEngineInput)
  } catch {
    return null
  }
}

// --- Dynamic Weight & Age Resolver ---
export function resolveWeightAndAge(
  profile: Partial<UserProfile> | null | undefined,
  bodyLog?: Array<{ date: string; weightKg: number }> | null,
): {
  weightKg: number | null
  weightSourceText: string
  isWeightStale: boolean
  age: number | null
  heightCm: number | null
  sex: Sex | null
} {
  if (!profile || !profile.body) {
    return {
      weightKg: null,
      weightSourceText: 'لا توجد بيانات وزن',
      isWeightStale: false,
      age: null,
      heightCm: null,
      sex: null,
    }
  }

  let weightKg: number | null = null
  let weightSourceText = ''
  let isWeightStale = false

  const validLogs = (bodyLog || [])
    .filter(
      (entry) =>
        typeof entry.weightKg === 'number' &&
        !isNaN(entry.weightKg) &&
        entry.weightKg > 0,
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const latestLog = validLogs[0]
  if (latestLog) {
    const logDate = new Date(latestLog.date)
    const now = new Date()
    const diffDays =
      (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
    if (diffDays <= 30) {
      weightKg = latestLog.weightKg
      weightSourceText = `الوزن المستخدم ${latestLog.weightKg} كجم، من قياس ${fmtDate(latestLog.date)}`
      isWeightStale = false
    } else {
      if (profile.body.weightKg && Number(profile.body.weightKg) > 0) {
        weightKg = Number(profile.body.weightKg)
        weightSourceText = `الوزن المستخدم ${weightKg} كجم من الملف الشخصي (القياس أقدم من 30 يوماً)`
        isWeightStale = true
      } else {
        weightKg = latestLog.weightKg
        weightSourceText = `الوزن المستخدم ${latestLog.weightKg} كجم، من قياس ${fmtDate(latestLog.date)} (أقدم من 30 يوماً)`
        isWeightStale = true
      }
    }
  } else if (profile.body.weightKg && Number(profile.body.weightKg) > 0) {
    weightKg = Number(profile.body.weightKg)
    weightSourceText = `الوزن المستخدم ${weightKg} كجم من الملف الشخصي`
    isWeightStale = false
  }

  let age: number | null = null
  if (profile.body.birthDate) {
    const birth = new Date(profile.body.birthDate)
    const now = new Date()
    if (!isNaN(birth.getTime())) {
      let computedAge = now.getFullYear() - birth.getFullYear()
      const m = now.getMonth() - birth.getMonth()
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        computedAge--
      }
      age = computedAge
    }
  }
  if (age === null && profile.body.age && Number(profile.body.age) > 0) {
    const baseAge = Number(profile.body.age)
    if (profile.body.ageEnteredAt) {
      const entered = new Date(profile.body.ageEnteredAt)
      const now = new Date()
      if (!isNaN(entered.getTime())) {
        const diffYears =
          (now.getTime() - entered.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
        age = Math.floor(baseAge + Math.max(0, diffYears))
      } else {
        age = baseAge
      }
    } else {
      age = baseAge
    }
  }

  const heightCm =
    profile.body.heightCm && Number(profile.body.heightCm) > 0
      ? Number(profile.body.heightCm)
      : null
  const sex =
    profile.body.sex === 'male' || profile.body.sex === 'female'
      ? profile.body.sex
      : null

  return {
    weightKg,
    weightSourceText,
    isWeightStale,
    age,
    heightCm,
    sex,
  }
}

export interface EnergyExplanationWorkoutBlock {
  activity: string
  intensity: string
  met: number
  source: string
  netMet: number
  minutes: number
  sessionsPerWeek: number
  epocFactor: number
  perSessionKcal: number
  perDayKcal: number
  formattedDescription: string
}

export interface EnergyExplanation {
  inputs: {
    sex: Sex
    age: number
    weightKg: number
    weightSourceText: string
    isWeightStale: boolean
    heightCm: number
    lifestyle: LifestyleLevel
    lifestyleFactor: number
    lifestyleLabel: string
    bodyGoal?: string
    trainingStyle?: string[]
  }
  bmr: {
    formulaName: string
    terms: {
      weightTerm: number
      heightTerm: number
      ageTerm: number
      sexConstant: number
    }
    value: number
    formattedText: string
  }
  baseline: {
    factor: number
    value: number
    formattedText: string
  }
  workoutBlocks: EnergyExplanationWorkoutBlock[]
  eat: {
    dailyKcal: number
    epocNote: string
    formattedText: string
  }
  tdee: {
    value: number
    rangeMin: number
    rangeMax: number
    formattedText: string
  }
  goalAdjustment: {
    goal: string
    adjustmentKcal: number
    reasonAr: string
    formattedText: string
  }
  targets: {
    targetCalories: number
    proteinGrams: number
    carbsGrams: number
    fatsGrams: number
  }
  proteinBasis: {
    gPerKg: number
    totalGrams: number
    referenceText: string
    plateauGPerKg: number
    upperCiGPerKg: number
  }
}

export function explainEnergy(
  profile: Partial<UserProfile> | null | undefined,
  bodyLog?: Array<{ date: string; weightKg: number }> | null,
): EnergyExplanation | null {
  const resolved = resolveWeightAndAge(profile, bodyLog)
  if (
    resolved.weightKg === null ||
    resolved.heightCm === null ||
    resolved.age === null ||
    resolved.sex === null
  ) {
    return null
  }

  const { weightKg, heightCm, age, sex, weightSourceText, isWeightStale } =
    resolved

  // BMR terms (Mifflin-St Jeor 1990)
  const weightTerm = 10 * weightKg
  const heightTerm = 6.25 * heightCm
  const ageTerm = 5 * age
  const sexConstant = sex === 'male' ? 5 : -161
  const bmrValue = weightTerm + heightTerm - ageTerm + sexConstant

  // Lifestyle factor
  const lifestyle: LifestyleLevel = profile?.body?.lifestyle ?? 2
  const lifestyleFactor = LIFESTYLE_FACTORS[lifestyle] ?? 1.35
  const baselineValue = bmrValue * lifestyleFactor

  // Workout blocks
  let workoutBlocksInput: WorkoutBlockInput[] =
    profile?.body?.workoutBlocks ?? []
  if (workoutBlocksInput.length === 0) {
    const sessions = profile?.trainingDaysPerWeek || 4
    workoutBlocksInput = [
      {
        type: 'resistance',
        sessionsPerWeek: sessions,
        minutesPerSession: profile?.body?.sessionMinutes || 60,
        intensity: profile?.body?.sessionIntensity || 'moderate',
      },
    ]
  }

  const blocks: EnergyExplanationWorkoutBlock[] = []
  let totalDailyEAT = 0

  for (const b of workoutBlocksInput) {
    const met = MET_TABLE[b.type]?.[b.intensity] ?? 5.0
    const netMet = met - 1
    const minutes = b.minutesPerSession ?? b.durationMinutes ?? 60
    const sessions = b.sessionsPerWeek ?? 4
    const epocFactor = 1.1
    const perSessionKcal = netMet * weightKg * (minutes / 60) * epocFactor
    const perDayKcal = (perSessionKcal * sessions) / 7

    totalDailyEAT += perDayKcal

    const intensityAr =
      b.intensity === 'light'
        ? 'خفيفة'
        : b.intensity === 'hard'
          ? 'شديدة'
          : 'متوسطة'
    const activityAr = b.type === 'resistance' ? 'مقاومة' : 'كارديو'
    const sourceText =
      b.intensity === 'moderate' && b.type === 'resistance'
        ? 'Compendium of Physical Activities (2011, code 02052) / estimate'
        : 'Compendium of Physical Activities (2011)'

    blocks.push({
      activity: b.type,
      intensity: b.intensity,
      met,
      source: sourceText,
      netMet,
      minutes,
      sessionsPerWeek: sessions,
      epocFactor,
      perSessionKcal: Number(perSessionKcal.toFixed(2)),
      perDayKcal: Number(perDayKcal.toFixed(2)),
      formattedDescription: `${sessions} جلسات × ${minutes} دقيقة، ${activityAr} ${intensityAr} (MET صافي ${netMet.toFixed(1)})`,
    })
  }

  const tdee = baselineValue + totalDailyEAT
  const tdeeRange = {
    min: Math.round(tdee * 0.9),
    max: Math.round(tdee * 1.1),
  }

  // Goal adjustment
  const bodyGoal =
    profile?.bodyGoal ||
    (profile?.primaryGoal === 'hypertrophy'
      ? 'gain'
      : profile?.primaryGoal === 'cut'
        ? 'cut'
        : 'maintain')
  let adjustmentKcal = 0
  let reasonAr = 'سعرات الثبات (0)'

  if (bodyGoal === 'gain') {
    adjustmentKcal = Math.round((tdee * 0.1) / 25) * 25
    reasonAr = 'زيادة تدريجية (+10%)'
  } else if (bodyGoal === 'cut') {
    const rawCut = Math.round((tdee * 0.15) / 25) * 25
    if (tdee - rawCut < bmrValue) {
      adjustmentKcal = -Math.max(0, Math.round(tdee - bmrValue))
      reasonAr = 'عجز تدريجي (محدود بحد الحرق الأساسي BMR)'
    } else {
      adjustmentKcal = -rawCut
      reasonAr = 'عجز تدريجي (-15%)'
    }
  }

  const targetCalories = Math.round(tdee + adjustmentKcal)

  // Protein basis: Morton et al., BJSM 2018
  const proteinPerKg = profile?.body?.proteinPerKgOverride ?? 1.8
  const proteinGrams = Math.round(proteinPerKg * weightKg)

  const fatGrams = Math.round((0.25 * targetCalories) / 9)
  const remainingKcal = Math.max(
    0,
    targetCalories - (proteinGrams * 4 + fatGrams * 9),
  )
  const carbsGrams = Math.round(remainingKcal / 4)

  return {
    inputs: {
      sex,
      age,
      weightKg,
      weightSourceText,
      isWeightStale,
      heightCm,
      lifestyle,
      lifestyleFactor,
      lifestyleLabel:
        LIFESTYLE_OPTIONS.find((l) => l.level === lifestyle)?.titleAr || '',
      bodyGoal,
      trainingStyle: profile?.trainingStyle,
    },
    bmr: {
      formulaName: 'معادلة ميفلين–سانت جور (1990)',
      terms: {
        weightTerm,
        heightTerm,
        ageTerm,
        sexConstant,
      },
      value: Number(bmrValue.toFixed(2)),
      formattedText: `الحرق الأساسي (BMR) = 10 × ${weightKg} + 6.25 × ${heightCm} − 5 × ${age} ${sex === 'male' ? '+ 5' : '− 161'} = ${bmrValue.toFixed(2)} كالوِري/يوم`,
    },
    baseline: {
      factor: lifestyleFactor,
      value: Number(baselineValue.toFixed(2)),
      formattedText: `الحرق القاعدي بنشاط الحياة = ${bmrValue.toFixed(2)} × ${lifestyleFactor} = ${baselineValue.toFixed(2)} كالوِري/يوم`,
    },
    workoutBlocks: blocks,
    eat: {
      dailyKcal: Number(totalDailyEAT.toFixed(2)),
      epocNote: 'افتراض EPOC بنسبة 10%',
      formattedText: `إجمالي الحرق الرياضي اليومي (EAT) = ${totalDailyEAT.toFixed(2)} كالوِري/يوم (مع افتراض EPOC بنسبة 10%)`,
    },
    tdee: {
      value: Number(tdee.toFixed(2)),
      rangeMin: tdeeRange.min,
      rangeMax: tdeeRange.max,
      formattedText: `إجمالي الحرق اليومي (TDEE) = ${tdee.toFixed(2)} كالوِري/يوم (النطاق: ${tdeeRange.min} إلى ${tdeeRange.max})`,
    },
    goalAdjustment: {
      goal: bodyGoal,
      adjustmentKcal,
      reasonAr,
      formattedText: `تعديل السعرات للهدف: ${adjustmentKcal >= 0 ? `+${adjustmentKcal}` : adjustmentKcal} (${reasonAr})`,
    },
    targets: {
      targetCalories,
      proteinGrams,
      carbsGrams,
      fatsGrams: fatGrams,
    },
    proteinBasis: {
      gPerKg: proteinPerKg,
      totalGrams: proteinGrams,
      plateauGPerKg: 1.6,
      upperCiGPerKg: 2.2,
      referenceText:
        'وفق دراسة Morton et al., BJSM 2018: نقطة تشبع البناء العضلي عند ~1.6 جم/كجم والحد الأعلى لنطاق الثقة 95% عند 2.2 جم/كجم، وافتراض التطبيق 1.8 جم/كجم يقع ضمن هذا النطاق.',
    },
  }
}

