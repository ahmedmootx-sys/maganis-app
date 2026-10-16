import { useState, useEffect } from 'react'
import type { UserProfile, Goal } from '../onboarding/types.ts'
import { GOALS } from '../onboarding/types.ts'
import {
  LIFESTYLE_OPTIONS,
  type LifestyleLevel,
  mapLifestyleToLegacyActivity,
  mapLegacyActivityToLifestyle,
} from '../nutrition/nutritionEngine.ts'
import type { BackupData } from '../shared/types.ts'
import {
  TopBar,
  Section,
  Card,
  KeyValueList,
  ListRow,
  Select,
  Sheet,
  ConfirmSheet,
  Segmented,
  Button,
  Field,
  Icon,
  Callout,
} from '../../ui'
import { BackupPanel } from '../backup/BackupPanel.tsx'

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
  { value: 'beginner', labelAr: 'مبتدئ' },
  { value: 'intermediate', labelAr: 'متوسط' },
  { value: 'advanced', labelAr: 'متقدم' },
]

const LOCATION_OPTIONS = [
  { value: 'gym', labelAr: 'جيم' },
  { value: 'home', labelAr: 'منزل' },
  { value: 'both', labelAr: 'الاثنان' },
]

const WEEK_START_OPTIONS = [
  { value: '6', labelAr: 'السبت' },
  { value: '0', labelAr: 'الأحد' },
  { value: '1', labelAr: 'الإثنين' },
]

