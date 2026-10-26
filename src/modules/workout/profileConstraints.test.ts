import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
  deriveConstraints,
  isExerciseAllowed,
  CATALOG_EQUIPMENT_VALUES,
} from './constraints.ts'
import type { UserProfile } from '../onboarding/types.ts'

describe('deriveConstraints - pure function contract', () => {
  it('unanswered/null profile yields unrestricted full gym constraints without error', () => {
    const c = deriveConstraints(null)
    expect(c.allowsLoadedExercises).toBe(true)
    expect(c.levelCeiling).toBe('advanced')
    expect(c.isCalisthenicsOnly).toBe(false)
    expect(c.excludedExerciseKeys.size).toBe(0)

    for (const eq of CATALOG_EQUIPMENT_VALUES) {
      expect(c.allowedEquipment.has(eq)).toBe(true)
    }

    // Exercise allowed
    expect(
      isExerciseAllowed({ id: 'bench-press', equipment: 'barbell' }, c),
    ).toBe(true)
    expect(isExerciseAllowed({ id: 'pushup', equipment: 'body only' }, c)).toBe(
      true,
    )
  })

  it('calisthenics profile restricts equipment to bodyweight/none/other and disallows loaded exercises', () => {
    const profile: Partial<UserProfile> = {
      primaryGoal: 'calisthenics',
      trainingStyle: ['calisthenics'],
      trainingLocation: 'home',
      experienceLevel: 'intermediate',
    }
    const c = deriveConstraints(profile as UserProfile)

    expect(c.allowsLoadedExercises).toBe(false)
    expect(c.isCalisthenicsOnly).toBe(true)
    expect(c.allowedEquipment.has('body only')).toBe(true)
    expect(c.allowedEquipment.has('none')).toBe(true)
    expect(c.allowedEquipment.has('other')).toBe(true)
    expect(c.allowedEquipment.has('barbell')).toBe(false)
    expect(c.allowedEquipment.has('dumbbell')).toBe(false)
    expect(c.allowedEquipment.has('cable')).toBe(false)
    expect(c.allowedEquipment.has('machine')).toBe(false)

    // Check exercise allowed filtering
    expect(isExerciseAllowed({ id: 'pullup', equipment: 'body only' }, c)).toBe(
      true,
    )
    expect(isExerciseAllowed({ id: 'dip', equipment: 'other' }, c)).toBe(true)
    expect(
      isExerciseAllowed({ id: 'bench_press', equipment: 'barbell' }, c),
    ).toBe(false)
    expect(isExerciseAllowed({ id: 'db_curl', equipment: 'dumbbell' }, c)).toBe(
      false,
    )
  })

  it('home dumbbells profile allows dumbbells and bodyweight, disallows heavy gym machines and barbells', () => {
    const profile: Partial<UserProfile> = {
      trainingStyle: ['weights'],
      trainingLocation: 'home',
      equipmentAvailable: ['dumbbell', 'bodyweight'],
      experienceLevel: 'beginner',
    }
    const c = deriveConstraints(profile as UserProfile)

    expect(c.allowsLoadedExercises).toBe(true)
    expect(c.levelCeiling).toBe('beginner')
    expect(c.allowedEquipment.has('dumbbell')).toBe(true)
    expect(c.allowedEquipment.has('body only')).toBe(true)
    expect(c.allowedEquipment.has('barbell')).toBe(false)
    expect(c.allowedEquipment.has('cable')).toBe(false)
    expect(c.allowedEquipment.has('machine')).toBe(false)

    expect(
      isExerciseAllowed({ id: 'db_press', equipment: 'dumbbell' }, c),
    ).toBe(true)
    expect(isExerciseAllowed({ id: 'pushup', equipment: 'body only' }, c)).toBe(
      true,
    )
    expect(
      isExerciseAllowed({ id: 'barbell_squat', equipment: 'barbell' }, c),
    ).toBe(false)
    expect(
      isExerciseAllowed({ id: 'lat_pulldown', equipment: 'cable' }, c),
    ).toBe(false)
  })

  it('runs cleanly on synthetic persona dump (fixtures/persona.synthetic.json)', () => {
    const dumpPath = path.join(process.cwd(), 'fixtures', 'persona.synthetic.json')
    expect(fs.existsSync(dumpPath)).toBe(true)
    const dumpData = JSON.parse(fs.readFileSync(dumpPath, 'utf-8'))
    const personaProfile = dumpData.profile as UserProfile

    const c = deriveConstraints(personaProfile)
    expect(c.allowsLoadedExercises).toBe(true)
    expect(c.levelCeiling).toBe('intermediate')
    expect(c.allowedEquipment.has('barbell')).toBe(true)
    expect(c.allowedEquipment.has('dumbbell')).toBe(true)
    expect(c.allowedEquipment.has('cable')).toBe(true)
    expect(c.allowedEquipment.has('machine')).toBe(true)
  })
})
