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
} from '../shared/types.ts'
import { DAY_NAMES_AR, MUSCLE_GROUP_LABELS } from '../shared/types.ts'
import { EXERCISES, filterByInjuries } from './exercises.ts'

// ============================================================
// منهجية بناء البرنامج وفق إرشادات ACSM/NSCA:
// - تقسيم عضلي منظم حسب عدد أيام التمرين (لا توزيع عشوائي)
// - كل مجموعة عضلية تُدرَّب 1-2 مرة أسبوعياً
// - ترتيب التمارين: الأساسيات متعددة المفاصل أولاً ثم العزل
// - حجم التدريب (مجموعات/تكرارات) حسب الهدف
// مراجع: ACSM's Guidelines for Exercise Testing and Prescription (11th ed.)
//         NSCA's Essentials of Strength Training and Conditioning (4th ed.)
// ============================================================

// --------------- تقسيم العضلات حسب عدد الأيام ---------------

/**
 * أنماط التقسيم العلمي الشائعة:
 * - يومان: جسم كامل ×2 (توصية ACSM للمبتدئين)
 * - 3 أيام: دفع / سحب / أرجل+بطن
 * - 4 أيام: علوي / سفلي ×2
 * - 5 أيام: تقسيم عضلي يومي (Bro Split) مع يوم بطن مستقل
 * - 6 أيام: دفع/سحب/أرجل ×2 (للمتقدمين)
 */
const SPLITS: Record<number, MuscleGroup[][]> = {
  2: [
    ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'],
    ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'],
  ],
  3: [
    ['chest', 'shoulders', 'arms'],
    ['back', 'core'],
    ['legs', 'arms', 'core'],
  ],
  4: [
    ['chest', 'back', 'shoulders'],
    ['legs', 'core'],
    ['back', 'chest', 'arms'],
    ['legs', 'core', 'shoulders'],
  ],
  5: [['chest'], ['back'], ['legs'], ['shoulders', 'arms'], ['core', 'arms']],
  6: [
    ['chest', 'shoulders'],
    ['back', 'arms'],
    ['legs', 'core'],
    ['chest', 'arms'],
    ['back', 'shoulders'],
    ['legs', 'core'],
  ],
}

/** وصف عربي مختصر لنمط كل يوم */
const SPLIT_DAY_LABELS: Record<number, string[]> = {
  2: ['جسم كامل (أ)', 'جسم كامل (ب)'],
  3: ['دفع (صدر/كتف/ذراعين)', 'سحب (ظهر/بطن)', 'أرجل وبطن'],
  4: [
    'علوي (صدر/ظهر/كتف)',
    'سفلي (أرجل/بطن)',
    'علوي (ظهر/صدر/ذراعين)',
    'سفلي (أرجل/بطن/كتف)',
  ],
  5: ['صدر', 'ظهر', 'أرجل', 'كتف وذراعين', 'بطن وذراعين'],
  6: ['دفع (أ)', 'سحب (أ)', 'أرجل (أ)', 'دفع (ب)', 'سحب (ب)', 'أرجل (ب)'],
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
  injuries?: string[]
  customExercises?: CustomExercise[]
}

export function generateProgram(params: GenerateParams): WorkoutProgram {
  const {
    goal,
    trainingDaysPerWeek,
    injuries = [],
    customExercises = [],
  } = params

  // 1. بناء مجمّع التمارين المتاحة
  const basePool = filterByInjuries(EXERCISES, injuries)
  const equipmentOk = goalEquipmentFilter(goal)
  const pool = shuffle(
    [...basePool, ...customExercises].filter((e) => equipmentOk(e.equipment)),
  )

  // 2. نمط التقسيم العلمي حسب عدد الأيام
  const normalizedDays = Math.min(6, Math.max(2, trainingDaysPerWeek))
  const splits = SPLITS[normalizedDays] ?? SPLITS[3]
  const dayLabels = SPLIT_DAY_LABELS[normalizedDays] ?? []
  const config = GOAL_CONFIG[goal]

  // 3. بناء كل يوم تدريبي
  const usedIds = new Set<string>()
  const days: ProgramDay[] = splits.map((groups, dayIdx) => {
    const exercises: ProgramExercise[] = []
    const targetCount = groups.length === 1 ? 5 : groups.length === 2 ? 4 : 6

    // الترتيب داخل اليوم: حسب ترتيب المجموعات في النمط العلمي
    for (const group of groups) {
      if (exercises.length >= targetCount) break
      const perGroup = Math.max(
        1,
        Math.ceil((targetCount - exercises.length) / 1),
      )
      const picks = selectForGroup(group, pool, Math.min(perGroup, 2), usedIds)
      for (const pick of picks) {
        if (exercises.length >= targetCount) break
        usedIds.add(pick.id)
        exercises.push(
          buildProgramExercise(pick.id, pick.difficulty, config, goal),
        )
      }
    }

    // ملء النقص من أي مجموعة في نفس اليوم
    if (exercises.length < 3) {
      for (const e of pool) {
        if (exercises.length >= 3) break
        if (usedIds.has(e.id)) continue
        if (!groups.includes(e.category)) continue
        usedIds.add(e.id)
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
