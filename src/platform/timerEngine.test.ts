import { describe, it, expect } from 'vitest'
import {
  computeElapsedSeconds,
  computeRestSecondsLeft,
  isSessionStale,
} from './timerEngine.ts'

describe('Timer Engine & Timestamp Derivation (Task N4.5)', () => {
  it('computes elapsed seconds purely from now - startedAt', () => {
    const startedAt = 1700000000000
    const now = startedAt + 65400 // 65.4 seconds later
    expect(computeElapsedSeconds({ startedAt, now })).toBe(65)
  })

  it('accounts for pausedMs and active pausedAt', () => {
    const startedAt = 1700000000000
    // Workout ran for 30s, paused for 20s (accumulated in pausedMs), currently running at 100s total
    const now = startedAt + 100000
    expect(
      computeElapsedSeconds({
        startedAt,
        pausedMs: 20000,
        now,
      }),
    ).toBe(80)

    // Currently paused: pausedAt was at startedAt + 50s, now is startedAt + 120s
    expect(
      computeElapsedSeconds({
        startedAt,
        pausedMs: 0,
        pausedAt: startedAt + 50000,
        now: startedAt + 120000,
      }),
    ).toBe(50) // only 50s elapsed before pause
  })

  it('clamps and never goes backwards if system clock shifts backwards', () => {
    const startedAt = 1700000000000
    const lastSeenAt = startedAt + 120000 // user saw 120s
    const rewoundNow = startedAt + 60000 // user changed device clock back 60s

    const elapsed = computeElapsedSeconds({
      startedAt,
      lastSeenAt,
      now: rewoundNow,
    })

    // Clamped to at least lastSeenAt (120s)
    expect(elapsed).toBe(120)
  })

  it('computes restSecondsLeft accurately across fake clock jumps', () => {
    const now = 1700000000000
    const restEndsAt = now + 45000 // 45 seconds

    expect(computeRestSecondsLeft(restEndsAt, now)).toBe(45)
    // 30 seconds jump
    expect(computeRestSecondsLeft(restEndsAt, now + 30000)).toBe(15)
    // Passed restEndsAt
    expect(computeRestSecondsLeft(restEndsAt, now + 46000)).toBe(0)
    // Null rest
    expect(computeRestSecondsLeft(null, now)).toBeNull()
  })

  it('stale-session guard: detects sessions abandoned for > 3 hours', () => {
    const now = 1700000000000
    const twoHoursAgo = now - 2 * 3600 * 1000
    const fourHoursAgo = now - 4 * 3600 * 1000

    expect(isSessionStale(twoHoursAgo, now)).toBe(false)
    expect(isSessionStale(fourHoursAgo, now)).toBe(true)
  })
})
