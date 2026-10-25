import type { UserProfile } from '../onboarding/types.ts'
import regionLoadData from '../../data/exercise-region-load.json' with { type: 'json' }
import type { ExerciseRegionLoadEntry } from './limitations.ts'

/**
 * All distinct equipment values occurring in catalog-v1.json equipment.db:
 * ['barbell', 'body only', 'dumbbell', 'cable', 'machine', 'none', 'other']
 */
export const CATALOG_EQUIPMENT_VALUES = [
  'barbell',
  'body only',
  'dumbbell',
  'cable',
  'machine',
  'none',
  'other',
] as const

export type CatalogEquipment = (typeof CATALOG_EQUIPMENT_VALUES)[number]

/**
 * Bodyweight / calisthenics allowed equipment:
 * Allows catalog equipment values 'body only', 'bodyweight', 'none', and 'other' (bars & parallettes).
 * Disallows weighted equipment (barbell, dumbbell, cable, machine).
 */
export const BODYWEIGHT_ALLOWED_EQUIPMENT = new Set<string>([
  'body only',
  'bodyweight',
  'none',
  'other',
])

/**
 * Home with dumbbells allowed equipment:
 * Allows dumbbells and bodyweight/none/other.
 */
export const HOME_DUMBBELLS_ALLOWED_EQUIPMENT = new Set<string>([
  'dumbbell',
  'body only',
  'bodyweight',
  'none',
  'other',
])

/**
 * Full commercial gym / unrestricted:
 * Allows all equipment.
 */
export const FULL_GYM_ALLOWED_EQUIPMENT = new Set<string>([
  'barbell',
  'body only',
  'bodyweight',
  'dumbbell',
  'cable',
  'machine',
  'none',
  'other',
])

export interface UserWorkoutConstraints {
  /** Set of allowed catalog equipment.db strings */
  allowedEquipment: Set<string>
  /** Whether the user can perform weighted/loaded exercises */
  allowsLoadedExercises: boolean
  /** Upper bound on exercise technical difficulty */
  levelCeiling: 'beginner' | 'intermediate' | 'advanced'
  /** Exercise IDs excluded due to high joint/region load matching active injuries */
  excludedExerciseKeys: Set<string>
  /** Whether user is restricted to calisthenics only */
  isCalisthenicsOnly: boolean
  /** Whether user is restricted to home dumbbells */
  isHomeDumbbellsOnly: boolean
  /** Default measurement values for logging & generation */
  measurementDefaults: {
    weightDefault: number
    repsDefault: number
    restSecondsDefault: number
  }
}

/**
 * Normalizes any exercise equipment representation to a catalog equipment string.
 */
export function normalizeExerciseEquipment(equipment: unknown): string {
  if (!equipment) return 'other'
  if (typeof equipment === 'string') {
    const lower = equipment.toLowerCase().trim()
    if (lower === 'bodyweight') return 'body only'
    return lower
  }
  if (typeof equipment === 'object' && equipment !== null) {
    const obj = equipment as { db?: string; ar?: string }
    if (obj.db) {
      const lower = obj.db.toLowerCase().trim()
      if (lower === 'bodyweight') return 'body only'
      return lower
    }
  }
  return 'other'
}

/**
 * Pure function: deriveConstraints(profile)
 *
 * Converts onboarding & profile fields into concrete workout constraints.
 * Rule: Unknown or unanswered fields mean NO restriction (never restrict silently).
 */
