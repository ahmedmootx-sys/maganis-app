import type { Storage } from '../../lib/storage.ts'
import type {
  CustomExercise,
  SavedWorkoutProgram,
  WorkoutProgram,
} from '../shared/types.ts'

export interface WorkoutStore {
  saveProgram(program: WorkoutProgram): void
  loadProgram(): WorkoutProgram | null
  clearProgram(): void
  addCustomExercise(exercise: CustomExercise): void
  getCustomExercises(): CustomExercise[]
  removeCustomExercise(id: string): void
  updateCustomExercise(exercise: CustomExercise): void
  getDeletedExerciseIds(): string[]
  deleteExercise(id: string): void
  restoreExercise(id: string): void
  getSavedPrograms(): SavedWorkoutProgram[]
  saveProgramToVault(
    title: string,
    program: WorkoutProgram,
  ): SavedWorkoutProgram
  deleteSavedProgram(id: string): void
  renameSavedProgram(id: string, newTitle: string): void
}

const PROGRAM_KEY = 'workout.program'
const CUSTOM_EXERCISES_KEY = 'workout.custom-exercises'
const DELETED_EXERCISES_KEY = 'workout.deleted-exercises'
const SAVED_PROGRAMS_KEY = 'workout.saved-programs'

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

  function updateCustomExercise(exercise: CustomExercise): void {
    const existing = storage.get<CustomExercise[]>(CUSTOM_EXERCISES_KEY, [])
    storage.set(
      CUSTOM_EXERCISES_KEY,
      existing.map((e) => (e.id === exercise.id ? exercise : e)),
    )
  }

  function getDeletedExerciseIds(): string[] {
    return storage.get<string[]>(DELETED_EXERCISES_KEY, [])
  }

  function deleteExercise(id: string): void {
    const existing = storage.get<string[]>(DELETED_EXERCISES_KEY, [])
    if (!existing.includes(id)) {
      storage.set(DELETED_EXERCISES_KEY, [...existing, id])
    }
  }

  function restoreExercise(id: string): void {
    const existing = storage.get<string[]>(DELETED_EXERCISES_KEY, [])
    storage.set(
      DELETED_EXERCISES_KEY,
      existing.filter((item) => item !== id),
    )
  }

  function getSavedPrograms(): SavedWorkoutProgram[] {
    return storage.get<SavedWorkoutProgram[]>(SAVED_PROGRAMS_KEY, [])
  }

  function saveProgramToVault(
    title: string,
    program: WorkoutProgram,
  ): SavedWorkoutProgram {
    const existing = getSavedPrograms()
    const newEntry: SavedWorkoutProgram = {
      id: `vault-prog-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: title.trim() || `جدول ${existing.length + 1}`,
      savedAt: Date.now(),
      program: JSON.parse(JSON.stringify(program)),
    }
    storage.set(SAVED_PROGRAMS_KEY, [newEntry, ...existing])
    return newEntry
  }

  function deleteSavedProgram(id: string): void {
    const existing = getSavedPrograms()
    storage.set(
      SAVED_PROGRAMS_KEY,
      existing.filter((p) => p.id !== id),
    )
  }

  function renameSavedProgram(id: string, newTitle: string): void {
    const existing = getSavedPrograms()
    storage.set(
      SAVED_PROGRAMS_KEY,
      existing.map((p) =>
        p.id === id ? { ...p, title: newTitle.trim() || p.title } : p,
      ),
    )
  }

  return {
    saveProgram,
    loadProgram,
    clearProgram,
    addCustomExercise,
    getCustomExercises,
    removeCustomExercise,
    updateCustomExercise,
    getDeletedExerciseIds,
    deleteExercise,
    restoreExercise,
    getSavedPrograms,
    saveProgramToVault,
    deleteSavedProgram,
    renameSavedProgram,
  }
}
