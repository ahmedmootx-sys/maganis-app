import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { buildAiDesignerPrompt } from './aiPromptBuilder.ts'
import { importProgramFromJson } from './programImporter.ts'
import { PROMPT_EXAMPLE_JSON } from './importSchema.ts'
import type { UserProfile } from '../onboarding/types.ts'

describe('A4: AI Designer Prompt Privacy Gate & Round Trip', () => {
  const rootDir = process.cwd()
  const ownerDump = JSON.parse(
    fs.readFileSync(
      path.resolve(rootDir, 'docs/owner-profile-dump.json'),
      'utf8',
    ),
  )
  const ownerProfile: UserProfile = ownerDump.profile

  const fixtureProfile: UserProfile = {
    id: 'fixture-test-user',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    name: 'سارة',
    primaryGoal: 'cut',
    goals: ['cut'],
    trainingDaysPerWeek: 3,
    equipmentAvailable: ['dumbbell', 'bodyweight'],
    body: {
      age: 24,
      sex: 'female',
      heightCm: 165,
      weightKg: 62,
      activityLevel: 'moderate',
    },
    medical: {
      hasIssues: true,
      injuryTags: ['lower_back'],
      notes: 'ألم بسيط أسفل الظهر',
    },
    limitations: [
      {
        region: 'lower_back',
        status: 'current_pain',
        note: 'تجنب الرفعات الميتة الثقيلة',
      },
    ],
  }

  // Collect all strings of 4+ characters from owner-profile-dump.json
  function extractStrings(obj: any): string[] {
    const list: string[] = []
    function traverse(val: any) {
      if (typeof val === 'string') {
        if (val.trim().length >= 4) {
          list.push(val.trim())
        }
      } else if (Array.isArray(val)) {
        val.forEach(traverse)
      } else if (val && typeof val === 'object') {
        Object.values(val).forEach(traverse)
      }
    }
    traverse(obj)
    return list
  }

  const ownerStrings = extractStrings(ownerDump)

  it('PRIVACY GATE: with switch OFF, prompt contains zero owner data', () => {
    for (const prof of [ownerProfile, fixtureProfile]) {
      const res = buildAiDesignerPrompt({
        profile: prof,
        includeProfileData: false,
        includeInjuryData: false,
      })

      const prompt = res.prompt

      // Assert {{PROFILE}} is '(not provided)'
      expect(prompt).toContain('(not provided)')

      // Forbidden strings:
      // Owner's name
      expect(prompt).not.toContain(ownerProfile.name)
      // Real body numbers
      expect(prompt).not.toContain('56.5')
      expect(prompt).not.toContain('171')
      expect(prompt).not.toContain('11.4')
      // prog-ahmed
      expect(prompt).not.toContain('prog-ahmed')
      expect(prompt).not.toContain('ahmed')

      // All strings >= 4 chars from owner dump (excluding generic words like hypertrophy that may appear in template definitions)
      const allowedGeneric = new Set([
        'hypertrophy',
        'intermediate',
        'standard',
        'moderate',
        'barbell',
        'dumbbell',
        'machine',
        'bodyweight',
        'weights',
        'cables',
        'upper_lower',
        'gain',
        'shoulder',
        'الكتف',
        'Mifflin-St Jeor (1990)',
        'Morton et al. BJSM 2018',
      ])

      for (const s of ownerStrings) {
        if (!allowedGeneric.has(s)) {
          if (prompt.includes(s)) {
            throw new Error(`FAILING OWNER STRING DETECTED: [${s}]`)
          }
          expect(prompt).not.toContain(s)
        }
      }
    }
  })

  it('PRIVACY GATE: with switch ON, only preview fields appear; NO injuries or health data', () => {
    const res = buildAiDesignerPrompt({
      profile: ownerProfile,
      includeProfileData: true,
      includeInjuryData: false,
    })

    const prompt = res.prompt

    // Preview fields should appear
    expect(prompt).toContain(`- Age: ${ownerProfile.body.age}`)
    expect(prompt).toContain(`- Sex: Male`)
    expect(prompt).toContain(`- Height: ${ownerProfile.body.heightCm} cm`)
    expect(prompt).toContain(`- Weight: ${ownerProfile.body.weightKg} kg`)
    expect(prompt).toContain(`- Main goal: ${ownerProfile.primaryGoal}`)
    expect(prompt).toContain(
      `- Training days per week: ${ownerProfile.trainingDaysPerWeek} days`,
    )

    // Forbidden in prompt even with switch ON:
    // 1. Owner's name
    expect(prompt).not.toContain(ownerProfile.name)
    // 2. prog-ahmed
    expect(prompt).not.toContain('prog-ahmed')
    // 3. Injuries, medical notes, limitations
    expect(prompt).not.toContain('التهاب أوتار')
    expect(prompt).not.toContain('الكتف الأيمن')
    expect(prompt).not.toContain('تجنب الأوزان الحرة')
    expect(prompt).not.toContain('استبدال الضغط الحر')
    expect(prompt).not.toContain('Injuries and limitations:')
  })

  it('Round trip test: prompt example JSON imports through real importer with zero warnings', () => {
    const res = importProgramFromJson(PROMPT_EXAMPLE_JSON)

    expect(res.success).toBe(true)
    expect(res.errors).toEqual([])
    expect(res.warnings).toEqual([])
    expect(res.program).toBeDefined()
    expect(res.program?.days.length).toBe(3)
  })
})
