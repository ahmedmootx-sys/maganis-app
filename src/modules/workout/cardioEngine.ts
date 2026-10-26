/**
 * src/modules/workout/cardioEngine.ts
 *
 * Implements Task G5-B1: Scientific Energy Expenditure Estimation based on the
 * 2011 Compendium of Physical Activities (Ainsworth et al., 2011).
 *
 * Formulas:
 *  - Gross kcal/min = MET * 3.5 * weightKg / 200
 *  - Net kcal/min = (MET - 1) * 3.5 * weightKg / 200
 *  - Session kcal = rate * durationMinutes
 *
 * Rounding: Whole kcal in displays. Full floating point precision internally.
 * Fat grams: Strictly NOT computed or displayed.
 */

import cardioMetData from '../../content/cardio-met-table.json'

export type CardioActivityId =
  'run' | 'walk' | 'bike' | 'swim' | 'jumprope' | 'rowing'

export type CardioEffortLevel = 'light' | 'moderate' | 'high'

export interface CardioLevelInfo {
  compendium_code: string
  met: number
  basis_en: string
  ui_hint_ar: string
}

export interface CardioActivityDef {
  id: CardioActivityId
  name_ar: string
  levels: Record<CardioEffortLevel, CardioLevelInfo>
  note_ar?: string
}

export interface CardioEstimateResult {
  activityId: CardioActivityId
  activityNameAr: string
  level: CardioEffortLevel
  met: number
  compendiumCode: string
  durationMinutes: number
  weightKg: number
  grossRateKcalPerMin: number
  netRateKcalPerMin: number
  grossSessionKcal: number
  netSessionKcal: number
  uiHintAr: string
}

export const CARDIO_ACTIVITIES = cardioMetData.activities as CardioActivityDef[]

export function getCardioActivity(
  activityId: CardioActivityId,
): CardioActivityDef | undefined {
  return CARDIO_ACTIVITIES.find((a) => a.id === activityId)
}

/**
 * Calculates energy expenditure for a cardio session.
 * Gross = Total energy spent including resting metabolic rate.
 * Net = Additional energy spent above resting baseline (used for EAT).
 */
export function calculateCardioEnergy(
  activityId: CardioActivityId,
  level: CardioEffortLevel,
  durationMinutes: number,
  weightKg: number,
): CardioEstimateResult | null {
  if (
    !activityId ||
    !level ||
    !durationMinutes ||
    durationMinutes <= 0 ||
    !weightKg ||
    weightKg <= 0
  ) {
    return null
  }

  const activity = getCardioActivity(activityId)
  if (!activity) return null

  const levelInfo = activity.levels[level]
  if (!levelInfo) return null

  const met = levelInfo.met
  const grossRateKcalPerMin = (met * 3.5 * weightKg) / 200
  const netRateKcalPerMin = ((met - 1) * 3.5 * weightKg) / 200

  const grossSessionKcal = grossRateKcalPerMin * durationMinutes
  const netSessionKcal = netRateKcalPerMin * durationMinutes

  return {
    activityId,
    activityNameAr: activity.name_ar,
    level,
    met,
    compendiumCode: levelInfo.compendium_code,
    durationMinutes,
    weightKg,
    grossRateKcalPerMin,
    netRateKcalPerMin,
    grossSessionKcal,
    netSessionKcal,
    uiHintAr: levelInfo.ui_hint_ar,
  }
}

/**
 * Calculates live energy expenditure based on timestamps (performance.now or Date.now deltas).
 * Never uses tick counters or setInterval increments.
 */
export function calculateLiveEnergy(
  rateKcalPerMin: number,
  elapsedMs: number,
): number {
  if (rateKcalPerMin <= 0 || elapsedMs <= 0) return 0
  const elapsedMinutes = elapsedMs / 60000
  return rateKcalPerMin * elapsedMinutes
}
