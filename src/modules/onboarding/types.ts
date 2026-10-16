/**
 * Onboarding domain model - Phase 1 (onboarding & profiling).
 *
 * ACTIVITY_LEVELS.multiplier holds the standard activity factors used with
 * the Mifflin-St Jeor equation. They will feed the TDEE calculator in the
 * nutrition module (Phase 3). No calorie math happens in this phase.
 */

export type Goal = 'hypertrophy' | 'cut' | 'flexibility' | 'calisthenics'

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
}

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
  trainingDaysPerWeek: number
  medical: MedicalAssessment
  body: BodyMetrics
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
    labelAr: 'تضخيم',
    hintAr: 'بناء العضلات وزيادة الحجم',
  },
  {
    value: 'cut',
    labelAr: 'تنشيف',
    hintAr: 'خسارة الدهون مع الحفاظ على العضلات',
  },
  {
    value: 'flexibility',
    labelAr: 'مرونة',
    hintAr: 'تحسين المدى الحركي والمطاطية',
  },
  {
    value: 'calisthenics',
    labelAr: 'كاليستينكس',
    hintAr: 'تقوية التحكم في الجسم بوزن الجسم',
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
