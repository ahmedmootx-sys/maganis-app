import exerciseMusclesData from '../../data/exercise_muscles.json' with { type: 'json' }
import groupToHeadsData from '../../data/group-to-heads.json' with { type: 'json' }
import atlasMetaData from '../../../public/atlas/atlas-meta.json' with { type: 'json' }

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
  imageUrl?: string
  thumbnailUrl?: string
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

const AR_TARGET_TO_GROUP: Record<string, string> = {
  الصدر: 'chest',
  الصدرية: 'chest',
  الكتف: 'shoulders',
  الدالية: 'shoulders',
  الترايسبس: 'triceps',
  البايسبس: 'biceps',
  الظهر: 'lats',
  المجانص: 'lats',
  الرومبويدز: 'middle back',
  الترابيس: 'traps',
  الساعد: 'forearms',
  السمانة: 'calves',
  المؤخرة: 'glutes',
  الجلوتس: 'glutes',
  الرباعية: 'quadriceps',
  الأمامية: 'quadriceps',
  'أوتار الركبة': 'hamstrings',
  الهمسترنج: 'hamstrings',
  البطن: 'abdominals',
  الكور: 'abdominals',
  القطنية: 'lower back',
  المبعدة: 'abductors',
  الضامة: 'adductors',
  الرقبة: 'neck',
}

