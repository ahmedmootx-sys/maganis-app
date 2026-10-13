import { describe, it, expect } from 'vitest'
import { MUSCLE_ATLAS, ROLE_COLORS } from './muscleAtlasData.ts'
import { resolveExerciseMuscles } from './legacyMuscleMapper.ts'

describe('Anatomical Muscle Atlas Specification', () => {
  it('1. Contains all 48 unique muscle IDs, each with non-trivial bboxes within 200x440 viewBox', () => {
    const ids = Object.keys(MUSCLE_ATLAS)
    expect(ids.length).toBeGreaterThanOrEqual(48)

    // IDs are unique
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)

    for (const [id, def] of Object.entries(MUSCLE_ATLAS)) {
      expect(def.id).toBe(id)
      expect(def.nameAr).toBeTruthy()
      expect(def.nameEn).toBeTruthy()

      if (def.view === 'A' || def.view === 'A+P') {
        expect(def.pathA).toBeTruthy()
        expect(def.bboxA).toBeDefined()
        const b = def.bboxA!
        expect(b.minX).toBeGreaterThanOrEqual(0)
        expect(b.maxX).toBeLessThanOrEqual(200)
        expect(b.minY).toBeGreaterThanOrEqual(0)
        expect(b.maxY).toBeLessThanOrEqual(440)
        expect(b.maxX - b.minX).toBeGreaterThan(3)
        expect(b.maxY - b.minY).toBeGreaterThan(3)
      }

      if (def.view === 'P' || def.view === 'A+P') {
        expect(def.pathP).toBeTruthy()
        expect(def.bboxP).toBeDefined()
        const b = def.bboxP!
        expect(b.minX).toBeGreaterThanOrEqual(0)
        expect(b.maxX).toBeLessThanOrEqual(200)
        expect(b.minY).toBeGreaterThanOrEqual(0)
        expect(b.maxY).toBeLessThanOrEqual(440)
        expect(b.maxX - b.minX).toBeGreaterThan(3)
        expect(b.maxY - b.minY).toBeGreaterThan(3)
      }
    }
  })

  it('2. Role colors match exact specifications (#E53935 / #B71C1C and #FDD835 / #F9A825)', () => {
    expect(ROLE_COLORS.primary.fill).toBe('#E53935')
    expect(ROLE_COLORS.primary.outline).toBe('#B71C1C')
    expect(ROLE_COLORS.secondary.fill).toBe('#FDD835')
    expect(ROLE_COLORS.secondary.outline).toBe('#F9A825')
  })

  it('3. Test Vector: Barbell Incline Bench Press', () => {
    const res = resolveExerciseMuscles({
      id: 'barbell_incline_bench_press',
      name: 'Barbell Incline Bench Press',
    })
    const prim = res.muscles
      .filter((m) => m.role === 'primary')
      .map((m) => m.id)
    const sec = res.muscles
      .filter((m) => m.role === 'secondary')
      .map((m) => m.id)

    expect(prim).toContain('pec_clavicular')
    expect(sec).toEqual(
      expect.arrayContaining([
        'pec_sternal',
        'delt_anterior',
        'triceps_lateral',
        'triceps_long',
      ]),
    )
    expect(res.muscles.length).toBe(new Set(res.muscles.map((m) => m.id)).size)
  })

  it('4. Test Vector: Overhead Dumbbell Triceps Extension', () => {
    const res = resolveExerciseMuscles({
      id: 'overhead_dumbbell_triceps_extension',
      name: 'Overhead Dumbbell Triceps Extension',
    })
    const prim = res.muscles
      .filter((m) => m.role === 'primary')
      .map((m) => m.id)
    const sec = res.muscles
      .filter((m) => m.role === 'secondary')
      .map((m) => m.id)

    expect(prim).toContain('triceps_long')
    expect(sec).toEqual(
      expect.arrayContaining(['triceps_lateral', 'triceps_medial']),
    )
  })

  it('5. Test Vector: Face Pull', () => {
    const res = resolveExerciseMuscles({
      id: 'face_pull',
      name: 'Face Pull',
    })
    const prim = res.muscles
      .filter((m) => m.role === 'primary')
      .map((m) => m.id)
    const sec = res.muscles
      .filter((m) => m.role === 'secondary')
      .map((m) => m.id)

    expect(prim).toEqual(
      expect.arrayContaining(['delt_posterior', 'trap_middle']),
    )
    expect(sec).toEqual(
      expect.arrayContaining(['rhomboids', 'infraspinatus', 'teres_minor']),
    )
  })

  it('6. Test Vector: Romanian Deadlift', () => {
    const res = resolveExerciseMuscles({
      id: 'romanian_deadlift',
      name: 'Romanian Deadlift',
    })
    const prim = res.muscles
      .filter((m) => m.role === 'primary')
      .map((m) => m.id)
    const sec = res.muscles
      .filter((m) => m.role === 'secondary')
      .map((m) => m.id)

    expect(prim).toEqual(
      expect.arrayContaining([
        'hamstring_bf_long',
        'hamstring_semitendinosus',
        'hamstring_semimembranosus',
        'glute_max',
      ]),
    )
    expect(sec).toEqual(expect.arrayContaining(['erector_spinae', 'adductors']))
  })

  it('7. Test Vector: Standing Calf Raise', () => {
    const res = resolveExerciseMuscles({
      id: 'standing_calf_raise',
      name: 'Standing Calf Raise',
    })
    const prim = res.muscles
      .filter((m) => m.role === 'primary')
      .map((m) => m.id)
    const sec = res.muscles
      .filter((m) => m.role === 'secondary')
      .map((m) => m.id)

    expect(prim).toEqual(
      expect.arrayContaining(['gastrocnemius_medial', 'gastrocnemius_lateral']),
    )
    expect(sec).toContain('soleus')
  })

  it('8. Test Vector: Dumbbell Lateral Raise', () => {
    const res = resolveExerciseMuscles({
      id: 'dumbbell_lateral_raise',
      name: 'Dumbbell Lateral Raise',
    })
    const prim = res.muscles
      .filter((m) => m.role === 'primary')
      .map((m) => m.id)
    const sec = res.muscles
      .filter((m) => m.role === 'secondary')
      .map((m) => m.id)

    expect(prim).toContain('delt_lateral')
    expect(sec).toEqual(
      expect.arrayContaining(['delt_anterior', 'trap_upper', 'supraspinatus']),
    )
    // Supraspinatus is deep layer
    expect(MUSCLE_ATLAS['supraspinatus'].layer).toBe('D')
  })

  it('9. Test Vector: Dumbbell Biceps Curl', () => {
    const res = resolveExerciseMuscles({
      id: 'dumbbell_biceps_curl',
      name: 'Dumbbell Biceps Curl',
    })
    const prim = res.muscles
      .filter((m) => m.role === 'primary')
      .map((m) => m.id)
    const sec = res.muscles
      .filter((m) => m.role === 'secondary')
      .map((m) => m.id)

    expect(prim).toEqual(
      expect.arrayContaining(['biceps_long', 'biceps_short']),
    )
    expect(sec).toEqual(
      expect.arrayContaining([
        'brachialis',
        'brachioradialis',
        'forearm_flexors',
      ]),
    )
  })

  it('10. Legacy expansion correctly flags as provisional and provides >= 1 primary', () => {
    const legacyExercise = {
      category: 'chest' as const,
      targetMusclesAr: ['الصدر', 'الترايسبس'],
    }
    const res = resolveExerciseMuscles(legacyExercise)
    expect(res.isProvisional).toBe(true)
    expect(res.muscles.length).toBeGreaterThan(0)
    expect(res.muscles.some((m) => m.role === 'primary')).toBe(true)
  })
})
