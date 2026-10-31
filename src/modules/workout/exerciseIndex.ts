import type { Exercise } from '../shared/types.ts'
import catalogData from '../../data/catalog-v1.json' with { type: 'json' }

export interface CatalogMediaFrame {
  start: string | null
  peak: string | null
  source: string
  source_id: string | null
  match: 'exact' | 'nearest' | 'none'
  display: boolean
  note_ar: string
}

export interface CatalogMediaGif {
  url: string | null
  source: string
  source_id: string | null
  source_name: string | null
  size: string | null
  attribution: string | null
  match: 'exact' | 'nearest' | 'none'
  display: boolean
  note_ar: string
}

export interface CatalogExerciseItem {
  key: string
  name_en: string
  name_ar: string
  category: string
  kind: string
  equipment: { ar: string; db: string }
  level: { ar: string; db: string }
  target_ar: string
  muscles: Array<{ id: string; role: 'primary' | 'secondary' }>
  muscles_note_en?: string
  muscles_status?: string
  benefit_ar: string
  mechanics_ar: string
  steps_ar: string[]
  common_mistakes_ar?: string[]
  rest_seconds: number
  references: string[]
  media?: {
    frames?: CatalogMediaFrame
    gif?: CatalogMediaGif
  }
  content_status?: string
  content_gaps?: string[]
}

export const EXERCISE_ALIASES: Record<string, string> = {
  'ext-Alternate_Hammer_Curl': 'Alternate_Hammer_Curl',
  Alternate_Incline_Dumbbell_Curl: 'Alternate_Incline_Dumbbell_Curl',
  'ext-Alternate_Incline_Dumbbell_Curl': 'Alternate_Incline_Dumbbell_Curl',
  Band_Skull_Crusher: 'Band_Skull_Crusher',
  'ext-Band_Skull_Crusher': 'Band_Skull_Crusher',
  Barbell_Curls_Lying_Against_An_Incline:
    'Barbell_Curls_Lying_Against_An_Incline',
  'ext-Barbell_Curls_Lying_Against_An_Incline':
    'Barbell_Curls_Lying_Against_An_Incline',
  'Palms-Down_Wrist_Curl_Over_A_Bench': 'Palms-Down_Wrist_Curl_Over_A_Bench',
  'ext-Palms-Down_Wrist_Curl_Over_A_Bench':
    'Palms-Down_Wrist_Curl_Over_A_Bench',
  'Close-Grip_Push-Up_off_of_a_Dumbbell': 'arm-20',
  'ext-Close-Grip_Push-Up_off_of_a_Dumbbell': 'arm-20',
  '3_4_Sit-Up': '3_4_Sit-Up',
  'ext-3_4_Sit-Up': '3_4_Sit-Up',
  Ab_Crunch_Machine: 'Ab_Crunch_Machine',
  'ext-Ab_Crunch_Machine': 'Ab_Crunch_Machine',
  Alternate_Heel_Touchers: 'Alternate_Heel_Touchers',
  'ext-Alternate_Heel_Touchers': 'Alternate_Heel_Touchers',
  'Barbell_Ab_Rollout_-_On_Knees': 'Barbell_Ab_Rollout_-_On_Knees',
  'ext-Barbell_Ab_Rollout_-_On_Knees': 'Barbell_Ab_Rollout_-_On_Knees',
  Cocoons: 'Cocoons',
  'ext-Cocoons': 'Cocoons',
  Gorilla_Chin_Crunch: 'Gorilla_Chin_Crunch',
  'ext-Gorilla_Chin_Crunch': 'Gorilla_Chin_Crunch',
  'Jackknife_Sit-Up': 'core-9',
  'ext-Jackknife_Sit-Up': 'core-9',
  Scissor_Kick: 'Scissor_Kick',
  'ext-Scissor_Kick': 'Scissor_Kick',
  Spider_Crawl: 'Spider_Crawl',
  'ext-Spider_Crawl': 'Spider_Crawl',
  'back-2': 'back-7',
  'back-21': 'core-19',
  'shoulder-2': 'shoulder-15',
  'shoulder-8': 'shoulder-16',
  'core-3': 'core-17',
  'core-11': 'core-13',
}

function mapCatalogItem(item: CatalogExerciseItem): Exercise {
  const primaryMuscles = (item.muscles || [])
    .filter((m) => m.role === 'primary')
    .map((m) => m.id)
  const primaryMuscle = primaryMuscles[0] || ''

  return {
    id: item.key,
    key: item.key,
    name: item.name_en,
    nameEn: item.name_en,
    nameAr: item.name_ar,
    descriptionAr: item.benefit_ar || item.mechanics_ar || '',
    category: item.category as Exercise['category'],
    kind: item.kind,
    difficulty: (item.level?.db || 'beginner') as Exercise['difficulty'],
    equipment: (item.equipment?.db || 'barbell') as Exercise['equipment'],
    equipmentDetail: item.equipment,
    levelDetail: item.level,
    target_ar: item.target_ar,
    targetMusclesAr: [item.target_ar],
    targetSubMuscleAr: primaryMuscle,
    targetSubMusclesAr: primaryMuscles,
    howToStepsAr: item.steps_ar || [],
    steps_ar: item.steps_ar || [],
    benefitAr: item.benefit_ar,
    mechanicsAr: item.mechanics_ar,
    common_mistakes_ar: item.common_mistakes_ar || [],
    restSeconds: item.rest_seconds || 90,
    rest_seconds: item.rest_seconds || 90,
    references: item.references || [],
    medicalSource: item.references?.[0] || '',
    muscles: item.muscles,
    muscles_status: item.muscles_status || 'coach_curated',
    media: item.media,
    archived: false,
    content_status: item.content_status,
  }
}

const INDEXED_EXERCISES: Exercise[] = (
  catalogData.exercises as CatalogExerciseItem[]
).map(mapCatalogItem)

const EXERCISE_BY_ID = new Map<string, Exercise>()
for (const ex of INDEXED_EXERCISES) {
  EXERCISE_BY_ID.set(ex.id, ex)
  if (ex.key && ex.key !== ex.id) {
    EXERCISE_BY_ID.set(ex.key, ex)
  }
}

export function getExerciseFromIndex(id: string): Exercise | undefined {
  if (!id) return undefined

  // 1. Direct hit
  const direct = EXERCISE_BY_ID.get(id)
  if (direct) return direct

  // 2. Alias hit
  const alias = EXERCISE_ALIASES[id]
  if (alias) {
    const aliased = EXERCISE_BY_ID.get(alias)
    if (aliased) return aliased
  }

  // 3. ext- prefix fallback
  if (id.startsWith('ext-')) {
    const raw = id.slice(4)
    const matched = EXERCISE_BY_ID.get(raw)
    if (matched) return matched
  }

  return undefined
}

export const CATALOG_INDEX: Exercise[] = INDEXED_EXERCISES
