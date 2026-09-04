import { ACTIVITY_LEVELS, GOALS } from './types'
import type { ActivityLevel, Goal, ProfileCore } from './types'

export type ValidationResult =
  { ok: true; profile: ProfileCore } | { ok: false; errors: string[] }

const GOAL_VALUES: Goal[] = GOALS.map((g) => g.value)
const ACTIVITY_VALUES: ActivityLevel[] = ACTIVITY_LEVELS.map((a) => a.value)

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toInt(value: unknown): number | null {
  const n =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : NaN
  return Number.isInteger(n) ? n : null
}

function toNum(value: unknown): number | null {
  const n =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : NaN
  return Number.isFinite(n) ? n : null
}

export function validateGoals(goals: unknown, primaryGoal: unknown): string[] {
  if (!Array.isArray(goals) || goals.length === 0) {
    return ['اختر هدفاً واحداً على الأقل']
  }
  const errors: string[] = []
  if (!goals.every((g) => GOAL_VALUES.includes(g as Goal))) {
    errors.push('قيمة هدف غير معروفة')
  }
  if (
    typeof primaryGoal !== 'string' ||
    !GOAL_VALUES.includes(primaryGoal as Goal)
  ) {
    errors.push('حدد هدفك الأساسي')
  } else if (!goals.includes(primaryGoal)) {
    errors.push('الهدف الأساسي يجب أن يكون من ضمن الأهداف المختارة')
  }
  return errors
}

export function validateDays(days: unknown): string[] {
  const n = toInt(days)
  if (n === null || n < 2 || n > 6) {
    return ['عدد أيام التمرين يجب أن يكون بين 2 و6 أيام في الأسبوع']
  }
  return []
}

export function validateMedical(medical: unknown): string[] {
  if (!isRecord(medical)) {
    return ['بيانات التقييم الطبي غير صالحة']
  }
  const errors: string[] = []
  const { hasIssues, injuryTags, notes } = medical
  if (typeof hasIssues !== 'boolean') {
    errors.push('أجب عن سؤال الإصابات والمشاكل الصحية')
  }
  if (
    !Array.isArray(injuryTags) ||
    !injuryTags.every((t) => typeof t === 'string' && t.trim() !== '')
  ) {
    errors.push('وسوم الإصابات غير صالحة')
  }
  if (typeof notes !== 'string') {
    errors.push('الملاحظات يجب أن تكون نصاً')
  }
  if (
    hasIssues === true &&
    Array.isArray(injuryTags) &&
    injuryTags.length === 0 &&
    typeof notes === 'string' &&
    notes.trim() === ''
  ) {
    errors.push('حدد نوع الإصابة أو اكتب ملاحظة توضح حالتك')
  }
  if (
    hasIssues === false &&
    Array.isArray(injuryTags) &&
    injuryTags.length > 0
  ) {
    errors.push('لا يمكن تسجيل إصابات مع الإجابة "لا"')
  }
  return errors
}

export function validateBody(body: unknown): string[] {
  if (!isRecord(body)) {
    return ['بيانات الجسم غير صالحة']
  }
  const errors: string[] = []
  const { sex, age, heightCm, weightKg, activityLevel } = body
  if (sex !== 'male' && sex !== 'female') {
    errors.push('اختر الجنس')
  }
  const ageN = toInt(age)
  if (ageN === null || ageN < 10 || ageN > 90) {
    errors.push('العمر يجب أن يكون بين 10 و90 سنة')
  }
  const heightN = toNum(heightCm)
  if (heightN === null || heightN < 100 || heightN > 250) {
    errors.push('الطول يجب أن يكون بين 100 و250 سم')
  }
  const weightN = toNum(weightKg)
  if (weightN === null || weightN < 30 || weightN > 300) {
    errors.push('الوزن يجب أن يكون بين 30 و300 كجم')
  }
  if (
    typeof activityLevel !== 'string' ||
    !ACTIVITY_VALUES.includes(activityLevel as ActivityLevel)
  ) {
    errors.push('اختر مستوى النشاط')
  }
  return errors
}

/**
 * Validates a complete profile payload. Accepts loose input (unknown) so the
 * wizard form and persisted records go through the same checks. Returns all
 * problems at once, with a specific Arabic message per field.
 */
export function validateProfile(input: unknown): ValidationResult {
  if (!isRecord(input)) {
    return { ok: false, errors: ['البيانات المرسلة غير صالحة'] }
  }
  const { goals, primaryGoal, trainingDaysPerWeek, medical, body } = input
  const goalErrors = validateGoals(goals, primaryGoal)
  const dayErrors = validateDays(trainingDaysPerWeek)
  const medicalErrors = validateMedical(medical)
  const bodyErrors = validateBody(body)
  const errors = [...goalErrors, ...dayErrors, ...medicalErrors, ...bodyErrors]
  if (errors.length > 0) {
    return { ok: false, errors }
  }
  const med = medical as Record<string, unknown>
  const b = body as Record<string, unknown>
  const profile: ProfileCore = {
    goals: [...(goals as Goal[])],
    primaryGoal: primaryGoal as Goal,
    trainingDaysPerWeek: trainingDaysPerWeek as number,
    medical: {
      hasIssues: med.hasIssues as boolean,
      injuryTags: [...(med.injuryTags as string[])],
      notes: med.notes as string,
    },
    body: {
      sex: b.sex as 'male' | 'female',
      age: b.age as number,
      heightCm: b.heightCm as number,
      weightKg: b.weightKg as number,
      activityLevel: b.activityLevel as ActivityLevel,
    },
  }
  return { ok: true, profile }
}
