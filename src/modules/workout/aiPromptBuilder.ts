import promptTemplateRaw from '../../data/ai-designer-prompt.md?raw'
import catalogData from '../../data/catalog-v1.json'
import type { UserProfile } from '../onboarding/types.ts'
import type { CustomExercise } from '../shared/types.ts'
import { PROMPT_SCHEMA_TEXT, PROMPT_EXAMPLE_JSON } from './importSchema.ts'
import { getRegionLabel } from './limitations.ts'

export interface PromptBuildOptions {
  profile?: UserProfile | null
  includeProfileData?: boolean
  includeInjuryData?: boolean
  includeCustomExercises?: boolean
  customExercises?: CustomExercise[]
}

/**
 * Builds the AI Coach Prompt adhering to TASK G4 Part 3.3.
 * Length strictly stays under 30,000 characters.
 */
export function buildAiDesignerPrompt(options: PromptBuildOptions = {}): {
  prompt: string
  characterCount: number
  catalogCount: number
} {
  const {
    profile,
    includeProfileData = false,
    includeInjuryData = false,
    includeCustomExercises = false,
    customExercises = [],
  } = options

  // 1. Build catalog lines
  const catalogLines: string[] = []
  const exercises =
    (
      catalogData as unknown as {
        exercises: Array<{
          key: string
          name_en: string
          name_ar: string
          category: string
          equipment: { ar: string; db: string }
        }>
      }
    ).exercises || []

  for (const ex of exercises) {
    catalogLines.push(
      `${ex.key} | ${ex.name_en} | ${ex.name_ar} | ${ex.category} | ${ex.equipment?.ar || ex.equipment?.db || ''}`,
    )
  }

  if (includeCustomExercises && customExercises.length > 0) {
    for (const cust of customExercises) {
      const id = cust.id || cust.key || 'custom'
      catalogLines.push(
        `${id} | ${cust.name || cust.nameEn || cust.nameAr} | ${cust.nameAr} | ${cust.category} | ${cust.equipment} [تمرين مخصص]`,
      )
    }
  }

  const catalogText = catalogLines.join('\n')

  // 2. Build profile block
  let profileText =
    'None provided by the app. Please proceed with Phase 1 interview questions.'
  if (includeProfileData && profile) {
    const parts: string[] = []
    const b = profile.body
    if (b.age) parts.push(`- Age: ${b.age}`)
    if (b.sex) parts.push(`- Sex: ${b.sex === 'female' ? 'Female' : 'Male'}`)
    if (b.heightCm) parts.push(`- Height: ${b.heightCm} cm`)
    if (b.weightKg) parts.push(`- Weight: ${b.weightKg} kg`)
    if (profile.primaryGoal) parts.push(`- Main goal: ${profile.primaryGoal}`)
    if (profile.trainingDaysPerWeek)
      parts.push(`- Target days per week: ${profile.trainingDaysPerWeek} days`)
    if (profile.experienceLevel)
      parts.push(`- Experience level: ${profile.experienceLevel}`)
    if (profile.trainingLocation)
      parts.push(
        `- Training place: ${profile.trainingLocation === 'gym' ? 'Gym' : profile.trainingLocation === 'home' ? 'Home' : 'Both'}`,
      )
    if (b.activityLevel)
      parts.push(`- Daily activity level: ${b.activityLevel}`)

    if (includeInjuryData) {
      parts.push('\nInjuries and limitations:')
      if (
        profile.medical?.hasIssues &&
        profile.limitations &&
        profile.limitations.length > 0
      ) {
        for (const lim of profile.limitations) {
          const regionNameAr = getRegionLabel(lim.region)
          const statusStr =
            lim.status === 'current_pain'
              ? 'Current Pain'
              : lim.status === 'old_recovered'
                ? 'Old injury (recovered)'
                : 'Under medical treatment'
          parts.push(
            `  * ${lim.region} (${regionNameAr}): ${statusStr}${lim.note ? ` - Note: ${lim.note}` : ''}`,
          )
        }
      } else if (profile.medical?.hasIssues && profile.medical.notes) {
        parts.push(`  * Notes: ${profile.medical.notes}`)
      } else {
        parts.push('  * No diagnosed injuries or current pain recorded.')
      }
    }

    profileText = parts.join('\n')
  }

  // 3. Template interpolation
  let finalPrompt = promptTemplateRaw
  finalPrompt = finalPrompt.replace(
    '{{LANG}}',
    'Arabic, simple everyday wording',
  )
  finalPrompt = finalPrompt.replace('{{CATALOG}}', catalogText)
  finalPrompt = finalPrompt.replace('{{SCHEMA}}', PROMPT_SCHEMA_TEXT)
  finalPrompt = finalPrompt.replace('{{EXAMPLE}}', PROMPT_EXAMPLE_JSON)
  finalPrompt = finalPrompt.replace('{{PROFILE}}', profileText)

  return {
    prompt: finalPrompt,
    characterCount: finalPrompt.length,
    catalogCount: catalogLines.length,
  }
}
