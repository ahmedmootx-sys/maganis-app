import { describe, it, expect } from 'vitest'
import { resolveMedia, getNullMediaExercises } from './mediaResolver.ts'
import { EXERCISES } from '../modules/workout/exercises.ts'

describe('Exercise Media Resolver: resolveMedia', () => {
  it('resolves consistently for Leg Pull-In across contexts', () => {
    const legPullIn = EXERCISES.find((e) => e.id === 'core-1' || e.nameAr.includes('ضم الساقين'))
    expect(legPullIn).toBeDefined()
    if (legPullIn) {
      const resObj = resolveMedia(legPullIn)
      const resId = resolveMedia(legPullIn.id)
      expect(resObj.url).toBe(resId.url)
      expect(resObj.url).not.toBeNull()
    }
  })

  it('resolves consistently for Leverage Incline Chest Press across contexts', () => {
    const levPress = EXERCISES.find((e) => e.nameAr.includes('مائل على الجهاز') || e.name?.includes('Leverage Incline'))
    expect(levPress).toBeDefined()
    if (levPress) {
      const resObj = resolveMedia(levPress)
      const resId = resolveMedia(levPress.id)
      expect(resObj.url).toBe(resId.url)
      expect(resObj.url).not.toBeNull()
    }
  })

  it('is deterministic: calling repeatedly yields identical URLs', () => {
    for (const ex of EXERCISES.slice(0, 50)) {
      const first = resolveMedia(ex)
      const second = resolveMedia(ex)
      const byId = resolveMedia(ex.id)
      expect(first.url).toBe(second.url)
      expect(first.url).toBe(byId.url)
    }
  })

  it('audits exercises with null media', () => {
    const nullExercises = getNullMediaExercises()
    console.log(`Total exercises with null media: ${nullExercises.length} / ${EXERCISES.length}`)
    // Must be array
    expect(Array.isArray(nullExercises)).toBe(true)
  })
})
