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
      expect(res.prompt).toContain('(not provided)')
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
      expect(result.program?.days.length).toBe(3)
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

    it('handles AI generated JSON with string range reps, string sets, and notes alias', () => {
      const aiJson = JSON.stringify({
        title: 'برنامج الذكاء الاصطناعي',
        days: [
          {
            labelAr: 'يوم الصدر والظهر',
            exercises: [
              {
                exerciseId: null,
                name: 'تمرين دفع مخصص بالدمبل',
                nameEn: 'Custom Dumbbell Press',
                sets: '4',
                reps: '8-12',
                notes: 'التركيز على النزول البطيء 3 ثواني',
              },
            ],
          },
        ],
      })

      const res = importProgramFromJson(aiJson)
      expect(res.success).toBe(true)
      expect(res.program).toBeDefined()
      expect(res.program?.trainingDaysPerWeek).toBe(1)
      expect(res.program?.days[0].labelAr).toBe('يوم الصدر والظهر')

      const ex = res.program?.days[0].exercises[0]
      expect(ex?.sets).toBe(4)
      expect(ex?.repsMin).toBe(8)
      expect(ex?.repsMax).toBe(12)
      expect(ex?.reps).toBe(10)
      expect(ex?.customName).toBe('تمرين دفع مخصص بالدمبل')
      expect(ex?.nameEn).toBe('Custom Dumbbell Press')
      expect(ex?.notes).toBe('التركيز على النزول البطيء 3 ثواني')
    })

    it('successfully imports programs exported between friends (WorkoutProgram shape)', () => {
      const friendExport = JSON.stringify({
        name: 'جدول أحمد للضخامة',
        splitType: 'upper_lower',
        days: [
          {
            id: 'day-1',
            dayIndex: 0,
            labelAr: 'علوي (أ)',
            focus: 'صدر · ظهر',
            exercises: [
              {
                exerciseId: 'bench',
                sets: 3,
                reps: 8,
                restSeconds: 120,
                notes: 'الثبات التام مع لمس الصدر',
              },
            ],
          },
          {
            id: 'day-2',
            dayIndex: 1,
            labelAr: 'سفلي (أ)',
            focus: 'أرجل',
            exercises: [
              {
                exerciseId: 'squat',
                sets: 4,
                reps: 6,
                restSeconds: 180,
              },
            ],
          },
        ],
      })

      const res = importProgramFromJson(friendExport)
      expect(res.success).toBe(true)
      expect(res.program?.title).toBe('جدول أحمد للضخامة')
      expect(res.program?.trainingDaysPerWeek).toBe(2)
      expect(res.program?.days.length).toBe(2)
      expect(res.program?.days[0].exercises[0].notes).toBe(
        'الثبات التام مع لمس الصدر',
      )
    })

    it('roundtrip export and import does not duplicate warmup and cooldown exercises', () => {
      const initialJson = JSON.stringify({
        title: 'برنامج متكامل',
        days: [
          {
            labelAr: 'اليوم الأول',
            focus: 'صدر',
            warmup: [
              { exerciseId: 'push_up', sets: 2, reps: 10, notesAr: 'إحماء' },
            ],
            exercises: [
              { exerciseId: 'bench', sets: 3, reps: 8, restSeconds: 120 },
            ],
            cooldown: [
              { exerciseId: 'plank', sets: 2, reps: 30, unit: 'seconds' },
            ],
          },
        ],
      })

      const res1 = importProgramFromJson(initialJson)
      expect(res1.success).toBe(true)
      const day1 = res1.program!.days[0]
      expect(day1.exercises.length).toBe(3)
      expect(day1.warmup?.length).toBe(1)
      expect(day1.cooldown?.length).toBe(1)

      // Export program as friend would share it
      const exportedJson = JSON.stringify(res1.program)
      const res2 = importProgramFromJson(exportedJson)
      expect(res2.success).toBe(true)
      const day2 = res2.program!.days[0]
      // Must NOT duplicate exercises (3 items, not 5 or more)
      expect(day2.exercises.length).toBe(3)
      expect(day2.exercises.map((e) => e.exerciseId)).toEqual([
        'push_up',
        'bench',
        'plank',
      ])
      // Cooldown section is preserved
      const cooldownEx = day2.exercises.find((e) => e.exerciseId === 'plank')
      expect(cooldownEx?.section).toBe('cooldown')
    })

    it('accepts cardio with high effort or Arabic effort level without validation error', () => {
      const json = JSON.stringify({
        title: 'برنامج مع كارديو عالي',
        days: [
          {
            labelAr: 'يوم كارديو',
            kind: 'cardio',
            cardio: {
              activity: 'ركض سريع',
              plannedMinutes: 45,
              effort: 'high',
            },
            exercises: [],
          },
        ],
      })

      const res = importProgramFromJson(json)
      expect(res.success).toBe(true)
      expect(res.program?.days[0].cardio?.effort).toBe('high')
    })
  })
})
