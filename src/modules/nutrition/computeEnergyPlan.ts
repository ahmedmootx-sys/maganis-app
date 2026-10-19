import type { UserProfile } from '../onboarding/types.ts'
import {
  LIFESTYLE_FACTORS,
  MET_TABLE,
  resolveWeightAndAge,
  type LifestyleLevel,
  type WorkoutBlockInput,
} from './nutritionEngine.ts'

export interface EnergyPlanResult {
  bmr: number
  baseline: number
  eat: number
  tdee: number
  adjustmentPct: number
  adjustmentKcal: number
  target: number
  proteinGrams: number
  fatGrams: number
  carbGrams: number
  isStaleWeight: boolean
  weightSourceText: string
  sources: {
    bmr: string
    baseline: string
    eat: string
    protein: string
    fat: string
    carbs: string
  }
}

/**
 * Single source of truth for energy and calorie/macro plan.
 * Used by Dashboard (Home), Nutrition banner, details card, calculator, and macro ring.
 *
 * Rules:
 * - Mifflin-St Jeor (1990) BMR
 * - Ainsworth et al. (2011) METs with EPOC (1.1)
 * - Morton et al. (2018) protein (1.8 g/kg)
 * - adjustmentKcal = round(tdee * adjustmentPct)
 * - target = round(tdee + adjustmentKcal)
 * - banner = details = target - tdee
 */
export type ComputableProfile = {
  primaryGoal?: string
  bodyGoal?: string
  trainingDaysPerWeek?: number
  body?: Partial<UserProfile['body']> & {
    proteinPerKgOverride?: number
  }
}

export function computeEnergyPlan(
  profile: ComputableProfile | null | undefined,
  bodyLog?: Array<{ date: string; weightKg: number }> | null,
  activitiesOverride?: WorkoutBlockInput[] | null,
): EnergyPlanResult | null {
  const resolved = resolveWeightAndAge(profile as unknown as Partial<UserProfile>, bodyLog)
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

  // 1. BMR (Mifflin-St Jeor 1990)
  const weightTerm = 10 * weightKg
  const heightTerm = 6.25 * heightCm
  const ageTerm = 5 * age
  const sexConstant = sex === 'male' ? 5 : -161
  const bmr = Number((weightTerm + heightTerm - ageTerm + sexConstant).toFixed(2))

  // 2. Baseline
  const lifestyle: LifestyleLevel = profile?.body?.lifestyle ?? 2
  const lifestyleFactor = LIFESTYLE_FACTORS[lifestyle] ?? 1.35
  const baseline = Number((bmr * lifestyleFactor).toFixed(2))

  // 3. EAT (Exercise Activity Thermogenesis)
  let blocks: WorkoutBlockInput[] =
    activitiesOverride ?? profile?.body?.workoutBlocks ?? []
  if (blocks.length === 0) {
    const sessions = profile?.trainingDaysPerWeek || 4
    blocks = [
      {
        type: 'resistance',
        sessionsPerWeek: sessions,
        minutesPerSession: profile?.body?.sessionMinutes || 60,
        intensity: profile?.body?.sessionIntensity || 'moderate',
      },
    ]
  }

  let totalDailyEat = 0
  for (const b of blocks) {
    const met = MET_TABLE[b.type]?.[b.intensity] ?? 5.0
    const netMet = Math.max(0, met - 1)
    const minutes = b.minutesPerSession ?? b.durationMinutes ?? 60
    const sessions = b.sessionsPerWeek ?? 4
    const epocFactor = 1.1
    const perSessionKcal = netMet * weightKg * (minutes / 60) * epocFactor
    const perDayKcal = (perSessionKcal * sessions) / 7
    totalDailyEat += perDayKcal
  }
  const eat = Number(totalDailyEat.toFixed(2))

  // 4. TDEE
  const rawTdee = baseline + eat
  const tdee = Math.round(rawTdee)

  // 5. Goal adjustment percentage
  const primaryGoal = profile?.primaryGoal
  const bodyGoal =
    profile?.bodyGoal ||
    (primaryGoal === 'hypertrophy'
      ? 'gain'
      : (primaryGoal === 'cut' || primaryGoal === 'fat_loss')
        ? 'cut'
        : 'maintain')

  let adjustmentPct = 0
  if (bodyGoal === 'gain') {
    adjustmentPct = 0.10 // +10%
  } else if (bodyGoal === 'cut') {
    adjustmentPct = -0.15 // -15%
  }

  let rawAdjustmentKcal = Math.round(rawTdee * adjustmentPct)

  // Guard: cut must not drop below BMR
  if (bodyGoal === 'cut' && rawTdee + rawAdjustmentKcal < bmr) {
    rawAdjustmentKcal = -Math.max(0, Math.round(rawTdee - bmr))
  }

  const adjustmentKcal = rawAdjustmentKcal
  const target = Math.round(tdee + adjustmentKcal)

  // 6. Macros
  // Protein: goal-based evidence multiplier (Morton et al. 2018: 1.8 baseline, 2.0 hypertrophy/recomp; Helms et al. 2014: 2.2 deficit)
  const defaultProteinPerKg =
    primaryGoal === 'fat_loss' || primaryGoal === 'cut'
      ? 2.2
      : (primaryGoal === 'hypertrophy' || primaryGoal === 'recomposition')
        ? 2.0
        : (primaryGoal === 'endurance' || primaryGoal === 'health')
          ? 1.6
          : 1.8

  const proteinPerKg = profile?.body?.proteinPerKgOverride ?? defaultProteinPerKg
  const proteinGrams = Math.round(weightKg * proteinPerKg)
  const proteinKcal = proteinGrams * 4

  // Fat: 25% of target energy
  const fatKcal = target * 0.25
  const fatGrams = Math.round(fatKcal / 9)

  // Carbs: Remaining calories (round half up)
  const carbKcal = Math.max(0, target - proteinKcal - fatGrams * 9)
  const carbGrams = Math.round(carbKcal / 4)

  return {
    bmr: Math.round(bmr),
    baseline: Math.round(baseline),
    eat: Math.round(eat),
    tdee,
    adjustmentPct,
    adjustmentKcal,
    target,
    proteinGrams,
    fatGrams,
    carbGrams,
    isStaleWeight: isWeightStale,
    weightSourceText,
    sources: {
      bmr: 'Mifflin-St Jeor (1990) Am J Clin Nutr',
      baseline: `FAO/WHO/UNU Physical Activity Level (×${lifestyleFactor})`,
      eat: 'Compendium of Physical Activities (Ainsworth 2011) + EPOC 1.1',
      protein: `Morton et al. (2018) Br J Sports Med (${proteinPerKg} جم/كجم)`,
      fat: '25% من إجمالي السعرات (دهون صحية)',
      carbs: 'باقي السعرات بعد البروتين والدهون للطاقة العضلية',
    },
  }
}
