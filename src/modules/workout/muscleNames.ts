import muscleNamesData from '../../data/muscle-names.json'

export interface MuscleNameEntry {
  id: string
  gym_ar: string
  short_ar: string
  gym_ar_alt?: string[]
  sci_en: string
  where_ar: string
  group: string
  atlas?: string
  note_ar?: string
}

export interface MuscleGroupEntry {
  id: string
  gym_ar: string
  sci_en: string
  members: string[]
}

const MUSCLES_BY_ID: Record<string, MuscleNameEntry> = {}
for (const m of (muscleNamesData as { muscles: MuscleNameEntry[] }).muscles ||
  []) {
  MUSCLES_BY_ID[m.id] = m
}

const GROUPS_BY_ID: Record<string, MuscleGroupEntry> = {}
for (const g of (muscleNamesData as { groups: MuscleGroupEntry[] }).groups ||
  []) {
  GROUPS_BY_ID[g.id] = g
}

/**
 * Returns authored muscle information by muscle id or atlas id.
 */
export function getMuscleInfo(id: string): MuscleNameEntry | undefined {
  return MUSCLES_BY_ID[id]
}

/**
 * Returns primary colloquial Egyptian gym name (e.g. «صدر علوي», «بايسبس»).
 */
export function getMuscleGymName(id: string, fallback?: string): string {
  const m = MUSCLES_BY_ID[id]
  if (m) return m.gym_ar
  const g = GROUPS_BY_ID[id]
  if (g) return g.gym_ar
  return fallback || id
}

/**
 * Returns short label for chips (e.g. «باي», «تراي»).
 */
export function getMuscleShortName(id: string, fallback?: string): string {
  const m = MUSCLES_BY_ID[id]
  if (m) return m.short_ar
  const g = GROUPS_BY_ID[id]
  if (g) return g.gym_ar
  return fallback || id
}

/**
 * Returns secondary Latin/English anatomical name (e.g. "Biceps brachii").
 */
export function getMuscleSciName(id: string): string | undefined {
  return MUSCLES_BY_ID[id]?.sci_en || GROUPS_BY_ID[id]?.sci_en
}

/**
 * Returns parent group information.
 */
export function getMuscleGroup(groupId: string): MuscleGroupEntry | undefined {
  return GROUPS_BY_ID[groupId]
}

/**
 * Returns all authored muscles.
 */
export function getAllMuscles(): MuscleNameEntry[] {
  return (muscleNamesData as { muscles: MuscleNameEntry[] }).muscles || []
}

/**
 * Searches muscles matching gym_ar, short_ar, gym_ar_alt, or sci_en.
 */
export function searchMuscles(query: string): MuscleNameEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return getAllMuscles()

  return getAllMuscles().filter((m) => {
    if (m.gym_ar.toLowerCase().includes(q)) return true
    if (m.short_ar.toLowerCase().includes(q)) return true
    if (m.sci_en.toLowerCase().includes(q)) return true
    if (m.gym_ar_alt?.some((alt) => alt.toLowerCase().includes(q))) return true
    return false
  })
}

export function getAllGroups(): MuscleGroupEntry[] {
  return (muscleNamesData as { groups: MuscleGroupEntry[] }).groups || []
}

