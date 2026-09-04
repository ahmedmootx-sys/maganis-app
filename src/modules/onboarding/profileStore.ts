import type { Storage } from '../../lib/storage'
import type { ProfileInput, UserProfile } from './types'

const PROFILE_KEY = 'profile.active'
const DRAFT_KEY = 'onboarding.draft'

export interface OnboardingDraft {
  stepIndex: number
  data: Record<string, unknown>
}

export interface ProfileStore {
  /** Saves the profile and returns the stored record (with id + timestamps). */
  saveProfile(input: ProfileInput): UserProfile
  loadProfile(): UserProfile | null
  clearProfile(): void
  saveDraft(draft: OnboardingDraft): void
  loadDraft(): OnboardingDraft | null
  clearDraft(): void
}

function uuid(): string {
  const c = globalThis.crypto as Crypto | undefined
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID()
  }
  const bytes = new Uint8Array(16)
  if (c && typeof c.getRandomValues === 'function') {
    c.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256)
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return (
    hex.slice(0, 8) +
    '-' +
    hex.slice(8, 12) +
    '-' +
    hex.slice(12, 16) +
    '-' +
    hex.slice(16, 20) +
    '-' +
    hex.slice(20)
  )
}

function looksLikeProfile(value: unknown): value is UserProfile {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }
  const p = value as Partial<UserProfile>
  return (
    typeof p.id === 'string' &&
    p.id !== '' &&
    typeof p.createdAt === 'number' &&
    typeof p.updatedAt === 'number' &&
    Array.isArray(p.goals) &&
    typeof p.primaryGoal === 'string' &&
    typeof p.trainingDaysPerWeek === 'number' &&
    typeof p.medical === 'object' &&
    p.medical !== null &&
    typeof p.body === 'object' &&
    p.body !== null
  )
}

function isDraft(value: unknown): value is OnboardingDraft {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }
  const d = value as Partial<OnboardingDraft>
  return (
    typeof d.stepIndex === 'number' &&
    typeof d.data === 'object' &&
    d.data !== null
  )
}

/**
 * Profile persistence on top of the namespaced storage wrapper.
 * Save failures intentionally propagate: the UI surfaces them, silence is
 * forbidden by the product's no-data-loss constraint.
 */
export function createProfileStore(storage: Storage): ProfileStore {
  function saveProfile(input: ProfileInput): UserProfile {
    const now = Date.now()
    const record: UserProfile = {
      ...input,
      id: input.id ?? uuid(),
      createdAt: input.createdAt ?? now,
      updatedAt: now,
    }
    storage.set(PROFILE_KEY, record)
    return record
  }

  function loadProfile(): UserProfile | null {
    const raw = storage.get<UserProfile | null>(PROFILE_KEY, null)
    return looksLikeProfile(raw) ? raw : null
  }

  function clearProfile(): void {
    storage.remove(PROFILE_KEY)
  }

  function saveDraft(draft: OnboardingDraft): void {
    storage.set(DRAFT_KEY, draft)
  }

  function loadDraft(): OnboardingDraft | null {
    const raw = storage.get<OnboardingDraft | null>(DRAFT_KEY, null)
    return isDraft(raw) ? raw : null
  }

  function clearDraft(): void {
    storage.remove(DRAFT_KEY)
  }

  return {
    saveProfile,
    loadProfile,
    clearProfile,
    saveDraft,
    loadDraft,
    clearDraft,
  }
}
