import type {
  ProgramDay,
  ProgramExercise,
  SavedWorkoutProgram,
  WorkoutProgram,
} from '../shared/types.ts'
import { EXERCISES } from './exercises.ts'

export interface SectionExerciseDef {
  name: string
  nameAr?: string
  sets: number
  repsMin: number
  repsMax?: number
  unit?: 'reps' | 'seconds'
  perSide?: boolean
  amrap?: boolean
  rpe?: number
  notes?: string
}

const WARMUP_EXERCISES: SectionExerciseDef[] = [
  { name: 'Arm Circles', nameAr: 'دوائر الذراعين للإحماء', sets: 1, repsMin: 10, notes: '10 في كل اتجاه' },
  { name: 'Leg Swings', nameAr: 'مرجحة الساقين', sets: 1, repsMin: 10, perSide: true },
  { name: 'Hip Circles', nameAr: 'دوائر الحوض للإحماء', sets: 1, repsMin: 10, notes: '10 في كل اتجاه' },
  { name: 'Cat-Cow', nameAr: 'إطالة القطة والبقرة', sets: 1, repsMin: 10 },
  { name: 'Standing Spinal Rotation', nameAr: 'دوران الجذع وقوفاً', sets: 1, repsMin: 10 },
]

const PULL_PREP_EXERCISES: SectionExerciseDef[] = [
  { name: 'Dead Hang', nameAr: 'التعلق الميت بالبار', sets: 3, repsMin: 20, repsMax: 30, unit: 'seconds' },
  { name: 'Scapular Pull-up', nameAr: 'سحب لوحي الكتف (Scapular Pull-Up)', sets: 3, repsMin: 8, repsMax: 10 },
]

const CONTROL_BLOCK_LOWER: SectionExerciseDef[] = [
  { name: 'Single-Leg Balance', nameAr: 'توازن الساق المفردة', sets: 3, repsMin: 20, repsMax: 30, unit: 'seconds', perSide: true, notes: 'عيون مفتوحة ثم مغلقة' },
  { name: 'Isometric Wall Sit', nameAr: 'جلسة الحائط الثابتة', sets: 3, repsMin: 30, repsMax: 45, unit: 'seconds' },
  { name: 'L-sit Progression', nameAr: 'تدرج الـ L-sit (ضم الركبتين Tuck)', sets: 3, repsMin: 10, repsMax: 15, unit: 'seconds' },
]

const COOLDOWN_EXERCISES: SectionExerciseDef[] = [
  { name: 'Doorway Chest Stretch', nameAr: 'إطالة الصدر في مدخل الباب', sets: 1, repsMin: 30, unit: 'seconds', perSide: true },
  { name: 'Standing Split-Stance Hip Flexor Stretch', nameAr: 'إطالة عضلات الفخذ وقوفاً', sets: 1, repsMin: 30, unit: 'seconds', perSide: true },
  { name: 'Standing Thoracic Extension', nameAr: 'تمديد القفص الصدري وقوفاً', sets: 1, repsMin: 5, repsMax: 6 },
  { name: 'Cross-Body Shoulder Stretch', nameAr: 'إطالة الكتف المعترضة للذراع', sets: 1, repsMin: 30, unit: 'seconds', perSide: true },
  { name: 'Standing Overhead Lat Stretch', nameAr: 'إطالة المجانص العلوية وقوفاً', sets: 1, repsMin: 30, unit: 'seconds', perSide: true },
]

