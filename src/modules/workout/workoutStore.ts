import type { Storage } from '../../lib/storage.ts'
import type { CustomExercise, WorkoutProgram } from '../shared/types.ts'

export interface WorkoutStore {
  saveProgram(program: WorkoutProgram): void
  loadProgram(): WorkoutProgram | null
  clearProgram(): void
  addCustomExercise(exercise: CustomExercise): void
  getCustomExercises(): CustomExercise[]
  removeCustomExercise(id: string): void
}

const PROGRAM_KEY = 'workout.program'
const CUSTOM_EXERCISES_KEY = 'workout.custom-exercises'

export function createWorkoutStore(storage: Storage): WorkoutStore {
  function saveProgram(program: WorkoutProgram): void {
    storage.set(PROGRAM_KEY, program)
  }

  function loadProgram(): WorkoutProgram | null {
    return storage.get<WorkoutProgram | null>(PROGRAM_KEY, null)
  }

  function clearProgram(): void {
    storage.remove(PROGRAM_KEY)
  }

  function addCustomExercise(exercise: CustomExercise): void {
    const existing = storage.get<CustomExercise[]>(CUSTOM_EXERCISES_KEY, [])
    storage.set(CUSTOM_EXERCISES_KEY, [...existing, exercise])
  }

  function getCustomExercises(): CustomExercise[] {
    return storage.get<CustomExercise[]>(CUSTOM_EXERCISES_KEY, [])
  }

  function removeCustomExercise(id: string): void {
    const existing = storage.get<CustomExercise[]>(CUSTOM_EXERCISES_KEY, [])
    storage.set(
      CUSTOM_EXERCISES_KEY,
      existing.filter((e) => e.id !== id),
    )
  }

  return {
    saveProgram,
    loadProgram,
    clearProgram,
    addCustomExercise,
    getCustomExercises,
    removeCustomExercise,
  }
}
