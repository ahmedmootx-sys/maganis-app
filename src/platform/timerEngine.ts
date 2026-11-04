import { useState, useEffect } from 'react'

export interface TimerStateParams {
  startedAt: number
  pausedMs?: number
  pausedAt?: number | null
  now: number
  lastSeenAt?: number
}

/**
 * Computes elapsed seconds strictly derived from timestamps.
 * Clamps if system clock moves backwards (now < lastSeenAt).
 * Never accumulates counters in a JavaScript interval loop.
 */
export function computeElapsedSeconds(params: TimerStateParams): number {
  const { startedAt, pausedMs = 0, pausedAt = null, lastSeenAt = 0 } = params
  // Clamp if device clock was turned backwards
  const effectiveNow = Math.max(params.now, lastSeenAt, startedAt)

  let totalPaused = pausedMs
  if (pausedAt && pausedAt > 0 && effectiveNow > pausedAt) {
    totalPaused += effectiveNow - pausedAt
  }

  const elapsedMs = Math.max(0, effectiveNow - startedAt - totalPaused)
  return Math.floor(elapsedMs / 1000)
}

/**
 * Computes remaining rest seconds from restEndsAt timestamp.
 * Returns null if no rest is active, 0 if finished, or positive seconds remaining.
 */
export function computeRestSecondsLeft(
  restEndsAt: number | null | undefined,
  now: number,
): number | null {
  if (restEndsAt == null) return null
  const remainingMs = restEndsAt - now
  if (remainingMs <= 0) return 0
  return Math.ceil(remainingMs / 1000)
}

/**
 * Guard: detects whether an active session was left abandoned/unseen for > 3 hours.
 */
export function isSessionStale(
  lastSeenAt: number,
  now: number,
  thresholdMs = 3 * 60 * 60 * 1000, // 3 hours
): boolean {
  if (!lastSeenAt || lastSeenAt <= 0) return false
  return now - lastSeenAt > thresholdMs
}

/**
 * React hook that triggers a re-render once every second (or intervalMs).
 * It simply returns the current timestamp (Date.now()) and never accumulates state.
 */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now())
    }, intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])

  return now
}
