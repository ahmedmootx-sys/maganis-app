import type { Goal } from '../onboarding/types.ts'
import type {
  CustomExercise,
  Difficulty,
  Equipment,
  Exercise,
  MuscleGroup,
  ProgramDay,
  ProgramExercise,
  WorkoutProgram,
  WorkoutSplitType,
} from '../shared/types.ts'
import { DAY_NAMES_AR, MUSCLE_GROUP_LABELS } from '../shared/types.ts'
import { EXERCISES, filterByInjuries } from './exercises.ts'

// ============================================================
// منهجية بناء البرنامج وفق إرشادات ACSM/NSCA:
// - دعم أنظمة التمرين العلمية: PPL، علوي/سفلي، أرنولد، برو سبليت، جسم كامل
// - استهداف العضلة مرتين أسبوعياً (2x Frequency) للأنظمة المناسبة
// - ترتيب التمارين: الأساسيات متعددة المفاصل أولاً ثم التكميلية فالعزل والبطن
// - عدد التمارين: 5 إلى 6 تمارين لكل يوم تدريبي
// ============================================================

export const SPLIT_CONFIGS: Record<
  WorkoutSplitType,
  {
    splits: MuscleGroup[][]
    dayLabels: string[]
  }
> = {
  ppl: {
    splits: [
      ['chest', 'shoulders', 'arms'],
      ['back', 'arms', 'core'],
      ['legs', 'core'],
      ['chest', 'shoulders', 'arms'],
      ['back', 'arms', 'core'],
      ['legs', 'core'],
    ],
    dayLabels: [
      'دفع (أ) — صدر / كتف / ترايسبس',
      'سحب (أ) — ظهر / بايسبس / بطن',
      'أرجل (أ) — فخذ أمامي / خلفيات / سمانة',
      'دفع (ب) — ضغط مائل / رفرفة / تراي',
      'سحب (ب) — سحب لأسفل / سحب أرضي / بطن',
      'أرجل (ب) — سكوات / طعنات / جلوتس',
    ],
  },
  upper_lower: {
    splits: [
      ['chest', 'back', 'shoulders', 'arms'],
      ['legs', 'core'],
      ['back', 'chest', 'shoulders', 'arms'],
      ['legs', 'core'],
    ],
    dayLabels: [
      'علوي (أ) — صدر / ظهر / كتف / ذراعين',
      'سفلي (أ) — أرجل / سمانة / بطن',
      'علوي (ب) — تركيز سحب ودفع متوازن',
      'سفلي (ب) — قوة واستقرار الجزء السفلي',
    ],
  },
  arnold: {
    splits: [
      ['chest', 'back'],
      ['shoulders', 'arms'],
      ['legs', 'core'],
      ['chest', 'back'],
      ['shoulders', 'arms'],
      ['legs', 'core'],
    ],
    dayLabels: [
      'أرنولد (أ) — صدر وظهر',
      'أرنولد (أ) — كتف وذراعين',
      'أرنولد (أ) — أرجل وجذع',
      'أرنولد (ب) — صدر وظهر',
      'أرنولد (ب) — كتف وذراعين',
      'أرنولد (ب) — أرجل وبطن',
    ],
  },
  bro_split: {
    splits: [
      ['chest', 'core'],
      ['back'],
      ['shoulders', 'core'],
      ['legs'],
      ['arms', 'core'],
    ],
    dayLabels: [
      'يوم الصدر والبطن',
      'يوم الظهر والمجانص',
      'يوم الأكتاف والترابيس',
      'يوم الأرجل الشامل',
      'يوم الذراعين (بايسبس + ترايسبس)',
    ],
  },
  full_body: {
    splits: [
      ['chest', 'back', 'legs', 'shoulders', 'core'],
      ['legs', 'back', 'chest', 'arms', 'core'],
      ['back', 'chest', 'legs', 'arms', 'core'],
    ],
    dayLabels: [
      'جسم كامل (أ) — تركيز القوة والأساسيات',
      'جسم كامل (ب) — حجم تدريبي متوازن',
      'جسم كامل (ج) — استطالة وتحمل عضلي',
    ],
  },
}

