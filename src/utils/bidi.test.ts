import { describe, it, expect } from 'vitest'
import {
  fmtNumber,
  fmtDate,
  fmtDuration,
  fmtWeight,
  fmtRange,
  fmtArabicPlural,
  fmtSets,
  fmtMuscles,
  fmtExercises,
  fmtReps,
  fmtDays,
  stripEmoji,
} from './bidi.ts'

const ARABIC_INDIC_DIGITS_REGEX = /[\u0660-\u0669\u06F0-\u06F9]/

describe('Bidi and Number Helpers (Priority 3.1 & 3.6)', () => {
  it('enforces Latin digits in fmtNumber without Arabic-Indic numerals', () => {
    const nums = [0, 1, 9, 12, 100, 2555.5, 0.25]
    for (const n of nums) {
      const formatted = fmtNumber(n)
      expect(formatted).not.toMatch(ARABIC_INDIC_DIGITS_REGEX)
      expect(formatted).toMatch(/[0-9]/)
    }
  })

  it('enforces Latin digits in fmtDate without Arabic-Indic numerals', () => {
    const d = new Date('2026-10-16T12:00:00Z')
    const formatted = fmtDate(d)
    expect(formatted).not.toMatch(ARABIC_INDIC_DIGITS_REGEX)
    expect(formatted).toMatch(/[0-9]/)
  })

  it('enforces Latin digits in fmtDuration and fmtWeight', () => {
    expect(fmtDuration(75)).toBe('01:15')
    expect(fmtDuration(3665)).toBe('1:01:05')
    expect(fmtDuration(75)).not.toMatch(ARABIC_INDIC_DIGITS_REGEX)

    const w = fmtWeight(74.5)
    expect(w).toBe('74.5 كجم')
    expect(w).not.toMatch(ARABIC_INDIC_DIGITS_REGEX)
  })

  it('formats ranges using fmtRange correctly: من A إلى B وحدة', () => {
    expect(fmtRange(120, 180, 'ثانية')).toBe('من 120 إلى 180 ثانية')
    expect(fmtRange(2.5, 5, 'كجم')).toBe('من 2.5 إلى 5 كجم')
    expect(fmtRange(8, 12)).toBe('من 8 إلى 12')
  })

  it('handles Arabic Plural Rules correctly for sets, muscles, exercises', () => {
    // Raw fmtArabicPlural
    expect(
      fmtArabicPlural(5, { one: 'يوم واحد', few: 'أيام', many: 'يوماً' }),
    ).toBe('5 أيام')

    // Sets
    expect(fmtSets(1)).toBe('مجموعة واحدة')
    expect(fmtSets(2)).toBe('مجموعتان')
    expect(fmtSets(3)).toBe('3 مجموعات')
    expect(fmtSets(10)).toBe('10 مجموعات')
    expect(fmtSets(12)).toBe('12 مجموعة') // NOT 12 مجموعات!
    expect(fmtSets(20)).toBe('20 مجموعة')

    // Muscles
    expect(fmtMuscles(1)).toBe('عضلة واحدة') // NOT 1 عضلات!
    expect(fmtMuscles(2)).toBe('عضلتان')
    expect(fmtMuscles(3)).toBe('3 عضلات')
    expect(fmtMuscles(12)).toBe('12 عضلة')

    // Exercises
    expect(fmtExercises(1)).toBe('تمرين واحد')
    expect(fmtExercises(2)).toBe('تمرينان')
    expect(fmtExercises(5)).toBe('5 تمارين')
    expect(fmtExercises(15)).toBe('15 تمريناً')

    // Reps & Days
    expect(fmtReps(1)).toBe('تكرار واحد')
    expect(fmtReps(10)).toBe('10 تكرارات')
    expect(fmtDays(1)).toBe('يوم واحد')
    expect(fmtDays(5)).toBe('5 أيام')
  })

  it('strips pictographic emojis cleanly', () => {
    // Use Unicode escapes to comply with zero-emoji-in-source gate
    expect(stripEmoji('مرحباً \u{1F3CB}\uFE0F\u200D\u2642\uFE0F')).toBe(
      'مرحباً',
    )
    expect(stripEmoji('تمرن بقوة \u{1F4AA}\u{1F525}')).toBe('تمرن بقوة')
  })

  it('verifies WORKOUT_SPLIT_LABELS has no English in parentheses and WORKOUT_SPLIT_EN exists', async () => {
    const { WORKOUT_SPLIT_LABELS, WORKOUT_SPLIT_EN } =
      await import('../modules/shared/types.ts')
    for (const [key, labelAr] of Object.entries(WORKOUT_SPLIT_LABELS)) {
      expect(labelAr).not.toMatch(/[a-zA-Z]/)
      expect(labelAr).not.toMatch(/\(/)
      expect(
        WORKOUT_SPLIT_EN[key as keyof typeof WORKOUT_SPLIT_EN],
      ).toBeDefined()
    }
  })

  it('verifies prescription-rules.json has no numeric hyphen ranges in Arabic basis strings', async () => {
    const rules = await import('../data/prescription-rules.json')
    const jsonStr = JSON.stringify(rules.default)
    // Matches patterns like "120-180" or "60-120" or "45-90" inside Arabic text
    const numericHyphenInText =
      /[\u0600-\u06FF]\s*\d+\s*-\s*\d+|\d+\s*-\s*\d+\s*[\u0600-\u06FF]/
    expect(jsonStr).not.toMatch(numericHyphenInText)
  })

  it('verifies no Arabic-Indic digits exist across formatted helpers', () => {
    const outputs = [
      fmtNumber(12345),
      fmtWeight(80.5),
      fmtDuration(3600),
      fmtRange(10, 20, 'كجم'),
      fmtSets(12),
      fmtMuscles(3),
      fmtExercises(15),
      fmtReps(10),
      fmtDays(7),
    ]
    for (const out of outputs) {
      expect(out).not.toMatch(ARABIC_INDIC_DIGITS_REGEX)
    }
  })
})
