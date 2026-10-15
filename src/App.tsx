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
import { GOALS } from './modules/onboarding/types.ts'
import { ACTIVITY_LEVELS } from './modules/onboarding/types.ts'
import { WeeklyPlanView } from './modules/workout/WeeklyPlanView.tsx'
import { CustomExerciseBuilder } from './modules/workout/CustomExerciseBuilder.tsx'
import { ExerciseLibraryModal } from './modules/workout/ExerciseLibraryModal.tsx'
import { CustomScheduleModal } from './modules/workout/CustomScheduleModal.tsx'
import { ProgramVaultModal } from './modules/workout/ProgramVaultModal.tsx'
import { ActiveWorkoutSession } from './modules/workout/ActiveWorkoutSession.tsx'
import { formatTime } from './modules/workout/workoutUtils.ts'
import { generateProgram } from './modules/workout/programGenerator.ts'
import { SessionLogger } from './modules/tracking/SessionLogger.tsx'
import { BodyWeightTracker } from './modules/tracking/BodyWeightTracker.tsx'
import { DayNotes } from './modules/tracking/DayNotes.tsx'
import { TrainingCalendar } from './modules/tracking/TrainingCalendar.tsx'
import { Reports } from './modules/reports/Reports.tsx'
import { SettingsScreen } from './modules/settings/SettingsScreen.tsx'
import { NutritionModule } from './modules/nutrition/NutritionModule.tsx'
import { MuscleAtlasDebug } from './modules/workout/MuscleAtlasDebug.tsx'
import { ProgressScreen } from './modules/tracking/ProgressScreen.tsx'
import { Toast } from './components/Toast.tsx'
import {
  IconUser,
  IconDumbbell,
  IconUtensils,
  IconClipboard,
  IconTrendingUp,
  IconSettings,
} from './components/Icons.tsx'
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
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
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

  const handleFactoryReset = useCallback(() => {
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
    setConfirmDeleteAll(false)
    setActiveTab('dashboard')
  }, [profileStore, workoutStore, storage])

  const handleGenerateProgram = useCallback(() => {
    if (!profile) return
    if (program && (program.isLocked || program.isCustom)) {
      const confirmed = window.confirm(
        '⚠️ لديك جدول تدريبي مخصص أو مقفل! هل أنت متأكد من إنشاء جدول تلقائي جديد واستبدال الحالي؟\n(ننصح بحفظ جدولك الحالي في "حافظة الجداول 📁" أولاً)',
      )
      if (!confirmed) return
    }
    const p = generateProgram({
      goal: profile.primaryGoal,
      trainingDaysPerWeek: profile.trainingDaysPerWeek,
      injuries: profile.medical.hasIssues ? profile.medical.injuryTags : [],
      customExercises: workoutStore.getCustomExercises(),
      excludedExerciseIds: workoutStore.getDeletedExerciseIds(),
    })
    workoutStore.saveProgram(p)
    setProgram(p)
  }, [profile, program, workoutStore])

  const handleSaveCustomSchedule = useCallback(
    (customProgram: WorkoutProgram) => {
      workoutStore.saveProgram(customProgram)
      setProgram(customProgram)
      setShowCustomScheduleModal(false)
    },
    [workoutStore],
  )

  const handleDeleteProgram = useCallback(() => {
    const confirmed = window.confirm(
      'هل أنت متأكد من حذف الجدول التدريبي بالكامل؟ يمكنك إنشاء جدول جديد أو استرجاعه من الحافظة في أي وقت.',
    )
    if (!confirmed) return
    workoutStore.clearProgram()
    setProgram(null)
  }, [workoutStore])

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
      const updated = current.filter((n) => !(n.date === date && n.note === noteText))
      trackingStore.saveDayNotes(updated)
      setDayNotes(updated)
    },
    [trackingStore],
  )

  const handleSaveCustomExercise = useCallback(
    (ex: CustomExercise) => {
      if (editingCustomExercise) {
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

  // Live File Auto-Sync whenever data changes
  const [liveSyncManager] = useState(() => createLiveFileSyncManager())
  useEffect(() => {
    liveSyncManager.init()
  }, [liveSyncManager])

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

  // --- Onboarding state ---
  if (!profile || editing) {
    return (
      <div className="app">
        <header className="app-header">
          <h1 data-testid="app-title">{config.appName}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span
              className="env-badge"
              data-testid="env-badge"
              data-env={config.appEnv}
            >
              {config.appEnv}
            </span>
          </div>
        </header>
        <main className="app-main">
          <OnboardingWizard
            store={profileStore}
            initialProfile={profile}
            onSaved={handleSaved}
            onCancel={profile ? () => setEditing(false) : undefined}
          />
        </main>
        <footer className="app-footer">
          تطبيق offline-first — كل بياناتك محفوظة على جهازك فقط
        </footer>
      </div>
    )
  }

  // --- Today's program day ---
  const todayDayIndex = new Date().getDay()
  const todayProgramDay =
    program?.days.find((d) => d.dayIndex === todayDayIndex) ?? null

  // --- Render active tab content ---
  function renderContent() {
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
              customExercises={workoutStore.getCustomExercises()}
              userInjuries={
                profile?.medical.hasIssues ? profile.medical.injuryTags : []
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
              onOpenLibrary={() => setShowExerciseLibrary(true)}
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
        className="app app--shell"
        style={{ display: isWorkoutSessionExpanded ? 'none' : 'flex' }}
      >
        <header className="app-header" style={{ display: 'none' }}>
          <div className="maganis-header-brand">
            <img
              src={assetUrl('branding/maganis-mascot-inner.png')}
              alt="د. مجانص"
              className="maganis-header-mascot"
            />
            <div className="maganis-brand-title">
              <h1 data-testid="app-title">{config.appName}</h1>
              <span className="maganis-brand-subtitle">
                💪 الطبيب والمدرب الرياضي الشخصي
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span
              className="env-badge"
              data-testid="env-badge"
              data-env={config.appEnv}
            >
              {config.appEnv}
            </span>
          </div>
        </header>

        {activeWorkoutDay && !isWorkoutSessionExpanded && (
          <div
            className="active-workout-sticky-banner"
            data-testid="active-workout-sticky-banner"
          >
            <div className="banner-info-section">
              <span className="banner-pulse-dot" />
              <div className="banner-timer-badge">
                ⏱️ {formatTime(activeSessionSeconds)}
              </div>
              <div className="banner-text">
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
                📲 العودة للجلسة
              </button>
              <button
                type="button"
                className="button-success small"
                onClick={() => setIsWorkoutSessionExpanded(true)}
              >
                🏁 إنهاء وحفظ
              </button>
              <button
                type="button"
                className="ghost-danger tiny"
                onClick={() => {
                  const confirmed = window.confirm(
                    'هل أنت متأكد من إلغاء جلسة التمرين الحالية؟ سيتم مسح بيانات هذه الجلسة.',
                  )
                  if (confirmed) {
                    setActiveWorkoutDay(null)
                    setIsWorkoutSessionExpanded(false)
                    try {
                      localStorage.removeItem('maganis:active_session')
                    } catch {
                      // ignore
                    }
                  }
                }}
              >
                ✕ إلغاء
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
              className={`bottom-nav__item${activeTab === tab.id ? ' bottom-nav__item--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="bottom-nav__icon">{tab.icon}</span>
              <span className="bottom-nav__label">{tab.label}</span>
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

        <Toast
          message={backToastMessage}
          icon="👈"
          onDismiss={() => setBackToastMessage(null)}
        />
      </div>
    </>
  )
}