function resolveSplit(
  daysCount: number,
  splitType?: WorkoutSplitType,
): {
  type: WorkoutSplitType
  groups: MuscleGroup[][]
  labels: string[]
} {
  if (splitType && SPLIT_CONFIGS[splitType]) {
    const config = SPLIT_CONFIGS[splitType]
    const needed = Math.min(daysCount, config.splits.length)
    return {
      type: splitType,
      groups: config.splits.slice(0, needed),
      labels: config.dayLabels.slice(0, needed),
    }
  }

  if (daysCount >= 6) {
    return {
      type: 'ppl',
      groups: SPLIT_CONFIGS.ppl.splits,
      labels: SPLIT_CONFIGS.ppl.dayLabels,
    }
  }
  if (daysCount === 5) {
    return {
      type: 'bro_split',
      groups: SPLIT_CONFIGS.bro_split.splits,
      labels: SPLIT_CONFIGS.bro_split.dayLabels,
    }
  }
  if (daysCount === 4) {
    return {
      type: 'upper_lower',
      groups: SPLIT_CONFIGS.upper_lower.splits,
      labels: SPLIT_CONFIGS.upper_lower.dayLabels,
    }
  }
  if (daysCount === 3) {
    return {
      type: 'ppl',
      groups: SPLIT_CONFIGS.ppl.splits.slice(0, 3),
      labels: SPLIT_CONFIGS.ppl.dayLabels.slice(0, 3),
    }
  }
  return {
    type: 'full_body',
    groups: SPLIT_CONFIGS.full_body.splits.slice(0, 2),
    labels: SPLIT_CONFIGS.full_body.dayLabels.slice(0, 2),
  }
}

// --------------- الحجم التدريبي حسب الهدف (ACSM) ---------------

interface SetRepConfig {
  minSets: number
  maxSets: number
  minReps: number
  maxReps: number
  restSeconds: number
}

const GOAL_CONFIG: Record<Goal, SetRepConfig> = {
  hypertrophy: {
    minSets: 3,
    maxSets: 4,
    minReps: 8,
    maxReps: 12,
    restSeconds: 75,
  },
  cut: { minSets: 3, maxSets: 4, minReps: 15, maxReps: 20, restSeconds: 38 },
  flexibility: {
    minSets: 2,
    maxSets: 3,
    minReps: 12,
    maxReps: 15,
    restSeconds: 60,
  },
  calisthenics: {
    minSets: 3,
    maxSets: 3,
    minReps: 0,
    maxReps: 0,
    restSeconds: 60,
  },
}

// --------------- Helpers ---------------

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function uniqueId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  }
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * اختيار تمارين مجموعة عضلية بترتيب علمي:
 * 1. رشّ داخل كل مستوى صعوبة (تنويع بين البرامج)
 * 2. ترتيب المستويات: مبتدئ ← متوسط ← متقدم
 *    (الأساسيات الأبسط تُدرَّب أولاً في الجلسة — توصية NSCA)
 */
function selectForGroup(
  group: MuscleGroup,
  pool: Exercise[],
  count: number,
  usedIds: Set<string>,
): Exercise[] {
  const candidates = pool.filter(
    (e) => e.category === group && !usedIds.has(e.id),
  )
  const ordered = [
    ...shuffle(candidates.filter((e) => e.difficulty === 'beginner')),
    ...shuffle(candidates.filter((e) => e.difficulty === 'intermediate')),
    ...shuffle(candidates.filter((e) => e.difficulty === 'advanced')),
  ]
  return ordered.slice(0, count)
}

// --------------- بناء تمرين واحد ---------------

function buildProgramExercise(
  exerciseId: string,
  difficulty: Difficulty,
  config: SetRepConfig,
  goal: Goal,
): ProgramExercise {
  // Progressive overload: المستوى المتقدم يحصل على حجم أعلى قليلاً
  const diffBonus = difficulty === 'advanced' ? 1 : 0
  const sets = randInt(config.minSets, config.maxSets) + diffBonus

  const reps =
    goal === 'calisthenics'
      ? 0 // 0 تعني "أقصى عدد ممكن" (AMRAP)
      : randInt(config.minReps, config.maxReps)

  return {
    exerciseId,
    sets,
    reps,
    restSeconds: config.restSeconds,
  }
}