export function deriveConstraints(
  profile?: UserProfile | null,
): UserWorkoutConstraints {
  // If profile is empty/missing, return completely unrestricted defaults
  if (!profile) {
    return {
      allowedEquipment: new Set(FULL_GYM_ALLOWED_EQUIPMENT),
      allowsLoadedExercises: true,
      levelCeiling: 'advanced',
      excludedExerciseKeys: new Set(),
      isCalisthenicsOnly: false,
      isHomeDumbbellsOnly: false,
      measurementDefaults: {
        weightDefault: 20,
        repsDefault: 10,
        restSecondsDefault: 90,
      },
    }
  }

  // 1. Determine Training Style & Equipment Restrictions
  const styles = profile.trainingStyle || []
  const hasCalisthenicsStyle =
    styles.includes('calisthenics') || profile.primaryGoal === 'calisthenics'
  const hasWeightsStyle = styles.includes('weights') || styles.includes('mixed')
  const location = profile.trainingLocation // 'gym' | 'home' | 'both'

  let allowedEquipment: Set<string>
  let allowsLoadedExercises = true
  let isCalisthenicsOnly = false
  let isHomeDumbbellsOnly = false

  // Pure calisthenics / bodyweight condition:
  // User selected calisthenics without weights, or home location explicitly without weights
  if (hasCalisthenicsStyle && !hasWeightsStyle && location !== 'gym' && location !== 'both') {
    allowedEquipment = new Set(BODYWEIGHT_ALLOWED_EQUIPMENT)
    allowsLoadedExercises = false
    isCalisthenicsOnly = true
  } else if (location === 'home' && !styles.includes('weights') && !profile.equipmentAvailable?.includes('barbell')) {
    // Home training with dumbbells / basic setup
    allowedEquipment = new Set(HOME_DUMBBELLS_ALLOWED_EQUIPMENT)
    allowsLoadedExercises = true
    isHomeDumbbellsOnly = true
  } else if (profile.equipmentAvailable && profile.equipmentAvailable.length > 0) {
    // Explicit equipment list from profile
    const customAllowed = new Set<string>(['body only', 'bodyweight', 'none', 'other'])
    let hasLoaded = false

    for (const eq of profile.equipmentAvailable) {
      const norm = normalizeExerciseEquipment(eq)
      if (norm === 'barbell' || norm === 'dumbbell' || norm === 'cable' || norm === 'machine') {
        customAllowed.add(norm)
        hasLoaded = true
      } else if (norm === 'cables') {
        customAllowed.add('cable')
        hasLoaded = true
      } else {
        customAllowed.add(norm)
      }
    }
    allowedEquipment = customAllowed
    allowsLoadedExercises = hasLoaded
    if (!hasLoaded) {
      isCalisthenicsOnly = true
    }
  } else {
    // Unrestricted / Gym access
    allowedEquipment = new Set(FULL_GYM_ALLOWED_EQUIPMENT)
    allowsLoadedExercises = true
  }

  // 2. Experience Level Ceiling
  const levelCeiling: 'beginner' | 'intermediate' | 'advanced' =
    profile.experienceLevel === 'beginner'
      ? 'beginner'
      : profile.experienceLevel === 'intermediate'
        ? 'intermediate'
        : 'advanced'

  // 3. Excluded Exercises via Limitations (exercise-region-load.json)
  const excludedExerciseKeys = new Set<string>()
  const limitations = profile.limitations || []

  const loadEntries =
    (
      regionLoadData as unknown as {
        entries?: Record<string, ExerciseRegionLoadEntry>
      }
    ).entries || {}

  for (const lim of limitations) {
    // Active limitation: current_pain or under_treatment (or legacy severity)
    const isLimitationActive =
      lim.status === 'current_pain' ||
      lim.status === 'under_treatment' ||
      (lim as unknown as { severity?: string }).severity === 'high' ||
      (lim as unknown as { severity?: string }).severity === 'moderate'

    if (!isLimitationActive) continue

    for (const [exerciseKey, entry] of Object.entries(loadEntries)) {
      if (entry.loads && entry.loads[lim.region] === 'high') {
        excludedExerciseKeys.add(exerciseKey)
      }
    }
  }

  // 4. Measurement defaults
  const measurementDefaults = !allowsLoadedExercises
    ? {
        weightDefault: 0,
        repsDefault: 12,
        restSecondsDefault: 60,
      }
    : {
        weightDefault: 20,
        repsDefault: 10,
        restSecondsDefault: 90,
      }

  return {
    allowedEquipment,
    allowsLoadedExercises,
    levelCeiling,
    excludedExerciseKeys,
    isCalisthenicsOnly,
    isHomeDumbbellsOnly,
    measurementDefaults,
  }
}

/**
 * Checks whether an exercise complies with user constraints.
 */
export function isExerciseAllowed(
  exercise: {
    id?: string
    key?: string
    equipment?: unknown
    equipmentDetail?: any
    difficulty?: string
    [key: string]: any
  },
  constraints: UserWorkoutConstraints,
): boolean {
  const exKey = exercise.key || exercise.id || ''
  if (exKey && constraints.excludedExerciseKeys.has(exKey)) {
    return false
  }

  const rawEq =
    exercise.equipmentDetail?.db ||
    (typeof exercise.equipment === 'string'
      ? exercise.equipment
      : (exercise.equipment as { db?: string })?.db) ||
    'other'
  const normEq = normalizeExerciseEquipment(rawEq)

  if (!constraints.allowedEquipment.has(normEq) && !constraints.allowedEquipment.has(rawEq.toLowerCase())) {
    return false
  }

  // If user cannot perform loaded exercises, reject weighted equipment
  if (!constraints.allowsLoadedExercises) {
    if (normEq === 'barbell' || normEq === 'dumbbell' || normEq === 'cable' || normEq === 'machine') {
      return false
    }
  }

  return true
}
