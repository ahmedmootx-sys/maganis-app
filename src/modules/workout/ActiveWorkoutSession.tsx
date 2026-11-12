import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { appStorage } from '../../platform/storage.ts'
import { platform } from '../../platform/index.ts'
import {
  computeElapsedSeconds,
  computeRestSecondsLeft,
  isSessionStale,
  useNow,
} from '../../platform/timerEngine.ts'
import { haptics } from '../../platform/haptics.ts'
import { useKeepAwake } from '../../platform/keepAwake.ts'
import { onAppPause } from '../../platform/lifecycle.ts'
import { syncSchedule } from '../../platform/notifications/notificationEngine.ts'
import { storageHealth } from '../../platform/storageHealth.ts'
import type {
  Exercise,
  ProgramDay,
  SessionExercise,
  TrackingSession,
} from '../shared/types.ts'
import { getEffectiveExercise } from './exerciseStore.ts'
import { ExerciseMarks } from '../../components/ExerciseMarks.tsx'
import { ExerciseDetailModal } from './ExerciseDetailModal.tsx'
import { ExerciseThumb } from '../../components/ExerciseThumb.tsx'
import { MUSCLE_GROUP_LABELS } from '../shared/types.ts'
import { formatPrescription, cleanDayName } from './sessionResolver.ts'
import { formatTime } from './workoutUtils.ts'
import { TopBar, ProgressBar, Sheet, ConfirmSheet } from '../../ui/index.ts'
import { plural } from '../../utils/plural.ts'
import exerciseFlagsData from '../../data/exercise-flags.json'
import {
  IconClock,
  IconMoreVertical,
  IconChevronDown,
  IconInfo,
  IconClose,
} from '../../components/Icons.tsx'
import {
  computeExerciseSuggestions,
  type CellState,
} from '../tracking/setPropagation.ts'
import { Claim } from '../../content/Claim.tsx'

export type { CellState }

export interface ActiveWorkoutSessionProps {
  programDay: ProgramDay
  customExercises?: Exercise[]
  previousSessions?: TrackingSession[]
  onFinish: (session: TrackingSession) => void
  onCancel: () => void
  onMinimize?: () => void
  onElapsedSecondsUpdate?: (seconds: number) => void
}

export interface ActiveSet {
  id: string
  setNum: number
  weightKg: number
  reps: number
  durationSeconds?: number
  isCompleted: boolean
  hasMissingWeight?: boolean
  weightState: CellState
  repsState: CellState
  durationState?: CellState
}

export interface ActiveExerciseState {
  exerciseId: string
  sets: ActiveSet[]
  hintClaimId?: 'sugg.first_time_weight' | 'sugg.progress' | 'sugg.below_range'
}

export function getExerciseMeasureType(
  ex?: Exercise | null,
): 'weight' | 'bodyweight' | 'timed' {
  if (!ex) return 'weight'
  if (
    ex.measurementType === 'duration' ||
    ex.nameAr?.includes('بلانك') ||
    ex.name?.toLowerCase().includes('plank')
  ) {
    return 'timed'
  }
  const eq = (
    (ex.equipmentDetail as { db?: string } | undefined)?.db ||
    (typeof ex.equipment === 'string'
      ? ex.equipment
      : (ex.equipment as unknown as { db?: string })?.db) ||
    ''
  ).toLowerCase()

  if (
    eq === 'body only' ||
    eq === 'bodyweight' ||
    eq === 'none' ||
    ex.equipment === 'bodyweight' ||
    ex.measurementType === 'bodyweight'
  ) {
    return 'bodyweight'
  }
  return 'weight'
}

export function isSetReadyToComplete(
  set: ActiveSet,
  measureType: 'weight' | 'bodyweight' | 'timed',
): boolean {
  if (measureType === 'bodyweight') {
    return set.reps >= 1
  }
  if (measureType === 'timed') {
    return (set.durationSeconds ?? set.reps) >= 1
  }
  return set.weightKg > 0 && set.reps >= 1
}

function uniqueId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  }
}

const ACTIVE_SESSION_STORAGE_KEY = 'maganis:active_session'

export interface SavedSessionState {
  programDay: ProgramDay
  dayIndex: number
  exercisesState: ActiveExerciseState[]
  startedAt: number
  pausedMs?: number
  pausedAt?: number | null
  restEndsAt?: number | null
  lastSeenAt: number
  elapsedSeconds?: number
  savedAt: number
}

