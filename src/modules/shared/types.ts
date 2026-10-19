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
  name?: string
  nameAr: string
  descriptionAr: string
  category: MuscleGroup
  difficulty: Difficulty
  equipment: Equipment
  avoidForInjuries?: string[]
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
  commonMistakes?: string[]
  common_mistakes?: string[]
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
  prescription?: string
  [key: string]: unknown
}

export type DayKind = 'strength' | 'cardio' | 'mobility' | 'custom'

export interface CardioConfig {
  activity: string
  plannedMinutes: number
  effort: 'light' | 'moderate' | 'hard'
}

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
  warmup?: ProgramExercise[]
  pullPrep?: ProgramExercise[]
  cooldown?: ProgramExercise[]
  controlBlock?: ProgramExercise[]
  [key: string]: unknown
}

export type WorkoutSplitType =
  'ppl' | 'upper_lower' | 'arnold' | 'bro_split' | 'full_body'

export const WORKOUT_SPLIT_LABELS: Record<WorkoutSplitType, string> = {
  ppl: 'دفع / سحب / أرجل',
  upper_lower: 'علوي / سفلي',
  arnold: 'أرنولد سبليت',
  bro_split: 'تقسيم عضلة باليوم',
  full_body: 'جسم كامل',
}

export const WORKOUT_SPLIT_EN: Record<WorkoutSplitType, string> = {
  ppl: 'Push / Pull / Legs (PPL)',
  upper_lower: 'Upper / Lower',
  arnold: 'Arnold Split',
  bro_split: 'Bro Split',
  full_body: 'Full Body',
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

export interface TrackingSession {
  id: string
  date: string
  programDayIndex: number | null
  exercises: SessionExercise[]
  notes: string
  createdAt: number
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