function cleanExerciseName(s: string): string {
  return s.toLowerCase()
    .replace(/\s*-\s*medium\s+grip/i, '')
    .replace(/\bbarbell\b/gi, '')
    .replace(/\bdumbbell\b/gi, '')
    .replace(/\bmachine\b/gi, '')
    .replace(/s$/i, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

const BANNED_EQUIPMENT_KEYWORDS = ['band', 'bands', 'assisted pull-up', 'seated leg curl', 'standing leg curl', 'standing hip abduction']

export function mapAppendixExercise(def: SectionExerciseDef): ProgramExercise {
  const { name, nameAr, sets, repsMin, repsMax, unit = 'reps', perSide, amrap, rpe, notes } = def

  // 1. Exact match
  let match = EXERCISES.find(e => e.name && e.name.toLowerCase() === name.toLowerCase())
  if (!match) {
    // 2. Normalized match
    const normName = cleanExerciseName(name)
    const wantsBarbell = /barbell/i.test(name)
    const wantsDumbbell = /dumbbell/i.test(name)

    match = EXERCISES.find(e => {
      if (!e.name) return false
      const nameLower = e.name.toLowerCase()
      if (BANNED_EQUIPMENT_KEYWORDS.some(k => nameLower.includes(k))) return false
      if (e.equipment === 'band') return false
      if (wantsBarbell && e.equipment !== 'barbell' && !/barbell/i.test(e.name)) return false
      if (wantsDumbbell && e.equipment !== 'dumbbell' && !/dumbbell/i.test(e.name)) return false

      const normE = cleanExerciseName(e.name)
      return normE === normName
    })
  }

  const exerciseId = match ? match.id : `placeholder-${cleanExerciseName(name).replace(/\s+/g, '-')}`
  const targetSub = match?.targetSubMuscleAr || 'عضلة رئيسية'
  const customName = match ? undefined : (nameAr ? `${nameAr} (${name}) [قيد المراجعة]` : `${name} [قيد المراجعة]`)

  return {
    exerciseId,
    customName,
    sets,
    reps: repsMin,
    repsMin,
    repsMax,
    unit,
    perSide,
    amrap,
    rpe,
    restSeconds: rpe && rpe >= 7 ? 90 : 60,
    targetSubMuscleAr: targetSub,
    notesAr: notes,
  }
}

export function buildOwnerProgram(): WorkoutProgram {
  const days: ProgramDay[] = [
    // Day A (Upper)
    {
      dayIndex: 0,
      id: 'day-ahmed-a',
      name: 'علوي (أ) — قوة وبناء',
      labelAr: 'علوي (أ) — قوة وبناء',
      focus: 'صدر · ظهر · كتف · بايسبس',
      kind: 'strength',
      warmup: WARMUP_EXERCISES.map(mapAppendixExercise),
      pullPrep: PULL_PREP_EXERCISES.map(mapAppendixExercise),
      exercises: [
        mapAppendixExercise({ name: 'Barbell Bench Press', sets: 3, repsMin: 8, rpe: 7 }),
        mapAppendixExercise({ name: 'Pull-Up', nameAr: 'سحب العقلة بالوزن الحر', sets: 3, repsMin: 3, repsMax: 5, rpe: 7.5, notes: 'نزول بطيء حتى اكتمال أول تكرار كامل' }),
        mapAppendixExercise({ name: 'Bent-Over Barbell Row', sets: 3, repsMin: 10, rpe: 7 }),
        mapAppendixExercise({ name: 'Overhead Press', nameAr: 'ضغط الكتف العسكري بالبار', sets: 3, repsMin: 8, rpe: 7 }),
        mapAppendixExercise({ name: 'Face Pull', sets: 3, repsMin: 15, rpe: 6 }),
        mapAppendixExercise({ name: 'Dumbbell Bicep Curl', sets: 3, repsMin: 12, rpe: 6 }),
      ],
      controlBlock: [], // upper days control block is UNDECIDED: leave empty
      cooldown: COOLDOWN_EXERCISES.map(mapAppendixExercise),
    },
    // Day B (Lower)
    {
      dayIndex: 1,
      id: 'day-ahmed-b',
      name: 'سفلي (أ) — أرجل وجذع',
      labelAr: 'سفلي (أ) — أرجل وجذع',
      focus: 'أرجل · حوض · سمانة · جذع',
      kind: 'strength',
      warmup: WARMUP_EXERCISES.map(mapAppendixExercise),
      exercises: [
        mapAppendixExercise({ name: 'Barbell Back Squat', nameAr: 'سكوات خلفي بالبار', sets: 3, repsMin: 8, rpe: 7 }),
        mapAppendixExercise({ name: 'Romanian Deadlift', sets: 3, repsMin: 8, rpe: 7 }),
        mapAppendixExercise({ name: 'Bulgarian Split Squat', nameAr: 'سكوات بلغاري منقسم بالدمبل', sets: 3, repsMin: 10, perSide: true, rpe: 7 }),
        mapAppendixExercise({ name: 'Barbell Hip Thrust', sets: 3, repsMin: 10, rpe: 7 }),
        mapAppendixExercise({ name: 'Standing Calf Raise', sets: 3, repsMin: 15, rpe: 6 }),
        mapAppendixExercise({ name: 'Plank', sets: 3, repsMin: 30, repsMax: 45, unit: 'seconds' }),
      ],
      controlBlock: CONTROL_BLOCK_LOWER.map(mapAppendixExercise),
      cooldown: COOLDOWN_EXERCISES.map(mapAppendixExercise),
    },
    // Day C (Upper)
    {
      dayIndex: 2,
      id: 'day-ahmed-c',
      name: 'علوي (ب) — حجم وتحمل',
      labelAr: 'علوي (ب) — حجم وتحمل',
      focus: 'صدر مائل · سحب كابل · ديبس · أكتاف',
      kind: 'strength',
      warmup: WARMUP_EXERCISES.map(mapAppendixExercise),
      pullPrep: PULL_PREP_EXERCISES.map(mapAppendixExercise),
      exercises: [
        mapAppendixExercise({ name: 'Incline Dumbbell Press', sets: 3, repsMin: 10, rpe: 7 }),
        mapAppendixExercise({ name: 'Pull-Up', nameAr: 'سحب العقلة بالوزن الحر', sets: 3, repsMin: 0, amrap: true, rpe: 7.5 }),
        mapAppendixExercise({ name: 'Seated Cable Row', sets: 3, repsMin: 10, rpe: 7 }),
        mapAppendixExercise({ name: 'Parallel Bar Dips', nameAr: 'المتوازي بقبضة الصدر/الترايسبس', sets: 3, repsMin: 8, repsMax: 10, rpe: 7 }),
        mapAppendixExercise({ name: 'Dumbbell Lateral Raise', nameAr: 'رفرفة جانبية بالدمبل', sets: 3, repsMin: 12, repsMax: 15, rpe: 6 }),
        mapAppendixExercise({ name: 'Dumbbell Wrist Curl', nameAr: 'ثني المعصم بالدمبل للساعدين', sets: 3, repsMin: 15, rpe: 6 }),
      ],
      controlBlock: [],
      cooldown: COOLDOWN_EXERCISES.map(mapAppendixExercise),
    },
    // Day D (Lower)
    {
      dayIndex: 3,
      id: 'day-ahmed-d',
      name: 'سفلي (ب) — ضخامة واستقرار',
      labelAr: 'سفلي (ب) — ضخامة واستقرار',
      focus: 'أجهزة الأرجل · سمانة · ترابيس · جانب الجذع',
      kind: 'strength',
      warmup: WARMUP_EXERCISES.map(mapAppendixExercise),
      exercises: [
        mapAppendixExercise({ name: 'Leg Press', sets: 3, repsMin: 10, rpe: 7, notes: 'أو Front Squat' }),
        mapAppendixExercise({ name: 'Lying Leg Curl Machine', sets: 3, repsMin: 10, repsMax: 12, rpe: 7 }),
        mapAppendixExercise({ name: 'Leg Extension', sets: 3, repsMin: 12, rpe: 6 }),
        mapAppendixExercise({ name: 'Standing Calf Raise', sets: 3, repsMin: 15, rpe: 6 }),
        mapAppendixExercise({ name: 'Dumbbell Shrug', sets: 3, repsMin: 15, rpe: 6 }),
        mapAppendixExercise({ name: 'Side Plank', nameAr: 'بلانك جانبي', sets: 3, repsMin: 20, repsMax: 30, unit: 'seconds', perSide: true }),
      ],
      controlBlock: CONTROL_BLOCK_LOWER.map(mapAppendixExercise),
      cooldown: COOLDOWN_EXERCISES.map(mapAppendixExercise),
    },
    // Day E (Upper)
    {
      dayIndex: 4,
      id: 'day-ahmed-e',
      name: 'علوي (ج) — ذراعين وكثافة',
      labelAr: 'علوي (ج) — ذراعين وكثافة',
      focus: 'بنش ضيق · عقلة أقصى مجهود · سحب مسنود · ذراعين',
      kind: 'strength',
      warmup: WARMUP_EXERCISES.map(mapAppendixExercise),
      pullPrep: PULL_PREP_EXERCISES.map(mapAppendixExercise),
      exercises: [
        mapAppendixExercise({ name: 'Close-Grip Bench Press', sets: 3, repsMin: 8, rpe: 7 }),
        mapAppendixExercise({ name: 'Pull-Up', nameAr: 'سحب العقلة بالوزن الحر', sets: 3, repsMin: 0, amrap: true, rpe: 7.5, notes: 'اختبار أقصى مجهود (maximum-effort test)' }),
        mapAppendixExercise({ name: 'Chest-Supported Row', nameAr: 'سحب الظهر المسنود بالدمبل', sets: 3, repsMin: 10, rpe: 7 }),
        mapAppendixExercise({ name: 'Reverse Pec Deck', nameAr: 'رفرفة خلفية بجهاز الفراشة المعكوس', sets: 3, repsMin: 15, rpe: 6 }),
        mapAppendixExercise({ name: 'Dumbbell Bicep Curl', sets: 3, repsMin: 12, rpe: 6 }),
        mapAppendixExercise({ name: 'Dumbbell Triceps Extension', nameAr: 'تمديد الترايسبس بالدمبل فوق الرأس', sets: 3, repsMin: 12, rpe: 6 }),
      ],
      controlBlock: [],
      cooldown: COOLDOWN_EXERCISES.map(mapAppendixExercise),
    },
  ]

  return {
    id: 'prog-ahmed-upper-lower-5d',
    createdAt: 1760778000000,
    primaryGoal: 'hypertrophy',
    trainingDaysPerWeek: 5,
    title: 'برنامج أحمد — علوي/سفلي (5 أيام)',
    splitType: 'upper_lower',
    days,
    isCustom: true,
    notes: 'الأسبوع 2 يبدأ بيوم سفلي لتحقيق توازن التردد بين العلوي والسفلي على مدار أسبوعين (ملاحظة تدريبية). الأيام: السبت إلى الأربعاء (A B C D E)، الخميس = كارديو خفيف (مشي سريع أو دراجة 20-25 د)، الجمعة = راحة.',
  }
}

export function createOwnerDraftProgram(): SavedWorkoutProgram {
  const program = buildOwnerProgram()
  return {
    id: 'vault-prog-ahmed-upper-lower-5d',
    title: 'برنامج أحمد — علوي/سفلي (5 أيام)',
    savedAt: 1760778000000,
    program,
  }
}
