/**
 * src/modules/workout/exerciseOverrides.test.ts
 *
 * Tests for Task G5-B4:
 * Overrides layer unit tests covering field merges, reset, image quota,
 * validation on import, and atlas synchronization.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  selectEffectiveExercise,
  saveExerciseOverride,
  deleteExerciseOverride,
  resetAllOverrides,
  getExerciseOverride,
  validateExerciseOverride,
  sweepOrphanedMedia,
  StorageSaveError,
  MAX_USER_IMAGES,
  type ExerciseOverride,
} from './exerciseOverrides'
import * as indexedStorage from '../../lib/indexedStorage'
import { resolveMuscles } from './muscleResolver'
import type { Exercise } from '../shared/types'

const BASE_EXERCISE: Exercise = {
  id: 'bench_press',
  key: 'bench_press',
  nameAr: 'بنش برس بالبار',
  nameEn: 'Barbell Bench Press',
  category: 'chest',
  difficulty: 'intermediate',
  equipment: 'barbell',
  descriptionAr: 'تمرين أساسي لعضلات الصدر',
  imageUrl: 'https://example.com/original-bench.png',
  benefitAr: 'بناء القوة والحجم العضلي للصدر',
  mechanicsAr: 'دفع الوزن لأعلى بنمط حركة عمودي',
  howToStepsAr: [
    'استلقِ على البنش',
    'امسك البار بقبضة مناسبة',
    'ادفع البار لأعلى',
  ],
  muscles: [
    { id: 'chest_mid', role: 'primary' },
    { id: 'triceps_lateral', role: 'secondary' },
  ],
}

describe('exerciseOverrides', () => {
  beforeEach(async () => {
    await resetAllOverrides()
  })

  it('returns base exercise unchanged when no override exists', () => {
    const effective = selectEffectiveExercise(BASE_EXERCISE)
    expect(effective.isModified).toBe(false)
    expect(effective.nameAr).toBe('بنش برس بالبار')
    expect(effective.nameEn).toBe('Barbell Bench Press')
    expect(effective.imageUrl).toBe('https://example.com/original-bench.png')
    expect(effective.benefitAr).toBe('بناء القوة والحجم العضلي للصدر')
    expect(effective.baseExercise).toEqual(BASE_EXERCISE)
  })

  it('correctly merges every overridden field', async () => {
    const override: ExerciseOverride = {
      exerciseId: 'bench_press',
      nameAr: 'بنش برس معدّل',
      nameEn: 'Modified Bench Press',
      imageMode: 'custom',
      customImageBlob: 'data:image/jpeg;base64,sampleblob123',
      benefitAr: 'فائدة مخصصة من المستخدم',
      mechanicsAr: 'ميكانيكا مخصصة من المستخدم',
      howToStepsAr: ['خطوة معدلة 1', 'خطوة معدلة 2'],
      muscles: [
        { id: 'pec_clavicular', role: 'primary' },
        { id: 'delt_anterior', role: 'secondary' },
      ],
      personalNote: 'ركز على تقريب لوحي الكتف',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    }

    await saveExerciseOverride(override)
    const effective = selectEffectiveExercise(BASE_EXERCISE)

    expect(effective.isModified).toBe(true)
    expect(effective.nameAr).toBe('بنش برس معدّل')
    expect(effective.nameEn).toBe('Modified Bench Press')
    expect(effective.imageUrl).toBe('data:image/jpeg;base64,sampleblob123')
    expect(effective.benefitAr).toBe('فائدة مخصصة من المستخدم')
    expect(effective.mechanicsAr).toBe('ميكانيكا مخصصة من المستخدم')
    expect(effective.howToStepsAr).toEqual(['خطوة معدلة 1', 'خطوة معدلة 2'])
    expect(effective.muscles).toEqual([
      { id: 'pec_clavicular', role: 'primary' },
      { id: 'delt_anterior', role: 'secondary' },
    ])
    expect(effective.personalNote).toBe('ركز على تقريب لوحي الكتف')
    expect(effective.videoUrl).toBe(
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    )
    // Original catalog entry is preserved in baseExercise
    expect(effective.baseExercise?.nameAr).toBe('بنش برس بالبار')
    expect(effective.baseExercise?.imageUrl).toBe(
      'https://example.com/original-bench.png',
    )
  })

  it('supports imageMode "none" (stripping image) and reverting to "original"', async () => {
    // 1. None
    await saveExerciseOverride({
      exerciseId: 'bench_press',
      imageMode: 'none',
    })
    let effective = selectEffectiveExercise(BASE_EXERCISE)
    expect(effective.imageUrl).toBeUndefined()
    expect(effective.isModified).toBe(true)

    // 2. Revert to original
    await saveExerciseOverride({
      exerciseId: 'bench_press',
      imageMode: 'original',
    })
    effective = selectEffectiveExercise(BASE_EXERCISE)
    expect(effective.imageUrl).toBe('https://example.com/original-bench.png')
  })

  it('deletes override ("رجّع الأصلي") and returns to catalog state', async () => {
    await saveExerciseOverride({
      exerciseId: 'bench_press',
      nameAr: 'اسم معدّل',
    })
    expect(selectEffectiveExercise(BASE_EXERCISE).nameAr).toBe('اسم معدّل')

    await deleteExerciseOverride('bench_press')
    expect(getExerciseOverride('bench_press')).toBeUndefined()
    expect(selectEffectiveExercise(BASE_EXERCISE).nameAr).toBe('بنش برس بالبار')
    expect(selectEffectiveExercise(BASE_EXERCISE).isModified).toBe(false)
  })

  it('atlas follows muscle overrides as Tier 2', async () => {
    await saveExerciseOverride({
      exerciseId: 'bench_press',
      muscles: [{ id: 'biceps_long', role: 'primary' }],
    })

    const effective = selectEffectiveExercise(BASE_EXERCISE)
    const resolved = resolveMuscles(effective)

    expect(resolved.tier).toBe(2)
    expect(resolved.muscles).toEqual([{ id: 'biceps_long', role: 'primary' }])
  })

  describe('validation on import', () => {
    it('accepts valid overrides', () => {
      const valid = validateExerciseOverride({
        exerciseId: 'squat',
        nameAr: 'سكوات معدل',
        personalNote: 'ملاحظة',
        muscles: [{ id: 'rectus_femoris', role: 'primary' }],
        videoUrl: 'https://vimeo.com/123456',
        imageMode: 'original',
      })
      expect(valid.valid).toBe(true)
    })

    it('rejects missing or empty exerciseId', () => {
      expect(validateExerciseOverride({}).valid).toBe(false)
      expect(validateExerciseOverride({ exerciseId: '   ' }).valid).toBe(false)
    })

    it('rejects personalNote exceeding 500 characters', () => {
      const longNote = 'a'.repeat(501)
      const res = validateExerciseOverride({
        exerciseId: 'squat',
        personalNote: longNote,
      })
      expect(res.valid).toBe(false)
      expect(res.error).toContain('500')
    })

    it('rejects invalid muscle IDs not in atlas', () => {
      const res = validateExerciseOverride({
        exerciseId: 'squat',
        muscles: [{ id: 'non_existent_muscle_xyz', role: 'primary' }],
      })
      expect(res.valid).toBe(false)
      expect(res.error).toContain('الأطلس')
    })

    it('rejects hostile video URLs', () => {
      const res = validateExerciseOverride({
        exerciseId: 'squat',
        videoUrl: 'javascript:alert(1)',
      })
      expect(res.valid).toBe(false)
    })
  })

  describe('quota limits', () => {
    it(`enforces maximum of ${MAX_USER_IMAGES} user images`, async () => {
      // Add MAX_USER_IMAGES
      for (let i = 1; i <= MAX_USER_IMAGES; i++) {
        await saveExerciseOverride({
          exerciseId: `ex_${i}`,
          imageMode: 'custom',
          customImageBlob: `data:image/jpeg;base64,image_${i}`,
        })
      }

      // Exceeding MAX_USER_IMAGES should throw
      await expect(
        saveExerciseOverride({
          exerciseId: `ex_overflow`,
          imageMode: 'custom',
          customImageBlob: 'data:image/jpeg;base64,image_overflow',
        }),
      ).rejects.toThrow(/الحد الأقصى/)
    })
  })

  describe('Storage integrity and media cleanup (Task H4.3)', () => {
    it('removes media blob when switching an exercise from upload to external link', async () => {
      // 1. Save uploaded image
      await saveExerciseOverride(
        {
          exerciseId: 'bench_press',
          imageMode: 'custom',
          media: {
            kind: 'upload-image',
            blobKey: 'bench_press',
            updatedAt: Date.now(),
          },
        },
        { dataUrl: 'data:image/jpeg;base64,sample_blob' },
      )

      const savedBlob = await indexedStorage.getMediaItem('bench_press')
      expect(savedBlob).toBeDefined()

      // 2. Switch to external link
      await saveExerciseOverride({
        exerciseId: 'bench_press',
        imageMode: 'custom',
        media: {
          kind: 'external-image',
          url: 'https://example.com/bench.png',
          updatedAt: Date.now(),
        },
      })

      const blobAfterSwitch = await indexedStorage.getMediaItem('bench_press')
      expect(blobAfterSwitch).toBeNull()
    })

    it('sweeps orphaned media in maganis_media not referenced by any override', async () => {
      // Seed orphaned item in media store
      await indexedStorage.setMediaItem('orphan_exercise_1', {
        dataUrl: 'data:image/jpeg;base64,orphan',
      })
      const initialMedia = await indexedStorage.getAllMediaItems()
      expect(initialMedia['orphan_exercise_1']).toBeDefined()

      const swept = await sweepOrphanedMedia()
      expect(swept).toBeGreaterThanOrEqual(1)

      const mediaAfter = await indexedStorage.getAllMediaItems()
      expect(mediaAfter['orphan_exercise_1']).toBeUndefined()
    })

    it('throws StorageSaveError without corrupting in-memory state if indexedDB save fails', async () => {
      vi.spyOn(indexedStorage, 'setIndexedItem').mockResolvedValueOnce(false)

      await expect(
        saveExerciseOverride({
          exerciseId: 'bench_press',
          nameAr: 'اسم غير محفوظ',
        }),
      ).rejects.toThrow(StorageSaveError)

      // In-memory state remains untouched
      const after = getExerciseOverride('bench_press')
      expect(after?.nameAr).not.toBe('اسم غير محفوظ')
    })

    it('validates, saves, and applies measurementType override in selectEffectiveExercise', async () => {
      const baseEx: Exercise = {
        id: 'bench_press',
        name: 'Bench Press',
        nameAr: 'بنش بريس',
        descriptionAr: 'تمرين بنش',
        category: 'chest',
        equipment: 'barbell',
        difficulty: 'intermediate',
        measurementType: 'weight',
      }

      await saveExerciseOverride({
        exerciseId: 'bench_press',
        measurementType: 'duration',
      })

      const effective = selectEffectiveExercise(baseEx)
      expect(effective.measurementType).toBe('duration')
      expect(effective.isModified).toBe(true)

      // Test validation rejects invalid measurementType
      const invalidRes = validateExerciseOverride({
        exerciseId: 'bench_press',
        measurementType: 'not_a_valid_type',
      })
      expect(invalidRes.valid).toBe(false)
      expect(invalidRes.error).toBe('نوع قياس التمرين غير صالح')
    })
  })
})
