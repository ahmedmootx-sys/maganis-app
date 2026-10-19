import type { Storage } from '../../lib/storage.ts'
import type {
  CustomExercise,
  SavedWorkoutProgram,
  WorkoutProgram,
} from '../shared/types.ts'
import { createOwnerDraftProgram } from './ownerProgramImporter.ts'

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

/**
 * Heals orphaned or legacy exercise IDs to canonical IDs.
 * Specifically: 'shoulder-2' was an orphaned ID that canonically maps to 'shoulder-15' (Dumbbell Shoulder Press).
 */
export function healExerciseId(id: string): string {
  if (id === 'shoulder-2') return 'shoulder-15'
  return id
}

export function healProgram(
  program: WorkoutProgram | null,
): WorkoutProgram | null {
  if (!program || !Array.isArray(program.days)) return program
  return {
    ...program,
    days: program.days.map((day) => ({
      ...day,
      exercises: Array.isArray(day.exercises)
        ? day.exercises.map((ex) => ({
            ...ex,
            exerciseId: healExerciseId(ex.exerciseId),
          }))
        : [],
    })),
  }
}

export function createWorkoutStore(storage: Storage): WorkoutStore {
  function saveProgram(program: WorkoutProgram): void {
    storage.set(PROGRAM_KEY, healProgram(program) || program)
  }

  function loadProgram(): WorkoutProgram | null {
    const raw = storage.get<WorkoutProgram | null>(PROGRAM_KEY, null)
    return healProgram(raw)
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
    const list = storage.get<SavedWorkoutProgram[]>(SAVED_PROGRAMS_KEY, [])
    const hasOwnerDraft = list.some(
      (p) =>
        p.id === 'vault-prog-ahmed-upper-lower-5d' ||
        p.title.includes('برنامج أحمد'),
    )
    let fullList = list
    if (!hasOwnerDraft) {
      const ownerDraft = createOwnerDraftProgram()
      fullList = [...list, ownerDraft]
    }

    return fullList.map((item) => ({
      ...item,
      program: healProgram(item.program) || item.program,
    }))
  }

  function saveProgramToVault(
    title: string,
    program: WorkoutProgram,
  ): SavedWorkoutProgram {
    const existing = getSavedPrograms()
    const healed = healProgram(JSON.parse(JSON.stringify(program))) || program
    const newEntry: SavedWorkoutProgram = {
      id: `vault-prog-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: title.trim() || `جدول ${existing.length + 1}`,
      savedAt: Date.now(),
      program: healed,
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
