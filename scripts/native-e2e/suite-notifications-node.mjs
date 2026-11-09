/**
 * scripts/native-e2e/suite-notifications.mjs
 * E2E Suite for Task N4: Idempotent Scheduler, Timers & Device Integration.
 */

import {
  generateNotificationId,
  computeDesiredSchedule,
  diffSchedule,
} from '../../src/platform/notifications/schedule.ts'
import {
  computeElapsedSeconds,
  computeRestSecondsLeft,
  isSessionStale,
} from '../../src/platform/timerEngine.ts'

export async function runNotificationsSuite() {
  console.log('--- RUNNING NOTIFICATIONS SUITE (N4) ---')
  const results = []

  // E1: Deterministic positive 31-bit IDs
  try {
    const id1 = generateNotificationId('rest_timer', 101, '2026-11-04')
    const id2 = generateNotificationId('rest_timer', 101, '2026-11-04')
    if (id1 !== id2 || id1 <= 0 || id1 > 0x7fffffff) {
      throw new Error(`Invalid or non-deterministic ID: ${id1}`)
    }
    results.push({ id: 'E1-deterministic-31bit-ids', ok: true })
  } catch (err) {
    results.push({
      id: 'E1-deterministic-31bit-ids',
      ok: false,
      error: err.message,
    })
  }

  // E2: Timestamp-derived timer with zero drift
  try {
    const start = 1000000
    const now1 = 1005000
    const elapsed = computeElapsedSeconds({ startedAt: start, now: now1 })
    if (elapsed !== 5) {
      throw new Error(`Elapsed mismatch: ${elapsed} !== 5`)
    }
    const restLeft = computeRestSecondsLeft(1000000 + 60000, 1000000 + 20000)
    if (restLeft !== 40) {
      throw new Error(`Rest mismatch: ${restLeft} !== 40`)
    }
    results.push({ id: 'E2-monotonic-timestamp-timers', ok: true })
  } catch (err) {
    results.push({
      id: 'E2-monotonic-timestamp-timers',
      ok: false,
      error: err.message,
    })
  }

  // E3: Idempotent Diffing (zero duplicates)
  try {
    const triggerAt = Date.now() + 3600000
    const desired = [
      {
        id: 1001,
        type: 'workout_reminder',
        channelId: 'maganis_reminders',
        title: 'تمرين',
        body: 'وقت التمرين',
        triggerAt,
        extra: { type: 'workout_reminder' },
        isExactNotification: true,
        isExactMandatory: false,
        smallIcon: 'ic_stat_notify',
      },
    ]
    const pending = [
      {
        id: 1001,
        triggerAt,
        title: 'تمرين',
      },
    ]
    const diff = diffSchedule(desired, pending)
    if (diff.toSchedule.length !== 0 || diff.toCancel.length !== 0) {
      throw new Error(`Diff not idempotent: ${JSON.stringify(diff)}`)
    }
    results.push({ id: 'E3-idempotent-diff-reconciliation', ok: true })
  } catch (err) {
    results.push({
      id: 'E3-idempotent-diff-reconciliation',
      ok: false,
      error: err.message,
    })
  }

  return results
}
