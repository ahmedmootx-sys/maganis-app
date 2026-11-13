import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { AppConfig } from './config/appConfig.ts'
import { assetUrl } from './utils/assetUrl.ts'
import { createStorage } from './lib/storage.ts'
import { appStorage } from './platform/storage.ts'
import { StorageHealthBanner } from './components/StorageHealthBanner.tsx'
import {
  applySnapshot,
  validateSnapshot,
  type MaganisSnapshotV2,
} from './modules/backup/snapshot.ts'
import { recordStorageError } from './platform/storageHealth.ts'
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
import { CustomExerciseBuilder } from './modules/workout/CustomExerciseBuilder.tsx'
import { takePreUpdateSnapshot } from './modules/backup/preUpdateSnapshot.ts'
import { executeFactoryReset } from './modules/settings/resetService.ts'
import { ActiveWorkoutSession } from './modules/workout/ActiveWorkoutSession.tsx'
import { CardioMiniBar } from './modules/workout/CardioMiniBar.tsx'
import type {
  CardioActivityId,
  CardioEffortLevel,
} from './modules/workout/cardioEngine.ts'
import { resolveSession } from './modules/workout/sessionResolver.ts'
import { formatTime } from './modules/workout/workoutUtils.ts'
import { SessionLogger } from './modules/tracking/SessionLogger.tsx'
import { Toast } from './components/Toast.tsx'
import { updateManager } from './utils/updateManager.ts'
import { isNative } from './platform/runtime.ts'
import { backButtonManager } from './platform/backStack.ts'
import { initLifecycleCoordinator } from './platform/lifecycle.ts'
import {
  initNotificationRouter,
  onNotificationAction,
} from './platform/notifications/notificationEngine.ts'
import {
  IconUser,
  IconDumbbell,
  IconUtensils,
  IconTrendingUp,
  IconSettings,
  IconClose,
} from './components/Icons.tsx'
import { getAllExerciseOverrides } from './modules/workout/exerciseOverrides.ts'
import { ConfirmSheet, Icon, Skeleton } from './ui/index.ts'
import { IconSprite } from './ui/IconSprite.tsx'
import { useRouter } from './shell/router.ts'
import { ErrorBoundary } from './platform/ErrorBoundary.tsx'
import './styles/app.css'

// Lazy-loaded routes and heavy surfaces
const WeeklyPlanView = lazy(() =>
  import('./modules/workout/WeeklyPlanView.tsx').then((m) => ({
    default: m.WeeklyPlanView,
  })),
)
const ExerciseDetailView = lazy(() =>
  import('./modules/workout/ExerciseDetailView.tsx').then((m) => ({
    default: m.ExerciseDetailView,
  })),
)
const ExerciseLibraryModal = lazy(() =>
  import('./modules/workout/ExerciseLibraryModal.tsx').then((m) => ({
    default: m.ExerciseLibraryModal,
  })),
)
const CardioRunner = lazy(() =>
  import('./modules/workout/CardioRunner.tsx').then((m) => ({
    default: m.CardioRunner,
  })),
)
const SettingsScreen = lazy(() =>
  import('./modules/settings/SettingsScreen.tsx').then((m) => ({
    default: m.SettingsScreen,
  })),
)
const NutritionModule = lazy(() =>
  import('./modules/nutrition/NutritionModule.tsx').then((m) => ({
    default: m.NutritionModule,
  })),
)
const MuscleAtlasDebug = lazy(() =>
  import('./modules/workout/MuscleAtlasDebug.tsx').then((m) => ({
    default: m.MuscleAtlasDebug,
  })),
)
const ProgressScreen = lazy(() =>
  import('./modules/tracking/ProgressScreen.tsx').then((m) => ({
    default: m.ProgressScreen,
  })),
)
const Styleguide = lazy(() =>
  import('./shell/Styleguide.tsx').then((m) => ({
    default: m.Styleguide,
  })),
)
const ComponentGallery = lazy(() =>
  import('./modules/gallery/ComponentGallery.tsx').then((m) => ({
    default: m.ComponentGallery,
  })),
)
const CustomScheduleModal = lazy(() =>
  import('./modules/workout/CustomScheduleModal.tsx').then((m) => ({
    default: m.CustomScheduleModal,
  })),
)
const ProgramVaultModal = lazy(() =>
  import('./modules/workout/ProgramVaultModal.tsx').then((m) => ({
    default: m.ProgramVaultModal,
  })),
)
const AiDesignerModal = lazy(() =>
  import('./modules/workout/AiDesignerModal.tsx').then((m) => ({
    default: m.AiDesignerModal,
  })),
)

