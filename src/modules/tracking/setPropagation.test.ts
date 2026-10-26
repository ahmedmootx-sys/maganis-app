import { describe, it, expect } from 'vitest'
import {
  propagateField,
  undoPropagation,
  computeExerciseSuggestions,
  type TrackedSetItem,
  type CellState,
} from './setPropagation.ts'

function createEmptySets(count: number): TrackedSetItem[] {
  return Array.from({ length: count }, () => ({
    weight: { value: 0, state: 'empty' as CellState },
    reps: { value: 0, state: 'empty' as CellState },
  }))
}

describe('Set Propagation & Suggestions (Task G5-B2)', () => {
  describe('B2.1 Propagation and Undo', () => {
    it('1. propagates typed value in set i to all subsequent empty, suggested, or auto cells', () => {
      const initial: TrackedSetItem[] = [
        {
          weight: { value: 0, state: 'empty' },
          reps: { value: 8, state: 'suggested' },
        },
        {
          weight: { value: 0, state: 'empty' },
          reps: { value: 8, state: 'suggested' },
        },
        {
          weight: { value: 0, state: 'empty' },
          reps: { value: 8, state: 'suggested' },
        },
      ]

      const { nextSets, propagatedCount } = propagateField(
        initial,
        0,
        'weight',
        60,
      )

      expect(propagatedCount).toBe(2)
      expect(nextSets[0].weight).toEqual({ value: 60, state: 'user' })
      expect(nextSets[1].weight).toEqual({ value: 60, state: 'auto' })
      expect(nextSets[2].weight).toEqual({ value: 60, state: 'auto' })
    })

    it('2. never overwrites user or done cells and never touches earlier sets', () => {
      const initial: TrackedSetItem[] = [
        {
          weight: { value: 40, state: 'done' },
          reps: { value: 10, state: 'done' },
        },
        {
          weight: { value: 50, state: 'user' },
          reps: { value: 10, state: 'user' },
        },
        {
          weight: { value: 0, state: 'empty' },
          reps: { value: 8, state: 'suggested' },
        },
        {
          weight: { value: 70, state: 'user' },
          reps: { value: 6, state: 'user' },
        },
        {
          weight: { value: 0, state: 'auto' },
          reps: { value: 8, state: 'auto' },
        },
      ]

      // Edit set index 2 (the 3rd set) to weight 55
      const { nextSets, propagatedCount } = propagateField(
        initial,
        2,
        'weight',
        55,
      )

      // Earlier sets (0 and 1) remain completely untouched
      expect(nextSets[0].weight).toEqual({ value: 40, state: 'done' })
      expect(nextSets[1].weight).toEqual({ value: 50, state: 'user' })

      // Target set becomes 'user'
      expect(nextSets[2].weight).toEqual({ value: 55, state: 'user' })

      // Set 3 had state 'user' -> MUST NOT BE OVERWRITTEN!
      expect(nextSets[3].weight).toEqual({ value: 70, state: 'user' })

      // Set 4 had state 'auto' -> OVERWRITTEN
      expect(nextSets[4].weight).toEqual({ value: 55, state: 'auto' })

      expect(propagatedCount).toBe(1) // Only set 4 was updated
    })

    it('3. restores previous snapshot in one step via undoPropagation', () => {
      const initial = createEmptySets(4)
      const { nextSets, previousSnapshot } = propagateField(
        initial,
        0,
        'reps',
        12,
      )

      expect(nextSets[1].reps.value).toBe(12)
      expect(nextSets[1].reps.state).toBe('auto')

      const undone = undoPropagation(previousSnapshot)
      expect(undone).toEqual(initial)
    })

    it('4. Property test: 500 random operations assert user and done cells never change by propagation', () => {
      let seed = 42
      function pseudoRandom() {
        seed = (seed * 9301 + 49297) % 233280
        return seed / 233280
      }

      for (let run = 0; run < 500; run++) {
        const numSets = 3 + Math.floor(pseudoRandom() * 4) // 3 to 6 sets
        const sets: TrackedSetItem[] = []

        const statesPool: CellState[] = [
          'empty',
          'suggested',
          'auto',
          'user',
          'done',
        ]

        for (let s = 0; s < numSets; s++) {
          const wState =
            statesPool[Math.floor(pseudoRandom() * statesPool.length)]
          const rState =
            statesPool[Math.floor(pseudoRandom() * statesPool.length)]
          sets.push({
            weight: { value: Math.floor(pseudoRandom() * 100), state: wState },
            reps: { value: Math.floor(pseudoRandom() * 15), state: rState },
          })
        }

        const editSetIndex = Math.floor(pseudoRandom() * numSets)
        const field: 'weight' | 'reps' =
          pseudoRandom() > 0.5 ? 'weight' : 'reps'
        const newValue = Math.floor(pseudoRandom() * 120) + 1

        // Snapshot existing user and done values before propagation
        const protectedBefore = sets.map((s, idx) => ({
          idx,
          weightUserOrDone:
            s.weight.state === 'user' || s.weight.state === 'done',
          weightVal: s.weight.value,
          weightState: s.weight.state,
          repsUserOrDone: s.reps.state === 'user' || s.reps.state === 'done',
          repsVal: s.reps.value,
          repsState: s.reps.state,
        }))

        const { nextSets } = propagateField(sets, editSetIndex, field, newValue)

        // Assert:
        // 1. All earlier sets unchanged
        for (let j = 0; j < editSetIndex; j++) {
          expect(nextSets[j]).toEqual(sets[j])
        }

        // 2. All protected user/done cells (except the one specifically edited by user) remain unchanged
        for (let j = 0; j < numSets; j++) {
          if (j === editSetIndex) continue

          const pb = protectedBefore[j]
          if (pb.weightUserOrDone) {
            expect(nextSets[j].weight.value).toBe(pb.weightVal)
            expect(nextSets[j].weight.state).toBe(pb.weightState)
          }
          if (pb.repsUserOrDone) {
            expect(nextSets[j].reps.value).toBe(pb.repsVal)
            expect(nextSets[j].reps.state).toBe(pb.repsState)
          }
        }
      }
    })
  })

  describe('B2.2 Suggestions Rules', () => {
    it('1. without history: pre-fills lower bound reps and shows first_time_weight hint without weight', () => {
      const res = computeExerciseSuggestions({ repsMin: 8, repsMax: 12 }, [])
      expect(res.suggestedReps).toBe(8)
      expect(res.suggestedWeight).toBeUndefined()
      expect(res.hintClaimId).toBe('sugg.first_time_weight')
    })

    it('2. with history: pre-fills weight and reps from previous session', () => {
      const history = [
        {
          date: '2026-10-20',
          sets: [
            { reps: 10, weightKg: 50 },
            { reps: 10, weightKg: 50 },
          ],
        },
      ]
      const res = computeExerciseSuggestions(
        { repsMin: 8, repsMax: 12 },
        history,
      )
      expect(res.suggestedWeight).toBe(50)
      expect(res.suggestedReps).toBe(10)
      expect(res.hintClaimId).toBeUndefined()
    })

    it('3. progression suggestion: suggests +5% weight rounded to nearest 0.5 kg when 2 sessions hit top', () => {
      const history = [
        {
          date: '2026-10-22',
          sets: [
            { reps: 12, weightKg: 50 },
            { reps: 12, weightKg: 50 },
          ],
        },
        {
          date: '2026-10-18',
          sets: [
            { reps: 12, weightKg: 50 },
            { reps: 12, weightKg: 50 },
          ],
        },
      ]
      // 50 * 1.05 = 52.5 kg
      const res = computeExerciseSuggestions(
        { repsMin: 8, repsMax: 12 },
        history,
      )
      expect(res.suggestedWeight).toBe(52.5)
      expect(res.hintClaimId).toBe('sugg.progress')
    })

    it('4. shows below_range hint if first completed set is below program lower bound', () => {
      const res = computeExerciseSuggestions({ repsMin: 8, repsMax: 12 }, [], {
        reps: 5,
        weightKg: 60,
      })
      expect(res.hintClaimId).toBe('sugg.below_range')
    })
  })
})
