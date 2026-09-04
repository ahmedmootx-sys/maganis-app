import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AppConfig } from './config/appConfig.ts'
import { assetUrl } from './utils/assetUrl.ts'
import { createStorage } from './lib/storage.ts'
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
} from './modules/shared/types.ts'
import type { UserProfile } from './modules/onboarding/types.ts'
import { GOALS } from './modules/onboarding/types.ts'
import { ACTIVITY_LEVELS } from './modules/onboarding/types.ts'
import { WeeklyPlanView } from './modules/workout/WeeklyPlanView.tsx'
import { CustomExerciseBuilder } from './modules/workout/CustomExerciseBuilder.tsx'
import { ExerciseLibraryModal } from './modules/workout/ExerciseLibraryModal.tsx'
import { ActiveWorkoutSession } from './modules/workout/ActiveWorkoutSession.tsx'
import { generateProgram } from './modules/workout/programGenerator.ts'
import { SessionLogger } from './modules/tracking/SessionLogger.tsx'
import { BodyWeightTracker } from './modules/tracking/BodyWeightTracker.tsx'
import { DayNotes } from './modules/tracking/DayNotes.tsx'
import { TrainingCalendar } from './modules/tracking/TrainingCalendar.tsx'
import { Reports } from './modules/reports/Reports.tsx'
import { BackupPanel } from './modules/backup/BackupPanel.tsx'
import { NutritionModule } from './modules/nutrition/NutritionModule.tsx'
import type { CustomExercise } from './modules/shared/types.ts'
import './styles/app.css'

type TabId =
  'dashboard' | 'workouts' | 'nutrition' | 'tracking' | 'reports' | 'settings'

