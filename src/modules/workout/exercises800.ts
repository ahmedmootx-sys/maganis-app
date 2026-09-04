import type { Exercise } from '../shared/types.ts'
import { EXERCISES } from './exercises.ts'

/**
 * إعادة تصدير التمارين الموحدة لضمان التوافق العكسي مع المكونات
 * دون زيادة حجم الحزمة البرمجية بملفات مكررة
 */
export const EXERCISES_800: Exercise[] = EXERCISES
export const EXERCISES_520: Exercise[] = EXERCISES
