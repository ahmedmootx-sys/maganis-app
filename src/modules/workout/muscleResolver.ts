import exerciseMusclesData from '../../data/exercise_muscles.json'
import groupToHeadsData from '../../data/group-to-heads.json'
import atlasMetaData from '../../../public/atlas/atlas-meta.json'

export type MuscleRole = 'primary' | 'secondary'

export interface ExerciseMuscleTarget {
  id: string
  role: MuscleRole
}

export interface ResolveMusclesInput {
  id?: string
  key?: string
  name?: string
  name_en?: string
  name_ar?: string
  nameAr?: string
  db_id?: string
  category?: string
  muscle_group?: string
  muscles?: ExerciseMuscleTarget[]
  isProvisionalMuscles?: boolean
  primary_muscles?: { ar?: string[]; db?: string[] } | string[]
  secondary_muscles?: { ar?: string[]; db?: string[] } | string[]
  targetMusclesAr?: string[]
}

export interface ResolvedMusclesResult {
  tier: 1 | 2 | 3 | 4
  muscles: ExerciseMuscleTarget[]
  caption?: string
  note?: string
  namesOnly?: string[]
  isProvisional?: boolean
  defaultView: 'A' | 'P'
}

// Group aliases to normalize group names across English, database IDs, and categories
const GROUP_NORM_MAP: Record<string, string> = {
  abdominals: 'abdominals',
  abs: 'abdominals',
  core: 'abdominals',
  abductors: 'abductors',
  adductors: 'adductors',
  biceps: 'biceps',
  arms: 'biceps',
  calves: 'calves',
  chest: 'chest',
  forearms: 'forearms',
  glutes: 'glutes',
  hamstrings: 'hamstrings',
  legs: 'quadriceps',
  quadriceps: 'quadriceps',
  quads: 'quadriceps',
  lats: 'lats',
  'lower back': 'lower back',
  lower_back: 'lower back',
  lowerback: 'lower back',
  'middle back': 'middle back',
  middle_back: 'middle back',
  back: 'lats',
  neck: 'neck',
  shoulders: 'shoulders',
  traps: 'traps',
  triceps: 'triceps',
}

function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

/**
 * Pure function to resolve muscles for an exercise across 4 strict tiers:
 * Tier 1: Curated exercise_muscles.json
 * Tier 2: User-defined exercise.muscles from custom exercise builder
 * Tier 3: Group-level expansion through group-to-heads.json with caption
 * Tier 4: Names only with "لا توجد خريطة تفصيلية لهذا التمرين بعد"
 */