function extractDbId(url?: string): string {
  if (!url) return ''
  const m = url.match(/exercises\/([^/]+)\//)
  return m ? m[1] : ''
}

const STRICT_VARIANTS = [
  'incline',
  'decline',
  'close_grip',
  'reverse_grip',
  'wide_grip',
  'one_arm',
]

function areVariantsCompatible(a: string, b: string): boolean {
  for (const v of STRICT_VARIANTS) {
    const inA = a.includes(v)
    const inB = b.includes(v)
    if (inA !== inB) return false
  }
  return true
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
 * Tier 1: Curated exercise_muscles.json (strict order: key -> db_id -> normalised db_name -> name_en)
 * Tier 2: User-defined exercise.muscles from custom exercise builder
 * Tier 3: Group-level expansion through group-to-heads.json with caption
 * Tier 4: Names only with "لا توجد خريطة تفصيلية لهذا التمرين بعد"
 */
export function resolveMuscles(
  exercise: ResolveMusclesInput,
): ResolvedMusclesResult {
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
  // Strict matching order: key -> db_id -> normalised db_name -> name_en
  // (never match across variants such as incline/decline/close-grip)
  // -------------------------------------------------------------
  const curatedMap = exerciseMusclesData as Record<
    string,
    { muscles: ExerciseMuscleTarget[] }
  >

  // 1. key
  if (exercise.key) {
    const normKey = normalizeKey(exercise.key)
    if (
      normKey &&
      curatedMap[normKey]?.muscles?.length > 0 &&
      areVariantsCompatible(normKey, normKey)
    ) {
      const muscles = curatedMap[normKey].muscles
      return {
        tier: 1,
        muscles,
        defaultView: computeBestView(muscles),
      }
    }
  }

  // 2. db_id
  const dbId =
    exercise.db_id ||
    extractDbId(exercise.imageUrl || exercise.thumbnailUrl) ||
    (exercise.id && !exercise.id.includes('-') ? exercise.id : '')
  if (dbId) {
    const normDbId = normalizeKey(dbId)
    if (
      normDbId &&
      curatedMap[normDbId]?.muscles?.length > 0 &&
      areVariantsCompatible(normDbId, normDbId)
    ) {
      const muscles = curatedMap[normDbId].muscles
      return {
        tier: 1,
        muscles,
        defaultView: computeBestView(muscles),
      }
    }
  }

  // 3. normalised db_name
  if (dbId) {
    const normDbName = normalizeKey(dbId.replace(/_/g, ' '))
    if (
      normDbName &&
      curatedMap[normDbName]?.muscles?.length > 0 &&
      areVariantsCompatible(normDbName, normDbName)
    ) {
      const muscles = curatedMap[normDbName].muscles
      return {
        tier: 1,
        muscles,
        defaultView: computeBestView(muscles),
      }
    }

    // Check non-variant stripped descriptors (e.g. medium grip, full squat, with handle)
    const stripped = normDbName
      .replace(/_medium_grip$/, '')
      .replace(/_full_squat$/, '_squat')
      .replace(/_with_handle$/, '')
      .replace(/_chest_version$/, '')
      .replace(/_triceps_version$/, '')
      .replace(/_back_extensions$/, '')
      .replace(/^standing_military_press$/, 'overhead_press')
      .replace(/^side_lateral_raise$/, 'lateral_raise')
      .replace(/^dumbbell_bicep_curl$/, 'dumbbell_biceps_curl')
    if (
      stripped &&
      curatedMap[stripped]?.muscles?.length > 0 &&
      areVariantsCompatible(normDbName, stripped)
    ) {
      const muscles = curatedMap[stripped].muscles
      return {
        tier: 1,
        muscles,
        defaultView: computeBestView(muscles),
      }
    }
  }

  // 4. name_en / name
  const candidateName = exercise.name_en || exercise.name
  if (candidateName) {
    const normName = normalizeKey(candidateName)
    if (
      normName &&
      curatedMap[normName]?.muscles?.length > 0 &&
      areVariantsCompatible(normName, normName)
    ) {
      const muscles = curatedMap[normName].muscles
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
  const groupTable = (groupToHeadsData as { groups: Record<string, string[]> })
    .groups

  const primaryGroupNames: string[] = []
  const secondaryGroupNames: string[] = []

  // Extract primary groups
  if (Array.isArray(exercise.primary_muscles)) {
    primaryGroupNames.push(...exercise.primary_muscles)
  } else if (
    exercise.primary_muscles?.db &&
    Array.isArray(exercise.primary_muscles.db)
  ) {
    primaryGroupNames.push(...exercise.primary_muscles.db)
  }

  // Extract secondary groups
  if (Array.isArray(exercise.secondary_muscles)) {
    secondaryGroupNames.push(...exercise.secondary_muscles)
  } else if (
    exercise.secondary_muscles?.db &&
    Array.isArray(exercise.secondary_muscles.db)
  ) {
    secondaryGroupNames.push(...exercise.secondary_muscles.db)
  }

  // If no secondary groups from secondary_muscles, map from targetMusclesAr secondary items
  if (
    secondaryGroupNames.length === 0 &&
    Array.isArray(exercise.targetMusclesAr) &&
    exercise.targetMusclesAr.length > 1
  ) {
    for (let i = 1; i < exercise.targetMusclesAr.length; i++) {
      const arText = exercise.targetMusclesAr[i]
      for (const [arKey, groupVal] of Object.entries(AR_TARGET_TO_GROUP)) {
        if (arText.includes(arKey)) {
          secondaryGroupNames.push(groupVal)
          break
        }
      }
    }
  }

  // If no primary group specified, inspect category / muscle_group or targetMuscles
  if (primaryGroupNames.length === 0) {
    const fallbackGroup = exercise.muscle_group || exercise.category
    if (fallbackGroup) {
      const nameText =
        `${exercise.name || ''} ${exercise.name_ar || ''} ${exercise.nameAr || ''}`.toLowerCase()
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
    const norm =
      GROUP_NORM_MAP[groupName.toLowerCase().trim()] ||
      groupName.toLowerCase().trim()
    const heads = groupTable[norm]
    if (heads) {
      for (const h of heads) primaryHeadIds.add(h)
    }
  }

  for (const groupName of secondaryGroupNames) {
    const norm =
      GROUP_NORM_MAP[groupName.toLowerCase().trim()] ||
      groupName.toLowerCase().trim()
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
      ...Array.from(primaryHeadIds).map((id) => ({
        id,
        role: 'primary' as const,
      })),
      ...Array.from(secondaryHeadIds).map((id) => ({
        id,
        role: 'secondary' as const,
      })),
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
  const names = (exercise.primary_muscles &&
    !Array.isArray(exercise.primary_muscles) &&
    exercise.primary_muscles.ar) ||
    exercise.targetMusclesAr || [
      exercise.nameAr || exercise.name_ar || 'تمرين عام',
    ]

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
/**
 * Computes default best view ('A' anterior vs 'P' posterior) per TASK G3 Part 4.2:
 * "Initial view = the side holding the most primary muscles (tie: the side of the first primary)."
 */
export function computeBestView(muscles: ExerciseMuscleTarget[]): 'A' | 'P' {
  const metaMuscles =
    (
      atlasMetaData as {
        muscles?: Record<
          string,
          {
            best_view?: 'A' | 'P'
            views?: {
              A?: { visible_pixels?: number }
              P?: { visible_pixels?: number }
            }
          }
        >
      }
    ).muscles || {}

  const primaries = muscles.filter((m) => m.role === 'primary')
  if (primaries.length === 0) {
    return 'A'
  }

  let countA = 0
  let countP = 0
  let firstPrimaryView: 'A' | 'P' = 'A'

  primaries.forEach((m, idx) => {
    const meta = metaMuscles[m.id]
    const view: 'A' | 'P' =
      meta?.best_view ||
      ((meta?.views?.P?.visible_pixels ?? 0) >
      (meta?.views?.A?.visible_pixels ?? 0)
        ? 'P'
        : 'A')
    if (idx === 0) {
      firstPrimaryView = view
    }
    if (view === 'A') countA++
    else countP++
  })

  if (countA > countP) return 'A'
  if (countP > countA) return 'P'
  return firstPrimaryView
}