// --------------- Core logic ---------------

interface GenerateParams {
  goal: Goal
  trainingDaysPerWeek: number
  splitType?: WorkoutSplitType
  injuries?: string[]
  customExercises?: CustomExercise[]
}

export function generateProgram(params: GenerateParams): WorkoutProgram {
  const {
    goal,
    trainingDaysPerWeek,
    splitType,
    injuries = [],
    customExercises = [],
  } = params

  // 1. بناء مجمّع التمارين المتاحة
  const basePool = filterByInjuries(EXERCISES, injuries)
  const equipmentOk = goalEquipmentFilter(goal)
  const pool = shuffle(
    [...basePool, ...customExercises].filter((e) => equipmentOk(e.equipment)),
  )

  // 2. تحديد نمط التقسيم العلمي
  const normalizedDays = Math.min(6, Math.max(2, trainingDaysPerWeek))
  const resolved = resolveSplit(normalizedDays, splitType)
  const splits = resolved.groups
  const dayLabels = resolved.labels
  const config = GOAL_CONFIG[goal]

  // 3. بناء كل يوم تدريبي بعدد 5 إلى 6 تمارين
  const days: ProgramDay[] = splits.map((groups, dayIdx) => {
    const exercises: ProgramExercise[] = []
    const targetCount = groups.length === 1 ? 5 : 6
    const usedToday = new Set<string>()

    // المرحلة الأولى: اختيار تمارين متوازنة لكل مجموعة عضلية باليوم
    for (const group of groups) {
      if (exercises.length >= targetCount) break
      const remainingSlots = targetCount - exercises.length
      const countForGroup = Math.min(
        Math.max(1, Math.ceil(remainingSlots / Math.max(1, groups.length))),
        remainingSlots,
      )
      const picks = selectForGroup(group, pool, countForGroup, usedToday)
      for (const pick of picks) {
        if (exercises.length >= targetCount) break
        usedToday.add(pick.id)
        exercises.push(
          buildProgramExercise(pick.id, pick.difficulty, config, goal),
        )
      }
    }

    // المرحلة الثانية: استكمال باقي التمارين حتى 5-6 تمارين
    if (exercises.length < targetCount) {
      for (const group of groups) {
        if (exercises.length >= targetCount) break
        const picks = selectForGroup(
          group,
          pool,
          targetCount - exercises.length,
          usedToday,
        )
        for (const pick of picks) {
          if (exercises.length >= targetCount) break
          usedToday.add(pick.id)
          exercises.push(
            buildProgramExercise(pick.id, pick.difficulty, config, goal),
          )
        }
      }
    }

    // المرحلة الثالثة: ضمان ألا يقل اليوم عن 5 تمارين إطلاقاً
    if (exercises.length < 5) {
      for (const e of pool) {
        if (exercises.length >= 5) break
        if (usedToday.has(e.id)) continue
        usedToday.add(e.id)
        exercises.push(buildProgramExercise(e.id, e.difficulty, config, goal))
      }
    }

    const dayName = DAY_NAMES_AR[dayIdx] ?? `يوم ${dayIdx + 1}`
    const focusLabel =
      dayLabels[dayIdx] ?? groups.map((g) => MUSCLE_GROUP_LABELS[g]).join(' و')

    return {
      dayIndex: dayIdx,
      labelAr: dayName,
      focus: focusLabel,
      exercises,
    }
  })

  return {
    id: uniqueId(),
    createdAt: Date.now(),
    primaryGoal: goal,
    trainingDaysPerWeek,
    splitType: resolved.type,
    days,
  }
}

// --------------- Goal -> equipment filter ---------------

function goalEquipmentFilter(goal: Goal): (eq: Equipment) => boolean {
  if (goal === 'calisthenics') return (eq) => eq === 'bodyweight'
  if (goal === 'flexibility')
    return (eq) => eq === 'bodyweight' || eq === 'band'
  return () => true
}
