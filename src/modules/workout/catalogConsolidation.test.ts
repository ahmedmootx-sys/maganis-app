import { describe, it, expect } from 'vitest'
import {
  EXERCISES,
  CATALOG_EXERCISES,
  LEGACY_EXERCISES,
  ALL_EXERCISES,
  getExerciseById,
  isArchivedExercise,
  getCatalogReplacements,
  getExercisesByCategory,
} from './exercises.ts'
import { generateProgram } from './programGenerator.ts'

describe('Part 1 — Catalog Consolidation and Gate Checks', () => {
  it('loads catalog-v1.json with exactly 44 active coach-curated exercises', () => {
    expect(CATALOG_EXERCISES.length).toBe(44)
    expect(EXERCISES.length).toBe(44)
    for (const ex of EXERCISES) {
      expect(ex.archived).toBe(false)
      expect(ex.id).toBeTruthy()
      expect(ex.nameAr).toBeTruthy()
      expect(ex.muscles?.some((m) => m.role === 'primary')).toBe(true)
    }
  })

  it('keeps legacy 261 exercises read-only as archived', () => {
    expect(LEGACY_EXERCISES.length).toBe(261)
    for (const ex of LEGACY_EXERCISES) {
      expect(ex.archived).toBe(true)
    }
    expect(ALL_EXERCISES.length).toBe(44 + 261)
  })

  it('resolves legacy IDs for backwards compatibility and history snapshots', () => {
    const legacyBench = getExerciseById('chest-1')
    expect(legacyBench).toBeDefined()
    expect(legacyBench?.archived).toBe(true)
    expect(isArchivedExercise(legacyBench)).toBe(true)

    const catalogBench = getExerciseById('bench')
    expect(catalogBench).toBeDefined()
    expect(catalogBench?.archived).toBe(false)
    expect(isArchivedExercise(catalogBench)).toBe(false)
  })

  it('ensures getExercisesByCategory never returns an archived exercise', () => {
    const chestExercises = getExercisesByCategory('chest')
    expect(chestExercises.length).toBeGreaterThan(0)
    for (const ex of chestExercises) {
      expect(ex.archived).toBeFalsy()
      expect(CATALOG_EXERCISES.some((c) => c.id === ex.id)).toBe(true)
    }
  })

  it('ensures program generator never returns an archived exercise', () => {
    const prog = generateProgram({
      goal: 'hypertrophy',
      trainingDaysPerWeek: 4,
    })
    expect(prog).toBeDefined()
    expect(prog.days.length).toBeGreaterThan(0)

    for (const day of prog.days) {
      for (const item of day.exercises) {
        const ex = getExerciseById(item.exerciseId)
        expect(ex).toBeDefined()
        expect(ex?.archived).toBeFalsy()
        expect(CATALOG_EXERCISES.some((c) => c.id === item.exerciseId)).toBe(
          true,
        )
      }
    }
  })

  it('matching test: for each Appendix C exercise in the catalog, primary muscle equals expected', () => {
    const appendixCMatches: Array<{
      name: string
      key: string
      expectedCategory: string
      expectedPrimaryGroup: string
    }> = [
      {
        name: 'Barbell Bench Press',
        key: 'bench',
        expectedCategory: 'chest',
        expectedPrimaryGroup: 'pec_sternal',
      },
      {
        name: 'Pull-Up',
        key: 'pullup',
        expectedCategory: 'back',
        expectedPrimaryGroup: 'lats',
      },
      {
        name: 'One-Arm Dumbbell Row',
        key: 'onearmrow',
        expectedCategory: 'back',
        expectedPrimaryGroup: 'lats',
      },
      {
        name: 'Seated Dumbbell Overhead Press',
        key: 'ohp',
        expectedCategory: 'shoulders',
        expectedPrimaryGroup: 'delt_anterior',
      },
      {
        name: 'Face Pull',
        key: 'facepull',
        expectedCategory: 'shoulders',
        expectedPrimaryGroup: 'delt_posterior',
      },
      {
        name: 'Dumbbell Bicep Curl',
        key: 'bicepcurl',
        expectedCategory: 'arms',
        expectedPrimaryGroup: 'biceps_long',
      },
      {
        name: 'Barbell Back Squat',
        key: 'squat',
        expectedCategory: 'legs',
        expectedPrimaryGroup: 'rectus_femoris',
      },
      {
        name: 'Romanian Deadlift',
        key: 'rdl',
        expectedCategory: 'legs',
        expectedPrimaryGroup: 'hamstring_bf_long',
      },
      {
        name: 'Bulgarian Split Squat',
        key: 'bss',
        expectedCategory: 'legs',
        expectedPrimaryGroup: 'rectus_femoris',
      },
      {
        name: 'Barbell Hip Thrust',
        key: 'hipthrust',
        expectedCategory: 'legs',
        expectedPrimaryGroup: 'glute_max',
      },
      {
        name: 'Standing Calf Raise',
        key: 'calf',
        expectedCategory: 'legs',
        expectedPrimaryGroup: 'gastrocnemius_medial',
      },
      {
        name: 'Incline Dumbbell Press',
        key: 'incline',
        expectedCategory: 'chest',
        expectedPrimaryGroup: 'pec_clavicular',
      },
      {
        name: 'Seated Cable Row',
        key: 'cablerow',
        expectedCategory: 'back',
        expectedPrimaryGroup: 'lats',
      },
      {
        name: 'Dumbbell Lateral Raise',
        key: 'lateral',
        expectedCategory: 'shoulders',
        expectedPrimaryGroup: 'delt_lateral',
      },
      {
        name: 'Leg Press',
        key: 'legpress',
        expectedCategory: 'legs',
        expectedPrimaryGroup: 'rectus_femoris',
      },
      {
        name: 'Front Squat',
        key: 'frontsquat',
        expectedCategory: 'legs',
        expectedPrimaryGroup: 'rectus_femoris',
      },
      {
        name: 'Lying Leg Curl',
        key: 'legcurl',
        expectedCategory: 'legs',
        expectedPrimaryGroup: 'hamstring_bf_long',
      },
      {
        name: 'Leg Extension',
        key: 'legext',
        expectedCategory: 'legs',
        expectedPrimaryGroup: 'rectus_femoris',
      },
      {
        name: 'Side Plank',
        key: 'sideplank',
        expectedCategory: 'core',
        expectedPrimaryGroup: 'obliques_external',
      },
      {
        name: 'Close-Grip Bench Press',
        key: 'cgbench',
        expectedCategory: 'arms',
        expectedPrimaryGroup: 'triceps_lateral',
      },
      {
        name: 'Chest-Supported Dumbbell Row',
        key: 'csrow',
        expectedCategory: 'back',
        expectedPrimaryGroup: 'rhomboids',
      },
      {
        name: 'Reverse Pec Deck',
        key: 'revpec',
        expectedCategory: 'shoulders',
        expectedPrimaryGroup: 'delt_posterior',
      },
      {
        name: 'Dumbbell Triceps Extension (Overhead)',
        key: 'tricepsext',
        expectedCategory: 'arms',
        expectedPrimaryGroup: 'triceps_long',
      },
      {
        name: 'Dead Hang',
        key: 'deadhang',
        expectedCategory: 'back',
        expectedPrimaryGroup: 'forearm_flexors',
      },
      {
        name: 'Scapular Pull-Up',
        key: 'scappull',
        expectedCategory: 'shoulders',
        expectedPrimaryGroup: 'trap_lower',
      },
      {
        name: 'Leg Swings',
        key: 'legswing',
        expectedCategory: 'mobility',
        expectedPrimaryGroup: 'iliopsoas',
      },
      {
        name: 'Standing Hip Circles',
        key: 'hipcircles',
        expectedCategory: 'mobility',
        expectedPrimaryGroup: 'glute_med',
      },
      {
        name: 'Cat-Cow',
        key: 'catcow',
        expectedCategory: 'mobility',
        expectedPrimaryGroup: 'erector_spinae',
      },
      {
        name: 'Standing Spinal Rotation',
        key: 'spinalrot',
        expectedCategory: 'mobility',
        expectedPrimaryGroup: 'obliques_external',
      },
    ]

    for (const item of appendixCMatches) {
      const ex = getExerciseById(item.key)
      expect(
        ex,
        `Exercise ${item.name} with key ${item.key} must exist in catalog`,
      ).toBeDefined()
      expect(ex?.category).toBe(item.expectedCategory)
      const primaryMuscles =
        ex?.muscles?.filter((m) => m.role === 'primary').map((m) => m.id) || []
      expect(
        primaryMuscles.includes(item.expectedPrimaryGroup),
        `Exercise ${item.name} primary muscles [${primaryMuscles.join(', ')}] must include ${item.expectedPrimaryGroup}`,
      ).toBe(true)
    }

    // Specific check for Close-Grip Bench Press: MUST target triceps and NOT forearms
    const cgbench = getExerciseById('cgbench')
    expect(cgbench?.category).toBe('arms')
    const cgPrimary =
      cgbench?.muscles?.filter((m) => m.role === 'primary').map((m) => m.id) ||
      []
    expect(cgPrimary).toContain('triceps_lateral')
    expect(cgPrimary).not.toContain('forearm_flexors')
  })

  it('suggests catalog replacements for archived exercises by primary muscle and equipment', () => {
    const legacyBench = getExerciseById('chest-1')
    expect(legacyBench).toBeDefined()
    if (legacyBench) {
      const suggestions = getCatalogReplacements(legacyBench)
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions.some((s) => s.id === 'bench')).toBe(true)
      for (const s of suggestions) {
        expect(s.archived).toBe(false)
        expect(s.category).toBe(legacyBench.category)
      }
    }
  })
})
