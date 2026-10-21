import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { buildAiDesignerPrompt } from './aiPromptBuilder.ts'
import {
  importProgramFromJson,
  extractJsonFromText,
  formatJsonSyntaxError,
} from './programImporter.ts'
import type { UserProfile } from '../onboarding/types.ts'
import type { UserLimitation } from './limitations.ts'
import { PROMPT_EXAMPLE_JSON } from './importSchema.ts'

describe('Part 3 — AI Program Designer and Program Importer', () => {
  const mockProfile: UserProfile = {
    id: 'user-1',
    name: 'أحمد',
    experienceLevel: 'intermediate',
    trainingLocation: 'gym',
    primaryGoal: 'hypertrophy',
    goals: ['hypertrophy'],
    trainingDaysPerWeek: 5,
    weekStartDay: 6,
    medical: {
      hasIssues: true,
      injuryTags: ['كتف', 'أسفل الظهر'],
      notes: 'ألم خفيف بالكتف الأيمن عند الدفع فوق الرأس',
    },
    limitations: [
      { region: 'shoulder', status: 'current_pain', note: 'الكتف الأيمن' },
      { region: 'lower_back', status: 'old_recovered' },
    ],
    body: {
      sex: 'male',
      age: 28,
      heightCm: 178,
      weightKg: 82,
      activityLevel: 'moderate',
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  describe('3.1 Prompt Builder (aiPromptBuilder)', () => {
    it('builds a prompt strictly under 30,000 characters', () => {
      const res = buildAiDesignerPrompt({
        profile: mockProfile,
        includeProfileData: true,
        includeInjuryData: true,
      })

      expect(res.characterCount).toBeLessThan(30000)
      expect(res.prompt.length).toBeLessThan(30000)
      expect(res.catalogCount).toBe(44)
    })

    it('interpolates catalog lines, schema, and example into prompt', () => {
      const res = buildAiDesignerPrompt({
        profile: mockProfile,
        includeProfileData: true,
        includeInjuryData: true,
      })

      expect(res.prompt).toContain('# CATALOG')
      expect(res.prompt).toContain('bench | Barbell Bench Press')
      expect(res.prompt).toContain('# SCHEMA')
      expect(res.prompt).toContain('# EXAMPLE')
      expect(res.prompt).toContain('Age: 28')
      expect(res.prompt).toContain('Weight: 82 kg')
      expect(res.prompt).toContain('Shoulder')
    })

    it('omits personal and injury details when toggles are disabled', () => {
      const res = buildAiDesignerPrompt({
        profile: mockProfile,
        includeProfileData: false,
        includeInjuryData: false,
      })

      expect(res.prompt).not.toContain('Weight: 82 kg')
      expect(res.prompt).not.toContain('الكتف الأيمن')
      expect(res.prompt).toContain('None provided by the app')
    })
  })

  describe('3.2 Program Importer (programImporter)', () => {
    it('extracts JSON from markdown code block and raw text', () => {
      const fenced = '```json\n{"title": "برنامج تجريبي"}\n```'
      expect(extractJsonFromText(fenced)).toBe('{"title": "برنامج تجريبي"}')

      const raw = 'بعض الشرح قبل الكود: {"title": "برنامج"} وبعض الشرح بعده'
      expect(extractJsonFromText(raw)).toBe('{"title": "برنامج"}')
    })

    it('reports JSON syntax errors in Arabic with line and column numbers', () => {
      const badJson = '{\n  "title": "برنامج",\n  "days": [\n}'
      const err = new SyntaxError('Unexpected token } in JSON at position 33')
      const formatted = formatJsonSyntaxError(err, badJson)

      expect(formatted).toContain('خطأ في بناء جملة JSON')
      expect(formatted).toContain('السطر')
      expect(formatted).toContain('العمود')
    })

    it('imports the real fixture maganis-program-prog-ahmed-upper-lower-5d.json with 0 errors', () => {
      const fixturePath = path.resolve(
        process.cwd(),
        'src/data/fixtures/maganis-program-prog-ahmed-upper-lower-5d.json',
      )
      const fixtureContent = fs.readFileSync(fixturePath, 'utf8')

      const result = importProgramFromJson(fixtureContent, {
        limitations: mockProfile.limitations,
      })

      expect(result.errors).toEqual([])
      expect(result.success).toBe(true)
      expect(result.program).toBeDefined()
      expect(result.program?.days.length).toBe(5)
      expect(result.stats.daysCount).toBe(5)
      expect(result.stats.totalItems).toBeGreaterThan(20)

      // Verify fixture defect fixes:
      // 1. targetSubMuscleAr: "عضلة رئيسية" omitted
      const allExercises = result.program!.days.flatMap((d) => d.exercises)
      for (const ex of allExercises) {
        expect(ex.targetSubMuscleAr).not.toBe('عضلة رئيسية')
      }

      // 2. customName compound parsed
      const pullUpEx = allExercises.find(
        (e) =>
          e.exerciseId === 'placeholder-arm-circle' ||
          e.nameEn === 'Arm Circles',
      )
      expect(pullUpEx).toBeDefined()
      expect(pullUpEx?.customName).toBe('دوائر الذراعين للإحماء')
      expect(pullUpEx?.nameEn).toBe('Arm Circles')
      expect(pullUpEx?.needsReview).toBe(true)
    })

    it('round-trips the example program template through import without error', () => {
      const result = importProgramFromJson(PROMPT_EXAMPLE_JSON)
      expect(result.success).toBe(true)
      expect(result.errors).toEqual([])
      expect(result.program?.days.length).toBe(2)
    })

    it('flags limitation conflicts on exercises with high/unreviewed load', () => {
      const testLimitation: UserLimitation[] = [
        { region: 'shoulder', status: 'current_pain' },
      ]

      const json = JSON.stringify({
        title: 'برنامج تجريبي',
        primaryGoal: 'hypertrophy',
        trainingDaysPerWeek: 1,
        splitType: 'full_body',
        days: [
          {
            name: 'يوم 1',
            kind: 'strength',
            exercises: [
              {
                exerciseId: 'bench',
                sets: 3,
                reps: 10,
              },
            ],
          },
        ],
      })

      const res = importProgramFromJson(json, { limitations: testLimitation })
      expect(res.success).toBe(true)
      expect(res.diagnostics.length).toBe(1)
      expect(res.diagnostics[0].tags.length).toBeGreaterThan(0)
    })
  })
})
