import { z } from 'zod'

/**
 * src/modules/workout/importSchema.ts
 * Unified Zod schema for Program Import, Export, and AI Designer Prompt Schema.
 * Adheres strictly to TASK G4 Part 3.4.
 */

export const ItemSchema = z.object({
  exerciseId: z.string().nullable().default(null),
  customName: z.string().max(200).optional(),
  nameEn: z.string().max(200).optional(),
  sets: z.number().int().min(1).max(10),
  reps: z.number().int().min(1).max(100).nullable().optional(),
  repsMin: z.number().int().min(1).max(100).optional(),
  repsMax: z.number().int().min(1).max(100).optional(),
  unit: z.enum(['reps', 'seconds']).default('reps'),
  perSide: z.boolean().optional(),
  amrap: z.boolean().optional(),
  rpe: z.number().min(1).max(10).optional(),
  restSeconds: z.number().int().min(0).max(600).optional(),
  notesAr: z.string().max(200).optional(),
  targetSubMuscleAr: z.string().max(200).optional(),
  needsReview: z.boolean().optional(),
})

export const CardioConfigSchema = z.object({
  activity: z.string().max(200).default('جري'),
  plannedMinutes: z.number().int().min(5).max(600).default(30),
  effort: z.enum(['light', 'moderate', 'hard']).default('moderate'),
})

export const DaySchema = z.object({
  id: z.string().optional(),
  dayIndex: z.number().int().optional(),
  name: z.string().min(1).max(200),
  labelAr: z.string().min(1).max(200).optional(),
  focus: z.string().max(200).default(''),
  kind: z
    .enum(['strength', 'cardio', 'mobility', 'custom'])
    .default('strength'),
  weekday: z.enum(['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri']).optional(),
  warmup: z.array(ItemSchema).max(40).default([]),
  exercises: z.array(ItemSchema).max(40).default([]),
  controlBlock: z.array(ItemSchema).max(40).optional(),
  cooldown: z.array(ItemSchema).max(40).default([]),
  pullPrep: z.array(ItemSchema).max(40).optional(),
  cardio: CardioConfigSchema.optional(),
  cardioConfig: CardioConfigSchema.optional(),
})

export const ProgramImportSchema = z.object({
  id: z.string().optional(),
  createdAt: z.number().optional(),
  title: z.string().min(1).max(200),
  primaryGoal: z.string().max(200).default('hypertrophy'),
  trainingDaysPerWeek: z.number().int().min(1).max(14),
  splitType: z.string().max(200).default('custom'),
  notes: z.string().max(500).optional(),
  days: z.array(DaySchema).min(1).max(14),
})

export type ImportedItem = z.infer<typeof ItemSchema>
export type ImportedDay = z.infer<typeof DaySchema>
export type ImportedProgram = z.infer<typeof ProgramImportSchema>

/**
 * Clean compact schema description for prompt insertion
 */
export const PROMPT_SCHEMA_TEXT = `{
  "title": "string (Arabic program title, e.g. برنامج أحمد — علوي/سفلي)",
  "primaryGoal": "string (e.g. hypertrophy | strength | cut | fitness)",
  "trainingDaysPerWeek": "number (integer 1-7)",
  "splitType": "string (e.g. upper_lower | psh_pull_legs | full_body)",
  "notes": "string (optional Arabic notes on deload, progression, safety)",
  "days": [
    {
      "name": "string (Arabic day name, e.g. علوي (أ))",
      "labelAr": "string (Arabic day name)",
      "focus": "string (Arabic focus muscles, e.g. صدر · ظهر)",
      "kind": "strength | cardio | mobility | custom",
      "weekday": "sat | sun | mon | tue | wed | thu | fri (optional)",
      "warmup": [
        {
          "exerciseId": "string from CATALOG or null if custom",
          "customName": "string in Arabic if exerciseId is null",
          "nameEn": "string in English if exerciseId is null",
          "sets": "number (1-10)",
          "reps": "number (1-100) or null if amrap",
          "unit": "reps | seconds",
          "restSeconds": "number (0-600)",
          "notesAr": "string (optional Arabic note)"
        }
      ],
      "exercises": [
        {
          "exerciseId": "string from CATALOG or null",
          "customName": "string in Arabic if exerciseId is null",
          "nameEn": "string in English if exerciseId is null",
          "sets": "number (1-10)",
          "reps": "number (1-100)",
          "repsMin": "number (optional)",
          "repsMax": "number (optional)",
          "unit": "reps | seconds",
          "rpe": "number (1-10, optional)",
          "restSeconds": "number (0-600)",
          "notesAr": "string (optional Arabic coaching cue)"
        }
      ],
      "cooldown": [
        {
          "exerciseId": "string from CATALOG or null",
          "sets": "number",
          "reps": "number",
          "unit": "reps | seconds",
          "restSeconds": "number"
        }
      ],
      "cardio": {
        "activity": "string (e.g. مشي سريع | دراجة)",
        "plannedMinutes": "number (5-600)",
        "effort": "light | moderate | hard"
      }
    }
  ]
}`

