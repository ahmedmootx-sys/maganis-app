import type { Storage } from '../../lib/storage.ts'
import type { TrackingSession, BodyLogEntry, DayNote } from '../shared/types.ts'

export interface TrackingStore {
  saveSession(session: TrackingSession): void
  loadSessions(): TrackingSession[]
  saveBodyLog(entries: BodyLogEntry[]): void
  loadBodyLog(): BodyLogEntry[]
  addBodyLogEntry(entry: BodyLogEntry): void
  saveDayNotes(notes: DayNote[]): void
  loadDayNotes(): DayNote[]
  addDayNote(note: DayNote): void
}

const SESSIONS_KEY = 'tracking.sessions'
const BODY_LOG_KEY = 'tracking.body-log'
const DAY_NOTES_KEY = 'tracking.notes'

export function createTrackingStore(storage: Storage): TrackingStore {
  function saveSession(session: TrackingSession): void {
    const existing = storage.get<TrackingSession[]>(SESSIONS_KEY, [])
    storage.set(SESSIONS_KEY, [...existing, session])
  }

  function loadSessions(): TrackingSession[] {
    return storage.get<TrackingSession[]>(SESSIONS_KEY, [])
  }

  function saveBodyLog(entries: BodyLogEntry[]): void {
    storage.set(BODY_LOG_KEY, entries)
  }

  function loadBodyLog(): BodyLogEntry[] {
    return storage.get<BodyLogEntry[]>(BODY_LOG_KEY, [])
  }

  function addBodyLogEntry(entry: BodyLogEntry): void {
    const existing = loadBodyLog()
    // Replace if same date exists, otherwise append
    const idx = existing.findIndex((e) => e.date === entry.date)
    if (idx >= 0) {
      existing[idx] = entry
    } else {
      existing.push(entry)
    }
    saveBodyLog(existing)
  }

  function saveDayNotes(notes: DayNote[]): void {
    storage.set(DAY_NOTES_KEY, notes)
  }

  function loadDayNotes(): DayNote[] {
    return storage.get<DayNote[]>(DAY_NOTES_KEY, [])
  }

  function addDayNote(note: DayNote): void {
    const existing = loadDayNotes()
    const idx = existing.findIndex((n) => n.date === note.date)
    if (idx >= 0) {
      existing[idx] = note
    } else {
      existing.push(note)
    }
    saveDayNotes(existing)
  }

  return {
    saveSession,
    loadSessions,
    saveBodyLog,
    loadBodyLog,
    addBodyLogEntry,
    saveDayNotes,
    loadDayNotes,
    addDayNote,
  }
}
