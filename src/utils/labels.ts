/**
 * src/utils/labels.ts
 *
 * Canonical Label Module (Task G6-A / D4)
 * Single source of truth mapping all internal enums, equipment keys, difficulty levels,
 * workout kinds, and anatomical muscle IDs to:
 * - Egyptian gym Arabic names (primary)
 * - Scientific English names inside <bdi dir="ltr"> (secondary)
 *
 * STRICT RULE: Never leak raw internal enum strings (e.g. "none", "body only", "pec_sternal")
 * to user-facing UI text.
 */

import React from 'react'
import muscleNamesData from '../data/muscle-names.json'

export interface MuscleLabelInfo {
  id: string
  gymAr: string
  sciEn: string
  shortAr: string
  groupAr: string
}

const MUSCLE_MAP = new Map<string, MuscleLabelInfo>()

// Pre-index muscle-names.json
if (Array.isArray(muscleNamesData.muscles)) {
  for (const m of muscleNamesData.muscles) {
    MUSCLE_MAP.set(m.id, {
      id: m.id,
      gymAr: m.gym_ar || m.short_ar || 'عضلة مستهدفة',
      sciEn: m.sci_en || '',
      shortAr: m.short_ar || m.gym_ar || 'عضلة',
      groupAr: m.group || '',
    })
  }
}

/**
 * Standard equipment translations (colloquial Egyptian gym terminology)
 */
export const EQUIPMENT_MAP: Record<string, string> = {
  bodyweight: 'وزن الجسم',
  'body only': 'وزن الجسم',
  body_only: 'وزن الجسم',
  none: 'وزن الجسم',
  barbell: 'بار',
  bar: 'بار',
  dumbbell: 'دامبل',
  dumbbells: 'دامبل',
  cable: 'كابل',
  cables: 'كابل',
  machine: 'جهاز',
  machines: 'أجهزة',
  band: 'حبل مقاومة',
  resistance_band: 'حبل مقاومة',
  kettlebell: 'كيتل بل',
  smith: 'جهاز سميث',
  smith_machine: 'جهاز سميث',
}

/**
 * Standard difficulty translations
 */
export const DIFFICULTY_MAP: Record<string, string> = {
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم',
  expert: 'خبير',
}

/**
 * Standard muscle group translations
 */
export const MUSCLE_GROUP_MAP: Record<string, string> = {
  chest: 'صدر',
  back: 'ظهر',
  shoulders: 'كتف',
  arms: 'ذراعين',
  legs: 'أرجل',
  core: 'بطن',
  full_body: 'جسم كامل',
  fullbody: 'جسم كامل',
  mobility: 'حركية ومرونة',
  stretch: 'إطالات',
  stretching: 'إطالات',
  cardio: 'كارديو',
  neck: 'رقبة',
  forearms: 'سواعد',
  calves: 'سمانة',
  glutes: 'مؤخرة',
}

/**
 * Standard kind / section translations
 */
export const KIND_MAP: Record<string, string> = {
  strength: 'تمارين القوة',
  cardio: 'كارديو',
  stretch: 'إطالات',
  stretching: 'إطالات',
  warmup: 'إحماء',
  primary: 'تمارين أساسية',
  flexibility_core: 'مرونة وجذع',
}

/**
 * Returns Arabic equipment label for any equipment enum, string, or object.
 */
export function getEquipmentLabel(input: unknown): string {
  if (!input) return 'وزن الجسم'
  if (typeof input === 'object' && input !== null) {
    const obj = input as Record<string, unknown>
    if (typeof obj.ar === 'string' && obj.ar.trim()) {
      return obj.ar.trim()
    }
    if (typeof obj.db === 'string') {
      return getEquipmentLabel(obj.db)
    }
  }

  const key = String(input).trim().toLowerCase()
  return EQUIPMENT_MAP[key] || 'أجهزة ومعدات'
}

/**
 * Returns Arabic difficulty level label.
 */
export function getDifficultyLabel(input: unknown): string {
  if (!input) return 'عام'
  if (typeof input === 'object' && input !== null) {
    const obj = input as Record<string, unknown>
    if (typeof obj.ar === 'string' && obj.ar.trim()) return obj.ar.trim()
    if (typeof obj.db === 'string') return getDifficultyLabel(obj.db)
  }
  const key = String(input).trim().toLowerCase()
  return DIFFICULTY_MAP[key] || 'متوسط'
}

/**
 * Returns Arabic muscle group label.
 */
export function getMuscleGroupLabel(group: string | undefined): string {
  if (!group) return 'عام'
  const key = group.trim().toLowerCase()
  if (MUSCLE_GROUP_MAP[key]) return MUSCLE_GROUP_MAP[key]
  if (key.includes('full') && key.includes('body')) return 'جسم كامل'
  if (key.includes('mob')) return 'حركية ومرونة'
  if (key.includes('stretch')) return 'إطالات'
  if (key.includes('cardio')) return 'كارديو'
  if (/^[a-z0-9_-]+$/i.test(key)) {
    return 'عام'
  }
  return group
}

