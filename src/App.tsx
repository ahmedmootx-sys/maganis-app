import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AppConfig } from './config/appConfig.ts'
import { assetUrl } from './utils/assetUrl.ts'
import { createStorage } from './lib/storage.ts'
import { navigationHistory } from './utils/navigationHistory.ts'
import { createLiveFileSyncManager } from './lib/liveFileSync.ts'
import { createProfileStore } from './modules/onboarding/profileStore.ts'
import { OnboardingWizard } from './modules/onboarding/OnboardingWizard.tsx'
import { Dashboard } from './modules/dashboard/index.ts'
import { createWorkoutStore } from './modules/workout/workoutStore.ts'
import { createTrackingStore } from './modules/tracking/trackingStore.ts'
import type {
  WorkoutProgram,
  ProgramDay,
  TrackingSession,
  BodyLogEntry,
  DayNote,
  BackupData,
  SavedWorkoutProgram,
  CustomExercise,
} from './modules/shared/types.ts'
import type { UserProfile } from './modules/onboarding/types.ts'
import { WeeklyPlanView } from './modules/workout/WeeklyPlanView.tsx'
import { CustomExerciseBuilder } from './modules/workout/CustomExerciseBuilder.tsx'
import { ExerciseLibraryModal } from './modules/workout/ExerciseLibraryModal.tsx'
import { CustomScheduleModal } from './modules/workout/CustomScheduleModal.tsx'
import { ProgramVaultModal } from './modules/workout/ProgramVaultModal.tsx'
import { ActiveWorkoutSession } from './modules/workout/ActiveWorkoutSession.tsx'
import { formatTime } from './modules/workout/workoutUtils.ts'
import { generateProgram } from './modules/workout/programGenerator.ts'
import { SessionLogger } from './modules/tracking/SessionLogger.tsx'
import { SettingsScreen } from './modules/settings/SettingsScreen.tsx'
import { NutritionModule } from './modules/nutrition/NutritionModule.tsx'
import { MuscleAtlasDebug } from './modules/workout/MuscleAtlasDebug.tsx'
import { ProgressScreen } from './modules/tracking/ProgressScreen.tsx'
import { Toast } from './components/Toast.tsx'
import { updateManager } from './utils/updateManager.ts'
import {
  IconUser,
  IconDumbbell,
  IconUtensils,
  IconTrendingUp,
  IconSettings,
  IconClose,
} from './components/Icons.tsx'
import { ExerciseDetailView } from './modules/workout/ExerciseDetailView.tsx'
import { ConfirmSheet } from './ui/index.ts'
import { IconSprite } from './ui/IconSprite.tsx'
import { Styleguide } from './shell/Styleguide.tsx'
import { ComponentGallery } from './modules/gallery/ComponentGallery.tsx'
import { useRouter } from './shell/router.ts'
import './styles/app.css'

type TabId =
  | 'dashboard'
  | 'workouts'
  | 'nutrition'
  | 'progress'
  | 'tracking'
  | 'reports'
  | 'settings'

interface AppProps {
  config: AppConfig
}

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'الرئيسية', icon: <IconUser size={20} /> },
  { id: 'workouts', label: 'التدريب', icon: <IconDumbbell size={20} /> },
  { id: 'nutrition', label: 'التغذية', icon: <IconUtensils size={20} /> },
  { id: 'progress', label: 'التقدم', icon: <IconTrendingUp size={20} /> },
  { id: 'settings', label: 'الإعدادات', icon: <IconSettings size={20} /> },
]

