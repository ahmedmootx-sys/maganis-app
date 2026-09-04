import { describe, expect, it } from 'vitest'
import {
  validateBody,
  validateDays,
  validateGoals,
  validateMedical,
  validateProfile,
} from './validate'

const validProfile = {
  goals: ['hypertrophy'],
  primaryGoal: 'hypertrophy',
  trainingDaysPerWeek: 4,
  medical: { hasIssues: false, injuryTags: [], notes: '' },
  body: {
    sex: 'male',
    age: 25,
    heightCm: 178,
    weightKg: 80,
    activityLevel: 'moderate',
  },
}

describe('validateGoals', () => {
  it('passes with one goal matching the primary goal', () => {
    expect(validateGoals(['cut'], 'cut')).toEqual([])
  })

  it('rejects an empty goal list', () => {
    expect(validateGoals([], 'cut')).toContain('اختر هدفاً واحداً على الأقل')
  })

  it('rejects an unknown goal value', () => {
    expect(validateGoals(['bulk'], 'bulk')).toContain('قيمة هدف غير معروفة')
  })

  it('rejects a primary goal outside the selection', () => {
    expect(validateGoals(['cut'], 'hypertrophy')).toContain(
      'الهدف الأساسي يجب أن يكون من ضمن الأهداف المختارة',
    )
  })

  it('requires a primary goal for compound goals', () => {
    expect(validateGoals(['cut', 'hypertrophy'], null)).toContain(
      'حدد هدفك الأساسي',
    )
  })
})

describe('validateDays', () => {
  it('accepts integer days 2..6 including numeric strings', () => {
    expect(validateDays(2)).toEqual([])
    expect(validateDays(6)).toEqual([])
    expect(validateDays('3')).toEqual([])
  })

  it.each([1, 7, 2.5, null, '', 'abc'])('rejects %p', (value) => {
    expect(validateDays(value)).toContain(
      'عدد أيام التمرين يجب أن يكون بين 2 و6 أيام في الأسبوع',
    )
  })
})

describe('validateMedical', () => {
  it('passes with no issues', () => {
    expect(
      validateMedical({ hasIssues: false, injuryTags: [], notes: '' }),
    ).toEqual([])
  })

  it('passes with issues and at least one tag', () => {
    expect(
      validateMedical({ hasIssues: true, injuryTags: ['ركبة'], notes: '' }),
    ).toEqual([])
  })

  it('passes with issues described only in notes', () => {
    expect(
      validateMedical({ hasIssues: true, injuryTags: [], notes: 'ألم مزمن' }),
    ).toEqual([])
  })

  it('requires an answer to the medical question', () => {
    expect(
      validateMedical({ hasIssues: null, injuryTags: [], notes: '' }),
    ).toContain('أجب عن سؤال الإصابات والمشاكل الصحية')
  })

  it('requires a tag or a note when issues exist', () => {
    expect(
      validateMedical({ hasIssues: true, injuryTags: [], notes: '  ' }),
    ).toContain('حدد نوع الإصابة أو اكتب ملاحظة توضح حالتك')
  })

  it('forbids injury tags when the answer is no', () => {
    expect(
      validateMedical({ hasIssues: false, injuryTags: ['ركبة'], notes: '' }),
    ).toContain('لا يمكن تسجيل إصابات مع الإجابة "لا"')
  })
})

describe('validateBody', () => {
  it('passes with valid values including numeric strings', () => {
    expect(
      validateBody({
        sex: 'female',
        age: '30',
        heightCm: '165',
        weightKg: '62',
        activityLevel: 'light',
      }),
    ).toEqual([])
  })

  it.each([9, 91])('rejects age %p outside 10..90', (value) => {
    const body = { ...validProfile.body, age: value }
    expect(validateBody(body)).toContain('العمر يجب أن يكون بين 10 و90 سنة')
  })

  it.each([99, 251])('rejects height %p outside 100..250', (value) => {
    const body = { ...validProfile.body, heightCm: value }
    expect(validateBody(body)).toContain('الطول يجب أن يكون بين 100 و250 سم')
  })

  it.each([29, 301])('rejects weight %p outside 30..300', (value) => {
    const body = { ...validProfile.body, weightKg: value }
    expect(validateBody(body)).toContain('الوزن يجب أن يكون بين 30 و300 كجم')
  })

  it('requires sex and activity level', () => {
    const errors = validateBody({
      sex: null,
      age: 25,
      heightCm: 178,
      weightKg: 80,
      activityLevel: 'extreme',
    })
    expect(errors).toContain('اختر الجنس')
    expect(errors).toContain('اختر مستوى النشاط')
  })
})

describe('validateProfile', () => {
  it('accepts a complete valid profile', () => {
    const result = validateProfile(validProfile)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.profile.trainingDaysPerWeek).toBe(4)
    }
  })

  it('collects every problem at once', () => {
    const result = validateProfile({
      ...validProfile,
      trainingDaysPerWeek: 9,
      body: { ...validProfile.body, age: 5 },
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toContain(
        'عدد أيام التمرين يجب أن يكون بين 2 و6 أيام في الأسبوع',
      )
      expect(result.errors).toContain('العمر يجب أن يكون بين 10 و90 سنة')
    }
  })

  it('rejects non-object input', () => {
    expect(validateProfile('nope').ok).toBe(false)
    expect(validateProfile(null).ok).toBe(false)
  })
})