export function resolveMuscles(exercise: ResolveMusclesInput): ResolvedMusclesResult {
  if (!exercise) {
    return {
      tier: 4,
      muscles: [],
      note: 'لا توجد خريطة تفصيلية لهذا التمرين بعد',
      namesOnly: [],
      defaultView: 'A',
    }
  }

  // -------------------------------------------------------------
  // TIER 1: Curated match from exercise_muscles.json
  // Matches by key, name_en (or name), or db_id (or id)
  // -------------------------------------------------------------
  const curatedMap = exerciseMusclesData as Record<
    string,
    { muscles: ExerciseMuscleTarget[] }
  >

  const candidatesToMatch: string[] = []
  if (exercise.key) candidatesToMatch.push(exercise.key)
  if (exercise.name_en) candidatesToMatch.push(exercise.name_en)
  if (exercise.name) candidatesToMatch.push(exercise.name)
  if (exercise.db_id) candidatesToMatch.push(exercise.db_id)
  if (exercise.id) candidatesToMatch.push(exercise.id)

  for (const candidate of candidatesToMatch) {
    const norm = normalizeKey(candidate)
    if (norm && curatedMap[norm] && curatedMap[norm].muscles?.length > 0) {
      const muscles = curatedMap[norm].muscles
      return {
        tier: 1,
        muscles,
        defaultView: computeBestView(muscles),
      }
    }
  }

  // -------------------------------------------------------------
  // TIER 2: User-defined explicit muscles on exercise
  // (From custom exercise picker in Task B)
  // -------------------------------------------------------------
  if (exercise.muscles && exercise.muscles.length > 0) {
    return {
      tier: 2,
      muscles: exercise.muscles,
      defaultView: computeBestView(exercise.muscles),
    }
  }

  // -------------------------------------------------------------
  // TIER 3: Group-level expansion via group-to-heads.json
  // Map primary_muscles.db and secondary_muscles.db
  // Never expand beyond that group (e.g. lower back -> erector_spinae only)
  // -------------------------------------------------------------
  const groupTable = (groupToHeadsData as { groups: Record<string, string[]> }).groups

  const primaryGroupNames: string[] = []
  const secondaryGroupNames: string[] = []

  // Extract primary groups
  if (Array.isArray(exercise.primary_muscles)) {
    primaryGroupNames.push(...exercise.primary_muscles)
  } else if (exercise.primary_muscles?.db && Array.isArray(exercise.primary_muscles.db)) {
    primaryGroupNames.push(...exercise.primary_muscles.db)
  }

  // Extract secondary groups
  if (Array.isArray(exercise.secondary_muscles)) {
    secondaryGroupNames.push(...exercise.secondary_muscles)
  } else if (exercise.secondary_muscles?.db && Array.isArray(exercise.secondary_muscles.db)) {
    secondaryGroupNames.push(...exercise.secondary_muscles.db)
  }

  // If no primary group specified, inspect category / muscle_group or targetMuscles
  if (primaryGroupNames.length === 0) {
    const fallbackGroup = exercise.muscle_group || exercise.category
    if (fallbackGroup) {
      const nameText = `${exercise.name || ''} ${exercise.name_ar || ''} ${exercise.nameAr || ''}`.toLowerCase()
      if (
        fallbackGroup === 'lower back' ||
        fallbackGroup === 'lower_back' ||
        (fallbackGroup === 'back' &&
          (nameText.includes('lower back') ||
            nameText.includes('قطنية') ||
            nameText.includes('أسفل الظهر') ||
            nameText.includes('hyperextension') ||
            nameText.includes('back extension')))
      ) {
        primaryGroupNames.push('lower back')
      } else {
        primaryGroupNames.push(fallbackGroup)
      }
    }
  }

  const primaryHeadIds = new Set<string>()
  const secondaryHeadIds = new Set<string>()

  for (const groupName of primaryGroupNames) {
    const norm = GROUP_NORM_MAP[groupName.toLowerCase().trim()] || groupName.toLowerCase().trim()
    const heads = groupTable[norm]
    if (heads) {
      for (const h of heads) primaryHeadIds.add(h)
    }
  }

  for (const groupName of secondaryGroupNames) {
    const norm = GROUP_NORM_MAP[groupName.toLowerCase().trim()] || groupName.toLowerCase().trim()
    const heads = groupTable[norm]
    if (heads) {
      for (const h of heads) {
        if (!primaryHeadIds.has(h)) {
          secondaryHeadIds.add(h)
        }
      }
    }
  }

  if (primaryHeadIds.size > 0 || secondaryHeadIds.size > 0) {
    const muscles: ExerciseMuscleTarget[] = [
      ...Array.from(primaryHeadIds).map((id) => ({ id, role: 'primary' as const })),
      ...Array.from(secondaryHeadIds).map((id) => ({ id, role: 'secondary' as const })),
    ]

    return {
      tier: 3,
      muscles,
      caption: 'تحديد على مستوى العضلة كاملة',
      isProvisional: true,
      defaultView: computeBestView(muscles),
    }
  }

  // -------------------------------------------------------------
  // TIER 4: Names only (unknown group / unmapped)
  // -------------------------------------------------------------
  const names =
    (exercise.primary_muscles && !Array.isArray(exercise.primary_muscles) && exercise.primary_muscles.ar) ||
    exercise.targetMusclesAr ||
    [exercise.nameAr || exercise.name_ar || 'تمرين عام']

  return {
    tier: 4,
    muscles: [],
    note: 'لا توجد خريطة تفصيلية لهذا التمرين بعد',
    namesOnly: names,
    defaultView: 'A',
  }
}

/**
 * Computes default best view ('A' anterior vs 'P' posterior)
 * Weight: primary = 2, secondary = 1.
 * Tie -> 'A' (أمامي)
 */
export function computeBestView(muscles: ExerciseMuscleTarget[]): 'A' | 'P' {
  const metaMuscles = (atlasMetaData as {
    muscles?: Record<string, { best_view?: 'A' | 'P'; views?: { A?: { visible_pixels?: number }; P?: { visible_pixels?: number } } }>
  }).muscles || {}

  let scoreA = 0
  let scoreP = 0

  for (const m of muscles) {
    const weight = m.role === 'primary' ? 2 : 1
    const meta = metaMuscles[m.id]
    if (meta) {
      const hasA = (meta.views?.A?.visible_pixels ?? 0) > 0 || meta.best_view === 'A'
      const hasP = (meta.views?.P?.visible_pixels ?? 0) > 0 || meta.best_view === 'P'

      if (hasA) scoreA += weight
      if (hasP) scoreP += weight
    } else {
      // Fallback heuristics if ID not in meta
      scoreA += weight
    }
  }

  return scoreP > scoreA ? 'P' : 'A'
}
