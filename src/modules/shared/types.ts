import type { Goal } from '../onboarding/types'
export type { Goal }

export type MuscleGroup =
  'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export type Equipment =
  'bodyweight' | 'dumbbell' | 'barbell' | 'machine' | 'band'

export type MeasurementType = 'reps' | 'duration' | 'bodyweight' | 'weight'

export interface Exercise {
  id: string
  key?: string
  name?: string
  nameEn?: string
  nameAr: string
  descriptionAr: string
  category: MuscleGroup
  difficulty: Difficulty
  equipment: Equipment
  equipmentDetail?: unknown
  levelDetail?: unknown
  kind?: string
  target_ar?: string
  avoidForInjuries?: string[]
  archived?: boolean
  media?: {
    gif?: {
      display?: boolean
      match?: string
      url?: string | null
      attribution?: string | null
    }
    frames?: {
      display?: boolean
      match?: string
      start?: string | null
      peak?: string | null
    }
  }
  /** نوع القياس */
  measurementType?: MeasurementType
  /** صورة أو GIF توضيحي للتمرين (رابط أو Data URL) */
  imageUrl?: string
  /** صورة مصغرة للتمرين */
  thumbnailUrl?: string
  /** ميكانيكا الحركة */
  mechanicsAr?: string
  /** خطوات التنفيذ المفصلة (4-6 خطوات) */
  howToStepsAr?: string[]
  /** الفائدة العضلية/الوظيفية للتمرين */
  benefitAr?: string
  /** العضلات المستهدفة الرئيسية والمساعدة */
  targetMusclesAr?: string[]
  /** الرأس العضلي أو الجزء المستهدف التفصيلي (مثل: صدر علوي، بريكيالس، رأس طويل) */
  targetSubMuscleAr?: string
  /** قائمة الأجزاء العضلية التفصيلية */
  targetSubMusclesAr?: string[]
  /** المرجع العلمي الموثوق */
  medicalSource?: string
  /** العضلات المستهدفة على مستوى الرؤوس التشريحية */
  muscles?: ExerciseMuscleTarget[]
  /** علامة تدل على أن توزيع العضلات مؤقت وموسع من التصنيف القديم */
  isProvisionalMuscles?: boolean
  /** فترات الراحة المقترحة */
  restSeconds?: number
  rest_seconds?: number
  /** وسائط بديلة ومصادر */
  image?: string
  gifUrl?: string
  gif?: string
  attribution?: string
  /** نصوص وتفاصيل إضافية موروثة */
  benefit?: string
  mechanics?: string
  target?: string
  reference?: string
  mapNote?: string
  map_note?: string
  steps?: string[]
  steps_ar?: string[]
  references?: string[]
  muscles_status?: string
  content_status?: string
  commonMistakes?: string[]
  common_mistakes?: string[]
  common_mistakes_ar?: string[]
  safetyCues?: string[]
  safety_cues?: string[]
  tempo?: string
  breathing?: string
}

export type ExerciseSection =
  'warmup' | 'primary' | 'flexibility_core' | (string & {})

export interface DaySectionConfig {
  id: string
  labelAr: string
  icon: string
}

export const DEFAULT_DAY_SECTIONS: DaySectionConfig[] = [
  { id: 'warmup', labelAr: 'تمارين الإحماء والتسخين', icon: 'flame' },
  { id: 'primary', labelAr: 'التمارين الأساسية', icon: 'dumbbell' },
  {
    id: 'flexibility_core',
    labelAr: 'المرونة، الثبات والتهدئة',
    icon: 'heart',
  },
]

export const PRESET_DAY_SECTIONS: DaySectionConfig[] = [
  { id: 'warmup', labelAr: 'تمارين الإحماء والتسخين', icon: 'flame' },
  { id: 'primary', labelAr: 'التمارين الأساسية', icon: 'dumbbell' },
  { id: 'cardio', labelAr: 'تمارين الكارديو واللياقة', icon: 'activity' },
  {
    id: 'flexibility_core',
    labelAr: 'المرونة، الثبات والتهدئة',
    icon: 'heart',
  },
  { id: 'core_abs', labelAr: 'تمارين البطن والكور', icon: 'shield' },
  { id: 'arms_grip', labelAr: 'تمارين الساعد والقبضة', icon: 'zap' },
]

export const EXERCISE_SECTION_LABELS: Record<
  string,
  { labelAr: string; icon: string }
> = {
  warmup: { labelAr: 'تمارين الإحماء والتسخين', icon: 'flame' },
  primary: { labelAr: 'التمارين الأساسية', icon: 'dumbbell' },
  flexibility_core: { labelAr: 'المرونة، الثبات والتهدئة', icon: 'heart' },
  cardio: { labelAr: 'تمارين الكارديو واللياقة', icon: 'activity' },
  core_abs: { labelAr: 'تمارين البطن والكور', icon: 'shield' },
  arms_grip: { labelAr: 'تمارين الساعد والقبضة', icon: 'zap' },
}