const GOAL_OPTIONS = GOALS.map((g) => ({
  value: g.value,
  labelAr: g.labelAr,
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
  const [currentThemeMode, setCurrentThemeMode] = useState<ThemeMode>(() => {
    if (propThemeMode) return propThemeMode
    try {
      const saved = localStorage.getItem('maganis:theme_mode')
      if (saved === 'auto' || saved === 'light' || saved === 'dark')
        return saved
    } catch {
      // ignore
    }
    return 'auto'
  })

  useEffect(() => {
    if (currentThemeMode === 'auto') {
      const isDark =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      if ((isDark && theme !== 'dark') || (!isDark && theme !== 'light')) {
        onToggleTheme()
      }
    }
  }, [currentThemeMode, theme, onToggleTheme])

  function handleThemeChange(mode: ThemeMode) {
    setCurrentThemeMode(mode)
    try {
      localStorage.setItem('maganis:theme_mode', mode)
    } catch {
      // ignore
    }
    onChangeThemeMode?.(mode)

    if (mode === 'light' && theme !== 'light') {
      onToggleTheme()
    } else if (mode === 'dark' && theme !== 'dark') {
      onToggleTheme()
    } else if (mode === 'auto') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (isDark && theme !== 'dark') onToggleTheme()
      if (!isDark && theme !== 'light') onToggleTheme()
    }
  }

  // --- Profile Edit State ---
  const [showEditModal, setShowEditModal] = useState(false)
  const [editName, setEditName] = useState(profile?.name ?? '')
  const [editGoal, setEditGoal] = useState<Goal>(
    profile?.primaryGoal ?? 'hypertrophy',
  )
  const [editDays, setEditDays] = useState(profile?.trainingDaysPerWeek ?? 4)
  const [editExperience, setEditExperience] = useState(
    profile?.experienceLevel ?? 'beginner',
  )
  const [editLocation, setEditLocation] = useState(
    profile?.trainingLocation ?? 'gym',
  )
  const [editSex, setEditSex] = useState<'male' | 'female'>(
    profile?.body?.sex ?? 'male',
  )
  const [editAge, setEditAge] = useState(profile?.body?.age ?? 25)
  const [editHeight, setEditHeight] = useState(profile?.body?.heightCm ?? 175)
  const [editWeight, setEditWeight] = useState(profile?.body?.weightKg ?? 75)
  const [editLifestyle, setEditLifestyle] = useState<LifestyleLevel>(
    profile?.body?.lifestyle ??
      mapLegacyActivityToLifestyle(profile?.body?.activityLevel),
  )
  const [editHasIssues, setEditHasIssues] = useState(
    profile?.medical?.hasIssues ?? false,
  )
  const [editRestrictions, setEditRestrictions] = useState(
    profile?.medical?.notes || (profile?.medical?.injuryTags ?? []).join('، '),
  )

  useEffect(() => {
    if (profile) {
      setEditName(profile.name ?? '')
      setEditGoal(profile.primaryGoal)
      setEditDays(profile.trainingDaysPerWeek)
      setEditExperience(profile.experienceLevel ?? 'beginner')
      setEditLocation(profile.trainingLocation ?? 'gym')
      setEditSex(profile.body?.sex ?? 'male')
      setEditAge(profile.body?.age ?? 25)
      setEditHeight(profile.body?.heightCm ?? 175)
      setEditWeight(profile.body?.weightKg ?? 75)
      setEditLifestyle(
        profile.body?.lifestyle ??
          mapLegacyActivityToLifestyle(profile.body?.activityLevel),
      )
      setEditHasIssues(profile.medical?.hasIssues ?? false)
      setEditRestrictions(
        profile.medical?.notes ||
          (profile.medical?.injuryTags ?? []).join('، '),
      )
    }
  }, [profile])

  function handleSaveProfileEdits() {
    if (!profile) return

    // Auto-sync training days into workoutBlocks if not customized by user
    let updatedWorkoutBlocks = profile.body.workoutBlocks
    if (!profile.body.hasCustomWorkoutBlocks) {
      if (updatedWorkoutBlocks && updatedWorkoutBlocks.length > 0) {
        updatedWorkoutBlocks = updatedWorkoutBlocks.map((b, i) =>
          i === 0 ? { ...b, sessionsPerWeek: editDays } : b,
        )
      } else {
        updatedWorkoutBlocks = [
          {
            type: 'resistance',
            sessionsPerWeek: editDays,
            minutesPerSession: profile.body.sessionMinutes ?? 60,
            intensity: profile.body.sessionIntensity ?? 'moderate',
          },
        ]
      }
    }

    const updated: UserProfile = {
      ...profile,
      name: editName.trim() || undefined,
      primaryGoal: editGoal,
      goals: [editGoal],
      trainingDaysPerWeek: editDays,
      experienceLevel: editExperience as
        'beginner' | 'intermediate' | 'advanced',
      trainingLocation: editLocation as 'gym' | 'home' | 'both',
      medical: {
        hasIssues: editHasIssues,
        injuryTags:
          editHasIssues && editRestrictions.trim()
            ? [editRestrictions.trim()]
            : [],
        notes: editRestrictions.trim(),
      },
      body: {
        ...profile.body,
        sex: editSex,
        age: editAge,
        heightCm: editHeight,
        weightKg: editWeight,
        activityLevel: mapLifestyleToLegacyActivity(editLifestyle),
        lifestyle: editLifestyle,
        workoutBlocks: updatedWorkoutBlocks,
      },
      updatedAt: Date.now(),
    }
    onUpdateProfile(updated)
    setShowEditModal(false)
  }

  function handleWeekStartChange(val: string) {
    if (!profile) return
    const updated: UserProfile = {
      ...profile,
      weekStartDay: Number(val),
      updatedAt: Date.now(),
    }
    onUpdateProfile(updated)
  }

  // Confirm Reset State
  const [showConfirmReset, setShowConfirmReset] = useState(false)

  const isDebugMode =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debug') === '1'

  const goalObj = GOALS.find((g) => g.value === profile?.primaryGoal)

  const currentLifestyle =
    profile?.body?.lifestyle ??
    mapLegacyActivityToLifestyle(profile?.body?.activityLevel)
  const lifestyleObj = LIFESTYLE_OPTIONS.find(
    (l) => l.level === currentLifestyle,
  )

  const hasTrainingDaysMismatch =
    Boolean(profile?.body?.hasCustomWorkoutBlocks) &&
    Boolean(profile?.body?.workoutBlocks?.length) &&
    profile?.body?.workoutBlocks?.[0]?.sessionsPerWeek !==
      profile?.trainingDaysPerWeek

  return (
    <div className="settings-screen" dir="rtl">
      <TopBar title="الإعدادات" />

      <div
        className="screen-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '16px',
          maxWidth: '560px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Training days mismatch Callout */}
        {hasTrainingDaysMismatch && (
          <Callout
            variant="warning"
            title="عدد الأيام مختلف بين ملفك وحاسبة السعرات"
            message={`ملفك محدد به ${profile?.trainingDaysPerWeek} أيام، بينما حاسبة السعرات محدد بها ${profile?.body?.workoutBlocks?.[0]?.sessionsPerWeek} أيام.`}
            actionLabel="تطابق"
            onAction={() => {
              if (!profile) return
              const synced: UserProfile = {
                ...profile,
                body: {
                  ...profile.body,
                  workoutBlocks: profile.body.workoutBlocks?.map((b, i) =>
                    i === 0
                      ? { ...b, sessionsPerWeek: profile.trainingDaysPerWeek }
                      : b,
                  ),
                },
                updatedAt: Date.now(),
              }
              onUpdateProfile(synced)
            }}
          />
        )}

        {/* Section 1: الملف الشخصي */}
        <Section
          title="الملف الشخصي"
          trailing={
            <Button
              variant="subtle"
              size="sm"
              onClick={() => setShowEditModal(true)}
            >
              تعديل بياناتي
            </Button>
          }
        >
          <Card padding="md">
            <KeyValueList
              items={[
                {
                  key: 'الاسم',
                  value: profile?.name || 'غير محدد',
                  onClick: () => setShowEditModal(true),
                },
                {
                  key: 'الهدف الأساسي',
                  value: goalObj?.labelAr || '—',
                  onClick: () => setShowEditModal(true),
                },
                {
                  key: 'جلسات التمرين',
                  value: `${profile?.trainingDaysPerWeek ?? 4} أيام أسبوعياً`,
                  onClick: () => setShowEditModal(true),
                },
                {
                  key: 'الخبرة',
                  value:
                    profile?.experienceLevel === 'beginner'
                      ? 'مبتدئ'
                      : profile?.experienceLevel === 'intermediate'
                        ? 'متوسط'
                        : 'متقدم',
                  onClick: () => setShowEditModal(true),
                },
                {
                  key: 'مكان التمرين',
                  value:
                    profile?.trainingLocation === 'gym'
                      ? 'جيم'
                      : profile?.trainingLocation === 'home'
                        ? 'منزل'
                        : 'الاثنان',
                  onClick: () => setShowEditModal(true),
                },
                {
                  key: 'الجنس',
                  value: profile?.body?.sex === 'female' ? 'أنثى' : 'ذكر',
                  onClick: () => setShowEditModal(true),
                },
                {
                  key: 'الوزن',
                  value: `${profile?.body?.weightKg ?? '—'} كجم`,
                  onClick: () => setShowEditModal(true),
                },
                {
                  key: 'الطول',
                  value: `${profile?.body?.heightCm ?? '—'} سم`,
                  onClick: () => setShowEditModal(true),
                },
                {
                  key: 'العمر',
                  value: `${profile?.body?.age ?? '—'} سنة`,
                  onClick: () => setShowEditModal(true),
                },
                {
                  key: 'نمط النشاط اليومي',
                  value: `${lifestyleObj?.titleAr || '—'} (معامل ×${lifestyleObj?.factor ?? 1.35})`,
                  onClick: () => setShowEditModal(true),
                },
                {
                  key: 'الصحة والإصابات',
                  value: profile?.medical?.hasIssues
                    ? profile.medical.notes || 'يوجد إصابة'
                    : 'سليم ولا توجد إصابات',
                  onClick: () => setShowEditModal(true),
                },
              ]}
            />
          </Card>
        </Section>

        {/* Section 2: التفضيلات */}
        <Section title="التفضيلات">
          <Card padding="md">
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div>
                <Select
                  id="settings-week-start"
                  label="بداية الأسبوع"
                  value={String(profile?.weekStartDay ?? 6)}
                  onChange={handleWeekStartChange}
                  options={WEEK_START_OPTIONS}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '6px',
                  borderTop: '1px solid var(--color-divider)',
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 600 }}>
                  وقت الراحة الافتراضي
                </span>
                <span
                  style={{ fontSize: '14px', color: 'var(--color-text-2)' }}
                >
                  60 ثانية
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '6px',
                  borderTop: '1px solid var(--color-divider)',
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 600 }}>
                  نظام الوحدات
                </span>
                <span
                  style={{ fontSize: '14px', color: 'var(--color-text-2)' }}
                >
                  متري (كجم / سم)
                </span>
              </div>
            </div>
          </Card>
        </Section>

        {/* Section 3: المظهر (ONE Segmented Row) */}
        <Section title="المظهر">
          <Card padding="md">
            <Segmented
              options={[
                { value: 'auto', label: 'تلقائي' },
                { value: 'light', label: 'فاتح' },
                { value: 'dark', label: 'داكن' },
              ]}
              value={currentThemeMode}
              onChange={(val) => handleThemeChange(val as ThemeMode)}
            />
          </Card>
        </Section>

        {/* Section 4: البيانات والمزامنة */}
        <Section title="البيانات والمزامنة">
          <BackupPanel
            backupData={backupData}
            onImported={onImported}
            onRestore={onRestore}
          />
        </Section>

        {/* Section 5: حول التطبيق وحقوق الملكية */}
        <Section title="حول التطبيق">
          <Card padding="md">
            <KeyValueList
              items={[
                { key: 'الإصدار', value: '0.2.0', bdi: true, stacked: true },
                {
                  key: 'طبيعة التخزين',
                  value: 'محلي بالكامل على جهازك',
                  stacked: true,
                },
                {
                  key: 'النموذج التشريحي',
                  value:
                    'BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International',
                  stacked: true,
                },
                {
                  key: 'الأيقونات',
                  value: 'Lucide Icons (ISC)',
                  stacked: true,
                },
                {
                  key: 'وسائط التمارين',
                  value: 'Gym Visual',
                  stacked: true,
                },
              ]}
            />
          </Card>
        </Section>

        {/* Developer debug only if ?debug=1 */}
        {isDebugMode && (
          <Section title="أدوات المطور والتصحيح">
            <Card padding="sm">
              <ListRow
                title="أداة فحص الرؤوس العضلية (Muscle Atlas Inspector)"
                subtitle="فحص الرؤوس العضلية الـ 53"
                onClick={onOpenAtlasDebug}
                trailing={<Icon name="chevron-left" size={16} />}
              />
            </Card>
          </Section>
        )}

        {/* Section 6: منطقة الخطر (Danger Zone) */}
        <Section title="منطقة الخطر">
          <Card padding="md">
            <ListRow
              title="إعادة ضبط التطبيق"
              subtitle="حذف الحساب والبيانات والبدء من جديد"
              onClick={() => setShowConfirmReset(true)}
              trailing={<Icon name="chevron-left" size={16} />}
            />
          </Card>
        </Section>
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
            gap: '14px',
            paddingBottom: '20px',
          }}
        >
          <Field
            label="الاسم"
            value={editName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEditName(e.target.value)
            }
            placeholder="مثال: أحمد"
          />

          <Select
            id="edit-profile-goal"
            label="الهدف الأساسي"
            value={editGoal}
            onChange={(val) => setEditGoal(val as Goal)}
            options={GOAL_OPTIONS}
          />

          <div>
            <div
              style={{
                fontSize: '13.5px',
                fontWeight: 600,
                marginBottom: '6px',
              }}
            >
              أيام التمرين أسبوعياً
            </div>
            <Segmented
              options={[
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '5', label: '5' },
                { value: '6', label: '6' },
              ]}
              value={String(editDays)}
              onChange={(val) => setEditDays(Number(val))}
            />
          </div>

          <div>
            <div
              style={{
                fontSize: '13.5px',
                fontWeight: 600,
                marginBottom: '6px',
              }}
            >
              خبرة التدريب
            </div>
            <Segmented
              options={EXPERIENCE_OPTIONS}
              value={editExperience}
              onChange={(val) =>
                setEditExperience(
                  val as 'beginner' | 'intermediate' | 'advanced',
                )
              }
            />
          </div>

          <div>
            <div
              style={{
                fontSize: '13.5px',
                fontWeight: 600,
                marginBottom: '6px',
              }}
            >
              مكان التدريب
            </div>
            <Segmented
              options={LOCATION_OPTIONS}
              value={editLocation}
              onChange={(val) =>
                setEditLocation(val as 'gym' | 'home' | 'both')
              }
            />
          </div>

          <div>
            <div
              style={{
                fontSize: '13.5px',
                fontWeight: 600,
                marginBottom: '6px',
              }}
            >
              الجنس
            </div>
            <Segmented
              options={[
                { value: 'male', label: 'ذكر' },
                { value: 'female', label: 'أنثى' },
              ]}
              value={editSex}
              onChange={(val) => setEditSex(val as 'male' | 'female')}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '8px',
            }}
          >
            <Field
              label="العمر"
              unit="سنة"
              inputMode="numeric"
              value={String(editAge)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditAge(Number(e.target.value))
              }
            />
            <Field
              label="الطول"
              unit="سم"
              inputMode="numeric"
              value={String(editHeight)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditHeight(Number(e.target.value))
              }
            />
            <Field
              label="الوزن"
              unit="كجم"
              inputMode="decimal"
              value={String(editWeight)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditWeight(Number(e.target.value))
              }
            />
          </div>

          <Select
            id="edit-profile-lifestyle"
            label="نمط النشاط اليومي"
            value={String(editLifestyle)}
            onChange={(val) => setEditLifestyle(Number(val) as LifestyleLevel)}
            options={LIFESTYLE_OPTIONS.map((opt) => ({
              value: String(opt.level),
              labelAr: `${opt.titleAr} (${opt.descriptionAr} - معامل ×${opt.factor})`,
            }))}
          />

          <div>
            <div
              style={{
                fontSize: '13.5px',
                fontWeight: 600,
                marginBottom: '6px',
              }}
            >
              هل لديك إصابات سابقة؟
            </div>
            <Segmented
              options={[
                { value: 'false', label: 'لا' },
                { value: 'true', label: 'نعم' },
              ]}
              value={String(editHasIssues)}
              onChange={(val) => setEditHasIssues(val === 'true')}
            />
          </div>

          {editHasIssues && (
            <Field
              label="تفاصيل الإصابة أو الملاحظات"
              value={editRestrictions}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditRestrictions(e.target.value)
              }
              placeholder="اكتب تفاصيل الإصابة..."
            />
          )}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginTop: '10px',
            }}
          >
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleSaveProfileEdits}
            >
              حفظ التعديلات
            </Button>
            <Button
              variant="ghost"
              size="md"
              fullWidth
              onClick={() => {
                setShowEditModal(false)
                onEditProfile()
              }}
            >
              إعادة فتح معالج البداية بالكامل
            </Button>
          </div>
        </div>
      </Sheet>

      {/* Danger Zone: ConfirmSheet with verification */}
      <ConfirmSheet
        isOpen={showConfirmReset}
        onClose={() => setShowConfirmReset(false)}
        onConfirm={onFactoryReset}
        title="تأكيد إعادة ضبط المصنع الشاملة"
        consequences={[
          'سيتم مسح حسابك والملف الشخصي نهائياً.',
          'سيتم مسح الجداول التدريبية والتمارين المخصصة.',
          'سيتم مسح كافة سجلات الوزن، الملاحظات، وسجلات التغذية اليومية.',
        ]}
        requiredWord="حذف"
        backupOffer={{
          label: 'حفظ نسخة أولاً',
          onBackup: async () => {
            const { createBackupStore } =
              await import('../backup/backupStore.ts')
            const store = createBackupStore()
            await store.exportData(backupData())
          },
        }}
        confirmLabel="حذف كل شيء والبدء من جديد"
        cancelLabel="تراجع"
        isDestructive
      />
    </div>
  )
}
export default SettingsScreen
