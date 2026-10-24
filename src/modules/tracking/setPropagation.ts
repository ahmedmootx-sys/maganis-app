/**
 * src/modules/tracking/setPropagation.ts
 *
 * Implements Task G5-B2:
 * 1. Set Propagation across sets with undo capability.
 * 2. Science-based Suggestions (no invented absolute starting weights).
 */

export type CellState = 'empty' | 'suggested' | 'auto' | 'user' | 'done'

export interface CellData {
  value: number
  state: CellState
}

export interface TrackedSetItem {
  weight: CellData
  reps: CellData
  duration?: CellData
  completed?: boolean
}

export type SetFieldType = 'weight' | 'reps' | 'duration'

export interface PropagationResult {
  nextSets: TrackedSetItem[]
  propagatedCount: number
  previousSnapshot: TrackedSetItem[]
}

/**
 * Propagates user-typed values in set `fromSetIndex` to subsequent sets `j > fromSetIndex`.
 * Invariant: Never overwrites 'user' or 'done' cells, never touches earlier sets (j < fromSetIndex).
 */
export function propagateField(
  currentSets: TrackedSetItem[],
  fromSetIndex: number,
  field: SetFieldType,
  newValue: number,
): PropagationResult {
  // Deep clone for snapshot (undo)
  const previousSnapshot: TrackedSetItem[] = JSON.parse(
    JSON.stringify(currentSets),
  )
  const nextSets: TrackedSetItem[] = JSON.parse(JSON.stringify(currentSets))

  if (fromSetIndex < 0 || fromSetIndex >= nextSets.length) {
    return { nextSets, propagatedCount: 0, previousSnapshot }
  }

  // Set the modified cell to 'user'
  const targetSet = nextSets[fromSetIndex]
  if (field === 'weight') {
    targetSet.weight = { value: newValue, state: 'user' }
  } else if (field === 'reps') {
    targetSet.reps = { value: newValue, state: 'user' }
  } else if (field === 'duration' && targetSet.duration) {
    targetSet.duration = { value: newValue, state: 'user' }
  }

  let propagatedCount = 0

  // Propagate to later sets j > fromSetIndex
  for (let j = fromSetIndex + 1; j < nextSets.length; j++) {
    const s = nextSets[j]
    const cell = field === 'weight' ? s.weight : field === 'reps' ? s.reps : s.duration

    if (!cell) continue

    // Only overwrite empty, suggested, or auto cells
    if (cell.state === 'empty' || cell.state === 'suggested' || cell.state === 'auto') {
      cell.value = newValue
      cell.state = 'auto'
      propagatedCount++
    }
  }

  return { nextSets, propagatedCount, previousSnapshot }
}

/**
 * Reverts sets to the previous snapshot in one step.
 */
export function undoPropagation(
  previousSnapshot: TrackedSetItem[],
): TrackedSetItem[] {
  return JSON.parse(JSON.stringify(previousSnapshot))
}

export interface ProgramExerciseSpec {
  reps?: number
  repsMin?: number
  repsMax?: number
  durationSeconds?: number
}

export interface HistoricalSessionSpec {
  date: string
  sets: Array<{ reps: number; weightKg: number; durationSeconds?: number }>
}

export interface SuggestionResult {
  suggestedReps?: number
  suggestedWeight?: number
  suggestedDuration?: number
  hintClaimId?: 'sugg.first_time_weight' | 'sugg.progress' | 'sugg.below_range'
}

/**
 * Computes scientific suggestions based on Task G5-B2.2 rules:
 * 1. No history: suggested reps from lower bound of program range. Never suggest starting weight.
 * 2. With history: prefill from last session.
 * 3. Progression: if last 2 sessions completed at or above top of range, prefill weight +5% rounded to 0.5 kg.
 * 4. Below range: show hint if first completed set is below lower bound.
 */
export function computeExerciseSuggestions(
  spec: ProgramExerciseSpec,
  history: HistoricalSessionSpec[] = [],
  firstCompletedSet?: { reps: number; weightKg: number },
): SuggestionResult {
  const minReps = spec.repsMin ?? spec.reps ?? 8
  const maxReps = spec.repsMax ?? spec.reps ?? 12

  // Rule 4: If first completed set is below lower bound of the range
  if (firstCompletedSet && firstCompletedSet.reps > 0 && firstCompletedSet.reps < minReps) {
    return {
      hintClaimId: 'sugg.below_range',
    }
  }

  // Rule 1: No history
  if (!history || history.length === 0) {
    const rangeWidth = maxReps - minReps
    const suggestedReps = rangeWidth >= 3 ? minReps : minReps
    return {
      suggestedReps,
      suggestedDuration: spec.durationSeconds,
      // No weight suggested!
      hintClaimId: 'sugg.first_time_weight',
    }
  }

  const lastSession = history[0]
  const lastSets = lastSession.sets.filter((s) => s.reps > 0)

  // Rule 3: Check progression over last two sessions
  if (history.length >= 2) {
    const prevSession = history[1]
    const prevSets = prevSession.sets.filter((s) => s.reps > 0)

    const lastSessionHitTop =
      lastSets.length > 0 && lastSets.every((s) => s.reps >= maxReps)
    const prevSessionHitTop =
      prevSets.length > 0 && prevSets.every((s) => s.reps >= maxReps)

    if (lastSessionHitTop && prevSessionHitTop) {
      const avgLastWeight =
        lastSets.reduce((sum, s) => sum + s.weightKg, 0) / (lastSets.length || 1)

      // 5% increase rounded to nearest 0.5 kg
      const rawProg = avgLastWeight * 1.05
      const roundedWeight = Math.round(rawProg * 2) / 2

      return {
        suggestedWeight: roundedWeight,
        suggestedReps: minReps,
        hintClaimId: 'sugg.progress',
      }
    }
  }

  // Rule 2: Pre-fill from last session
  const lastWeight = lastSets[0]?.weightKg ?? 0
  const lastReps = lastSets[0]?.reps ?? minReps
  const lastDuration = lastSets[0]?.durationSeconds ?? spec.durationSeconds

  return {
    suggestedWeight: lastWeight > 0 ? lastWeight : undefined,
    suggestedReps: lastReps > 0 ? lastReps : minReps,
    suggestedDuration: lastDuration,
  }
}
