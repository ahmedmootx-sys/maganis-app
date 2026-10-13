import type {
  Exercise,
  ExerciseMuscleTarget,
  MuscleRole,
} from '../shared/types.ts'
import exerciseMusclesData from './exercise_muscles.json'

const LEGACY_MAP: Record<string, string[]> = {
  chest: ['pec_clavicular', 'pec_sternal', 'pec_costal'],
  shoulders: ['delt_anterior', 'delt_lateral', 'delt_posterior'],
  triceps: ['triceps_long', 'triceps_lateral', 'triceps_medial'],
  biceps: ['biceps_long', 'biceps_short'],
  lats: ['lats', 'teres_major'],
  'middle back': ['rhomboids', 'trap_middle', 'trap_lower'],
  'lower back': ['erector_spinae'],
  traps: ['trap_upper', 'trap_middle', 'trap_lower'],
  quadriceps: ['rectus_femoris', 'vastus_lateralis', 'vastus_medialis'],
  hamstrings: [
    'hamstring_bf_long',
    'hamstring_bf_short',
    'hamstring_semitendinosus',
    'hamstring_semimembranosus',
  ],
  glutes: ['glute_max', 'glute_med'],
  calves: ['gastrocnemius_medial', 'gastrocnemius_lateral', 'soleus'],
  abdominals: [
    'rectus_abdominis_upper',
    'rectus_abdominis_lower',
    'obliques_external',
  ],
  forearms: ['forearm_flexors', 'forearm_extensors', 'brachioradialis'],
  abductors: ['glute_med', 'tfl'],
  adductors: ['adductors'],
}

// Arabic to legacy group mapping
const ARABIC_GROUP_MAP: Record<string, string> = {
  صدر: 'chest',
  أكتاف: 'shoulders',
  كتف: 'shoulders',
  دالية: 'shoulders',
  ترايسبس: 'triceps',
  تراي: 'triceps',
  بايسبس: 'biceps',
  باي: 'biceps',
  ظهر: 'middle back',
  لاتس: 'lats',
  عريضة: 'lats',
  ترابيس: 'traps',
  رباعية: 'quadriceps',
  فخذ: 'quadriceps',
  أوتار: 'hamstrings',
  خلفية: 'hamstrings',
  ألوية: 'glutes',
  سمانة: 'calves',
  بطن: 'abdominals',
  ساعد: 'forearms',
  مقربة: 'adductors',
}

/**
 * Resolves head-level muscle targets for an exercise.
 * 1. If exercise already defines explicit `muscles`, uses them.
 * 2. If defined in `exercise_muscles.json`, uses them.
 * 3. Otherwise, expands legacy category & targetMusclesAr and flags as provisional.
 */
export function resolveExerciseMuscles(exercise: Partial<Exercise>): {
  muscles: ExerciseMuscleTarget[]
  isProvisional: boolean
} {
  // 1. Explicit head-level targets on exercise
  if (exercise.muscles && exercise.muscles.length > 0) {
    return {
      muscles: exercise.muscles,
      isProvisional: !!exercise.isProvisionalMuscles,
    }
  }

  // 2. Check exercise_muscles.json by normalized id or name
  const exId = exercise.id ? exercise.id.toLowerCase().replace(/-/g, '_') : ''
  const jsonMap = exerciseMusclesData as Record<
    string,
    { muscles: ExerciseMuscleTarget[] }
  >

  if (exId && jsonMap[exId]) {
    return {
      muscles: jsonMap[exId].muscles,
      isProvisional: false,
    }
  }

  // Also check normalized name if id didn't match directly
  const nameEn = (exercise.name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
  if (nameEn && jsonMap[nameEn]) {
    return {
      muscles: jsonMap[nameEn].muscles,
      isProvisional: false,
    }
  }

  // 3. Fallback: Legacy expansion
  const muscleMap = new Map<string, MuscleRole>()

  // Helper to add expanded group
  function addGroup(groupName: string, role: MuscleRole) {
    const normalized = groupName.toLowerCase().trim()
    const mappedKey =
      Object.keys(LEGACY_MAP).find((k) => k === normalized) ||
      Object.entries(ARABIC_GROUP_MAP).find(([ar]) =>
        normalized.includes(ar),
      )?.[1]

    const heads = mappedKey ? LEGACY_MAP[mappedKey] : undefined
    if (heads) {
      for (const head of heads) {
        if (!muscleMap.has(head)) {
          muscleMap.set(head, role)
        }
      }
    }
  }

  // Primary from exercise category
  if (exercise.category) {
    const catGroup =
      exercise.category === 'legs'
        ? 'quadriceps'
        : exercise.category === 'back'
          ? 'lats'
          : exercise.category === 'core'
            ? 'abdominals'
            : exercise.category === 'arms'
              ? 'biceps'
              : exercise.category
    addGroup(catGroup, 'primary')
  }

  // Additional targets from targetMusclesAr
  if (exercise.targetMusclesAr && exercise.targetMusclesAr.length > 0) {
    for (let i = 0; i < exercise.targetMusclesAr.length; i++) {
      const targetStr = exercise.targetMusclesAr[i]
      const role: MuscleRole =
        i === 0 && muscleMap.size === 0 ? 'primary' : 'secondary'
      addGroup(targetStr, role)
    }
  }

  // Ensure at least one primary exists
  const muscles: ExerciseMuscleTarget[] = []
  let hasPrimary = false

  for (const [id, role] of muscleMap.entries()) {
    if (role === 'primary') hasPrimary = true
    muscles.push({ id, role })
  }

  if (!hasPrimary && muscles.length > 0) {
    muscles[0].role = 'primary'
  }

  // If still completely empty, default to chest primary
  if (muscles.length === 0) {
    muscles.push(
      { id: 'pec_clavicular', role: 'primary' },
      { id: 'pec_sternal', role: 'primary' },
    )
  }

  return {
    muscles,
    isProvisional: true,
  }
}