export type MuscleRole = 'primary' | 'secondary'

export interface ExerciseMuscleTarget {
  id: string
  role: MuscleRole
}

export interface CustomExercise extends Exercise {
  isCustom: true
}

export interface ProgramExercise {
  exerciseId: string
  sets: number
  reps: number
  restSeconds: number
  repsMin?: number
  repsMax?: number
  unit?: 'reps' | 'seconds'
  perSide?: boolean
  amrap?: boolean
  rpe?: number
  notes?: string
  section?: ExerciseSection
  customName?: string
  nameEn?: string
  needsReview?: boolean
  prescription?: string
  [key: string]: unknown
}

export type DayKind = 'strength' | 'cardio' | 'mobility' | 'custom'

export interface CardioConfig {
  activity: string
  plannedMinutes: number
  effort: 'light' | 'moderate' | 'hard' | 'high'
}

export type ScheduleSlotType = 'rest' | 'cardio' | string

export interface ProgramDay {
  id?: string
  name?: string
  dayIndex: number
  labelAr: string
  kind?: DayKind
  focus: string
  exercises: ProgramExercise[]
  sections?: DaySectionConfig[]
  cardio?: CardioConfig
  cardioConfig?: CardioConfig
  finisher?: {
    activity: string
    minutes: number
    level: 'خفيف' | 'متوسط' | 'عالي'
  } | null
  warmup?: ProgramExercise[]
  pullPrep?: ProgramExercise[]
  cooldown?: ProgramExercise[]
  controlBlock?: ProgramExercise[]
  [key: string]: unknown
}

export type WorkoutSplitType =
  'ppl' | 'upper_lower' | 'arnold' | 'bro_split' | 'full_body' | 'custom'

export const WORKOUT_SPLIT_LABELS: Record<WorkoutSplitType, string> = {
  ppl: 'دفع / سحب / أرجل',
  upper_lower: 'علوي / سفلي',
  arnold: 'أرنولد سبليت',
  bro_split: 'تقسيم عضلة باليوم',
  full_body: 'جسم كامل',
  custom: 'جدول مخصص',
}

export const WORKOUT_SPLIT_EN: Record<WorkoutSplitType, string> = {
  ppl: 'Push / Pull / Legs (PPL)',
  upper_lower: 'Upper / Lower',
  arnold: 'Arnold Split',
  bro_split: 'Bro Split',
  full_body: 'Full Body',
  custom: 'Custom Split',
}

export interface WorkoutProgram {
  id: string
  createdAt: number
  primaryGoal: Goal
  trainingDaysPerWeek: number
  splitType?: WorkoutSplitType
  days: ProgramDay[]
  isCustom?: boolean
  isLocked?: boolean
  title?: string
  name?: string
  description?: string
  [key: string]: unknown
}

export interface SavedWorkoutProgram {
  id: string
  title: string
  savedAt: number
  program: WorkoutProgram
  notes?: string
}

export interface SessionExercise {
  exerciseId: string
  sets: { reps: number; weightKg: number }[]
  completed: boolean
}

export interface CardioSessionDetails {
  activityId: string
  activityNameAr: string
  level: string
  durationMinutes: number
  grossKcal: number
  netKcal: number
}

export interface TrackingSession {
  id: string
  date: string
  programDayIndex: number | null
  exercises: SessionExercise[]
  notes: string
  createdAt: number
  cardioDetails?: CardioSessionDetails
  kind?: 'strength' | 'cardio' | 'finisher'
  finisherDetails?: CardioSessionDetails
}

export interface BodyLogEntry {
  date: string
  weightKg: number
}

export interface DayNote {
  date: string
  note: string
}

export interface BackupData {
  exportVersion: number
  exportedAt: number
  profile: unknown
  workoutProgram: WorkoutProgram | null
  customExercises: CustomExercise[]
  trackingSessions: TrackingSession[]
  bodyLog: BodyLogEntry[]
  dayNotes: DayNote[]
  exerciseOverrides?: Record<string, unknown>
}

export const DAY_NAMES_AR: string[] = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
]

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: 'صدر',
  back: 'ظهر',
  shoulders: 'كتف',
  arms: 'ذراعين',
  legs: 'أرجل',
  core: 'بطن',
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم',
  expert: 'خبير',
}

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  bodyweight: 'وزن الجسم',
  dumbbell: 'دامبل',
  barbell: 'بار',
  machine: 'آلة',
  band: 'حبل مقاومة',
}
