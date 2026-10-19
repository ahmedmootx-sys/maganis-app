import regionLoadData from '../../data/exercise-region-load.json'

export type LimitationRegion =
  | 'lower_back'
  | 'neck'
  | 'shoulder'
  | 'elbow'
  | 'wrist_hand'
  | 'hip'
  | 'knee'
  | 'ankle_foot'

export type LimitationStatus =
  'current_pain' | 'old_recovered' | 'under_treatment'

export interface UserLimitation {
  region: LimitationRegion
  status: LimitationStatus
  note?: string
}

export interface RegionInfo {
  id: LimitationRegion
  labelAr: string
}

export const REGIONS: RegionInfo[] = [
  { id: 'lower_back', labelAr: 'أسفل الظهر' },
  { id: 'neck', labelAr: 'الرقبة' },
  { id: 'shoulder', labelAr: 'الكتف' },
  { id: 'elbow', labelAr: 'الكوع' },
  { id: 'wrist_hand', labelAr: 'المعصم واليد' },
  { id: 'hip', labelAr: 'الورك' },
  { id: 'knee', labelAr: 'الركبة' },
  { id: 'ankle_foot', labelAr: 'الكاحل والقدم' },
]

export const STATUS_OPTIONS: Array<{ id: LimitationStatus; labelAr: string }> =
  [
    { id: 'current_pain', labelAr: 'ألم حالي' },
    { id: 'old_recovered', labelAr: 'إصابة قديمة وتعافيت' },
    { id: 'under_treatment', labelAr: 'تحت علاج طبيب' },
  ]

export const PAIN_TYPES = [
  { id: 'acute', labelAr: 'حاد' },
  { id: 'pressing', labelAr: 'ضاغط' },
  { id: 'tingling', labelAr: 'وخز' },
  { id: 'numbness', labelAr: 'تنميل' },
] as const

export type PainType = (typeof PAIN_TYPES)[number]['id']

export interface PainLogEntry {
  id?: string
  exerciseKey: string
  exerciseName?: string
  region: LimitationRegion
  type: PainType
  date: string
}

export interface ExerciseRegionLoadEntry {
  loads: Partial<Record<LimitationRegion, 'high' | 'moderate' | 'low'>>
  note_ar?: string
  alternatives?: string[]
}

export interface RegionTag {
  regionId: LimitationRegion
  regionLabel: string
  level: 'high' | 'moderate' | 'unreviewed' | 'recovered_high'
  labelAr: string
  className: 'tag-danger' | 'tag-warning' | 'tag-muted' | 'tag-info'
}

export function getRegionLabel(region: LimitationRegion): string {
  const found = REGIONS.find((r) => r.id === region)
  return found?.labelAr || region
}

export function getExerciseTags(
  exerciseKey: string,
  limitations: UserLimitation[] | undefined | null,
): RegionTag[] {
  if (!limitations || limitations.length === 0) return []

  const entries =
    (
      regionLoadData as unknown as {
        entries?: Record<string, ExerciseRegionLoadEntry>
      }
    ).entries || {}
  const entry = entries[exerciseKey]

  const tags: RegionTag[] = []

  for (const lim of limitations) {
    const regLabel = getRegionLabel(lim.region)

    if (!entry) {
      // Absent from curated file -> grey tag «لم يُراجَع لحالتك» (never show «آمن»)
      if (lim.status === 'current_pain' || lim.status === 'under_treatment') {
        tags.push({
          regionId: lim.region,
          regionLabel: regLabel,
          level: 'unreviewed',
          labelAr: 'لم يُراجَع لحالتك',
          className: 'tag-muted',
        })
      }
      continue
    }

    const loadLevel = entry.loads[lim.region]

    if (lim.status === 'current_pain' || lim.status === 'under_treatment') {
      if (loadLevel === 'high') {
        tags.push({
          regionId: lim.region,
          regionLabel: regLabel,
          level: 'high',
          labelAr: `حمل عالٍ على ${regLabel}`,
          className: 'tag-danger',
        })
      } else if (loadLevel === 'moderate') {
        tags.push({
          regionId: lim.region,
          regionLabel: regLabel,
          level: 'moderate',
          labelAr: `حمل متوسط على ${regLabel}`,
          className: 'tag-warning',
        })
      } else if (!loadLevel) {
        tags.push({
          regionId: lim.region,
          regionLabel: regLabel,
          level: 'unreviewed',
          labelAr: 'لم يُراجَع لحالتك',
          className: 'tag-muted',
        })
      }
    } else if (lim.status === 'old_recovered') {
      if (loadLevel === 'high') {
        tags.push({
          regionId: lim.region,
          regionLabel: regLabel,
          level: 'recovered_high',
          labelAr: `حمل عالٍ على ${regLabel} (إصابة سابقة)`,
          className: 'tag-info',
        })
      }
    }
  }

  return tags
}

export function getExerciseDetailsWithLimitations(exerciseKey: string) {
  const entries =
    (
      regionLoadData as unknown as {
        entries?: Record<string, ExerciseRegionLoadEntry>
      }
    ).entries || {}
  return entries[exerciseKey] || null
}
