import type { Goal } from '../onboarding/types'

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
  /** المرجع العلمي الموثوق */
  medicalSource?: string
}

export interface CustomExercise extends Exercise {
  isCustom: true
}

export interface ProgramExercise {
  exerciseId: string
  sets: number
  reps: number
  restSeconds: number
  notes?: string
}

export interface ProgramDay {
  dayIndex: number
  labelAr: string
  focus: string
  exercises: ProgramExercise[]
}

export type WorkoutSplitType =
  'ppl' | 'upper_lower' | 'arnold' | 'bro_split' | 'full_body'

export const WORKOUT_SPLIT_LABELS: Record<WorkoutSplitType, string> = {
  ppl: 'دفع / سحب / أرجل (PPL)',
  upper_lower: 'علوي / سفلي (Upper / Lower)',
  arnold: 'أرنولد سبليت (Arnold Split)',
  bro_split: 'تقسيم عضلة باليوم (Bro Split)',
  full_body: 'جسم كامل (Full Body)',
}

export interface WorkoutProgram {
  id: string
  createdAt: number
  primaryGoal: Goal
  trainingDaysPerWeek: number
  splitType?: WorkoutSplitType
  days: ProgramDay[]
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
