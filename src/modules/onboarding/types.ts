/**
 * Onboarding domain model - Phase 1 (onboarding & profiling).
 *
 * ACTIVITY_LEVELS.multiplier holds the standard activity factors used with
 * the Mifflin-St Jeor equation. They will feed the TDEE calculator in the
 * nutrition module (Phase 3). No calorie math happens in this phase.
 */

export type Goal = 'hypertrophy' | 'cut' | 'flexibility' | 'calisthenics'

export type BodyGoal = 'gain' | 'maintain' | 'cut' | 'recomp'
export type TrainingStyle = 'weights' | 'calisthenics' | 'mobility' | 'mixed'

export type ActivityLevel =
  'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'

export type Sex = 'male' | 'female'

export interface MedicalAssessment {
  hasIssues: boolean
  injuryTags: string[]
  notes: string
}

export interface WorkoutBlock {
  type: 'resistance' | 'cardio'
  sessionsPerWeek: number
  minutesPerSession: number
  intensity: 'light' | 'moderate' | 'hard'
}

export interface BodyMetrics {
  sex: Sex
  age: number
  heightCm: number
  weightKg: number
  activityLevel: ActivityLevel
  bodyFatPercent?: number
  lifestyle?: 1 | 2 | 3 | 4 | 5
  workoutBlocks?: WorkoutBlock[]
  sessionMinutes?: number
  sessionIntensity?: 'light' | 'moderate' | 'hard'
  hasCustomWorkoutBlocks?: boolean
  lifestyleMigrated?: boolean
  migrationReviewed?: boolean
  pace?: 'slow' | 'standard' | 'fast'
  formulaOverride?: 'auto' | 'mifflin' | 'katch'
  proteinPerKgOverride?: number
  birthDate?: string
  ageEnteredAt?: number
}

import type { UserLimitation, PainLogEntry } from '../workout/limitations.ts'

export type {
  UserLimitation,
  LimitationRegion,
  LimitationStatus,
  PainLogEntry,
} from '../workout/limitations.ts'

export interface UserProfile {
  id: string
  createdAt: number
  updatedAt: number
  name?: string
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced'
  trainingLocation?: 'gym' | 'home' | 'both'
  restrictions?: string
  weekStartDay?: number
  goals: Goal[]
  primaryGoal: Goal
  bodyGoal?: BodyGoal
  trainingStyle?: TrainingStyle[]
  trainingDaysPerWeek: number
  equipmentAvailable?: string[]
  medical: MedicalAssessment
  body: BodyMetrics
  limitations?: UserLimitation[]
  redFlag?: boolean
  redFlagDismissed?: boolean
  schedule?: Record<number, string>
  painLog?: PainLogEntry[]
}

/** Profile fields the user provides; identity/timestamps are assigned by the store. */
export type ProfileCore = Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>

export type ProfileInput = ProfileCore & {
  id?: string
  createdAt?: number
  updatedAt?: number
}

export interface GoalInfo {
  value: Goal
  labelAr: string
  hintAr: string
}

export const GOALS: GoalInfo[] = [
  {
    value: 'hypertrophy',
    labelAr: 'بناء عضلات / زيادة الوزن',
    hintAr: 'بناء العضلات وزيادة الحجم',
  },
  {
    value: 'cut',
    labelAr: 'خسارة دهون / تنشيف',
    hintAr: 'خسارة الدهون مع الحفاظ على العضلات',
  },
  {
    value: 'flexibility',
    labelAr: 'مرونة وإطالات',
    hintAr: 'تحسين المدى الحركي والمطاطية',
  },
  {
    value: 'calisthenics',
    labelAr: 'كاليستينكس (وزن الجسم)',
    hintAr: 'تقوية التحكم في الجسم بوزن الجسم',
  },
]

export interface BodyGoalInfo {
  value: BodyGoal
  labelAr: string
  hintAr: string
}

export const BODY_GOALS: BodyGoalInfo[] = [
  {
    value: 'gain',
    labelAr: 'بناء عضلات / زيادة الوزن',
    hintAr: 'فائض طاقة تدريجي لبناء كتلة عضلية نقية بأقل تراكم دهون',
  },
  {
    value: 'maintain',
    labelAr: 'المحافظة على الوزن الحالي',
    hintAr: 'توازن السعرات للحفاظ على الكتلة والوزن دون زيادة أو نقصان',
  },
  {
    value: 'cut',
    labelAr: 'خسارة دهون / تنشيف',
    hintAr: 'عجز طاقة محسوب لخسارة الدهون مع الحفاظ على الكتلة العضلية',
  },
  {
    value: 'recomp',
    labelAr: 'إعادة التكوين العضلي (Recomp)',
    hintAr: 'بناء العضلات وخسارة الدهون بالتزامن على سعرات الثبات',
  },
]

export interface TrainingStyleInfo {
  value: TrainingStyle
  labelAr: string
  hintAr: string
}

export const TRAINING_STYLES: TrainingStyleInfo[] = [
  {
    value: 'weights',
    labelAr: 'أثقال وحديد',
    hintAr: 'تدريب مقاومة باستخدام البارات والدنابل والأجهزة',
  },
  {
    value: 'calisthenics',
    labelAr: 'كاليستينكس (وزن الجسم)',
    hintAr: 'تقوية وتحكم كامل بالجسم باستخدام وزن الجسم',
  },
  {
    value: 'mobility',
    labelAr: 'مرونة وإطالات',
    hintAr: 'تحسين المدى الحركي وصحة المفاصل والمطاطية',
  },
  {
    value: 'mixed',
    labelAr: 'تدريب مدمج / متنوع',
    hintAr: 'الدمج بين الأثقال والكاليستينكس والمرونة',
  },
]

export interface ActivityLevelInfo {
  value: ActivityLevel
  labelAr: string
  hintAr: string
  /** Standard activity multiplier used with Mifflin-St Jeor BMR for TDEE (nutrition module, Phase 3). */
  multiplier: number
}

export const ACTIVITY_LEVELS: ActivityLevelInfo[] = [
  {
    value: 'sedentary',
    labelAr: 'قليل الحركة',
    hintAr: 'خامل بلا حركة تذكر خارج أوقات التمرين',
    multiplier: 1.2,
  },
  {
    value: 'light',
    labelAr: 'خفيف',
    hintAr: 'حركة يومية خفيفة مع مشي متقطع',
    multiplier: 1.375,
  },
  {
    value: 'moderate',
    labelAr: 'متوسط',
    hintAr: 'وقوف وحركة نشطة أغلب اليوم',
    multiplier: 1.55,
  },
  {
    value: 'active',
    labelAr: 'نشط',
    hintAr: 'عمل بدني شاق ومجهود مستمر',
    multiplier: 1.725,
  },
  {
    value: 'very_active',
    labelAr: 'نشط جداً',
    hintAr: 'مجهود بدني شاق واستثنائي طوال اليوم',
    multiplier: 1.9,
  },
]

export const INJURY_TAGS: string[] = [
  'ركبة',
  'كتف',
  'أسفل الظهر',
  'رسغ',
  'رقبة',
  'أخرى',
]
