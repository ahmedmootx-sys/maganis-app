import { z } from 'zod'
import atlasMusclesData from '../../data/atlas_muscles.json' with { type: 'json' }

export const ATLAS_MUSCLE_IDS = new Set<string>(
  atlasMusclesData.muscles.map((m: { id: string }) => m.id),
)

export const MuscleRoleSchema = z.enum(['primary', 'secondary'])

export const ExerciseMuscleSchema = z.object({
  id: z.string().refine((id) => ATLAS_MUSCLE_IDS.has(id), {
    message: 'Muscle id must be one of the 53 official atlas muscle ids',
  }),
  role: MuscleRoleSchema,
})

export const DisplayRulesSchema = z.object({
  gif_native_size_css_px: z.number().default(180),
  gif_attribution: z.string(),
  show_media_only_if: z.string(),
  nearest_matches: z.string(),
  empty_sections: z.string(),
})

export const AtlasColorsSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
})

export const MediaMatchSchema = z.enum(['exact', 'nearest', 'none'])

export const FrameMediaSchema = z.object({
  start: z.string().nullable().optional(),
  peak: z.string().nullable().optional(),
  source: z.string().optional(),
  source_id: z.string().nullable().optional(),
  match: MediaMatchSchema,
  display: z.boolean(),
  note_ar: z.string().optional(),
})

export const GifMediaSchema = z.object({
  url: z.string().nullable().optional(),
  source: z.string().optional(),
  source_id: z.string().nullable().optional(),
  source_name: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
  attribution: z.string().nullable().optional(),
  match: MediaMatchSchema,
  display: z.boolean(),
  note_ar: z.string().optional(),
})

export const CatalogExerciseSchema = z
  .object({
    key: z.string().min(1),
    name_en: z.string().min(1),
    name_ar: z.string().min(1, 'Exercise must have name_ar'),
    category: z.string().min(1),
    kind: z.string().min(1),
    equipment: z.object({
      ar: z.string(),
      db: z.string(),
    }),
    level: z.object({
      ar: z.string(),
      db: z.string(),
    }),
    target_ar: z.string(),
    muscles: z
      .array(ExerciseMuscleSchema)
      .min(1, 'Must have at least one muscle'),
    muscles_note_en: z.string().optional(),
    muscles_status: z.literal('coach_curated'),
    benefit_ar: z.string().min(1, 'Exercise must have benefit_ar'),
    mechanics_ar: z.string().min(1, 'Exercise must have mechanics_ar'),
    steps_ar: z
      .array(z.string().min(1))
      .min(3, 'Exercise must have at least 3 steps_ar'),
    common_mistakes_ar: z.array(z.string()).optional(),
    rest_seconds: z.number().nonnegative(),
    references: z.array(z.string()).optional(),
    media: z.object({
      frames: FrameMediaSchema.optional(),
      gif: GifMediaSchema.optional(),
    }),
    content_status: z.string().optional(),
    content_gaps: z.array(z.string()).optional(),
  })
  .superRefine((val, ctx) => {
    const hasPrimary = val.muscles.some((m) => m.role === 'primary')
    if (!hasPrimary) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Exercise "${val.key}" must have at least one muscle with role "primary"`,
        path: ['muscles'],
      })
    }
  })

export const CatalogV1Schema = z.object({
  schema: z.literal('maganis.catalog/1'),
  version: z.string(),
  generated: z.string(),
  author: z.string(),
  notes_ar: z.string().optional(),
  display_rules: DisplayRulesSchema,
  atlas_colors: AtlasColorsSchema,
  exercises: z.array(CatalogExerciseSchema),
})

export type CatalogV1 = z.infer<typeof CatalogV1Schema>
export type CatalogExercise = z.infer<typeof CatalogExerciseSchema>