/**
 * Valid small example program for prompt template
 */
export const PROMPT_EXAMPLE_JSON = `{
  "title": "برنامج علوي/سفلي للمبتدئين",
  "primaryGoal": "hypertrophy",
  "trainingDaysPerWeek": 2,
  "splitType": "upper_lower",
  "notes": "التقدم التدريبي بمبدأ الزيادة المزدوجة (Double Progression)، وأسبوع استشفاء (Deload) كل 5 أسابيع.",
  "days": [
    {
      "name": "علوي (أ)",
      "labelAr": "علوي (أ)",
      "focus": "صدر · ظهر · أكتاف",
      "kind": "strength",
      "warmup": [
        {
          "exerciseId": "crossst",
          "sets": 1,
          "reps": 30,
          "unit": "seconds",
          "restSeconds": 30,
          "notesAr": "30 ثانية لكل جانب"
        }
      ],
      "exercises": [
        {
          "exerciseId": "bench",
          "sets": 3,
          "reps": 8,
          "repsMin": 8,
          "repsMax": 10,
          "unit": "reps",
          "rpe": 7,
          "restSeconds": 120,
          "notesAr": "تثبيت لوحي الكتف على الدكة، النزول ببطء 2-3 ثوانٍ"
        },
        {
          "exerciseId": "pullup",
          "sets": 3,
          "reps": 6,
          "repsMin": 6,
          "repsMax": 8,
          "unit": "reps",
          "rpe": 7,
          "restSeconds": 120,
          "notesAr": "بدون أرجحة، نزول كامل متحكم به"
        }
      ],
      "cooldown": [
        {
          "exerciseId": "chestst",
          "sets": 1,
          "reps": 30,
          "unit": "seconds",
          "restSeconds": 0,
          "notesAr": "تمدد الصدر على إطار الباب"
        }
      ]
    },
    {
      "name": "سفلي (أ)",
      "labelAr": "سفلي (أ)",
      "focus": "أرجل · جذع",
      "kind": "strength",
      "warmup": [
        {
          "exerciseId": "legswing",
          "sets": 1,
          "reps": 10,
          "unit": "reps",
          "perSide": true,
          "restSeconds": 30
        }
      ],
      "exercises": [
        {
          "exerciseId": "squat",
          "sets": 3,
          "reps": 8,
          "repsMin": 8,
          "repsMax": 10,
          "unit": "reps",
          "rpe": 7,
          "restSeconds": 150,
          "notesAr": "النزول بموازاة الفخذين للأرض مع بقاء الجذع مشدوداً"
        },
        {
          "exerciseId": "rdl",
          "sets": 3,
          "reps": 10,
          "repsMin": 8,
          "repsMax": 10,
          "unit": "reps",
          "rpe": 7,
          "restSeconds": 120,
          "notesAr": "انثناء من الورك للخلف مع ظهر مستقيم"
        }
      ],
      "cooldown": [
        {
          "exerciseId": "hipflexst",
          "sets": 1,
          "reps": 30,
          "unit": "seconds",
          "restSeconds": 0
        }
      ]
    }
  ]
}`