/**
 * Formats text with any embedded Latin words/phrases wrapped inside <bdi dir="ltr">.
 */
export function formatBdiText(text: string): React.ReactNode {
  if (!text) return ''
  const parts = text.split(/([A-Za-z0-9_.-]+(?:[\s-][A-Za-z0-9_.-]+)*)/)
  if (parts.length <= 1) return text
  return parts.map((part, idx) => {
    if (/[A-Za-z]/.test(part)) {
      return React.createElement('bdi', { key: idx, dir: 'ltr' }, part)
    }
    return part
  })
}

/**
 * Returns Arabic exercise kind label.
 */
export function getKindLabel(kind: string | undefined): string {
  if (!kind) return 'تمرين'
  const key = kind.trim().toLowerCase()
  return KIND_MAP[key] || kind
}

/**
 * Returns muscle info from muscle-names.json, with safe Egyptian gym fallbacks.
 */
export function getMuscleInfo(muscleId: string): MuscleLabelInfo {
  const cleanId = String(muscleId || '').trim().toLowerCase()
  const found = MUSCLE_MAP.get(cleanId)
  if (found) return found

  // Derived or approximate head fallbacks without leaking raw snake_case
  if (cleanId.includes('pec')) {
    return { id: cleanId, gymAr: 'عضلة الصدر', sciEn: 'Pectoralis', shortAr: 'صدر', groupAr: 'صدر' }
  }
  if (cleanId.includes('trap')) {
    return { id: cleanId, gymAr: 'ترابيس', sciEn: 'Trapezius', shortAr: 'ترابيس', groupAr: 'ظهر' }
  }
  if (cleanId.includes('delt')) {
    return { id: cleanId, gymAr: 'كتف', sciEn: 'Deltoid', shortAr: 'كتف', groupAr: 'كتف' }
  }
  if (cleanId.includes('lat')) {
    return { id: cleanId, gymAr: 'عضلة الظهر (المجنص)', sciEn: 'Latissimus dorsi', shortAr: 'ظهر', groupAr: 'ظهر' }
  }
  if (cleanId.includes('bicep')) {
    return { id: cleanId, gymAr: 'بايسبس', sciEn: 'Biceps', shortAr: 'باي', groupAr: 'ذراعين' }
  }
  if (cleanId.includes('tricep')) {
    return { id: cleanId, gymAr: 'ترايسبس', sciEn: 'Triceps', shortAr: 'تراي', groupAr: 'ذراعين' }
  }
  if (cleanId.includes('glute')) {
    return { id: cleanId, gymAr: 'جلوتس (المؤخرة)', sciEn: 'Gluteal muscles', shortAr: 'جلوتس', groupAr: 'أرجل' }
  }
  if (cleanId.includes('quad') || cleanId.includes('femoris')) {
    return { id: cleanId, gymAr: 'فخذ أمامي', sciEn: 'Quadriceps', shortAr: 'فخذ أمامي', groupAr: 'أرجل' }
  }
  if (cleanId.includes('hamstring')) {
    return { id: cleanId, gymAr: 'فخذ خلفي (هامسترنج)', sciEn: 'Hamstrings', shortAr: 'فخذ خلفي', groupAr: 'أرجل' }
  }
  if (cleanId.includes('abdominis') || cleanId.includes('oblique')) {
    return { id: cleanId, gymAr: 'عضلات البطن والجوانب', sciEn: 'Abdominal muscles', shortAr: 'بطن', groupAr: 'بطن' }
  }

  return {
    id: cleanId,
    gymAr: 'عضلة مساعدة',
    sciEn: '',
    shortAr: 'عضلة',
    groupAr: 'عام',
  }
}

/**
 * Returns formatted React node for a muscle target:
 * Gym colloquial Arabic name, plus scientific English name inside <bdi dir="ltr">.
 */
export function formatMuscleLabel(
  muscleId: string,
  options: { short?: boolean; includeSci?: boolean } = {},
): React.ReactNode {
  if (!muscleId) return ''
  const trimmed = String(muscleId).trim()

  // If already an Arabic string (e.g. from targetMusclesAr or custom exercise)
  if (/[\u0600-\u06FF]/.test(trimmed)) {
    return React.createElement('bdi', { dir: 'auto' }, trimmed)
  }

  // Raw anatomical identifier (e.g. "pec_sternal", "trap_lower")
  const info = getMuscleInfo(trimmed)
  const arabicText = options.short ? info.shortAr : info.gymAr

  if (!options.includeSci || !info.sciEn) {
    return arabicText
  }

  return React.createElement(
    React.Fragment,
    null,
    arabicText,
    ' ',
    React.createElement(
      'bdi',
      { dir: 'ltr', style: { opacity: 0.85, fontSize: '0.9em' } },
      `(${info.sciEn})`,
    ),
  )
}