export function ActiveWorkoutSession({
  programDay,
  customExercises = [],
  previousSessions = [],
  onFinish,
  onCancel,
  onMinimize,
  onElapsedSecondsUpdate,
}: ActiveWorkoutSessionProps) {
  // --- Load Initial Saved Session State (if matching & within 12 hours) ---
  const [initialSavedState] = useState<SavedSessionState | null>(() => {
    try {
      const raw = appStorage.getItem(ACTIVE_SESSION_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as SavedSessionState
        if (
          parsed.dayIndex === programDay.dayIndex &&
          Array.isArray(parsed.exercisesState) &&
          Date.now() - parsed.savedAt < 1000 * 60 * 60 * 12
        ) {
          return parsed
        }
      }
    } catch {
      // fallback
    }
    return null
  })

  // Stale-session prompt state (> 3 hours gap)
  const [showStalePrompt, setShowStalePrompt] = useState(() => {
    if (initialSavedState?.lastSeenAt) {
      return isSessionStale(initialSavedState.lastSeenAt, Date.now())
    }
    return false
  })

  // Timestamp tracking states
  const [startedAt] = useState<number>(() => {
    if (initialSavedState?.startedAt) return initialSavedState.startedAt
    if (typeof initialSavedState?.elapsedSeconds === 'number') {
      return Date.now() - initialSavedState.elapsedSeconds * 1000
    }
    return Date.now()
  })
  const [pausedMs, setPausedMs] = useState<number>(
    () => initialSavedState?.pausedMs || 0,
  )
  const [pausedAt] = useState<number | null>(
    () => initialSavedState?.pausedAt || null,
  )
  const [restEndsAt, setRestEndsAt] = useState<number | null>(() => {
    if (
      initialSavedState?.restEndsAt &&
      initialSavedState.restEndsAt > Date.now()
    ) {
      return initialSavedState.restEndsAt
    }
    return null
  })
  const [lastSeenAt, setLastSeenAt] = useState<number>(
    () => initialSavedState?.lastSeenAt || Date.now(),
  )

  // Keep screen awake during workouts
  useKeepAwake(true)

  // 1 Hz Clock ticker (forces re-render without accumulating state)
  const now = useNow(1000)

  // Derived elapsed time strictly computed from timestamps
  const elapsedSeconds = useMemo(() => {
    return computeElapsedSeconds({
      startedAt,
      pausedMs,
      pausedAt,
      now,
      lastSeenAt,
    })
  }, [startedAt, pausedMs, pausedAt, now, lastSeenAt])

  // Derived rest seconds left from restEndsAt timestamp
  const restSecondsLeft = useMemo(() => {
    return computeRestSecondsLeft(restEndsAt, now)
  }, [restEndsAt, now])

  // Notify parent component of elapsed seconds updates
  useEffect(() => {
    onElapsedSecondsUpdate?.(elapsedSeconds)
  }, [elapsedSeconds, onElapsedSecondsUpdate])

  // Rest timer completion alert in foreground
  const restAlertFiredRef = useRef<number | null>(null)
  useEffect(() => {
    if (restEndsAt !== null && now >= restEndsAt) {
      if (restAlertFiredRef.current !== restEndsAt) {
        restAlertFiredRef.current = restEndsAt
        void haptics.notifySuccess()
        setRestEndsAt(null)
        void syncSchedule()
      }
    }
  }, [restEndsAt, now])

  // --- Initialize Exercises & Sets with Refresh Recovery ---
  const [exercisesState, setExercisesState] = useState<ActiveExerciseState[]>(
    () => {
      if (initialSavedState?.exercisesState) {
        return initialSavedState.exercisesState
      }
      return programDay.exercises.map((pe) => {
        const defaultSetsCount = Math.max(1, pe.sets || 3)
        // Check suggestions from previous history
        const exSessions = (previousSessions || [])
          .filter(
            (s) =>
              s.exercises &&
              s.exercises.some((e) => e.exerciseId === pe.exerciseId),
          )
          .map((s) => ({
            date: s.date,
            sets:
              s.exercises
                .find((e) => e.exerciseId === pe.exerciseId)
                ?.sets?.map((st) => ({
                  reps: st.reps,
                  weightKg: st.weightKg,
                })) || [],
          }))

        const sugg = computeExerciseSuggestions(
          {
            reps: pe.reps,
            repsMin: pe.repsMin,
            repsMax: pe.repsMax,
            durationSeconds: pe.restSeconds,
          },
          exSessions,
        )

        // Rule: with no history, pre-fill reps from the program's range and leave weight empty with the hint sugg.first_time_weight
        const defaultReps = sugg.suggestedReps ?? pe.repsMin ?? pe.reps ?? 10
        const defaultWeight = sugg.suggestedWeight ?? 0

        const sets: ActiveSet[] = Array.from(
          { length: defaultSetsCount },
          (_, idx) => ({
            id: uniqueId(),
            setNum: idx + 1,
            weightKg: defaultWeight,
            reps: defaultReps,
            isCompleted: false,
            weightState: defaultWeight > 0 ? 'suggested' : 'empty',
            repsState: defaultReps > 0 ? 'suggested' : 'empty',
          }),
        )
        return {
          exerciseId: pe.exerciseId,
          sets,
          hintClaimId: sugg.hintClaimId,
        }
      })
    },
  )

  // Start mascot toast message, auto disappears after 3.5s
  const [toastMessage, setToastMessage] = useState<string | null>(
    'عاش يا بطل! ركّز في الأداء والتكنيك وتدرب بعزيمة.',
  )

  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => {
      setToastMessage(null)
    }, 3500)
    return () => clearTimeout(timer)
  }, [toastMessage])

  // --- Persistent Storage Management (Heartbeat + Event-driven, Task N4.5) ---
  const persistSession = useCallback(
    (overrides?: Partial<SavedSessionState>) => {
      try {
        const nowTs = Date.now()
        setLastSeenAt(nowTs)
        const dataToSave: SavedSessionState = {
          programDay,
          dayIndex: programDay.dayIndex,
          exercisesState,
          startedAt,
          pausedMs,
          pausedAt,
          restEndsAt,
          lastSeenAt: nowTs,
          elapsedSeconds,
          savedAt: nowTs,
          ...overrides,
        }
        appStorage.setItem(
          ACTIVE_SESSION_STORAGE_KEY,
          JSON.stringify(dataToSave),
        )
        storageHealth.recordWriteSuccess()
      } catch (err) {
        storageHealth.recordError(ACTIVE_SESSION_STORAGE_KEY, err)
      }
    },
    [
      programDay,
      exercisesState,
      startedAt,
      pausedMs,
      pausedAt,
      restEndsAt,
      elapsedSeconds,
    ],
  )

  // 15-second heartbeat auto-save (replaces 1-second auto-save loop)
  useEffect(() => {
    const heartbeat = setInterval(() => {
      persistSession()
    }, 15000)
    return () => clearInterval(heartbeat)
  }, [persistSession])

  // Save on native pause / backgrounding
  useEffect(() => {
    const unpause = onAppPause(() => {
      persistSession()
    })
    return () => unpause()
  }, [persistSession])

  // Prevent accidental web back/refresh during active workout
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleBeforeUnload)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', handleBeforeUnload)
      }
    }
  }, [])

  function triggerRestTimer(seconds = 60) {
    const endsAt = Date.now() + seconds * 1000
    setRestEndsAt(endsAt)
    persistSession({ restEndsAt: endsAt })
    void syncSchedule()
  }

  // --- Exercise Detail Modal ---
  const [selectedExerciseForDetail, setSelectedExerciseForDetail] =
    useState<Exercise | null>(null)

  function handleOpenExerciseDetail(exerciseId: string) {
    const ex = getEffectiveExercise(exerciseId, customExercises)
    if (ex) {
      setSelectedExerciseForDetail(ex)
    }
  }

  // Warmup Confirmation State for high-risk exercises
  const [warmupConfirmationPending, setWarmupConfirmationPending] = useState<{
    exerciseIndex: number
    setIndex: number
  } | null>(null)
  const [confirmedWarmups, setConfirmedWarmups] = useState<
    Record<string, boolean>
  >({})

  function executeToggleSet(exerciseIndex: number, setIndex: number) {
    setExercisesState((prev) => {
      const next = [...prev]
      const currentEx = { ...next[exerciseIndex] }
      const nextSets = [...currentEx.sets]
      const currentSet = { ...nextSets[setIndex] }

      const newStatus = !currentSet.isCompleted
      currentSet.isCompleted = newStatus
      if (newStatus) {
        if (currentSet.weightKg > 0) currentSet.weightState = 'done'
        if (currentSet.reps > 0) currentSet.repsState = 'done'
      } else {
        if (currentSet.weightKg > 0) currentSet.weightState = 'user'
        if (currentSet.reps > 0) currentSet.repsState = 'user'
      }
      nextSets[setIndex] = currentSet
      currentEx.sets = nextSets
      next[exerciseIndex] = currentEx

      // If marked completed, trigger haptic and start rest timer
      if (newStatus) {
        void haptics.impactLight()
        const pe = programDay.exercises[exerciseIndex]
        const rest = pe?.restSeconds > 0 ? pe.restSeconds : 60
        triggerRestTimer(rest)
      }

      return next
    })
  }

  // Inline Hint state when clicking disabled checkmark
  const [inlineHintSetId, setInlineHintSetId] = useState<string | null>(null)

  // Propagation Undo state
  const [propagationUndoSnapshot, setPropagationUndoSnapshot] = useState<{
    exerciseIndex: number
    sets: ActiveSet[]
  } | null>(null)
  const [showPropagationToast, setShowPropagationToast] = useState(false)
  const propagationTimerRef = useRef<number | null>(null)

  // Undo delete state
  const [deletedSetInfo, setDeletedSetInfo] = useState<{
    exerciseIndex: number
    setIndex: number
    set: ActiveSet
  } | null>(null)
  const undoTimeoutRef = useRef<number | null>(null)

  // --- Sets Actions ---
  function handleToggleSetCompleted(exerciseIndex: number, setIndex: number) {
    const exState = exercisesState[exerciseIndex]
    const exId = exState?.exerciseId
    const exercise = getEffectiveExercise(exId, customExercises)
    const measureType = getExerciseMeasureType(exercise)
    const currentSet = exState.sets[setIndex]

    // If set is not yet completed, enforce completion readiness rule (A1)
    if (!currentSet.isCompleted) {
      if (!isSetReadyToComplete(currentSet, measureType)) {
        setInlineHintSetId(currentSet.id)
        return
      }
    }

    setInlineHintSetId(null)

    const flag = exId
      ? (
          exerciseFlagsData.exercises as Record<
            string,
            { requiresWarmupConfirmation?: boolean }
          >
        )[exId]
      : null

    // If exercise requires warmup confirmation and hasn't been confirmed yet
    if (flag?.requiresWarmupConfirmation && !confirmedWarmups[exId]) {
      setWarmupConfirmationPending({ exerciseIndex, setIndex })
      return
    }

    executeToggleSet(exerciseIndex, setIndex)
  }

  function handleConfirmWarmup() {
    if (!warmupConfirmationPending) return
    const { exerciseIndex, setIndex } = warmupConfirmationPending
    const exId = exercisesState[exerciseIndex]?.exerciseId
    if (exId) {
      setConfirmedWarmups((prev) => ({ ...prev, [exId]: true }))
    }
    executeToggleSet(exerciseIndex, setIndex)
    setWarmupConfirmationPending(null)
  }

  function handleUpdateSetField(
    exerciseIndex: number,
    setIndex: number,
    field: 'weightKg' | 'reps',
    value: number,
  ) {
    setExercisesState((prev) => {
      const next = [...prev]
      const currentEx = { ...next[exerciseIndex] }
      const snapshot: ActiveSet[] = JSON.parse(JSON.stringify(currentEx.sets))
      const nextSets: ActiveSet[] = JSON.parse(JSON.stringify(currentEx.sets))

      const targetSet = nextSets[setIndex]
      const numVal = Math.max(0, value)
      targetSet[field] = numVal
      if (field === 'weightKg')
        targetSet.weightState = numVal > 0 ? 'user' : 'empty'
      if (field === 'reps') targetSet.repsState = numVal > 0 ? 'user' : 'empty'

      let propagatedCount = 0

      // Propagate forward to sets j > setIndex where cell is empty, suggested, or auto
      if (numVal > 0) {
        for (let j = setIndex + 1; j < nextSets.length; j++) {
          const s = nextSets[j]
          if (field === 'weightKg') {
            if (
              s.weightState === 'empty' ||
              s.weightState === 'suggested' ||
              s.weightState === 'auto'
            ) {
              s.weightKg = numVal
              s.weightState = 'auto'
              propagatedCount++
            }
          } else if (field === 'reps') {
            if (
              s.repsState === 'empty' ||
              s.repsState === 'suggested' ||
              s.repsState === 'auto'
            ) {
              s.reps = numVal
              s.repsState = 'auto'
              propagatedCount++
            }
          }
        }
      }

      currentEx.sets = nextSets
      next[exerciseIndex] = currentEx

      if (propagatedCount > 0) {
        setPropagationUndoSnapshot({ exerciseIndex, sets: snapshot })
        setShowPropagationToast(true)
        if (propagationTimerRef.current)
          clearTimeout(propagationTimerRef.current)
        propagationTimerRef.current = window.setTimeout(() => {
          setShowPropagationToast(false)
        }, 6000)
      }

      return next
    })
    setInlineHintSetId(null)
  }

  function handleUndoPropagation() {
    if (!propagationUndoSnapshot) return
    if (propagationTimerRef.current) clearTimeout(propagationTimerRef.current)
    const { exerciseIndex, sets } = propagationUndoSnapshot
    setExercisesState((prev) => {
      const next = [...prev]
      next[exerciseIndex] = {
        ...next[exerciseIndex],
        sets: JSON.parse(JSON.stringify(sets)),
      }
      return next
    })
    setPropagationUndoSnapshot(null)
    setShowPropagationToast(false)
  }

  // Previous-value shortcut (A2)
  function handleCopyPrevious(exerciseIndex: number, setIndex: number) {
    const exState = exercisesState[exerciseIndex]
    const prevExSets = previousHistoryMap[exState.exerciseId]
    const prevSet =
      prevExSets?.[setIndex] ||
      (prevExSets && prevExSets.length > 0
        ? prevExSets[prevExSets.length - 1]
        : null)
    if (!prevSet) return

    setExercisesState((prev) => {
      const next = [...prev]
      const currentEx = { ...next[exerciseIndex] }
      const nextSets = [...currentEx.sets]
      nextSets[setIndex] = {
        ...nextSets[setIndex],
        weightKg:
          prevSet.weightKg > 0 ? prevSet.weightKg : nextSets[setIndex].weightKg,
        reps: prevSet.reps > 0 ? prevSet.reps : nextSets[setIndex].reps,
      }
      currentEx.sets = nextSets
      next[exerciseIndex] = currentEx
      return next
    })
    setInlineHintSetId(null)
  }

  function handleAddSet(exerciseIndex: number) {
    setExercisesState((prev) => {
      const next = [...prev]
      const currentEx = { ...next[exerciseIndex] }
      const newSet: ActiveSet = {
        id: uniqueId(),
        setNum: currentEx.sets.length + 1,
        weightKg: 0,
        reps: 0,
        isCompleted: false,
        weightState: 'empty',
        repsState: 'empty',
      }
      currentEx.sets = [...currentEx.sets, newSet]
      next[exerciseIndex] = currentEx
      return next
    })
  }

  function handleRemoveSet(exerciseIndex: number, setIndex: number) {
    setExercisesState((prev) => {
      const next = [...prev]
      const currentEx = { ...next[exerciseIndex] }
      if (currentEx.sets.length <= 1) return prev
      const setToRemove = currentEx.sets[setIndex]
      const filtered = currentEx.sets.filter((_, idx) => idx !== setIndex)
      currentEx.sets = filtered.map((s, idx) => ({ ...s, setNum: idx + 1 }))
      next[exerciseIndex] = currentEx

      // Save for 6-second undo (A8)
      setDeletedSetInfo({ exerciseIndex, setIndex, set: setToRemove })
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current)
      undoTimeoutRef.current = window.setTimeout(() => {
        setDeletedSetInfo(null)
      }, 6000)

      return next
    })
  }

  function handleUndoRemoveSet() {
    if (!deletedSetInfo) return
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current)

    const { exerciseIndex, setIndex, set } = deletedSetInfo
    setExercisesState((prev) => {
      const next = [...prev]
      const currentEx = { ...next[exerciseIndex] }
      const nextSets = [...currentEx.sets]
      nextSets.splice(setIndex, 0, set)
      currentEx.sets = nextSets.map((s, idx) => ({ ...s, setNum: idx + 1 }))
      next[exerciseIndex] = currentEx
      return next
    })
    setDeletedSetInfo(null)
  }

  // Modals & Sheets
  const [showConfirmFinish, setShowConfirmFinish] = useState(false)
  const [showConfirmCancel, setShowConfirmCancel] = useState(false)
  const [showOverflowSheet, setShowOverflowSheet] = useState(false)

  // Load previous sessions to show "السابق" history per exercise
  const previousHistoryMap = useMemo(() => {
    let allSessions: TrackingSession[] = previousSessions || []
    if (allSessions.length === 0) {
      try {
        const raw = appStorage.getItem('tracking.sessions')
        if (raw) {
          allSessions = JSON.parse(raw)
        }
      } catch {
        // ignore
      }
    }

    const history: Record<string, { weightKg: number; reps: number }[]> = {}
    if (Array.isArray(allSessions)) {
      const sorted = [...allSessions].sort((a, b) => b.createdAt - a.createdAt)
      for (const session of sorted) {
        if (!Array.isArray(session.exercises)) continue
        for (const ex of session.exercises) {
          if (
            !history[ex.exerciseId] &&
            Array.isArray(ex.sets) &&
            ex.sets.length > 0
          ) {
            history[ex.exerciseId] = ex.sets
          }
        }
      }
    }
    return history
  }, [previousSessions])

  const completedSetsCount = useMemo(() => {
    return exercisesState.reduce((acc, ex) => {
      return acc + ex.sets.filter((s) => s.isCompleted).length
    }, 0)
  }, [exercisesState])

  const totalSetsCount = useMemo(() => {
    return exercisesState.reduce((acc, ex) => acc + ex.sets.length, 0)
  }, [exercisesState])

  const totalVolumeKg = useMemo(() => {
    return exercisesState.reduce((acc, ex) => {
      const exercise = getEffectiveExercise(ex.exerciseId, customExercises)
      const measureType = getExerciseMeasureType(exercise)
      if (measureType !== 'weight') return acc

      return (
        acc +
        ex.sets
          .filter((s) => s.isCompleted && s.weightKg > 0)
          .reduce((sAcc, s) => sAcc + s.weightKg * s.reps, 0)
      )
    }, 0)
  }, [exercisesState, customExercises])

  const unweightedCompletedSetsCount = useMemo(() => {
    return exercisesState.reduce((acc, ex) => {
      const exercise = getEffectiveExercise(ex.exerciseId, customExercises)
      const measureType = getExerciseMeasureType(exercise)
      if (measureType !== 'weight') return acc

      return (
        acc +
        ex.sets.filter((s) => s.isCompleted && (!s.weightKg || s.weightKg <= 0))
          .length
      )
    }, 0)
  }, [exercisesState, customExercises])

  const [showBackSheet, setShowBackSheet] = useState(false)

  // Hardware back button integration (N1 back-stack & N4.5)
  useEffect(() => {
    const unregister = platform.app.registerBackHandler(() => {
      if (selectedExerciseForDetail) {
        setSelectedExerciseForDetail(null)
        return true
      }
      if (showConfirmFinish) {
        setShowConfirmFinish(false)
        return true
      }
      if (showConfirmCancel) {
        setShowConfirmCancel(false)
        return true
      }
      if (showBackSheet) {
        setShowBackSheet(false)
        return true
      }
      setShowBackSheet(true)
      return true
    }, 100)

    return () => unregister()
  }, [
    selectedExerciseForDetail,
    showConfirmFinish,
    showConfirmCancel,
    showBackSheet,
  ])

  function handleSaveAndFinish(overrideElapsedSeconds?: number) {
    const todayStr = new Date().toISOString().split('T')[0]
    const finalElapsed =
      typeof overrideElapsedSeconds === 'number'
        ? overrideElapsedSeconds
        : elapsedSeconds

    const sessionExercises: SessionExercise[] = exercisesState.map(
      (exState) => {
        const exercise = getEffectiveExercise(
          exState.exerciseId,
          customExercises,
        )
        const measureType = getExerciseMeasureType(exercise)

        const completedSets = exState.sets
          .filter((s) => s.isCompleted)
          .map((s) => ({
            reps: s.reps,
            weightKg: s.weightKg,
            hasMissingWeight:
              measureType === 'weight' && (!s.weightKg || s.weightKg <= 0),
          }))

        return {
          exerciseId: exState.exerciseId,
          sets:
            completedSets.length > 0
              ? completedSets
              : exState.sets.map((s) => ({
                  reps: s.reps,
                  weightKg: s.weightKg,
                  hasMissingWeight:
                    measureType === 'weight' &&
                    (!s.weightKg || s.weightKg <= 0),
                })),
          completed: completedSets.length > 0,
        }
      },
    )

    const newSession: TrackingSession = {
      id: uniqueId(),
      date: todayStr,
      programDayIndex: programDay.dayIndex,
      exercises: sessionExercises,
      notes: `جلسة تدريب مكتملة في ${formatTime(finalElapsed)} — إجمالي الحمل المرفوع: ${totalVolumeKg > 0 ? `${totalVolumeKg} كجم` : '—'}`,
      createdAt: Date.now(),
    }

    try {
      appStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY)
    } catch (err) {
      storageHealth.recordError(ACTIVE_SESSION_STORAGE_KEY, err)
    }

    void haptics.notifySuccess()
    void syncSchedule()
    onFinish(newSession)
  }

  return (
    <div
      className="active-workout-session"
      data-testid="active-workout-session"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'var(--bg)',
        paddingBottom: 'calc(100px + var(--safe-area-bottom, 0px))',
      }}
    >
      <div className="active-workout-sticky-header">
        {/* TopBar with Timer, Overflow and Back Sheet */}
        <TopBar
          title={programDay.labelAr}
          subtitle={programDay.focus}
          onBack={() => setShowBackSheet(true)}
          actions={
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                className="stopwatch-badge"
                style={{
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  color: 'var(--color-accent-text, #b83a00)',
                  background: 'var(--card-subtle)',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  margin: 0,
                }}
              >
                <IconClock size={15} />
                <span>{formatTime(elapsedSeconds)}</span>
              </div>
              {onMinimize && (
                <button
                  type="button"
                  className="btn-icon"
                  onClick={onMinimize}
                  title="تصغير الجلسة ومتابعة التصفح"
                  aria-label="تصغير الجلسة"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--card-subtle)',
                    color: 'var(--ink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <IconChevronDown size={20} />
                </button>
              )}
              <button
                type="button"
                className="btn-icon"
                onClick={() => setShowOverflowSheet(true)}
                aria-label="خيارات الجلسة"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--card-subtle)',
                  color: 'var(--ink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <IconMoreVertical size={20} />
              </button>
            </div>
          }
        />

        {/* Floating Rest Timer */}
        {restSecondsLeft !== null && restSecondsLeft > 0 && (
          <div
            className="rest-timer-banner"
            data-overlay="true"
            style={{
              margin: '8px 16px 6px',
              padding: '10px 14px',
              borderRadius: '12px',
              background: 'var(--card-subtle)',
              border: '1px solid var(--brand)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13.5px',
                fontWeight: 600,
              }}
            >
              <IconClock size={18} style={{ color: 'var(--brand)' }} />
              <span
                style={{ color: 'var(--color-text, #111)', fontWeight: 700 }}
              >
                فترة الراحة
              </span>
              <strong
                style={{
                  color: 'var(--brand)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {restSecondsLeft} ثانية
              </strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  const currentEnds =
                    restEndsAt && restEndsAt > Date.now()
                      ? restEndsAt
                      : Date.now()
                  const nextEnds = currentEnds + 30 * 1000
                  setRestEndsAt(nextEnds)
                  persistSession({ restEndsAt: nextEnds })
                  void syncSchedule()
                }}
                style={{
                  padding: '6px 10px',
                  fontSize: '12.5px',
                  borderRadius: '8px',
                  border: '1px solid var(--line)',
                  background: 'var(--card-bg)',
                  cursor: 'pointer',
                }}
              >
                +30ث
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setRestEndsAt(null)
                  persistSession({ restEndsAt: null })
                  void syncSchedule()
                }}
                aria-label="تخطي الراحة"
                style={{
                  padding: '6px 10px',
                  fontSize: '12.5px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--danger)',
                  cursor: 'pointer',
                }}
              >
                تخطي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Progress Strip: Single line + ProgressBar */}
      <div
        className="workout-progress-strip"
        style={{
          padding: '12px 16px',
          background: 'var(--card-bg)',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13.5px',
            fontWeight: 700,
            color: 'var(--ink)',
          }}
        >
          <span>
            {completedSetsCount} من {plural(totalSetsCount, 'مجموعة')} مكتملة
          </span>
          <span
            style={{
              color: 'var(--muted)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {totalVolumeKg > 0 ? `${totalVolumeKg}\u00A0كجم` : '—'}
          </span>
        </div>
        <ProgressBar
          value={completedSetsCount}
          max={Math.max(1, totalSetsCount)}
          height={6}
          aria-label="تقدم الجلسة التدريبية"
        />
      </div>

      {/* Exercises List (Hevy / Strong Style) */}
      <main
        className="active-exercises-list"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '16px',
          maxWidth: '720px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {exercisesState.map((exState, exIdx) => {
          const exercise = getEffectiveExercise(
            exState.exerciseId,
            customExercises,
          )
          const exerciseName = exercise?.nameAr ?? exState.exerciseId

          return (
            <div
              key={exState.exerciseId}
              className="active-exercise-card card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '16px',
                borderRadius: '16px',
                background: 'var(--card-bg)',
                border: '1px solid var(--line)',
              }}
            >
              {/* Exercise Header Row */}
              <div
                className="exercise-card-header"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div
                  className="exercise-title-group"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    minWidth: 0,
                  }}
                >
                  <ExerciseThumb
                    exercise={exercise}
                    exerciseId={exState.exerciseId}
                    size={52}
                    fullAnimation={
                      typeof window !== 'undefined' &&
                      typeof window.matchMedia === 'function'
                        ? !window.matchMedia('(prefers-reduced-motion: reduce)')
                            .matches
                        : true
                    }
                  />
                  <div style={{ minWidth: 0 }}>
                    <h3
                      className="exercise-name"
                      style={{
                        margin: 0,
                        fontSize: '15.5px',
                        fontWeight: 700,
                        color: 'var(--ink)',
                        lineHeight: 1.5,
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                      }}
                    >
                      {exerciseName}
                      <ExerciseMarks
                        hasVideo={exercise?.hasVideo}
                        hasCustomMedia={exercise?.hasCustomMedia}
                      />
                    </h3>
                    {exercise && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginTop: '2px',
                        }}
                      >
                        <span
                          className="muscle-badge"
                          style={{
                            fontSize: '12px',
                            color: 'var(--muted)',
                          }}
                        >
                          {MUSCLE_GROUP_LABELS[exercise.category] ||
                            exercise.category}
                        </span>
                        {(() => {
                          const pe = programDay.exercises.find(
                            (p) => p.exerciseId === exState.exerciseId,
                          )
                          if (!pe) return null
                          return (
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: 700,
                                color: 'var(--ink)',
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              · <bdi dir="ltr">{formatPrescription(pe)}</bdi>
                            </span>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="ghost-primary tiny info-btn"
                  onClick={() => handleOpenExerciseDetail(exState.exerciseId)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    height: '38px',
                    padding: '0 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--line)',
                    background: 'var(--card-subtle)',
                    color: 'var(--ink)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <IconInfo size={16} />
                  <span>شرح التمرين</span>
                </button>
              </div>

              {/* Suggestions Hint Claim */}
              {exState.hintClaimId && (
                <div style={{ margin: '4px 0 10px', padding: '0 4px' }}>
                  <Claim id={exState.hintClaimId} />
                </div>
              )}

              {/* Sets Table */}
              {(() => {
                const cardMeasureType = getExerciseMeasureType(exercise)
                const isBodyweight = cardMeasureType === 'bodyweight'
                const isTimed = cardMeasureType === 'timed'

                return (
                  <div
                    className="sets-table-wrapper"
                    style={{ overflowX: 'auto' }}
                  >
                    <table className="sets-table" style={{ width: '100%' }}>
                      <thead>
                        <tr>
                          <th className="col-set">المجموعة</th>
                          <th className="col-prev">السابق</th>
                          {!isBodyweight && !isTimed && (
                            <th className="col-input">الوزن</th>
                          )}
                          <th className="col-input">
                            {isTimed ? 'المدة' : 'التكرارات'}
                          </th>
                          <th className="col-check">تم</th>
                          <th className="col-action"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {exState.sets.map((set, sIdx) => {
                          const measureType = cardMeasureType
                          const prevExSets =
                            previousHistoryMap[exState.exerciseId]
                          const prevSet = prevExSets?.[sIdx]
                          const prevText = prevSet
                            ? isBodyweight
                              ? `${prevSet.reps}\u00A0عدات`
                              : isTimed
                                ? `${(prevSet as { durationSeconds?: number; reps?: number }).durationSeconds ?? prevSet.reps}\u00A0ثانية`
                                : `${prevSet.weightKg}\u00A0كجم × ${prevSet.reps}`
                            : '—'
                          const isReady = isSetReadyToComplete(set, measureType)

                          return (
                            <React.Fragment key={set.id}>
                              <tr
                                className={`set-row ${set.isCompleted ? 'set-completed' : ''}`}
                              >
                                <td className="col-set">
                                  <span className="set-number-badge">
                                    {set.setNum}
                                  </span>
                                </td>
                                <td className="col-prev">
                                  <button
                                    type="button"
                                    data-testid={`prev-set-btn-${exIdx}-${sIdx}`}
                                    className="set-prev-badge set-prev-btn"
                                    onClick={() =>
                                      handleCopyPrevious(exIdx, sIdx)
                                    }
                                    title={
                                      prevSet
                                        ? 'نسخ قيم الجلسة السابقة'
                                        : 'لا توجد بيانات سابقة'
                                    }
                                    disabled={!prevSet}
                                  >
                                    {prevText}
                                  </button>
                                </td>
                                {!isBodyweight && !isTimed && (
                                  <td className="col-input">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.5"
                                      value={
                                        set.weightKg === 0 ? '' : set.weightKg
                                      }
                                      placeholder="كجم"
                                      onChange={(e) =>
                                        handleUpdateSetField(
                                          exIdx,
                                          sIdx,
                                          'weightKg',
                                          parseFloat(e.target.value) || 0,
                                        )
                                      }
                                      className="set-field-input"
                                      style={{
                                        border:
                                          set.weightState === 'auto'
                                            ? '1.5px dashed var(--color-accent, #f95700)'
                                            : set.weightState === 'suggested'
                                              ? '1px dashed var(--color-divider)'
                                              : undefined,
                                        fontWeight:
                                          set.weightState === 'auto'
                                            ? 700
                                            : undefined,
                                      }}
                                      aria-label={`وزن المجموعة ${set.setNum}`}
                                    />
                                  </td>
                                )}
                                <td className="col-input">
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={set.reps === 0 ? '' : set.reps}
                                    placeholder={
                                      measureType === 'timed'
                                        ? 'ثوانٍ'
                                        : 'تكرار'
                                    }
                                    onChange={(e) =>
                                      handleUpdateSetField(
                                        exIdx,
                                        sIdx,
                                        'reps',
                                        parseInt(e.target.value, 10) || 0,
                                      )
                                    }
                                    className="set-field-input"
                                    style={{
                                      border:
                                        set.repsState === 'auto'
                                          ? '1.5px dashed var(--color-accent, #f95700)'
                                          : set.repsState === 'suggested'
                                            ? '1px dashed var(--color-divider)'
                                            : undefined,
                                      fontWeight:
                                        set.repsState === 'auto'
                                          ? 700
                                          : undefined,
                                    }}
                                    aria-label={
                                      measureType === 'timed'
                                        ? `ثواني المجموعة ${set.setNum}`
                                        : `تكرار المجموعة ${set.setNum}`
                                    }
                                  />
                                </td>
                                <td className="col-check">
                                  <button
                                    type="button"
                                    className={`set-check-btn ${set.isCompleted ? 'checked' : ''} ${!isReady && !set.isCompleted ? 'disabled' : ''}`}
                                    onClick={() =>
                                      handleToggleSetCompleted(exIdx, sIdx)
                                    }
                                    aria-pressed={set.isCompleted}
                                    title={
                                      set.isCompleted
                                        ? 'إلغاء التحديد'
                                        : isReady
                                          ? 'تأكيد إنهاء المجموعة'
                                          : measureType === 'bodyweight'
                                            ? 'اكتب التكرارات أولًا'
                                            : measureType === 'timed'
                                              ? 'اكتب عدد الثواني أولًا'
                                              : 'اكتب الوزن والتكرارات أولًا'
                                    }
                                    aria-label={
                                      set.isCompleted
                                        ? 'مكتملة'
                                        : 'تأكيد إنهاء المجموعة'
                                    }
                                  >
                                    {set.isCompleted ? '✓' : ''}
                                  </button>
                                </td>
                                <td className="col-action">
                                  {exState.sets.length > 1 && (
                                    <button
                                      type="button"
                                      className="ghost-danger tiny remove-set-btn"
                                      onClick={() =>
                                        handleRemoveSet(exIdx, sIdx)
                                      }
                                      title="حذف هذه المجموعة"
                                      aria-label="حذف المجموعة"
                                    >
                                      <IconClose size={14} />
                                    </button>
                                  )}
                                </td>
                              </tr>
                              {inlineHintSetId === set.id && (
                                <tr className="set-hint-row">
                                  <td
                                    colSpan={isBodyweight || isTimed ? 5 : 6}
                                    style={{ padding: '0 4px 8px' }}
                                  >
                                    <div className="set-row-hint" role="alert">
                                      {measureType === 'bodyweight'
                                        ? 'اكتب التكرارات أولًا'
                                        : measureType === 'timed'
                                          ? 'اكتب عدد الثواني أولًا'
                                          : 'اكتب الوزن والتكرارات أولًا'}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              })()}

              {/* Add Set Button */}
              <div className="exercise-card-footer">
                <button
                  type="button"
                  className="ghost-primary tiny add-set-btn"
                  onClick={() => handleAddSet(exIdx)}
                  style={{
                    height: '42px',
                    width: '100%',
                    borderRadius: '10px',
                    border: '1px dashed var(--line)',
                    background: 'var(--card-subtle)',
                    color: 'var(--color-accent-text, #b83a00)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  + إضافة مجموعة جديدة
                </button>
              </div>
            </div>
          )
        })}
      </main>

      {/* Bottom Sticky Action Bar: EXACTLY ONE finish button */}
      <footer
        className="active-workout-footer"
        data-overlay="true"
        style={{
          position: 'fixed',
          bottom: 0,
          insetInline: 0,
          padding: '10px 16px',
          background: 'var(--bg)',
          borderTop: '1px solid var(--line)',
          zIndex: 50,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <button
          type="button"
          className="button-primary full-width finish-workout-large-btn"
          data-testid="header-finish-btn"
          onClick={() => setShowConfirmFinish(true)}
          style={{
            maxWidth: '560px',
            width: '100%',
            minHeight: '50px',
            height: 'auto',
            padding: '8px 14px',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            background: 'var(--btn-primary-bg, var(--brand))',
            border: 'none',
            color: 'var(--btn-primary-fg, var(--on-accent, #14110e))',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '15.5px', fontWeight: 700 }}>
            إنهاء التمرين
          </span>
          <span style={{ fontSize: '12px', fontWeight: 500, opacity: 0.9 }}>
            {completedSetsCount} من {plural(totalSetsCount, 'مجموعة')} مكتملة
          </span>
        </button>
      </footer>

      {/* Toast message at session start */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="toast"
          data-overlay="true"
          style={{
            position: 'fixed',
            bottom: '76px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1300,
            background: 'var(--color-toast-bg, #181614)',
            color: 'var(--color-toast-text, #ffffff)',
            padding: '10px 18px',
            borderRadius: '12px',
            fontSize: '13.5px',
            fontWeight: 600,
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            maxWidth: 'calc(100vw - 32px)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Overflow Sheet for Session Options */}
      <Sheet
        isOpen={showOverflowSheet}
        onClose={() => setShowOverflowSheet(false)}
        title="خيارات الجلسة"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '8px 0',
          }}
        >
          {onMinimize && (
            <button
              type="button"
              onClick={() => {
                setShowOverflowSheet(false)
                onMinimize()
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '12px',
                border: 'none',
                background: 'var(--card-subtle)',
                color: 'var(--ink)',
                fontSize: '15px',
                fontWeight: 600,
                textAlign: 'right',
                width: '100%',
                cursor: 'pointer',
              }}
            >
              <IconChevronDown size={20} />
              <span>تصغير الجلسة ومتابعة التصفح</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setShowOverflowSheet(false)
              setShowConfirmCancel(true)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              borderRadius: '12px',
              border: 'none',
              background: 'var(--danger-surface, rgba(220, 38, 38, 0.08))',
              color: 'var(--danger)',
              fontSize: '15px',
              fontWeight: 600,
              textAlign: 'right',
              width: '100%',
              cursor: 'pointer',
            }}
          >
            <IconClose size={20} />
            <span>إلغاء الجلسة الحالية</span>
          </button>
        </div>
      </Sheet>

      {/* Exercise Detail Modal */}
      {selectedExerciseForDetail && (
        <ExerciseDetailModal
          exercise={selectedExerciseForDetail}
          onClose={() => setSelectedExerciseForDetail(null)}
        />
      )}

      {/* Confirm Finish Modal */}
      {showConfirmFinish && (
        <div
          className="modal-backdrop"
          onClick={() => setShowConfirmFinish(false)}
        >
          <div
            className="modal-content card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '440px', width: '100%' }}
          >
            <div className="modal-header">
              <h2>مبروك إنهاء التمرين!</h2>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowConfirmFinish(false)}
                aria-label="إغلاق"
              >
                <IconClose size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p>هل ترغب في حفظ هذه الجلسة في سجل التتبع الخاص بك والتقويم؟</p>

              {unweightedCompletedSetsCount > 0 && (
                <div
                  className="unweighted-sets-warning"
                  role="alert"
                  style={{
                    background: 'var(--warn-surface, rgba(217, 119, 6, 0.1))',
                    border: '1px solid var(--warn, #d97706)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    marginBottom: '14px',
                    color: 'var(--ink)',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 600 }}>
                    تنبيه: يوجد {plural(unweightedCompletedSetsCount, 'مجموعة')}{' '}
                    بدون وزن مسجل. لن يتم احتسابها في الحمل المرفوع وسيتم
                    تمييزها في السجل.
                  </p>
                  <div
                    style={{ display: 'flex', gap: '8px', marginTop: '10px' }}
                  >
                    <button
                      type="button"
                      className="button-secondary tiny"
                      onClick={() => setShowConfirmFinish(false)}
                      style={{
                        flex: 1,
                        minHeight: '36px',
                        height: 'auto',
                        paddingBlock: '6px',
                        fontSize: '13px',
                        borderRadius: '8px',
                        border: '1px solid var(--line)',
                        background: 'var(--card-subtle)',
                        color: 'var(--ink)',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      أكمل التسجيل
                    </button>
                    <button
                      type="button"
                      className="button-ghost tiny"
                      onClick={() => {
                        setShowConfirmFinish(false)
                        handleSaveAndFinish()
                      }}
                      style={{
                        flex: 1,
                        minHeight: '36px',
                        height: 'auto',
                        paddingBlock: '6px',
                        fontSize: '13px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--muted)',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      احفظ كما هي
                    </button>
                  </div>
                </div>
              )}

              <ul className="summary-list">
                <li>
                  <span>اليوم التدريبي</span>
                  <strong>
                    {cleanDayName(programDay.name || programDay.labelAr)} (
                    {programDay.focus})
                  </strong>
                </li>
                <li>
                  <span>مدة التمرين</span>
                  <strong>{formatTime(elapsedSeconds)}</strong>
                </li>
                <li>
                  <span>المجموعات المنجزة</span>
                  <strong>{plural(completedSetsCount, 'مجموعة')}</strong>
                </li>
                <li>
                  <span>إجمالي الحمل المرفوع</span>
                  <strong data-testid="finish-total-volume">
                    {totalVolumeKg > 0 ? `${totalVolumeKg}\u00A0كجم` : '—'}
                  </strong>
                </li>
              </ul>
            </div>
            <div
              className="modal-footer actions-row"
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <button
                type="button"
                className="button-primary full-width"
                data-testid="confirm-save-session-btn"
                onClick={() => {
                  setShowConfirmFinish(false)
                  handleSaveAndFinish()
                }}
                style={{
                  minHeight: '48px',
                  height: 'auto',
                  paddingBlock: '10px',
                  fontSize: '16px',
                  fontWeight: 700,
                }}
              >
                تأكيد وحفظ الجلسة
              </button>
              <button
                type="button"
                className="ghost full-width"
                onClick={() => setShowConfirmFinish(false)}
                style={{
                  minHeight: '44px',
                  height: 'auto',
                  paddingBlock: '8px',
                }}
              >
                الرجوع للجلسة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3-Option Back Sheet (Task N4.5) */}
      {showBackSheet && (
        <Sheet
          isOpen={showBackSheet}
          onClose={() => setShowBackSheet(false)}
          title="مغادرة التمرين؟"
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '16px',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                color: 'var(--muted)',
                lineHeight: 1.5,
              }}
            >
              بيانات تمرينك ومجموعاتك محفوظة تلقائياً بأمان. اختر الإجراء اللي
              يناسبك:
            </p>

            <button
              type="button"
              className="primary full-width"
              style={{
                minHeight: '48px',
                height: 'auto',
                paddingBlock: '10px',
                fontSize: '15px',
                fontWeight: 700,
              }}
              onClick={() => setShowBackSheet(false)}
            >
              كمّل التمرين
            </button>

            <button
              type="button"
              className="secondary full-width"
              style={{
                minHeight: '48px',
                height: 'auto',
                paddingBlock: '10px',
                fontSize: '15px',
                fontWeight: 600,
              }}
              onClick={() => {
                setShowBackSheet(false)
                if (onMinimize) {
                  onMinimize()
                } else {
                  onCancel()
                }
              }}
            >
              اخرج وسيبه شغال
            </button>

            <button
              type="button"
              className="ghost full-width"
              style={{
                minHeight: '44px',
                height: 'auto',
                paddingBlock: '8px',
                fontSize: '14px',
                color: 'var(--color-danger, #ef4444)',
                fontWeight: 600,
              }}
              onClick={() => {
                setShowBackSheet(false)
                handleSaveAndFinish()
              }}
            >
              إنهاء التمرين
            </button>
          </div>
        </Sheet>
      )}

      {/* Stale Session Guard Sheet (Task N4.5) */}
      {showStalePrompt && (
        <Sheet
          isOpen={showStalePrompt}
          onClose={() => {}}
          title="استكمال التمرين؟"
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '16px',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                color: 'var(--muted)',
                lineHeight: 1.5,
              }}
            >
              التمرين كان متوقف من فترة كبيرة (أكتر من 3 ساعات). تحب تكمّل
              التمرين من مكان ما وقفت، ولا تنهي الجلسة وتسجل مدتها الفعلية؟
            </p>

            <button
              type="button"
              className="primary full-width"
              style={{ height: '48px', fontSize: '15px', fontWeight: 700 }}
              onClick={() => {
                if (initialSavedState?.lastSeenAt) {
                  const idleGap = Date.now() - initialSavedState.lastSeenAt
                  setPausedMs((prev) => prev + idleGap)
                }
                setShowStalePrompt(false)
                persistSession()
              }}
            >
              كمّل التمرين
            </button>

            <button
              type="button"
              className="ghost full-width"
              style={{
                height: '44px',
                fontSize: '14px',
                color: 'var(--color-danger, #ef4444)',
                fontWeight: 600,
              }}
              onClick={() => {
                setShowStalePrompt(false)
                const effectiveElapsed = initialSavedState?.lastSeenAt
                  ? computeElapsedSeconds({
                      startedAt,
                      pausedMs,
                      pausedAt,
                      now: initialSavedState.lastSeenAt,
                      lastSeenAt: initialSavedState.lastSeenAt,
                    })
                  : elapsedSeconds
                handleSaveAndFinish(effectiveElapsed)
              }}
            >
              إنهاء التمرين
            </button>
          </div>
        </Sheet>
      )}

      {/* Confirm Cancel Modal / ConfirmSheet */}
      {showConfirmCancel && (
        <ConfirmSheet
          isOpen={showConfirmCancel}
          onClose={() => setShowConfirmCancel(false)}
          onConfirm={() => {
            try {
              appStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY)
            } catch (err) {
              storageHealth.recordError(ACTIVE_SESSION_STORAGE_KEY, err)
            }
            setShowConfirmCancel(false)
            onCancel()
          }}
          title="إلغاء الجلسة؟"
          consequences={[
            'هل أنت متأكد من إلغاء جلسة التمرين الحالية؟',
            'لن يتم حفظ المجموعات التي قمت بتسجيلها في سجل التتبع.',
          ]}
          confirmLabel="نعم، إلغاء وخروج"
          cancelLabel="متابعة التمرين"
          isDestructive={true}
        />
      )}

      {/* Warmup Confirmation Sheet for high-risk exercises */}
      {warmupConfirmationPending && (
        <ConfirmSheet
          isOpen={true}
          onClose={() => setWarmupConfirmationPending(null)}
          onConfirm={handleConfirmWarmup}
          title="تأكيد الإحماء قبل بدء التمرين"
          consequences={[
            'هذا التمرين مصنف كعالي الخطورة على المفاصل والأوتار.',
            'تأكد من أداء مجموعات إحماء تدريجية بوزن خفيف وإطالات حركية لتجهيز المفصل وتجنب الإصابة.',
          ]}
          confirmLabel="نعم، أتممت الإحماء"
          cancelLabel="تراجع"
          isDestructive={false}
        />
      )}

      {/* Undo Toast for deleted set (A8) */}
      {deletedSetInfo && (
        <div
          role="status"
          className="toast undo-toast"
          style={{
            position: 'fixed',
            bottom: '76px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1300,
            background: 'var(--color-toast-bg, #181614)',
            color: 'var(--color-toast-text, #ffffff)',
            padding: '8px 16px',
            borderRadius: '12px',
            fontSize: '13.5px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          }}
        >
          <span>تم حذف المجموعة</span>
          <button
            type="button"
            className="undo-toast-btn"
            onClick={handleUndoRemoveSet}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--brand-accent, #38bdf8)',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '4px 8px',
              fontSize: '13.5px',
            }}
          >
            تراجع
          </button>
        </div>
      )}

      {/* Propagation Toast with Undo (D2) */}
      {showPropagationToast && (
        <div
          data-testid="propagation-toast"
          data-overlay="true"
          style={{
            position: 'fixed',
            bottom: '140px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1300,
            background: 'var(--color-surface-2, #262320)',
            color: 'var(--color-text, #f6f2ea)',
            border: '1px solid var(--color-divider, #2b2f35)',
            padding: '8px 16px',
            borderRadius: '12px',
            fontSize: '13.5px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          }}
        >
          <span>اتنقلت لباقي المجموعات</span>
          <button
            type="button"
            className="undo-toast-btn"
            onClick={handleUndoPropagation}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-accent-text, #b83a00)',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '4px 8px',
              fontSize: '13.5px',
            }}
          >
            تراجع
          </button>
        </div>
      )}
    </div>
  )
}
