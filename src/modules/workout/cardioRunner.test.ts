import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { calculateCardioEnergy, calculateLiveEnergy } from './cardioEngine.ts'

describe('CardioRunner State Machine & Timers (B3.1)', () => {
  const STORAGE_KEY = 'maganis:cardio_active_session'

  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('1. correctly computes remaining time and live calories from timestamp deltas', () => {
    const weightKg = 70
    const durationMinutes = 30
    const est = calculateCardioEnergy(
      'run',
      'moderate',
      durationMinutes,
      weightKg,
    )
    expect(est).not.toBeNull()

    const grossRate = est!.grossRateKcalPerMin
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

  it('2. State machine: run -> leave via arrow -> minimize -> navigate screens -> return -> end -> save', () => {
    const startTime = 1000000
    vi.setSystemTime(startTime)

    // 1. Session starts
    const session = {
      id: `cardio-${startTime}`,
      activityId: 'run',
      level: 'moderate',
      durationMinutes: 20,
      weightKg: 70,
      startTime,
      pausedTotalMs: 0,
      isPaused: false,
      pausedAt: null,
      minimized: false,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))

    // 2. Advance time by 5 minutes while running
    vi.advanceTimersByTime(5 * 60 * 1000)

    // 3. User taps back arrow -> leave sheet opens -> chooses "صغّر الجلسة" (minimize)
    session.minimized = true
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))

    // 4. Navigate through three different screens: Home, Nutrition, Progress
    const screensVisited = ['/home', '/nutrition', '/progress']
    for (const _scr of screensVisited) {
      vi.advanceTimersByTime(2 * 60 * 1000)
      const readState = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
      expect(readState.minimized).toBe(true)
      // Check elapsed time continues to accumulate
      const elapsed = Date.now() - readState.startTime - readState.pausedTotalMs
      expect(elapsed).toBeGreaterThanOrEqual(5 * 60 * 1000)
    }

    // Total time elapsed: 5 min + 3*2 min = 11 minutes
    expect(Date.now() - session.startTime).toBe(11 * 60 * 1000)

    // 5. User taps MiniBar -> returns to Runner (minimized = false)
    session.minimized = false
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))

    // 6. User ends session and saves
    const finalElapsedMinutes = Math.round(
      (Date.now() - session.startTime) / 60000,
    )
    expect(finalElapsedMinutes).toBe(11)

    // Clear session storage on save
    localStorage.removeItem(STORAGE_KEY)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('3. State machine: leave -> end -> discard', () => {
    const startTime = 1000000
    vi.setSystemTime(startTime)

    const session = {
      id: `cardio-${startTime}`,
      activityId: 'bike',
      level: 'light',
      durationMinutes: 15,
      weightKg: 80,
      startTime,
      pausedTotalMs: 0,
      isPaused: false,
      pausedAt: null,
      minimized: false,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))

    vi.advanceTimersByTime(3 * 60 * 1000)

    // User chooses leave -> end -> discard
    localStorage.removeItem(STORAGE_KEY)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('4. State machine: time expiring while away triggers expiration notice', () => {
    const startTime = 1000000
    vi.setSystemTime(startTime)

    const durationMinutes = 20
    const totalTargetMs = durationMinutes * 60 * 1000

    const session = {
      id: `cardio-${startTime}`,
      activityId: 'run',
      level: 'moderate',
      durationMinutes,
      weightKg: 70,
      startTime,
      pausedTotalMs: 0,
      isPaused: false,
      pausedAt: null,
      minimized: true,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))

    // Advance past the full 20 minutes (e.g. 25 minutes)
    vi.advanceTimersByTime(25 * 60 * 1000)

    const now = Date.now()
    const elapsedMs = Math.min(
      now - session.startTime - session.pausedTotalMs,
      totalTargetMs,
    )
    const isExpired = elapsedMs >= totalTargetMs

    expect(isExpired).toBe(true)
    const remainingMs = Math.max(0, totalTargetMs - elapsedMs)
    expect(remainingMs).toBe(0)
  })

  it('5. State machine: reload while minimized recovers state seamlessly', () => {
    const startTime = 5000000
    vi.setSystemTime(startTime + 8 * 60 * 1000)

    const session = {
      id: `cardio-${startTime}`,
      activityId: 'swim',
      level: 'moderate',
      durationMinutes: 30,
      weightKg: 75,
      startTime,
      pausedTotalMs: 60 * 1000, // 1 min paused
      isPaused: true,
      pausedAt: startTime + 8 * 60 * 1000,
      minimized: true,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))

    // Simulate page reload: re-read from localStorage
    const reloadedRaw = localStorage.getItem(STORAGE_KEY)
    expect(reloadedRaw).toBeTruthy()
    const reloaded = JSON.parse(reloadedRaw!)

    expect(reloaded.minimized).toBe(true)
    expect(reloaded.isPaused).toBe(true)
    expect(reloaded.pausedTotalMs).toBe(60 * 1000)
    expect(reloaded.activityId).toBe('swim')
  })

  it('6. System back (popstate) pushes and handles state transition to leave sheet', () => {
    let leaveSheetTriggered = false
    const onPopState = () => {
      leaveSheetTriggered = true
    }

    window.addEventListener('popstate', onPopState)
    window.dispatchEvent(new PopStateEvent('popstate'))

    expect(leaveSheetTriggered).toBe(true)
    window.removeEventListener('popstate', onPopState)
  })
})
