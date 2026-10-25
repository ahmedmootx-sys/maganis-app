import promptTemplateRaw from '../../data/ai-designer-prompt.md?raw'
import catalogData from '../../data/catalog-v1.json' with { type: 'json' }
import type { UserProfile } from '../onboarding/types.ts'
import type { CustomExercise } from '../shared/types.ts'
import { PROMPT_SCHEMA_TEXT, PROMPT_EXAMPLE_JSON } from './importSchema.ts'

import { deriveConstraints, isExerciseAllowed } from './constraints.ts'

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
    includeInjuryData: _includeInjuryData = false,
    includeCustomExercises = false,
    customExercises = [],
  } = options

  const constraints = deriveConstraints(profile)

  // 1. Build catalog lines (filtered by user constraints)
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
    if (isExerciseAllowed({ id: ex.key, key: ex.key, equipment: ex.equipment }, constraints)) {
      catalogLines.push(
        `${ex.key} | ${ex.name_en} | ${ex.name_ar} | ${ex.category} | ${ex.equipment?.ar || ex.equipment?.db || ''}`,
      )
    }
  }

  if (includeCustomExercises && customExercises.length > 0) {
    for (const cust of customExercises) {
      if (isExerciseAllowed(cust, constraints)) {
        const id = cust.id || cust.key || 'custom'
        catalogLines.push(
          `${id} | ${cust.name || cust.nameEn || cust.nameAr} | ${cust.nameAr} | ${cust.category} | ${cust.equipment} [تمرين مخصص]`,
        )
      }
    }
  }

  const catalogText = catalogLines.join('\n')

  // 2. Build profile block (only preview fields: age, sex, height, weight, main goal, training days, equipment)
  // Privacy Rule: Injuries and health data must never be auto-included.
  let profileText = '(not provided)'
  if (includeProfileData && profile) {
    const parts: string[] = []
    const b = profile.body
    if (b?.age) parts.push(`- Age: ${b.age}`)
    if (b?.sex) parts.push(`- Sex: ${b.sex === 'female' ? 'Female' : 'Male'}`)
    if (b?.heightCm) parts.push(`- Height: ${b.heightCm} cm`)
    if (b?.weightKg) parts.push(`- Weight: ${b.weightKg} kg`)
    if (profile.primaryGoal) parts.push(`- Main goal: ${profile.primaryGoal}`)
    if (profile.trainingDaysPerWeek)
      parts.push(`- Training days per week: ${profile.trainingDaysPerWeek} days`)
    if (profile.trainingStyle && profile.trainingStyle.length > 0) {
      parts.push(`- Training style: ${profile.trainingStyle.join(', ')}`)
    }
    if (profile.trainingLocation) {
      parts.push(`- Training location: ${profile.trainingLocation}`)
    }
    if (profile.equipmentAvailable && profile.equipmentAvailable.length > 0) {
      parts.push(`- Available equipment: ${profile.equipmentAvailable.join(', ')}`)
    } else if (constraints.isCalisthenicsOnly) {
      parts.push(`- Available equipment: Bodyweight only (calisthenics)`)
    } else if (constraints.isHomeDumbbellsOnly) {
      parts.push(`- Available equipment: Dumbbells and bodyweight (home)`)
    }

    profileText = parts.length > 0 ? parts.join('\n') : '(not provided)'
  }

  // 3. Template interpolation
  let finalPrompt = promptTemplateRaw
  finalPrompt = finalPrompt.replace(
    '{{LANG}}',
    'Egyptian Arabic, simple and natural',
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
