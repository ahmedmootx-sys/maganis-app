import { useState, useEffect } from 'react'
import type {
  UserProfile,
  Goal,
  ActivityLevel,
} from '../onboarding/types.ts'
import { GOALS, ACTIVITY_LEVELS } from '../onboarding/types.ts'
import type { BackupData } from '../shared/types.ts'
import { TopBar } from '../../components/TopBar.tsx'
import { KeyValueList, type KeyValueItem } from '../../components/KeyValueList.tsx'
import { ListRow } from '../../components/ListRow.tsx'
import { Select } from '../../components/Select.tsx'
import { Sheet } from '../../components/Sheet.tsx'
import { ConfirmSheet } from '../../components/ConfirmSheet.tsx'
import { BackupPanel } from '../backup/BackupPanel.tsx'
import {
  IconSun,
  IconMoon,
  IconMonitor,
  IconEdit,
  IconSettings,
  IconCalendar,
} from '../../components/Icons.tsx'

export type ThemeMode = 'auto' | 'light' | 'dark'

export interface SettingsScreenProps {
  profile: UserProfile | null
  onUpdateProfile: (updated: UserProfile) => void
  onEditProfile: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  themeMode?: ThemeMode
  onChangeThemeMode?: (mode: ThemeMode) => void
  backupData: () => BackupData
  onImported?: () => void
  onRestore?: (data: BackupData) => void
  onOpenAtlasDebug: () => void
  onFactoryReset: () => void
}

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', labelAr: 'مبتدئ', labelEn: 'Beginner (أقل من سنة)' },
  { value: 'intermediate', labelAr: 'متوسط', labelEn: 'Intermediate (1 - 3 سنوات)' },
  { value: 'advanced', labelAr: 'متقدم', labelEn: 'Advanced (أكثر من 3 سنوات)' },
]

const LOCATION_OPTIONS = [
  { value: 'gym', labelAr: 'صالة ألعاب رياضية (الجيم)', labelEn: 'Gym' },
  { value: 'home', labelAr: 'المنزل', labelEn: 'Home' },
  { value: 'both', labelAr: 'كلاهما (الجيم والمنزل)', labelEn: 'Both' },
]

const WEEK_START_OPTIONS = [
  { value: '6', labelAr: 'السبت', labelEn: 'Saturday (شائع في العالم العربي)' },
  { value: '0', labelAr: 'الأحد', labelEn: 'Sunday' },
  { value: '1', labelAr: 'الإثنين', labelEn: 'Monday' },
]

const GOAL_OPTIONS = GOALS.map((g) => ({
  value: g.value,
  labelAr: g.labelAr,
  labelEn: g.hintAr,
}))

const ACTIVITY_OPTIONS = ACTIVITY_LEVELS.map((a) => ({
  value: a.value,
  labelAr: a.labelAr,
  labelEn: a.descAr,
}))

