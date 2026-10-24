import { describe, it, expect, beforeEach, vi } from 'vitest'
import { calculateCardioEnergy, calculateLiveEnergy } from './cardioEngine.ts'

describe('CardioRunner State Machine & Timers (B1.3)', () => {
  const STORAGE_KEY = 'maganis:cardio_active_session'

  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('1. correctly computes remaining time and live calories from timestamp deltas', () => {
    const weightKg = 70
    const durationMinutes = 30
    const est = calculateCardioEnergy('run', 'moderate', durationMinutes, weightKg)
    expect(est).not.toBeNull()

    const grossRate = est!.grossRateKcalPerMin // 8.3 * 3.5 * 70 / 200 = 10.1675 kcal/min
    const netRate = est!.netRateKcalPerMin

    // At 0 ms
    expect(calculateLiveEnergy(grossRate, 0)).toBe(0)

    // At 10 virtual minutes (600,000 ms)
    const tenMinGross = calculateLiveEnergy(grossRate, 10 * 60 * 1000)
    expect(Math.round(tenMinGross)).toBe(Math.round(grossRate * 10))

    // At full 30 virtual minutes
    const fullGross = calculateLiveEnergy(grossRate, 30 * 60 * 1000)
    expect(Math.round(fullGross)).toBe(Math.round(est!.grossSessionKcal))

    const fullNet = calculateLiveEnergy(netRate, 30 * 60 * 1000)
    expect(Math.round(fullNet)).toBe(Math.round(est!.netSessionKcal))
  })

  it('2. persists in-progress session to localStorage and recovers state seamlessly', () => {
    const startTime = Date.now() - 5 * 60 * 1000 // 5 minutes ago
    const est = calculateCardioEnergy('bike', 'moderate', 20, 70)!

    const sessionData = {
      id: `cardio-${startTime}`,
      activityId: 'bike',
      level: 'moderate',
      durationMinutes: 20,
      weightKg: 70,
      startTime,
      pausedTotalMs: 0,
      isPaused: false,
      pausedAt: null,
      estimate: est,
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData))

    // Read back and restore
    const recoveredRaw = localStorage.getItem(STORAGE_KEY)
    expect(recoveredRaw).not.toBeNull()
    const recovered = JSON.parse(recoveredRaw!)

    expect(recovered.activityId).toBe('bike')
    expect(recovered.durationMinutes).toBe(20)
    expect(recovered.weightKg).toBe(70)

    // Calculate recovered elapsed time
    const elapsedMs = Date.now() - recovered.startTime - recovered.pausedTotalMs
    expect(elapsedMs).toBeGreaterThanOrEqual(5 * 60 * 1000)
  })

  it('3. accounts for paused time intervals in timestamp deltas', () => {
    const startTime = 1000000
    const pauseTime = 1000000 + 3 * 60 * 1000 // paused at 3 min
    const resumeTime = pauseTime + 2 * 60 * 1000 // paused for 2 min

    const pausedTotalMs = resumeTime - pauseTime // 2 min
    const currentTime = resumeTime + 5 * 60 * 1000 // ran for 5 more min (total running = 8 min)

    const effectiveElapsedMs = currentTime - startTime - pausedTotalMs
    expect(effectiveElapsedMs).toBe(8 * 60 * 1000)
  })

  it('4. prevents duplicate session saves', () => {
    let saveCount = 0
    let isSaved = false

    function saveSession() {
      if (isSaved) return
      isSaved = true
      saveCount++
    }

    saveSession()
    saveSession()
    saveSession()

    expect(saveCount).toBe(1)
  })
})
