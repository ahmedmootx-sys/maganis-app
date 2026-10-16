import { describe, it, expect } from 'vitest'
import { resolveMuscles } from './muscleResolver.ts'

describe('resolveMuscles Specification and Tier System', () => {
  it('1. Barbell Bench Press resolves to Tier 1 curated', () => {
    const res = resolveMuscles({
      name: 'Barbell Bench Press - Medium Grip',
      name_en: 'Barbell Bench Press',
    })
    expect(res.tier).toBe(1)
    expect(res.muscles.length).toBeGreaterThan(0)
    const primary = res.muscles
      .filter((m) => m.role === 'primary')
      .map((m) => m.id)
    expect(primary).toContain('pec_sternal')
  })

  it('2. "Smith Machine Squat" (not curated) resolves to Tier 3 with caption "تحديد على مستوى العضلة كاملة"', () => {
    const res = resolveMuscles({
      name: 'Smith Machine Squat',
      name_en: 'Smith Machine Squat',
      category: 'quadriceps',
    })
    expect(res.tier).toBe(3)
    expect(res.caption).toBe('تحديد على مستوى العضلة كاملة')
    const ids = res.muscles.map((m) => m.id)
    expect(ids).toEqual(
      expect.arrayContaining([
        'rectus_femoris',
        'vastus_lateralis',
        'vastus_medialis',
        'vastus_intermedius',
      ]),
    )
  })

  it('3. Lower-back exercise resolves to erector_spinae ONLY (no traps, no rhomboids)', () => {
    const res = resolveMuscles({
      name: 'Lower Back Extension Machine',
      nameAr: 'جهاز أسفل الظهر (قطنية)',
      category: 'lower back',
    })
    expect(res.tier).toBe(3)
    const ids = res.muscles.map((m) => m.id)
    expect(ids).toContain('erector_spinae')
    expect(ids).not.toContain('rhomboids')
    expect(ids).not.toContain('trap_middle')
    expect(ids).not.toContain('trap_upper')
    expect(ids).not.toContain('trap_lower')
  })

  it('4. Custom exercise with picker data resolves to Tier 2', () => {
    const customPickerMuscles = [
      { id: 'biceps_long', role: 'primary' as const },
      { id: 'brachialis', role: 'secondary' as const },
    ]
    const res = resolveMuscles({
      name: 'Custom Bicep Pull',
      muscles: customPickerMuscles,
    })
    expect(res.tier).toBe(2)
    expect(res.muscles).toEqual(customPickerMuscles)
  })

  it('5. Unknown group resolves to Tier 4 names only with note', () => {
    const res = resolveMuscles({
      name: 'Mysterious Exercise',
      category: 'non_existent_muscle_group',
      targetMusclesAr: ['عضلة غير معروفة'],
    })
    expect(res.tier).toBe(4)
    expect(res.muscles.length).toBe(0)
    expect(res.note).toBe('لا توجد خريطة تفصيلية لهذا التمرين بعد')
    expect(res.namesOnly).toContain('عضلة غير معروفة')
  })

  it('6. Auto view: a back exercise opens posterior, a chest exercise opens anterior', () => {
    const backExercise = resolveMuscles({
      name: 'Seated Cable Rows',
      name_en: 'seated_cable_rows',
    })
    expect(backExercise.defaultView).toBe('P')

    const chestExercise = resolveMuscles({
      name: 'Flat Bench Press',
      name_en: 'flat_bench_press',
    })
    expect(chestExercise.defaultView).toBe('A')
  })
})