export function App({ config }: AppProps) {
  const storage = useMemo(
    () => createStorage(config.storagePrefix),
    [config.storagePrefix],
  )
  const profileStore = useMemo(() => createProfileStore(storage), [storage])
  const workoutStore = useMemo(() => createWorkoutStore(storage), [storage])
  const trackingStore = useMemo(() => createTrackingStore(storage), [storage])

  const [profile, setProfile] = useState<UserProfile | null>(() =>
    profileStore.loadProfile(),
  )
  const [editing, setEditing] = useState(false)
  const { route, navigate } = useRouter()
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    switch (route.path) {
      case '/training':
      case '/training/day/:id':
      case '/exercise/:id':
      case '/library':
        return 'workouts'
      case '/nutrition':
        return 'nutrition'
      case '/progress':
        return 'progress'
      case '/settings':
        return 'settings'
      default:
        return 'dashboard'
    }
  })

  useEffect(() => {
    switch (route.path) {
      case '/home':
        setActiveTab('dashboard')
        break
      case '/training':
      case '/training/day/:id':
      case '/exercise/:id':
      case '/library':
        setActiveTab('workouts')
        if (route.path === '/library') {
          setShowExerciseLibrary(true)
        }
        break
      case '/nutrition':
        setActiveTab('nutrition')
        break
      case '/progress':
        setActiveTab('progress')
        break
      case '/settings':
        setActiveTab('settings')
        break
    }
  }, [route])

  const handleTabChange = useCallback(
    (tabId: TabId) => {
      if (activeTab === tabId) {
        // Tapping the already-active tab scrolls to top
        const scroller =
          document.querySelector('.app-main') ||
          document.querySelector('.screen-content') ||
          window
        scroller.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      setActiveTab(tabId)
      switch (tabId) {
        case 'dashboard':
          navigate('/home')
          break
        case 'workouts':
          navigate('/training')
          break
        case 'nutrition':
          navigate('/nutrition')
          break
        case 'progress':
        case 'tracking':
        case 'reports':
          navigate('/progress')
          break
        case 'settings':
          navigate('/settings')
          break
      }
    },
    [activeTab, navigate],
  )
  const [program, setProgram] = useState<WorkoutProgram | null>(() =>
    workoutStore.loadProgram(),
  )
  const [sessions, setSessions] = useState<TrackingSession[]>(() =>
    trackingStore.loadSessions(),
  )
  const [bodyLog, setBodyLog] = useState<BodyLogEntry[]>(() =>
    trackingStore.loadBodyLog(),
  )
  const [dayNotes, setDayNotes] = useState<DayNote[]>(() =>
    trackingStore.loadDayNotes(),
  )
  const [deletedExerciseIds, setDeletedExerciseIds] = useState<string[]>(() =>
    workoutStore.getDeletedExerciseIds(),
  )
  const [customExercisesList, setCustomExercisesList] = useState<
    CustomExercise[]
  >(() => workoutStore.getCustomExercises())
  const [editingCustomExercise, setEditingCustomExercise] =
    useState<CustomExercise | null>(null)
  const [showCustomBuilder, setShowCustomBuilder] = useState(false)
  const [showLogger, setShowLogger] = useState(false)
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false)
  const [confirmReplaceProgramOpen, setConfirmReplaceProgramOpen] =
    useState(false)
  const [confirmDeleteProgramOpen, setConfirmDeleteProgramOpen] =
    useState(false)
  const [confirmCancelActiveSessionOpen, setConfirmCancelActiveSessionOpen] =
    useState(false)
  const [activeWorkoutDay, setActiveWorkoutDay] = useState<ProgramDay | null>(
    () => {
      try {
        const raw = localStorage.getItem('maganis:active_session')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (
            parsed &&
            parsed.programDay &&
            Date.now() - parsed.savedAt < 1000 * 60 * 60 * 12
          ) {
            return parsed.programDay as ProgramDay
          }
        }
      } catch {
        // ignore
      }
      return null
    },
  )
  const [isWorkoutSessionExpanded, setIsWorkoutSessionExpanded] = useState(
    () => {
      // If there's an ongoing restored session, keep it available
      return false
    },
  )
  const [activeSessionSeconds, setActiveSessionSeconds] = useState(0)
  const [showCustomScheduleModal, setShowCustomScheduleModal] = useState(false)
  const [showProgramVaultModal, setShowProgramVaultModal] = useState(false)
  const [showAtlasDebugModal, setShowAtlasDebugModal] = useState(false)
  const [savedProgramsList, setSavedProgramsList] = useState<
    SavedWorkoutProgram[]
  >(() => workoutStore.getSavedPrograms())

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('maganis:theme')
      if (stored === 'dark' || stored === 'light') return stored
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    } catch {
      return 'light'
    }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('maganis:theme', theme)
    } catch {
      // ignore
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  // --- Mobile Back Gesture & Hardware Back Button Handling ---
  const [backToastMessage, setBackToastMessage] = useState<string | null>(null)
  const [hasAppUpdate, setHasAppUpdate] = useState(false)

  useEffect(() => {
    return updateManager.subscribe((avail) => {
      setHasAppUpdate(avail)
    })
  }, [])

  useEffect(() => {
    navigationHistory.setOnShowToast((msg) => {
      setBackToastMessage(msg)
      setTimeout(() => setBackToastMessage(null), 3000)
    })
  }, [])

  useEffect(() => {
    if (activeTab !== 'dashboard') {
      navigationHistory.setTabBackHandler(() => {
        setActiveTab('dashboard')
        return true
      })
    } else {
      navigationHistory.setTabBackHandler(undefined)
    }
    return () => {
      navigationHistory.setTabBackHandler(undefined)
    }
  }, [activeTab])

  useEffect(() => {
    if (showExerciseLibrary) {
      return navigationHistory.push('exerciseLibrary', () =>
        setShowExerciseLibrary(false),
      )
    }
  }, [showExerciseLibrary])

  useEffect(() => {
    if (showCustomBuilder) {
      return navigationHistory.push('customBuilder', () => {
        setShowCustomBuilder(false)
        setEditingCustomExercise(null)
      })
    }
  }, [showCustomBuilder])

  useEffect(() => {
    if (showCustomScheduleModal) {
      return navigationHistory.push('scheduleModal', () =>
        setShowCustomScheduleModal(false),
      )
    }
  }, [showCustomScheduleModal])

  useEffect(() => {
    if (showProgramVaultModal) {
      return navigationHistory.push('vaultModal', () =>
        setShowProgramVaultModal(false),
      )
    }
  }, [showProgramVaultModal])

  useEffect(() => {
    if (showAtlasDebugModal) {
      return navigationHistory.push('atlasDebugModal', () =>
        setShowAtlasDebugModal(false),
      )
    }
  }, [showAtlasDebugModal])

  useEffect(() => {
    if (showLogger) {
      return navigationHistory.push('loggerModal', () => setShowLogger(false))
    }
  }, [showLogger])

  useEffect(() => {
    if (activeWorkoutDay && isWorkoutSessionExpanded) {
      return navigationHistory.push('activeWorkoutSession', () => {
        // Pressing back or swipe gesture minimizes the workout without cancelling it!
        setIsWorkoutSessionExpanded(false)
      })
    }
  }, [activeWorkoutDay, isWorkoutSessionExpanded])

  useEffect(() => {
    if (editing) {
      return navigationHistory.push('editingProfile', () => setEditing(false))
    }
  }, [editing])

  // Live File Auto-Sync whenever data changes
  const [liveSyncManager] = useState(() => createLiveFileSyncManager())
  useEffect(() => {
    liveSyncManager.init()
  }, [liveSyncManager])

  // --- Handlers ---

  const handleSaved = useCallback((saved: UserProfile) => {
    setProfile(saved)
    setEditing(false)
  }, [])

  const handleUpdateProfile = useCallback(
    (updated: UserProfile) => {
      profileStore.saveProfile(updated)
      setProfile(updated)
    },
    [profileStore],
  )

  const handleFactoryReset = useCallback(async () => {
    try {
      await liveSyncManager.disable()
    } catch {
      // ignore
    }
    try {
      localStorage.clear()
    } catch {
      // ignore
    }
    profileStore.clearProfile()
    profileStore.clearDraft()
    workoutStore.clearProgram()
    storage.keys().forEach((k) => storage.remove(k))
    setDeletedExerciseIds([])
    setCustomExercisesList([])
    setSavedProgramsList([])
    setProfile(null)
    setEditing(false)
    setProgram(null)
    setSessions([])
    setBodyLog([])
    setDayNotes([])
    setActiveWorkoutDay(null)
    setIsWorkoutSessionExpanded(false)
    setActiveSessionSeconds(0)
    setActiveTab('dashboard')
  }, [profileStore, workoutStore, storage, liveSyncManager])

  const doGenerateProgram = useCallback(() => {
    if (!profile) return
    const p = generateProgram({
      goal: profile.primaryGoal,
      trainingDaysPerWeek: profile.trainingDaysPerWeek,
      injuries: profile.medical.hasIssues ? profile.medical.injuryTags : [],
      customExercises: workoutStore.getCustomExercises(),
      excludedExerciseIds: workoutStore.getDeletedExerciseIds(),
    })
    workoutStore.saveProgram(p)
    setProgram(p)
  }, [profile, workoutStore])

  const handleGenerateProgram = useCallback(() => {
    if (!profile) return
    if (program && (program.isLocked || program.isCustom)) {
      setConfirmReplaceProgramOpen(true)
      return
    }
    doGenerateProgram()
  }, [profile, program, doGenerateProgram])

  const handleSaveCustomSchedule = useCallback(
    (customProgram: WorkoutProgram) => {
      workoutStore.saveProgram(customProgram)
      setProgram(customProgram)
      setShowCustomScheduleModal(false)
    },
    [workoutStore],
  )

  const doDeleteProgram = useCallback(() => {
    workoutStore.clearProgram()
    setProgram(null)
  }, [workoutStore])

  const handleDeleteProgram = useCallback(() => {
    setConfirmDeleteProgramOpen(true)
  }, [])

  const handleSaveCurrentToVault = useCallback(
    (title: string) => {
      if (!program) return
      workoutStore.saveProgramToVault(title, program)
      setSavedProgramsList(workoutStore.getSavedPrograms())
    },
    [workoutStore, program],
  )

  const handleApplyProgramFromVault = useCallback(
    (saved: SavedWorkoutProgram) => {
      workoutStore.saveProgram(saved.program)
      setProgram(saved.program)
      setShowProgramVaultModal(false)
    },
    [workoutStore],
  )

  const handleDeleteFromVault = useCallback(
    (id: string) => {
      workoutStore.deleteSavedProgram(id)
      setSavedProgramsList(workoutStore.getSavedPrograms())
    },
    [workoutStore],
  )

  const handleRenameInVault = useCallback(
    (id: string, newTitle: string) => {
      workoutStore.renameSavedProgram(id, newTitle)
      setSavedProgramsList(workoutStore.getSavedPrograms())
    },
    [workoutStore],
  )

  const handleSaveSession = useCallback(
    (session: TrackingSession) => {
      trackingStore.saveSession(session)
      setSessions(trackingStore.loadSessions())
      setShowLogger(false)
      setActiveWorkoutDay(null)
      try {
        localStorage.removeItem('maganis:active_session')
      } catch {
        // ignore
      }
    },
    [trackingStore],
  )

  const handleAddWeight = useCallback(
    (entry: BodyLogEntry) => {
      trackingStore.addBodyLogEntry(entry)
      setBodyLog(trackingStore.loadBodyLog())
    },
    [trackingStore],
  )

  const handleDeleteWeight = useCallback(
    (date: string) => {
      const current = trackingStore.loadBodyLog()
      const updated = current.filter((e) => e.date !== date)
      trackingStore.saveBodyLog(updated)
      setBodyLog(updated)
    },
    [trackingStore],
  )

  const handleAddNote = useCallback(
    (note: DayNote) => {
      trackingStore.addDayNote(note)
      setDayNotes(trackingStore.loadDayNotes())
    },
    [trackingStore],
  )

  const handleDeleteNote = useCallback(
    (date: string, noteText: string) => {
      const current = trackingStore.loadDayNotes()
      const updated = current.filter(
        (n) => !(n.date === date && n.note === noteText),
      )
      trackingStore.saveDayNotes(updated)
      setDayNotes(updated)
    },
    [trackingStore],
  )

  const handleSaveCustomExercise = useCallback(
    (ex: CustomExercise) => {
      if (editingCustomExercise && editingCustomExercise.id) {
        workoutStore.updateCustomExercise(ex)
      } else {
        workoutStore.addCustomExercise(ex)
      }
      setCustomExercisesList(workoutStore.getCustomExercises())
      setShowCustomBuilder(false)
      setEditingCustomExercise(null)
    },
    [workoutStore, editingCustomExercise],
  )

  const handleDeleteExercise = useCallback(
    (id: string) => {
      workoutStore.deleteExercise(id)
      workoutStore.removeCustomExercise(id)
      setDeletedExerciseIds(workoutStore.getDeletedExerciseIds())
      setCustomExercisesList(workoutStore.getCustomExercises())
    },
    [workoutStore],
  )

  const handleRestoreExercise = useCallback(
    (id: string) => {
      workoutStore.restoreExercise(id)
      setDeletedExerciseIds(workoutStore.getDeletedExerciseIds())
    },
    [workoutStore],
  )

  const handleEditCustomExercise = useCallback((ex: CustomExercise) => {
    setEditingCustomExercise(ex)
    setShowExerciseLibrary(false)
    setShowCustomBuilder(true)
  }, [])

  const handleBackupData = useCallback((): BackupData => {
    return {
      exportVersion: 1,
      exportedAt: Date.now(),
      profile: profile,
      workoutProgram: program,
      customExercises: workoutStore.getCustomExercises(),
      trackingSessions: sessions,
      bodyLog,
      dayNotes,
    }
  }, [profile, program, sessions, bodyLog, dayNotes, workoutStore])

  useEffect(() => {
    if (
      profile ||
      program ||
      sessions.length > 0 ||
      bodyLog.length > 0 ||
      dayNotes.length > 0
    ) {
      liveSyncManager.sync(handleBackupData())
    }
  }, [
    profile,
    program,
    sessions,
    bodyLog,
    dayNotes,
    handleBackupData,
    liveSyncManager,
  ])

  const handleImported = useCallback(() => {
    setProfile(profileStore.loadProfile())
    setProgram(workoutStore.loadProgram())
    setSessions(trackingStore.loadSessions())
    setBodyLog(trackingStore.loadBodyLog())
    setDayNotes(trackingStore.loadDayNotes())
  }, [profileStore, workoutStore, trackingStore])

  const handleRestoreBackup = useCallback(
    (data: BackupData) => {
      if (data.profile && typeof data.profile === 'object') {
        profileStore.saveProfile(data.profile as UserProfile)
      }
      if (data.workoutProgram) {
        workoutStore.saveProgram(data.workoutProgram)
      }
      if (Array.isArray(data.customExercises)) {
        storage.set('workout.custom-exercises', data.customExercises)
      }
      if (Array.isArray(data.trackingSessions)) {
        storage.set('tracking.sessions', data.trackingSessions)
      }
      if (Array.isArray(data.bodyLog)) {
        storage.set('tracking.body-log', data.bodyLog)
      }
      if (Array.isArray(data.dayNotes)) {
        storage.set('tracking.notes', data.dayNotes)
      }
      handleImported()
    },
    [profileStore, workoutStore, storage, handleImported],
  )

  // --- Styleguide dev route ---
  if (route.path === '/styleguide') {
    return (
      <div className="maganis-shell">
        <IconSprite />
        <Styleguide />
      </div>
    )
  }

  // --- Component Gallery dev route ---
  if (route.path === '/gallery') {
    return (
      <div className="maganis-shell">
        <IconSprite />
        <ComponentGallery />
      </div>
    )
  }

  // --- Onboarding state ---
  if (!profile || editing) {
    return (
      <div className="maganis-shell app app--fullscreen" dir="rtl">
        <IconSprite />
        <h1 data-testid="app-title" style={{ display: 'none' }}>
          {config.appName}
        </h1>
        <main className="app-main app-main--fullscreen">
          <OnboardingWizard
            store={profileStore}
            initialProfile={profile}
            onSaved={handleSaved}
            onCancel={profile ? () => setEditing(false) : undefined}
          />
        </main>
      </div>
    )
  }

  // --- Today's program day ---
  const todayDayIndex = new Date().getDay()
  const todayProgramDay =
    program?.days.find((d) => d.dayIndex === todayDayIndex) ?? null

  // --- Render active tab content ---
  function renderContent() {
    if (route.path === '/exercise/:id' && route.params.id) {
      return (
        <div className="exercise-route-page screen-container" dir="rtl">
          <ExerciseDetailView
            exerciseId={route.params.id}
            profile={profile}
            program={program}
            sessions={sessions}
            onBack={() => {
              if (window.history.length > 1) {
                window.history.back()
              } else {
                navigate('/training')
              }
            }}
            onNavigateSettings={() => navigate('/settings')}
          />
        </div>
      )
    }

    if (route.path === '/library') {
      if (showCustomBuilder) {
        return (
          <CustomExerciseBuilder
            initialExercise={editingCustomExercise || undefined}
            onSave={handleSaveCustomExercise}
            onCancel={() => {
              setShowCustomBuilder(false)
              setEditingCustomExercise(null)
            }}
          />
        )
      }
      return (
        <ExerciseLibraryModal
          program={program}
          customExercises={customExercisesList}
          deletedExerciseIds={deletedExerciseIds}
          onDeleteExercise={handleDeleteExercise}
          onRestoreExercise={handleRestoreExercise}
          onEditCustomExercise={handleEditCustomExercise}
          onAddExerciseToDay={(dayIndex, exerciseId) => {
            if (program) {
              const newDays = program.days.map((d) =>
                d.dayIndex === dayIndex
                  ? {
                      ...d,
                      exercises: [
                        ...d.exercises,
                        {
                          exerciseId,
                          sets: 3,
                          reps: 10,
                          restSeconds: 60,
                          section: 'primary' as const,
                        },
                      ],
                    }
                  : d,
              )
              const updated = { ...program, days: newDays }
              workoutStore.saveProgram(updated)
              setProgram(updated)
            }
          }}
          onClose={() => navigate('/training')}
        />
      )
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            profile={profile}
            program={program}
            recentSessions={sessions}
            bodyLog={bodyLog}
            onStartWorkout={(day) => {
              setActiveWorkoutDay(day)
              setIsWorkoutSessionExpanded(true)
            }}
            onViewDay={() => {
              setActiveTab('workouts')
            }}
            onOpenNutrition={() => {
              setActiveTab('nutrition')
            }}
            onUpdateProfile={(updated) => {
              profileStore.saveProfile(updated)
              setProfile(updated)
            }}
          />
        )

      case 'workouts':
        return (
          <div className="workouts-tab">
            {showExerciseLibrary && (
              <ExerciseLibraryModal
                program={program}
                customExercises={customExercisesList}
                deletedExerciseIds={deletedExerciseIds}
                onDeleteExercise={handleDeleteExercise}
                onRestoreExercise={handleRestoreExercise}
                onEditCustomExercise={handleEditCustomExercise}
                onAddExerciseToDay={(dayIndex, exerciseId) => {
                  if (program) {
                    const newDays = program.days.map((d) =>
                      d.dayIndex === dayIndex
                        ? {
                            ...d,
                            exercises: [
                              ...d.exercises,
                              {
                                exerciseId,
                                sets: 3,
                                reps: 10,
                                restSeconds: 60,
                                section: 'primary' as const,
                              },
                            ],
                          }
                        : d,
                    )
                    const updated = { ...program, days: newDays }
                    workoutStore.saveProgram(updated)
                    setProgram(updated)
                  }
                }}
                onClose={() => setShowExerciseLibrary(false)}
              />
            )}

            {showCustomBuilder && (
              <CustomExerciseBuilder
                initialExercise={editingCustomExercise || undefined}
                onSave={handleSaveCustomExercise}
                onCancel={() => {
                  setShowCustomBuilder(false)
                  setEditingCustomExercise(null)
                }}
              />
            )}

            {showCustomScheduleModal && profile && (
              <CustomScheduleModal
                primaryGoal={profile.primaryGoal}
                profileDays={profile.trainingDaysPerWeek}
                weekStartDay={
                  (profile as { preferences?: { weekStartDay?: number } })
                    .preferences?.weekStartDay ?? 6
                }
                onSaveSchedule={handleSaveCustomSchedule}
                onClose={() => setShowCustomScheduleModal(false)}
              />
            )}

            {showProgramVaultModal && (
              <ProgramVaultModal
                savedPrograms={savedProgramsList}
                activeProgram={program}
                onSaveCurrentProgram={handleSaveCurrentToVault}
                onApplyProgram={handleApplyProgramFromVault}
                onDeleteProgram={handleDeleteFromVault}
                onRenameProgram={handleRenameInVault}
                onClose={() => setShowProgramVaultModal(false)}
              />
            )}

            {showLogger && (
              <SessionLogger
                programDay={todayProgramDay}
                dayIndex={todayDayIndex}
                onSave={handleSaveSession}
                onClose={() => setShowLogger(false)}
                customExercises={workoutStore.getCustomExercises()}
              />
            )}

            <WeeklyPlanView
              program={program}
              profile={profile}
              onUpdateProfile={(updated) => {
                profileStore.saveProfile(updated)
                setProfile(updated)
              }}
              customExercises={workoutStore.getCustomExercises()}
              userInjuries={
                profile?.medical.hasIssues ? profile.medical.injuryTags : []
              }
              initialSelectedDayIndex={
                route.path === '/training/day/:id' && route.params.id
                  ? parseInt(route.params.id, 10)
                  : null
              }
              onStartRoutine={(day) => {
                setActiveWorkoutDay(day)
                setIsWorkoutSessionExpanded(true)
              }}
              onUpdateProgram={(updated) => {
                workoutStore.saveProgram(updated)
                setProgram(updated)
              }}
              onDeleteProgram={handleDeleteProgram}
              onOpenScheduleModal={() => setShowCustomScheduleModal(true)}
              onOpenVaultModal={() => setShowProgramVaultModal(true)}
              onOpenLibrary={() => navigate('/library')}
              onOpenCustomBuilder={() => setShowCustomBuilder(true)}
              onOpenSessionLogger={() => setShowLogger(true)}
              onGenerateProgram={handleGenerateProgram}
            />
          </div>
        )

      case 'nutrition':
        return (
          <NutritionModule
            profile={profile}
            bodyLog={bodyLog}
            onAddBodyWeight={handleAddWeight}
            onUpdateProfile={(updated) => {
              const saved = profileStore.saveProfile(updated)
              setProfile(saved)
            }}
          />
        )

      case 'progress':
      case 'tracking':
      case 'reports':
        return (
          <ProgressScreen
            sessions={sessions}
            bodyLog={bodyLog}
            dayNotes={dayNotes}
            profile={profile}
            onAddBodyWeight={handleAddWeight}
            onDeleteBodyWeight={handleDeleteWeight}
            onAddDayNote={handleAddNote}
            onDeleteDayNote={handleDeleteNote}
            onUpdateSessions={(updated) => {
              setSessions(updated)
              storage.set('tracking.sessions', updated)
            }}
            onUpdateBodyLog={(updated) => {
              setBodyLog(updated)
              storage.set('tracking.body-log', updated)
            }}
            initialSubTab={activeTab === 'reports' ? 'reports' : 'log'}
          />
        )

      case 'settings': {
        if (!profile) return null
        return (
          <SettingsScreen
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onEditProfile={() => setEditing(true)}
            theme={theme}
            onToggleTheme={toggleTheme}
            backupData={handleBackupData}
            onImported={handleImported}
            onRestore={handleRestoreBackup}
            onOpenAtlasDebug={() => setShowAtlasDebugModal(true)}
            onFactoryReset={handleFactoryReset}
          />
        )
      }
    }
  }

  return (
    <>
      {activeWorkoutDay && (
        <div
          className="app app--workout-active"
          style={{ display: isWorkoutSessionExpanded ? 'block' : 'none' }}
        >
          <ActiveWorkoutSession
            programDay={activeWorkoutDay}
            customExercises={workoutStore.getCustomExercises()}
            previousSessions={sessions}
            onFinish={(session) => {
              handleSaveSession(session)
              setActiveWorkoutDay(null)
              setIsWorkoutSessionExpanded(false)
            }}
            onCancel={() => {
              setActiveWorkoutDay(null)
              setIsWorkoutSessionExpanded(false)
              try {
                localStorage.removeItem('maganis:active_session')
              } catch {
                // ignore
              }
            }}
            onMinimize={() => setIsWorkoutSessionExpanded(false)}
            onElapsedSecondsUpdate={(secs) => setActiveSessionSeconds(secs)}
          />
        </div>
      )}

      <div
        className="maganis-shell app app--shell"
        style={{ display: isWorkoutSessionExpanded ? 'none' : 'grid' }}
      >
        <IconSprite />
        <header className="app-header" style={{ display: 'none' }}>
          <div className="maganis-header-brand">
            <img
              src={assetUrl('branding/maganis-mascot-inner.png')}
              alt="د. مجانص"
              className="maganis-header-mascot"
            />
            <div className="maganis-brand-title">
              <h1
                data-testid="app-title"
                lang="en"
                dir="ltr"
                style={{ fontWeight: 600 }}
              >
                Maganis
              </h1>
              <span className="maganis-brand-subtitle">
                الطبيب والمدرب الرياضي الشخصي
              </span>
            </div>
          </div>
          {typeof window !== 'undefined' &&
            new URLSearchParams(window.location.search).get('debug') ===
              '1' && (
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}
              >
                <span
                  className="env-badge"
                  data-testid="env-badge"
                  data-env={config.appEnv}
                >
                  {config.appEnv}
                </span>
              </div>
            )}
        </header>

        {activeWorkoutDay && !isWorkoutSessionExpanded && (
          <div
            className="active-workout-sticky-banner"
            data-testid="active-workout-sticky-banner"
          >
            <div className="banner-info-section">
              <span className="banner-pulse-dot" />
              <div className="banner-timer-badge">
                {formatTime(activeSessionSeconds)}
              </div>
              <div className="banner-text">
                <span
                  className="banner-tag"
                  style={{
                    fontSize: '11.5px',
                    color: 'var(--brand)',
                    fontWeight: 700,
                    display: 'block',
                  }}
                >
                  لديك جلسة غير مكتملة
                </span>
                <strong className="banner-title">
                  {activeWorkoutDay.labelAr}
                </strong>
                <span className="banner-focus">{activeWorkoutDay.focus}</span>
              </div>
            </div>
            <div className="banner-actions-section">
              <button
                type="button"
                className="button-primary small banner-resume-btn"
                onClick={() => setIsWorkoutSessionExpanded(true)}
              >
                العودة للجلسة
              </button>
              <button
                type="button"
                className="button-success small"
                onClick={() => setIsWorkoutSessionExpanded(true)}
              >
                إنهاء وحفظ
              </button>
              <button
                type="button"
                className="ghost-danger tiny"
                onClick={() => setConfirmCancelActiveSessionOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <IconClose size={14} /> إلغاء
              </button>
            </div>
          </div>
        )}

        <main className="app-main">{renderContent()}</main>

        <nav className="bottom-nav" data-testid="bottom-nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-testid={`tab-${tab.id}`}
              className={`bottom-nav__item bottom-nav__tab${activeTab === tab.id ? ' bottom-nav__item--active bottom-nav__tab--active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              <span className="bottom-nav__icon">{tab.icon}</span>
              <span className="bottom-nav__label bottom-nav__tab-label">
                {tab.label}
              </span>
            </button>
          ))}
        </nav>

        {showAtlasDebugModal && (
          <div
            className="modal-backdrop"
            onClick={() => setShowAtlasDebugModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '16px',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '720px',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <MuscleAtlasDebug onClose={() => setShowAtlasDebugModal(false)} />
            </div>
          </div>
        )}

        <ConfirmSheet
          isOpen={confirmReplaceProgramOpen}
          onClose={() => setConfirmReplaceProgramOpen(false)}
          onConfirm={doGenerateProgram}
          title="استبدال الجدول الحالي"
          consequences={[
            'لديك جدول تدريبي مخصص أو مقفل حالياً.',
            'سيتم استبدال الجدول الحالي بجدول تلقائي جديد بناءً على بياناتك.',
            'ننصح بحفظ جدولك الحالي في "حافظة الجداول" أولاً لتفادي فقدانه.',
          ]}
          confirmLabel="إنشاء واستبدال"
          cancelLabel="إلغاء"
          isDestructive={true}
        />

        <ConfirmSheet
          isOpen={confirmDeleteProgramOpen}
          onClose={() => setConfirmDeleteProgramOpen(false)}
          onConfirm={doDeleteProgram}
          title="حذف الجدول التدريبي"
          consequences={[
            'سيتم حذف الجدول التدريبي بالكامل من التطبيق.',
            'يمكنك دائماً إنشاء جدول جديد أو استرجاع جدول سابق من الحافظة.',
          ]}
          confirmLabel="تأكيد الحذف"
          cancelLabel="تراجع"
          isDestructive={true}
        />

        <ConfirmSheet
          isOpen={confirmCancelActiveSessionOpen}
          onClose={() => setConfirmCancelActiveSessionOpen(false)}
          onConfirm={() => {
            setActiveWorkoutDay(null)
            setIsWorkoutSessionExpanded(false)
            try {
              localStorage.removeItem('maganis:active_session')
            } catch {
              // ignore
            }
          }}
          title="إلغاء جلسة التمرين"
          consequences={[
            'سيتم إلغاء الجلسة التدريبية الحالية ومسح أي مجموعات مؤقتة مسجلة فيها.',
            'لن يتم حفظ هذه الجلسة في سجل التتبع.',
          ]}
          confirmLabel="إلغاء الجلسة"
          cancelLabel="متابعة التمرين"
          isDestructive={true}
        />

        <Toast
          message={backToastMessage}
          onDismiss={() => setBackToastMessage(null)}
        />

        {hasAppUpdate && (
          <Toast
            message="تحديث جديد جاهز"
            duration={0}
            action={{
              label: 'تحديث الآن',
              onClick: () => updateManager.applyUpdate(),
            }}
          />
        )}
      </div>
    </>
  )
}
