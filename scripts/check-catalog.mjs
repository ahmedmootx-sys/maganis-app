#!/usr/bin/env node
/**
 * scripts/check-catalog.mjs
 * Gate 1.3: Catalog Schema and Data Integrity Check.
 * Validates catalog-v1.json with Zod schema.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const catalogPath = path.join(rootDir, 'src', 'data', 'catalog-v1.json')
const atlasMusclesPath = path.join(rootDir, 'data', 'atlas_muscles.json')

if (!fs.existsSync(catalogPath)) {
  console.error(`❌ Catalog file not found at ${catalogPath}`)
  process.exit(1)
}

const atlasMusclesData = JSON.parse(fs.readFileSync(atlasMusclesPath, 'utf8'))
const ATLAS_MUSCLE_IDS = new Set(atlasMusclesData.muscles.map((m) => m.id))

console.log('🚀 Checking Maganis Catalog Integrity (Gate 1.3)...')
console.log(`📋 Atlas muscles loaded: ${ATLAS_MUSCLE_IDS.size} official ids.`)

const rawCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))

const MuscleRoleSchema = z.enum(['primary', 'secondary'])

const ExerciseMuscleSchema = z.object({
  id: z.string().refine((id) => ATLAS_MUSCLE_IDS.has(id), {
    message: 'Muscle id must be one of the 53 official atlas muscle ids',
  }),
  role: MuscleRoleSchema,
})

const CatalogExerciseSchema = z
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
      frames: z.any().optional(),
      gif: z.any().optional(),
    }),
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

const CatalogV1Schema = z.object({
  schema: z.literal('maganis.catalog/1'),
  version: z.string(),
  generated: z.string(),
  author: z.string(),
  display_rules: z.object({
    gif_native_size_css_px: z.number(),
    gif_attribution: z.string(),
    show_media_only_if: z.string(),
    nearest_matches: z.string(),
    empty_sections: z.string(),
  }),
  atlas_colors: z.object({
    primary: z.string(),
    secondary: z.string(),
  }),
  exercises: z.array(CatalogExerciseSchema),
})

try {
  const parsed = CatalogV1Schema.parse(rawCatalog)
  console.log(
    `✓ Catalog schema valid: schema="${parsed.schema}", version="${parsed.version}"`,
  )
  console.log(
    `✓ All ${parsed.exercises.length} exercises passed schema validation!`,
  )

  // Check display rules & words check
  const rawCatalogStr = JSON.stringify(rawCatalog)
  if (rawCatalogStr.includes('موثوق') || rawCatalogStr.includes('تم التحقق')) {
    console.error(
      '❌ Found forbidden claim word («موثوق» or «تم التحقق») in catalog data!',
    )
    process.exit(1)
  }
  console.log('✓ No forbidden claims («موثوق» or «تم التحقق») in catalog.')

  // Check each exercise detailed criteria
  for (const ex of parsed.exercises) {
    if (!ex.name_ar || ex.name_ar.trim().length === 0) {
      throw new Error(`Exercise "${ex.key}" has empty name_ar`)
    }
    if (!ex.benefit_ar || ex.benefit_ar.trim().length === 0) {
      throw new Error(`Exercise "${ex.key}" has empty benefit_ar`)
    }
    if (!ex.mechanics_ar || ex.mechanics_ar.trim().length === 0) {
      throw new Error(`Exercise "${ex.key}" has empty mechanics_ar`)
    }
    if (!Array.isArray(ex.steps_ar) || ex.steps_ar.length < 3) {
      throw new Error(`Exercise "${ex.key}" has fewer than 3 steps_ar`)
    }
    const primaries = ex.muscles.filter((m) => m.role === 'primary')
    if (primaries.length === 0) {
      throw new Error(`Exercise "${ex.key}" has no primary muscle`)
    }
    for (const m of ex.muscles) {
      if (!ATLAS_MUSCLE_IDS.has(m.id)) {
        throw new Error(
          `Exercise "${ex.key}" has invalid atlas muscle id "${m.id}"`,
        )
      }
    }
  }

  console.log(
    '✓ All exercises have required fields: name_ar, benefit_ar, mechanics_ar, >=3 steps_ar, >=1 primary muscle, valid 53 atlas ids.',
  )
  console.log('✅ catalog:check PASSED!\n')
  process.exit(0)
} catch (err) {
  console.error('❌ catalog:check FAILED:', err)
  process.exit(1)
}
