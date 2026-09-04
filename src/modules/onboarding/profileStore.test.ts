import { beforeEach, describe, expect, it } from 'vitest'
import { createStorage } from '../../lib/storage'
import { createProfileStore } from './profileStore'
import type { ProfileInput } from './types'

const prefix = 'test-onboarding'
const sample: ProfileInput = {
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

function newStore() {
  return createProfileStore(createStorage(prefix))
}

describe('profileStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves and loads a profile (roundtrip)', () => {
    const store = newStore()
    const saved = store.saveProfile(sample)
    expect(saved.id).toBeTruthy()
    expect(saved.createdAt).toBeGreaterThan(0)
    expect(saved.updatedAt).toBeGreaterThan(0)
    expect(store.loadProfile()).toEqual(saved)
  })

  it('keeps a single record and refreshes updatedAt on re-save', () => {
    const store = newStore()
    const first = store.saveProfile(sample)
    const second = store.saveProfile({ ...first, trainingDaysPerWeek: 5 })
    expect(second.id).toBe(first.id)
    expect(second.createdAt).toBe(first.createdAt)
    expect(second.updatedAt).toBeGreaterThanOrEqual(first.updatedAt)
    expect(second.trainingDaysPerWeek).toBe(5)
    expect(store.loadProfile()).toEqual(second)
  })

  it('generates a fresh id when the save carries none', () => {
    const store = newStore()
    const saved = store.saveProfile(sample)
    const again = store.saveProfile({ ...saved, id: undefined })
    expect(again.id).toBeTruthy()
    expect(again.id).not.toBe(saved.id)
  })

  it('clears the profile', () => {
    const store = newStore()
    store.saveProfile(sample)
    store.clearProfile()
    expect(store.loadProfile()).toBeNull()
  })

  it('returns null for corrupt JSON instead of crashing', () => {
    const store = newStore()
    localStorage.setItem(prefix + ':profile.active', '{corrupt json')
    expect(store.loadProfile()).toBeNull()
  })

  it('returns null for structurally invalid stored records', () => {
    const store = newStore()
    localStorage.setItem(
      prefix + ':profile.active',
      '{"goals":"not-a-profile"}',
    )
    expect(store.loadProfile()).toBeNull()
  })

  it('saves, resumes and clears the onboarding draft', () => {
    const store = newStore()
    expect(store.loadDraft()).toBeNull()
    store.saveDraft({ stepIndex: 2, data: { goals: ['cut'] } })
    expect(store.loadDraft()).toEqual({
      stepIndex: 2,
      data: { goals: ['cut'] },
    })
    store.clearDraft()
    expect(store.loadDraft()).toBeNull()
  })
})