export function SettingsScreen({
  profile,
  onUpdateProfile,
  onEditProfile,
  theme,
  onToggleTheme,
  themeMode: propThemeMode,
  onChangeThemeMode,
  backupData,
  onImported,
  onRestore,
  onOpenAtlasDebug,
  onFactoryReset,
}: SettingsScreenProps) {
  // Theme mode local or prop
  const [currentThemeMode, setCurrentThemeMode] = useState<ThemeMode>(() => {
    if (propThemeMode) return propThemeMode
    try {
      const saved = localStorage.getItem('maganis:theme_mode')
      if (saved === 'auto' || saved === 'light' || saved === 'dark') return saved
    } catch {
      // ignore
    }
    return theme === 'dark' ? 'dark' : 'light'
  })

  // Edit Profile Modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [showConfirmReset, setShowConfirmReset] = useState(false)

  // Edit form state
  const [editName, setEditName] = useState(profile?.name ?? '')
  const [editGoal, setEditGoal] = useState<Goal>(profile?.primaryGoal ?? 'hypertrophy')
  const [editDays, setEditDays] = useState(profile?.trainingDaysPerWeek ?? 4)
  const [editExperience, setEditExperience] = useState<string>(
    profile?.experienceLevel ?? 'intermediate',
  )
  const [editLocation, setEditLocation] = useState<string>(
    profile?.trainingLocation ?? 'gym',
  )
  const [editRestrictions, setEditRestrictions] = useState(
    profile?.restrictions ?? '',
  )
  const [editSex, setEditSex] = useState<'male' | 'female'>(
    profile?.body.sex ?? 'male',
  )
  const [editAge, setEditAge] = useState(profile?.body.age ?? 25)
  const [editHeight, setEditHeight] = useState(profile?.body.heightCm ?? 175)
  const [editWeight, setEditWeight] = useState(profile?.body.weightKg ?? 75)
  const [editActivity, setEditActivity] = useState<ActivityLevel>(
    profile?.body.activityLevel ?? 'moderate',
  )

  // Sync edit form with profile when modal opens
  useEffect(() => {
    if (profile) {
      setEditName(profile.name ?? '')
      setEditGoal(profile.primaryGoal)
      setEditDays(profile.trainingDaysPerWeek)
      setEditExperience(profile.experienceLevel ?? 'intermediate')
      setEditLocation(profile.trainingLocation ?? 'gym')
      setEditRestrictions(profile.restrictions ?? '')
      setEditSex(profile.body.sex)
      setEditAge(profile.body.age)
      setEditHeight(profile.body.heightCm)
      setEditWeight(profile.body.weightKg)
      setEditActivity(profile.body.activityLevel)
    }
  }, [profile, showEditModal])

  function handleThemeChange(newMode: ThemeMode) {
    setCurrentThemeMode(newMode)
    try {
      localStorage.setItem('maganis:theme_mode', newMode)
    } catch {
      // ignore
    }

    if (onChangeThemeMode) {
      onChangeThemeMode(newMode)
    } else {
      let resolvedTheme: 'light' | 'dark' = 'light'
      if (newMode === 'auto') {
        resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
      } else {
        resolvedTheme = newMode
      }
      document.documentElement.setAttribute('data-theme', resolvedTheme)
      try {
        localStorage.setItem('maganis:theme', resolvedTheme)
      } catch {
        // ignore
      }
      if (resolvedTheme !== theme) {
        onToggleTheme()
      }
    }
  }

  function handleWeekStartChange(val: string) {
    if (!profile) return
    const day = parseInt(val, 10)
    if (!isNaN(day)) {
      onUpdateProfile({
        ...profile,
        weekStartDay: day,
        updatedAt: Date.now(),
      })
    }
  }

  function handleSaveProfileEdits() {
    if (!profile) return
    const updated: UserProfile = {
      ...profile,
      name: editName.trim() || undefined,
      primaryGoal: editGoal,
      goals: [editGoal],
      trainingDaysPerWeek: editDays,
      experienceLevel: (editExperience as 'beginner' | 'intermediate' | 'advanced') || undefined,
      trainingLocation: (editLocation as 'gym' | 'home' | 'both') || undefined,
      restrictions: editRestrictions.trim() || undefined,
      body: {
        ...profile.body,
        sex: editSex,
        age: Number(editAge),
        heightCm: Number(editHeight),
        weightKg: Number(editWeight),
        activityLevel: editActivity,
      },
      updatedAt: Date.now(),
    }
    onUpdateProfile(updated)
    setShowEditModal(false)
  }

  const isDebugMode =
    typeof window !== 'undefined' &&
    window.location.search.includes('debug=1')

  const goalInfo = GOALS.find((g) => g.value === profile?.primaryGoal)
  const activityInfo = ACTIVITY_LEVELS.find(
    (a) => a.value === profile?.body.activityLevel,
  )
  const experienceLabel =
    EXPERIENCE_OPTIONS.find((e) => e.value === profile?.experienceLevel)
      ?.labelAr ?? '—'
  const locationLabel =
    LOCATION_OPTIONS.find((l) => l.value === profile?.trainingLocation)
      ?.labelAr ?? '—'

  // Profile KeyValue Items
  const profileItems: KeyValueItem[] = []
  if (profile) {
    if (profile.name) {
      profileItems.push({
        id: 'name',
        label: 'الاسم',
        value: profile.name,
      })
    }
    profileItems.push(
      {
        id: 'goal',
        label: 'الهدف الأساسي',
        value: goalInfo?.labelAr ?? '—',
      },
      {
        id: 'training-days',
        label: 'أيام التمرين',
        value: `${profile.trainingDaysPerWeek} أيام / أسبوع`,
      },
      {
        id: 'sex',
        label: 'الجنس',
        value: profile.body.sex === 'male' ? 'ذكر' : 'أنثى',
      },
      {
        id: 'age',
        label: 'العمر',
        value: `${profile.body.age} سنة`,
      },
      {
        id: 'height',
        label: 'الطول',
        value: `${profile.body.heightCm} سم`,
      },
      {
        id: 'weight',
        label: 'الوزن',
        value: `${profile.body.weightKg} كجم`,
      },
      {
        id: 'activity',
        label: 'مستوى النشاط',
        value: activityInfo?.labelAr ?? '—',
      },
    )
    if (profile.experienceLevel) {
      profileItems.push({
        id: 'experience',
        label: 'مستوى الخبرة',
        value: experienceLabel,
      })
    }
    if (profile.trainingLocation) {
      profileItems.push({
        id: 'location',
        label: 'مكان التدريب',
        value: locationLabel,
      })
    }
    if (profile.restrictions) {
      profileItems.push({
        id: 'restrictions',
        label: 'إصابات أو قيود',
        value: profile.restrictions,
      })
    }
  }

  // About App KeyValue Items
  const aboutItems: KeyValueItem[] = [
    {
      id: 'app-version',
      label: 'الإصدار',
      value: '0.2.0',
      secondaryIsLtr: true,
    },
    {
      id: 'app-type',
      label: 'طبيعة التخزين',
      value: 'محلي بالكامل (Local-first Offline)',
    },
    {
      id: 'anatomical-model',
      label: 'النموذج التشريحي',
      value: 'BodyParts3D, © DBCLS',
      secondary: 'CC BY-SA 2.1 JP',
      secondaryIsLtr: true,
    },
    {
      id: 'icons-license',
      label: 'حزمة الأيقونات',
      value: 'Lucide Icons',
      secondary: 'ISC License',
      secondaryIsLtr: true,
    },
  ]

  return (
    <div
      className="settings-screen"
      data-testid="settings-screen"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        paddingBottom: '48px',
      }}
    >
      {/* TopBar */}
      <TopBar title="الإعدادات" />

      <div
        className="screen-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          padding: '0 16px',
          maxWidth: '720px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Section 1: Profile */}
        <section className="settings-section">
          <h2 className="section-title">الملف الشخصي</h2>
          <div className="card" style={{ padding: '16px' }}>
            <KeyValueList items={profileItems} />
            <div style={{ marginTop: '16px' }}>
              <button
                type="button"
                className="ghost-secondary full-width"
                onClick={() => setShowEditModal(true)}
                style={{
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '15px',
                  fontWeight: 700,
                }}
              >
                <IconEdit size={18} />
                تعديل بياناتي
              </button>
            </div>
          </div>
        </section>

        {/* Section 2: Preferences */}
        <section className="settings-section">
          <h2 className="section-title">التفضيلات</h2>
          <div
            className="card"
            style={{
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            {/* Theme Selector (Segmented) */}
            <div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  marginBottom: '4px',
                }}
              >
                المظهر والثيم
              </div>
              <p
                className="muted"
                style={{ fontSize: '12.5px', margin: '0 0 10px 0' }}
              >
                التحكم في الوضع الليلي والنهاري للتطبيق
              </p>
              <div
                className="segmented-control"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  background: 'var(--card-subtle)',
                  padding: '4px',
                  borderRadius: '12px',
                  border: '1px solid var(--line)',
                  gap: '4px',
                }}
              >
                <button
                  type="button"
                  onClick={() => handleThemeChange('auto')}
                  style={{
                    height: '42px',
                    borderRadius: '8px',
                    border: 'none',
                    background:
                      currentThemeMode === 'auto'
                        ? 'var(--card-bg)'
                        : 'transparent',
                    color:
                      currentThemeMode === 'auto'
                        ? 'var(--ink)'
                        : 'var(--muted)',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow:
                      currentThemeMode === 'auto'
                        ? '0 1px 3px rgba(0,0,0,0.1)'
                        : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <IconMonitor size={16} />
                  تلقائي
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  style={{
                    height: '42px',
                    borderRadius: '8px',
                    border: 'none',
                    background:
                      currentThemeMode === 'light'
                        ? 'var(--card-bg)'
                        : 'transparent',
                    color:
                      currentThemeMode === 'light'
                        ? 'var(--ink)'
                        : 'var(--muted)',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow:
                      currentThemeMode === 'light'
                        ? '0 1px 3px rgba(0,0,0,0.1)'
                        : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <IconSun size={16} />
                  فاتح
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  style={{
                    height: '42px',
                    borderRadius: '8px',
                    border: 'none',
                    background:
                      currentThemeMode === 'dark'
                        ? 'var(--card-bg)'
                        : 'transparent',
                    color:
                      currentThemeMode === 'dark'
                        ? 'var(--ink)'
                        : 'var(--muted)',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow:
                      currentThemeMode === 'dark'
                        ? '0 1px 3px rgba(0,0,0,0.1)'
                        : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <IconMoon size={16} />
                  داكن
                </button>
              </div>
            </div>

            {/* Week Start Day */}
            <div>
              <Select
                id="settings-week-start"
                label="بداية الأسبوع التدريبي"
                value={String(profile?.weekStartDay ?? 6)}
                onChange={handleWeekStartChange}
                options={WEEK_START_OPTIONS}
              />
              <p
                className="muted"
                style={{ fontSize: '12px', margin: '4px 0 0 0' }}
              >
                يحدد اليوم الأول في شريط الأيام وجدول التمارين الأسبوعي.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Data & Sync */}
        <section className="settings-section">
          <h2 className="section-title">البيانات والمزامنة</h2>
          <BackupPanel
            backupData={backupData}
            onImported={onImported}
            onRestore={onRestore}
          />
        </section>

        {/* Section 4: About App */}
        <section className="settings-section">
          <h2 className="section-title">حول التطبيق</h2>
          <div className="card" style={{ padding: '16px' }}>
            <KeyValueList items={aboutItems} />
          </div>
        </section>

        {/* Section 5: Developer Debug Inspector (debug=1 only) */}
        {isDebugMode && (
          <section className="settings-section">
            <h2 className="section-title">أدوات المطور والتصحيح</h2>
            <div className="card" style={{ padding: '8px' }}>
              <ListRow
                leading={<IconSettings size={20} />}
                title="أداة فحص الرؤوس العضلية (Muscle Atlas Inspector)"
                secondary="استعراض الرؤوس العضلية الـ 48 تشريحياً والتأكد من حدود كل رأس عضلي"
                onClick={onOpenAtlasDebug}
              />
            </div>
          </section>
        )}

        {/* Section 6: Danger Zone */}
        <section className="settings-section">
          <h2 className="section-title" style={{ color: 'var(--danger)' }}>
            منطقة الخطر
          </h2>
          <div
            className="card"
            style={{
              padding: '16px',
              border: '1px solid var(--danger-line)',
            }}
          >
            <p
              style={{
                fontSize: '13.5px',
                color: 'var(--muted)',
                margin: '0 0 14px 0',
                lineHeight: 1.6,
              }}
            >
              إعادة ضبط التطبيق بالكامل ومسح كافة البيانات والجداول التدريبية وسجلات التغذية واستعادة الحالة الأولية:
            </p>
            <button
              type="button"
              className="danger full-width"
              onClick={() => setShowConfirmReset(true)}
              style={{
                height: '48px',
                fontWeight: 800,
                fontSize: '14.5px',
              }}
            >
              حذف كل البيانات وإعادة ضبط المصنع
            </button>
          </div>
        </section>
      </div>

      {/* Edit Profile Sheet */}
      <Sheet
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="تعديل بيانات الملف الشخصي"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            padding: '8px 0 24px',
          }}
        >
          {/* Name */}
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="edit-profile-name" style={{ fontSize: '13.5px', fontWeight: 700 }}>
              الاسم (اختياري)
            </label>
            <input
              id="edit-profile-name"
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="مثال: أحمد"
              style={{
                height: '48px',
                width: '100%',
                borderRadius: '10px',
                border: '1.5px solid var(--line)',
                padding: '0 14px',
                fontSize: '15px',
                background: 'var(--card-bg)',
                color: 'var(--ink)',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Primary Goal */}
          <Select
            id="edit-profile-goal"
            label="الهدف الأساسي"
            value={editGoal}
            onChange={(val) => setEditGoal(val as Goal)}
            options={GOAL_OPTIONS}
          />

          {/* Training Days */}
          <Select
            id="edit-profile-days"
            label="أيام التمرين في الأسبوع"
            value={String(editDays)}
            onChange={(val) => setEditDays(Number(val))}
            options={[
              { value: '2', labelAr: 'يومان في الأسبوع' },
              { value: '3', labelAr: '3 أيام في الأسبوع' },
              { value: '4', labelAr: '4 أيام في الأسبوع' },
              { value: '5', labelAr: '5 أيام في الأسبوع' },
              { value: '6', labelAr: '6 أيام في الأسبوع' },
            ]}
          />

          {/* Experience Level */}
          <Select
            id="edit-profile-experience"
            label="مستوى الخبرة في التدريب"
            value={editExperience}
            onChange={(val) => setEditExperience(val)}
            options={EXPERIENCE_OPTIONS}
          />

          {/* Training Location */}
          <Select
            id="edit-profile-location"
            label="مكان التدريب المفضل"
            value={editLocation}
            onChange={(val) => setEditLocation(val)}
            options={LOCATION_OPTIONS}
          />

          {/* Restrictions / Injuries */}
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="edit-profile-restrictions" style={{ fontSize: '13.5px', fontWeight: 700 }}>
              إصابات سابقة أو قيود حركية (اختياري)
            </label>
            <textarea
              id="edit-profile-restrictions"
              value={editRestrictions}
              onChange={(e) => setEditRestrictions(e.target.value)}
              placeholder="مثال: آلام أسفل الظهر، خشونة بالركبة..."
              rows={2}
              style={{
                width: '100%',
                borderRadius: '10px',
                border: '1.5px solid var(--line)',
                padding: '10px 14px',
                fontSize: '14px',
                background: 'var(--card-bg)',
                color: 'var(--ink)',
                boxSizing: 'border-box',
                resize: 'none',
              }}
            />
          </div>

          {/* Sex */}
          <Select
            id="edit-profile-sex"
            label="الجنس"
            value={editSex}
            onChange={(val) => setEditSex(val as 'male' | 'female')}
            options={[
              { value: 'male', labelAr: 'ذكر' },
              { value: 'female', labelAr: 'أنثى' },
            ]}
          />

          {/* Body stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="edit-profile-age" style={{ fontSize: '13px', fontWeight: 700 }}>
                العمر
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="edit-profile-age"
                  type="number"
                  min="14"
                  max="99"
                  value={editAge}
                  onChange={(e) => setEditAge(Number(e.target.value))}
                  style={{
                    height: '48px',
                    width: '100%',
                    borderRadius: '10px',
                    border: '1.5px solid var(--line)',
                    padding: '0 10px',
                    fontSize: '15px',
                    background: 'var(--card-bg)',
                    color: 'var(--ink)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="edit-profile-height" style={{ fontSize: '13px', fontWeight: 700 }}>
                الطول (سم)
              </label>
              <input
                id="edit-profile-height"
                type="number"
                min="100"
                max="240"
                value={editHeight}
                onChange={(e) => setEditHeight(Number(e.target.value))}
                style={{
                  height: '48px',
                  width: '100%',
                  borderRadius: '10px',
                  border: '1.5px solid var(--line)',
                  padding: '0 10px',
                  fontSize: '15px',
                  background: 'var(--card-bg)',
                  color: 'var(--ink)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="edit-profile-weight" style={{ fontSize: '13px', fontWeight: 700 }}>
                الوزن (كجم)
              </label>
              <input
                id="edit-profile-weight"
                type="number"
                min="35"
                max="300"
                step="0.5"
                value={editWeight}
                onChange={(e) => setEditWeight(Number(e.target.value))}
                style={{
                  height: '48px',
                  width: '100%',
                  borderRadius: '10px',
                  border: '1.5px solid var(--line)',
                  padding: '0 10px',
                  fontSize: '15px',
                  background: 'var(--card-bg)',
                  color: 'var(--ink)',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Activity Level */}
          <Select
            id="edit-profile-activity"
            label="مستوى النشاط اليومي"
            value={editActivity}
            onChange={(val) => setEditActivity(val as ActivityLevel)}
            options={ACTIVITY_OPTIONS}
          />

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              className="btn-primary-action full-width"
              onClick={handleSaveProfileEdits}
              style={{ height: '48px', fontSize: '15px', fontWeight: 800 }}
            >
              حفظ التعديلات
            </button>
            <button
              type="button"
              className="ghost-secondary full-width"
              onClick={() => {
                setShowEditModal(false)
                onEditProfile()
              }}
              style={{ height: '44px', fontSize: '13.5px' }}
            >
              إعادة التهيئة الشاملة (معالج البداية)
            </button>
          </div>
        </div>
      </Sheet>

      {/* Confirm Factory Reset */}
      <ConfirmSheet
        isOpen={showConfirmReset}
        onClose={() => setShowConfirmReset(false)}
        onConfirm={onFactoryReset}
        title="تأكيد إعادة ضبط المصنع الشاملة"
        message="تحذير نهائي: سيتم مسح حسابك والجدول التدريبي والتمارين المخصصة وكل سجلات التغذية والوزن بشكل نهائي، وسيعود التطبيق كما لو كنت تفتحه لأول مرة. لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف كل شيء والبدء من جديد"
        cancelLabel="إلغاء التراجع"
        isDestructive
      />
    </div>
  )
}