function ScreenSkeleton() {
  return (
    <div
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '720px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}
      aria-busy="true"
      aria-label="جاري التحميل..."
    >
      <Skeleton height={28} width="45%" radius="control" />
      <Skeleton height={140} radius="card" />
      <Skeleton height={70} radius="card" />
      <Skeleton height={160} radius="card" />
    </div>
  )
}

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
        // Tapping the already-active tab scrolls the active screen scroller to top
        const scroller =
          document.querySelector('.screen-content') ||
          document.querySelector('.app-main') ||
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
        const raw = appStorage.getItem('maganis:active_session')
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
      } catch (err) {
        recordStorageError('maganis:active_session', err)
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
  const [showAiDesignerModal, setShowAiDesignerModal] = useState(false)
  const [showAtlasDebugModal, setShowAtlasDebugModal] = useState(false)
  const [savedProgramsList, setSavedProgramsList] = useState<
    SavedWorkoutProgram[]
  >(() => workoutStore.getSavedPrograms())

  const [activeCardioSession, setActiveCardioSession] = useState<{
    activityId: CardioActivityId
    level: CardioEffortLevel
    startTime: number
    durationMinutes: number
    weightKg: number
    pausedTotalMs: number
    isPaused: boolean
    pausedAt: number | null
    minimized?: boolean
  } | null>(() => {
    try {
      const raw = appStorage.getItem('maganis:cardio_active_session')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [isCardioRunnerOpen, setIsCardioRunnerOpen] = useState(false)

  useEffect(() => {
    const syncCardioSession = () => {
      try {
        const raw = appStorage.getItem('maganis:cardio_active_session')
        const parsed = raw ? JSON.parse(raw) : null
        setActiveCardioSession(parsed)
      } catch {
        setActiveCardioSession(null)
      }
    }

    const unsubStorage = appStorage.subscribe((e) => {
      if (e.key === null || e.key === 'maganis:cardio_active_session') {
        syncCardioSession()
      }
    })
    window.addEventListener('cardio-session-sync', syncCardioSession)
    const interval = setInterval(syncCardioSession, 1000)

    return () => {
      unsubStorage()
      window.removeEventListener('cardio-session-sync', syncCardioSession)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (
      activeCardioSession &&
      activeCardioSession.minimized &&
      !isCardioRunnerOpen
    ) {
      document.body.classList.add('with-cardio-mini-bar')
    } else {
      document.body.classList.remove('with-cardio-mini-bar')
    }
  }, [activeCardioSession, isCardioRunnerOpen])

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = appStorage.getItem('maganis:theme')
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
      appStorage.setItem('maganis:theme', theme)
    } catch (err) {
      recordStorageError('maganis:theme', err)
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const [backToastMessage, setBackToastMessage] = useState<string | null>(null)
  const [hasAppUpdate, setHasAppUpdate] = useState(false)

  const showToast = useCallback((msg: string) => {
    setBackToastMessage(msg)
    setTimeout(() => setBackToastMessage(null), 3000)
  }, [])

  useEffect(() => {
    return updateManager.subscribe((avail) => {
      setHasAppUpdate(avail)
    })
  }, [])

  useEffect(() => {
    updateManager.setWorkoutActive(Boolean(activeWorkoutDay))
  }, [activeWorkoutDay])

  useEffect(() => {
    navigationHistory.setOnShowToast((msg) => {
      setBackToastMessage(msg)
      setTimeout(() => setBackToastMessage(null), 3000)
    })
    backButtonManager.setOnShowToast(showToast)
  }, [showToast])

  // Lifecycle & Notification Router Wiring (Task N4)
  useEffect(() => {
    const cleanupLifecycle = initLifecycleCoordinator()
    const cleanupRouter = initNotificationRouter()

    const unlistenAction = onNotificationAction((target) => {
      if (target.route === 'workout_active') {
        try {
          const raw = appStorage.getItem('maganis:active_session')
          if (raw) {
            const parsed = JSON.parse(raw)
            if (parsed.programDay) {
              setActiveWorkoutDay(parsed.programDay)
              return
            }
          }
        } catch {
          // fallback
        }
        setActiveTab('workouts')
      } else if (target.route === 'cardio_runner') {
        setIsCardioRunnerOpen(true)
      } else if (target.route === 'weekly_plan') {
        setActiveTab('workouts')
      } else if (target.route === 'nutrition') {
        setActiveTab('nutrition')
      } else if (target.route === 'settings_backup') {
        setActiveTab('settings')
      }
    })

    return () => {
      cleanupLifecycle()
      cleanupRouter()
      unlistenAction()
    }
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

  const handleFactoryReset = useCallback(
    async (mode: 'keep-edits' | 'delete-all' = 'delete-all') => {
      try {
        await liveSyncManager.disable()
      } catch {
        // ignore
      }
      await executeFactoryReset(mode)
    },
    [liveSyncManager],
  )

  const doGenerateProgram = useCallback(async () => {
    if (!profile) return
    const { generateProgram } =
      await import('./modules/workout/programGenerator.ts')
    const p = generateProgram({
      goal: profile.primaryGoal,
      trainingDaysPerWeek: profile.trainingDaysPerWeek,
      injuries: profile.medical.hasIssues ? profile.medical.injuryTags : [],
      customExercises: workoutStore.getCustomExercises(),
      excludedExerciseIds: workoutStore.getDeletedExerciseIds(),
      profile,
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
    if (profile?.schedule) {
      const updated = { ...profile, schedule: {} }
      profileStore.saveProfile(updated)
      setProfile(updated)
    }
  }, [workoutStore, profile, profileStore])

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
        appStorage.removeItem('maganis:active_session')
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
      exerciseOverrides: getAllExerciseOverrides(),
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

  // Throttled pre-update snapshot: runs once per day on boot, not on every set
  useEffect(() => {
    void takePreUpdateSnapshot()
  }, [])

  const handleImported = useCallback(() => {
    setProfile(profileStore.loadProfile())
    setProgram(workoutStore.loadProgram())
    setSessions(trackingStore.loadSessions())
    setBodyLog(trackingStore.loadBodyLog())
    setDayNotes(trackingStore.loadDayNotes())
  }, [profileStore, workoutStore, trackingStore])

  const handleRestoreBackup = useCallback(
    async (data: BackupData | MaganisSnapshotV2) => {
      if ((data as MaganisSnapshotV2).format === 'maganis-snapshot') {
        const res = await applySnapshot(data as MaganisSnapshotV2)
        if (!res.success) {
          throw new Error(res.errorAr || 'فشلت استعادة النسخة الاحتياطية')
        }
      } else {
        const validation = await validateSnapshot(data)
        if (validation.ok && validation.snapshot) {
          const res = await applySnapshot(validation.snapshot)
          if (!res.success) {
            throw new Error(res.errorAr || 'فشلت استعادة النسخة الاحتياطية')
          }
        }
      }
      handleImported()
    },
    [handleImported],
  )

  // --- Styleguide dev route ---
  if (route.path === '/styleguide') {
    return (
      <div className="maganis-shell">
        <IconSprite />
        <StorageHealthBanner />
        <Suspense fallback={<ScreenSkeleton />}>
          <Styleguide />
        </Suspense>
      </div>
    )
  }

  // --- Component Gallery dev route ---
  if (route.path === '/gallery') {
    return (
      <div className="maganis-shell">
        <IconSprite />
        <StorageHealthBanner />
        <Suspense fallback={<ScreenSkeleton />}>
          <ComponentGallery />
        </Suspense>
      </div>
    )
  }

  // --- Onboarding state ---
  if (!profile || editing) {
    return (
      <div className="maganis-shell app app--fullscreen" dir="rtl">
        <IconSprite />
        <StorageHealthBanner />
        <StorageHealthBanner />
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

  // --- Today's resolved session ---
  const todayDayIndex = new Date().getDay()
  const todaySession = resolveSession(new Date(), { profile, program })
  const todayProgramDay = todaySession.programDay

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
          profile={profile}
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
            onStartCardio={(day) => {
              const weightKg =
                bodyLog?.[0]?.weightKg ?? profile?.body?.weightKg ?? 70
              const rawActivity =
                day?.cardio?.activity ?? day?.cardioConfig?.activity ?? 'walk'
              const activityAliasMap: Record<string, CardioActivityId> = {
                walking: 'walk',
                walk: 'walk',
                running: 'run',
                run: 'run',
                cycling: 'bike',
                bike: 'bike',
                swimming: 'swim',
                swim: 'swim',
                jumprope: 'jumprope',
                jump_rope: 'jumprope',
                rowing: 'rowing',
                row: 'rowing',
              }
              const activityId: CardioActivityId =
                activityAliasMap[String(rawActivity).toLowerCase()] ?? 'walk'
              const level: CardioEffortLevel =
                (day?.cardio?.effort as CardioEffortLevel) ?? 'moderate'
              const durationMinutes =
                day?.cardio?.plannedMinutes ??
                day?.cardioConfig?.plannedMinutes ??
                25
              const nextCardio = {
                activityId,
                level,
                durationMinutes,
                weightKg,
                startTime: Date.now(),
                pausedTotalMs: 0,
                isPaused: false,
                pausedAt: null,
              }
              try {
                appStorage.setItem(
                  'maganis:cardio_active_session',
                  JSON.stringify(nextCardio),
                )
              } catch {
                // ignore storage write failure
              }
              setActiveCardioSession(nextCardio)
              setIsCardioRunnerOpen(true)
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
            onGenerateProgram={handleGenerateProgram}
            onOpenAiDesigner={() => setShowAiDesignerModal(true)}
            onImportProgram={() => {
              setActiveTab('workouts')
            }}
            onSaveBackup={async () => {
              const { createBackupStore } =
                await import('./modules/backup/backupStore.ts')
              const store = createBackupStore()
              return await store.shareData(handleBackupData())
            }}
            onCreateManualProgram={() => {
              const emptyProgram: WorkoutProgram = {
                id: `prog_manual_${Date.now()}`,
                name: 'جدول تدريبي يدوي',
                splitType: 'custom',
                trainingDaysPerWeek: 3,
                primaryGoal: profile?.primaryGoal || 'hypertrophy',
                days: [
                  {
                    id: `day_${Date.now()}_0`,
                    dayIndex: 0,
                    name: 'تمرين 1',
                    labelAr: 'تمرين 1',
                    focus: 'تخصيص يدوي',
                    focusAr: 'تخصيص يدوي',
                    kind: 'strength',
                    exercises: [],
                  },
                ],
                createdAt: Date.now(),
                isCustom: true,
              }
              workoutStore.saveProgram(emptyProgram)
              setProgram(emptyProgram)
              setActiveTab('workouts')
            }}
          />
        )

      case 'workouts':
        return (
          <div className="workouts-tab">
            {showExerciseLibrary && (
              <ExerciseLibraryModal
                program={program}
                profile={profile}
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
              <Suspense fallback={null}>
                <CustomScheduleModal
                  primaryGoal={profile.primaryGoal}
                  profileDays={profile.trainingDaysPerWeek}
                  weekStartDay={profile.weekStartDay ?? 6}
                  onSaveSchedule={handleSaveCustomSchedule}
                  onClose={() => setShowCustomScheduleModal(false)}
                />
              </Suspense>
            )}

            {showProgramVaultModal && (
              <Suspense fallback={null}>
                <ProgramVaultModal
                  savedPrograms={savedProgramsList}
                  activeProgram={program}
                  onSaveCurrentProgram={handleSaveCurrentToVault}
                  onApplyProgram={handleApplyProgramFromVault}
                  onDeleteProgram={handleDeleteFromVault}
                  onRenameProgram={handleRenameInVault}
                  onClose={() => setShowProgramVaultModal(false)}
                />
              </Suspense>
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
              onOpenAiDesigner={() => setShowAiDesignerModal(true)}
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
            onOpenAiDesigner={() => setShowAiDesignerModal(true)}
            onFactoryReset={handleFactoryReset}
            customExercises={customExercisesList}
            deletedExerciseIds={deletedExerciseIds}
          />
        )
      }
    }
  }

  return (
    <ErrorBoundary route="root" onGoHome={() => setActiveTab('dashboard')}>
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
                appStorage.removeItem('maganis:active_session')
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
        <StorageHealthBanner />
        <header className="app-header" style={{ display: 'none' }}>
          <div className="maganis-header-brand">
            <img
              src={assetUrl('branding/bunyan-logo.png')}
              alt="بُنْيَان"
              className="maganis-header-mascot"
            />
            <div className="maganis-brand-title">
              <h1
                data-testid="app-title"
                lang="en"
                dir="ltr"
                style={{ fontWeight: 600 }}
              >
                Bunyan
              </h1>
              <span className="maganis-brand-subtitle">
                مدربك الرياضي والتغذوي الشخصي
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
                    color: 'var(--color-accent-text, #b83a00)',
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

        {hasAppUpdate && !activeWorkoutDay && !isNative() && (
          <div
            role="status"
            aria-live="polite"
            data-testid="app-update-banner"
            style={{
              background:
                'var(--color-primary-surface, rgba(14, 165, 233, 0.12))',
              borderBottom: '1px solid var(--color-primary, #0ea5e9)',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon
                name="refresh-cw"
                size={18}
                style={{ color: 'var(--color-primary)' }}
              />
              <span
                style={{
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                }}
              >
                تحديث جديد جاهز للتطبيق
              </span>
            </div>
            <button
              type="button"
              className="btn btn--primary btn--small"
              onClick={() => updateManager.applyUpdate()}
              style={{
                fontSize: '12.5px',
                padding: '6px 14px',
                cursor: 'pointer',
                borderRadius: 'var(--radius-control)',
                whiteSpace: 'nowrap',
              }}
            >
              تحديث الآن
            </button>
          </div>
        )}

        <main className="app-main">
          <ErrorBoundary
            route={activeTab}
            fallbackTitle={`حصلت مشكلة في قسم (${activeTab === 'dashboard' ? 'الرئيسية' : activeTab === 'workouts' ? 'التمارين' : activeTab === 'nutrition' ? 'التغذية' : activeTab === 'tracking' || activeTab === 'reports' ? 'التقدم' : 'الإعدادات'})`}
            onGoHome={() => setActiveTab('dashboard')}
          >
            <Suspense fallback={<ScreenSkeleton />}>{renderContent()}</Suspense>
          </ErrorBoundary>
        </main>

        {activeCardioSession &&
          activeCardioSession.minimized &&
          !isCardioRunnerOpen && (
            <CardioMiniBar
              activityId={activeCardioSession.activityId}
              level={activeCardioSession.level}
              startTime={activeCardioSession.startTime}
              durationMinutes={activeCardioSession.durationMinutes}
              weightKg={activeCardioSession.weightKg}
              pausedTotalMs={activeCardioSession.pausedTotalMs || 0}
              isPaused={Boolean(activeCardioSession.isPaused)}
              pausedAt={activeCardioSession.pausedAt || null}
              onOpenRunner={() => setIsCardioRunnerOpen(true)}
              onTogglePause={() => {
                const now = Date.now()
                const wasPaused = Boolean(activeCardioSession.isPaused)
                let updated
                if (wasPaused) {
                  const addedPauseMs = activeCardioSession.pausedAt
                    ? now - activeCardioSession.pausedAt
                    : 0
                  updated = {
                    ...activeCardioSession,
                    isPaused: false,
                    pausedAt: null,
                    pausedTotalMs:
                      (activeCardioSession.pausedTotalMs || 0) + addedPauseMs,
                  }
                } else {
                  updated = {
                    ...activeCardioSession,
                    isPaused: true,
                    pausedAt: now,
                  }
                }
                appStorage.setItem(
                  'maganis:cardio_active_session',
                  JSON.stringify(updated),
                )
                setActiveCardioSession(updated)
              }}
            />
          )}

        {isCardioRunnerOpen && activeCardioSession && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 'var(--z-dialog, 1400)',
              background: 'var(--color-bg, #121110)',
            }}
          >
            <Suspense fallback={<ScreenSkeleton />}>
              <CardioRunner
                activityId={activeCardioSession.activityId}
                level={activeCardioSession.level}
                durationMinutes={activeCardioSession.durationMinutes}
                weightKg={activeCardioSession.weightKg}
                onCancel={() => {
                  setIsCardioRunnerOpen(false)
                  appStorage.removeItem('maganis:cardio_active_session')
                  setActiveCardioSession(null)
                  window.dispatchEvent(new Event('cardio-session-sync'))
                }}
                onMinimize={() => {
                  setIsCardioRunnerOpen(false)
                  try {
                    const raw = appStorage.getItem(
                      'maganis:cardio_active_session',
                    )
                    if (raw) {
                      const parsed = JSON.parse(raw)
                      const next = { ...parsed, minimized: true }
                      appStorage.setItem(
                        'maganis:cardio_active_session',
                        JSON.stringify(next),
                      )
                      setActiveCardioSession(next)
                    } else {
                      setActiveCardioSession(null)
                    }
                  } catch {
                    // ignore
                  }
                }}
                onFinish={(sessionData) => {
                  setIsCardioRunnerOpen(false)
                  appStorage.removeItem('maganis:cardio_active_session')
                  setActiveCardioSession(null)
                  window.dispatchEvent(new Event('cardio-session-sync'))
                  const nowStr = new Date().toISOString().slice(0, 10)
                  const session: TrackingSession = {
                    id: `cardio-${Date.now()}`,
                    date: nowStr,
                    programDayIndex: null,
                    exercises: [],
                    notes: `جلسة كارديو: ${sessionData.activityNameAr} (${sessionData.durationMinutes} دقيقة) · الإجمالي: ${sessionData.grossKcal} سعرة`,
                    createdAt: Date.now(),
                    cardioDetails: sessionData,
                  }
                  trackingStore.saveSession(session)
                  setSessions(trackingStore.loadSessions())
                }}
              />
            </Suspense>
          </div>
        )}

        {(() => {
          const activeIndex = Math.max(
            0,
            TABS.findIndex((t) => t.id === activeTab),
          )
          const currentTab = TABS[activeIndex] || TABS[0]
          return (
            <nav
              className="bottom-nav"
              data-testid="bottom-nav"
              data-overlay="true"
              style={{ '--active-index': activeIndex } as React.CSSProperties}
            >
              <div className="bottom-nav__indicator" aria-hidden="true">
                <div className="bottom-nav__wave">
                  <svg
                    viewBox="0 0 96 26"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path d="M0 26 C16 26 24 16 34 8 C40 3 44 0 48 0 C52 0 56 3 62 8 C72 16 80 26 96 26 L96 28 L0 28 Z" />
                  </svg>
                </div>
                <div className="bottom-nav__circle">{currentTab.icon}</div>
              </div>
              <div className="bottom-nav__inner">
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
              </div>
            </nav>
          )
        })()}

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
              <Suspense fallback={<ScreenSkeleton />}>
                <MuscleAtlasDebug
                  onClose={() => setShowAtlasDebugModal(false)}
                />
              </Suspense>
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
            'تقدر دايمًا تعمل جدول جديد أو ترجّع جدول قديم من الحافظة.',
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
              appStorage.removeItem('maganis:active_session')
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

        {showAiDesignerModal && (
          <Suspense fallback={null}>
            <AiDesignerModal
              isOpen={showAiDesignerModal}
              onClose={() => setShowAiDesignerModal(false)}
              profile={profile}
              limitations={profile?.limitations}
              onSaveDraft={(prog) => {
                workoutStore.saveProgramToVault(
                  prog.title || 'مسودة برنامج',
                  prog,
                )
                setSavedProgramsList(workoutStore.getSavedPrograms())
                showToast('تم حفظ البرنامج كمسودة في خزانة البرامج')
              }}
              onSaveAndActivate={(prog) => {
                workoutStore.saveProgram(prog)
                setProgram(prog)
                showToast('تم تفعيل البرنامج التدريبي بنجاح')
              }}
              showToast={showToast}
            />
          </Suspense>
        )}

        <Toast
          message={backToastMessage}
          onDismiss={() => setBackToastMessage(null)}
        />
      </div>
    </ErrorBoundary>
  )
}
