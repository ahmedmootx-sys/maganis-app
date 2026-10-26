import { describe, it, expect } from 'vitest'
import { resolveMedia, getNullMediaExercises } from './mediaResolver.ts'
import { EXERCISES } from '../modules/workout/exercises.ts'

describe('Exercise Media Resolver: resolveMedia', () => {
  it('resolves consistently for Barbell Bench Press across contexts', () => {
    const bench = EXERCISES.find(
      (e) => e.id === 'bench' || e.nameAr.includes('البنش'),
    )
    expect(bench).toBeDefined()
    if (bench) {
      const resObj = resolveMedia(bench)
      const resClone = resolveMedia({ ...bench })
      expect(resObj.url).toBe(resClone.url)
      expect(resObj.url).not.toBeNull()
      expect(resObj.url).toContain('media/bench/animation.gif')
    }
  })

  it('resolves consistently for Pull-Up across contexts', () => {
    const pullup = EXERCISES.find(
      (e) => e.id === 'pullup' || e.nameEn === 'Pull-Up',
    )
    expect(pullup).toBeDefined()
    if (pullup) {
      const resObj = resolveMedia(pullup)
      const resClone = resolveMedia({ ...pullup })
      expect(resObj.url).toBe(resClone.url)
      expect(resObj.url).not.toBeNull()
      expect(resObj.url).toContain('media/pullup/animation.gif')
    }
  })

  it('is deterministic: calling repeatedly yields identical URLs', () => {
    for (const ex of EXERCISES.slice(0, 50)) {
      const first = resolveMedia(ex)
      const second = resolveMedia(ex)
      const clone = resolveMedia({ ...ex })
      expect(first.url).toBe(second.url)
      expect(first.url).toBe(clone.url)
    }
  })

  it('audits exercises with null media', () => {
    const nullExercises = getNullMediaExercises()
    console.log(
      `Total exercises with null media: ${nullExercises.length} / ${EXERCISES.length}`,
    )
    // Must be array
    expect(Array.isArray(nullExercises)).toBe(true)
  })
})