interface AppProps {
  config: AppConfig
}

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: '📊' },
  { id: 'workouts', label: 'التدريبات', icon: '💪' },
  { id: 'nutrition', label: 'التغذية 🇪🇬', icon: '🥗' },
  { id: 'tracking', label: 'التتبع', icon: '📝' },
  { id: 'reports', label: 'التقارير', icon: '📈' },
  { id: 'settings', label: 'الإعدادات', icon: '⚙️' },
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
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)

  // --- Handlers ---

  const handleSaved = useCallback((saved: UserProfile) => {
    setProfile(saved)
    setEditing(false)
  }, [])

  const handleDeleted = useCallback(() => {
    profileStore.clearProfile()
    profileStore.clearDraft()
    workoutStore.clearProgram()
    storage.remove('tracking.sessions')
    storage.remove('tracking.body-log')
    storage.remove('tracking.notes')
    storage.remove('workout.custom-exercises')
    storage.remove('backup.last-export')
    setProfile(null)
    setEditing(false)
    setProgram(null)
    setSessions([])
    setBodyLog([])
    setDayNotes([])
    setActiveWorkoutDay(null)
    setConfirmDeleteAll(false)
    setActiveTab('dashboard')
  }, [profileStore, workoutStore, storage])

  const handleGenerateProgram = useCallback(() => {
    if (!profile) return
    const p = generateProgram({
      goal: profile.primaryGoal,
      trainingDaysPerWeek: profile.trainingDaysPerWeek,
      injuries: profile.medical.hasIssues ? profile.medical.injuryTags : [],
      customExercises: workoutStore.getCustomExercises(),
    })
    workoutStore.saveProgram(p)
    setProgram(p)
  }, [profile, workoutStore])

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

  const handleAddNote = useCallback(
    (note: DayNote) => {
      trackingStore.addDayNote(note)
      setDayNotes(trackingStore.loadDayNotes())
    },
    [trackingStore],
  )

  const handleAddCustomExercise = useCallback(
    (ex: CustomExercise) => {
      workoutStore.addCustomExercise(ex)
      setShowCustomBuilder(false)
    },
    [workoutStore],
  )

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

  // --- Active live workout session overlay ---
  if (activeWorkoutDay) {
    return (
      <div className="app app--workout-active">
        <ActiveWorkoutSession
          programDay={activeWorkoutDay}
          customExercises={workoutStore.getCustomExercises()}
          onFinish={handleSaveSession}
          onCancel={() => {
            setActiveWorkoutDay(null)
            try {
              localStorage.removeItem('maganis:active_session')
            } catch {
              // ignore
            }
          }}
        />
      </div>
    )
  }

  // --- Onboarding state ---
  if (!profile || editing) {
    return (
      <div className="app">
        <header className="app-header">
          <h1 data-testid="app-title">{config.appName}</h1>
          <span
            className="env-badge"
            data-testid="env-badge"
            data-env={config.appEnv}
          >
            {config.appEnv}
          </span>
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
            onStartWorkout={(day) => setActiveWorkoutDay(day)}
          />
        )

      case 'workouts':
        return (
          <div className="workouts-tab">
            <div className="actions-row">
              <button type="button" onClick={handleGenerateProgram}>
                {program ? '🔄 إنشاء برنامج جديد' : '⚡ إنشاء برنامج تدريبي'}
              </button>
              <button type="button" onClick={() => setShowCustomBuilder(true)}>
                ➕ تمرين مخصص
              </button>
              <button
                type="button"
                onClick={() => setShowExerciseLibrary(true)}
              >
                🔍 مكتبة التمارين
              </button>
              <button type="button" onClick={() => setShowLogger(!showLogger)}>
                📝 تسجيل يدوي
              </button>
            </div>

            {showExerciseLibrary && (
              <ExerciseLibraryModal
                customExercises={workoutStore.getCustomExercises()}
                onClose={() => setShowExerciseLibrary(false)}
              />
            )}

            {showCustomBuilder && (
              <CustomExerciseBuilder
                onSave={handleAddCustomExercise}
                onCancel={() => setShowCustomBuilder(false)}
              />
            )}

            {showLogger && (
              <SessionLogger
                programDay={todayProgramDay}
                dayIndex={todayDayIndex}
                onSave={handleSaveSession}
              />
            )}

            {program ? (
              <WeeklyPlanView
                program={program}
                customExercises={workoutStore.getCustomExercises()}
                userInjuries={
                  profile?.medical.hasIssues ? profile.medical.injuryTags : []
                }
                onStartRoutine={(day) => setActiveWorkoutDay(day)}
                onUpdateProgram={(updated) => {
                  workoutStore.saveProgram(updated)
                  setProgram(updated)
                }}
              />
            ) : (
              <div className="card">
                <p className="muted">
                  لم يتم إنشاء برنامج بعد. اضغط "إنشاء برنامج تدريبي".
                </p>
              </div>
            )}
          </div>
        )

      case 'nutrition':
        return <NutritionModule profile={profile} />

      case 'tracking':
        return (
          <div className="tracking-tab">
            <TrainingCalendar sessions={sessions} />
            <BodyWeightTracker bodyLog={bodyLog} onAdd={handleAddWeight} />
            <DayNotes notes={dayNotes} onAdd={handleAddNote} />
          </div>
        )

      case 'reports':
        return <Reports sessions={sessions} bodyLog={bodyLog} />

      case 'settings': {
        if (!profile) return null
        const goalLabel =
          GOALS.find((g) => g.value === profile.primaryGoal)?.labelAr ?? '—'
        const activity = ACTIVITY_LEVELS.find(
          (a) => a.value === profile.body.activityLevel,
        )
        return (
          <div className="settings-tab">
            <div className="card">
              <h2>الملف الشخصي</h2>
              <ul className="summary-list">
                <li>
                  <span>الهدف الأساسي</span>
                  <strong>{goalLabel}</strong>
                </li>
                <li>
                  <span>أيام التمرين</span>
                  <strong>{profile.trainingDaysPerWeek}</strong>
                </li>
                <li>
                  <span>الجنس</span>
                  <strong>
                    {profile.body.sex === 'male' ? 'ذكر' : 'أنثى'}
                  </strong>
                </li>
                <li>
                  <span>العمر</span>
                  <strong>{profile.body.age} سنة</strong>
                </li>
                <li>
                  <span>الطول</span>
                  <strong>{profile.body.heightCm} سم</strong>
                </li>
                <li>
                  <span>الوزن</span>
                  <strong>{profile.body.weightKg} كجم</strong>
                </li>
                <li>
                  <span>مستوى النشاط</span>
                  <strong>{activity?.labelAr ?? '—'}</strong>
                </li>
              </ul>
              <div className="actions-row">
                <button type="button" onClick={() => setEditing(true)}>
                  تعديل بياناتي
                </button>
              </div>
            </div>

            <BackupPanel
              backupData={handleBackupData}
              onImported={handleImported}
              onRestore={handleRestoreBackup}
            />

            <div className="card">
              <h2>عن التطبيق</h2>
              <p>مجانص — الإصدار 0.2.0</p>
              <p className="muted">مدربك الشخصي وخبير التغذية على جهازك.</p>
            </div>

            <div className="card settings-tab__danger">
              <h2>منطقة الخطر</h2>
              {confirmDeleteAll ? (
                <>
                  <p style={{ color: 'var(--danger)' }}>
                    ⚠️ سيتم حذف جميع بياناتك نهائياً. هذا الإجراء لا يمكن
                    التراجع عنه.
                  </p>
                  <div className="actions-row">
                    <button
                      type="button"
                      className="danger"
                      onClick={handleDeleted}
                    >
                      متأكد — احذف كل شيء
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteAll(false)}
                    >
                      إلغاء
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  className="ghost-danger"
                  onClick={() => setConfirmDeleteAll(true)}
                >
                  حذف كل البيانات
                </button>
              )}
            </div>
          </div>
        )
      }
    }
  }

  return (
    <div className="app app--shell">
      <header className="app-header">
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
        <span
          className="env-badge"
          data-testid="env-badge"
          data-env={config.appEnv}
        >
          {config.appEnv}
        </span>
      </header>

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
    </div>
  )
}
