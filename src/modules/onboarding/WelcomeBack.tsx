import { useState } from 'react'
import { ACTIVITY_LEVELS, GOALS } from './types'
import type { UserProfile } from './types'

interface WelcomeBackProps {
  profile: UserProfile
  onEdit: () => void
  onDelete: () => void
}

export function WelcomeBack({ profile, onEdit, onDelete }: WelcomeBackProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const goalLabels = profile.goals
    .map((g) => GOALS.find((x) => x.value === g)?.labelAr ?? g)
    .join('، ')
  const primaryLabel =
    GOALS.find((x) => x.value === profile.primaryGoal)?.labelAr ??
    profile.primaryGoal
  const activity = ACTIVITY_LEVELS.find(
    (x) => x.value === profile.body.activityLevel,
  )
  const joined = new Date(profile.createdAt).toLocaleDateString('ar-EG')

  return (
    <section className="card" data-testid="welcome-card">
      <h2 data-testid="welcome-title">أهلاً بعودتك 👋</h2>
      <p className="muted">
        ملفك الشخصي محفوظ على جهازك منذ {joined} وجاهز للاستخدام.
      </p>

      <ul className="summary-list" data-testid="profile-summary">
        <li>
          <span>الأهداف</span>
          <strong>{goalLabels}</strong>
        </li>
        <li>
          <span>الهدف الأساسي</span>
          <strong>{primaryLabel}</strong>
        </li>
        <li>
          <span>أيام التمرين</span>
          <strong>{profile.trainingDaysPerWeek} أيام أسبوعياً</strong>
        </li>
        <li>
          <span>الحالة الصحية</span>
          <strong>
            {profile.medical.hasIssues
              ? profile.medical.injuryTags.length > 0
                ? profile.medical.injuryTags.join('، ')
                : 'يوجد — راجع الملاحظات'
              : 'لا توجد إصابات مسجلة'}
          </strong>
        </li>
        <li>
          <span>الجنس</span>
          <strong>{profile.body.sex === 'male' ? 'ذكر' : 'أنثى'}</strong>
        </li>
        <li>
          <span>العمر</span>
          <strong>{profile.body.age} سنة</strong>
        </li>
        <li>
          <span>الطول / الوزن</span>
          <strong>
            {profile.body.heightCm} سم / {profile.body.weightKg} كجم
          </strong>
        </li>
        <li>
          <span>مستوى النشاط</span>
          <strong>
            {activity
              ? `${activity.labelAr} (×${activity.multiplier})`
              : profile.body.activityLevel}
          </strong>
        </li>
      </ul>

      <h3>قادم قريباً</h3>
      <ul className="roadmap" data-testid="roadmap-list">
        <li>
          مولد الجداول التدريبية
          <span className="chip">قريباً</span>
        </li>
        <li>
          قاعدة بيانات التمارين
          <span className="chip">قريباً</span>
        </li>
        <li>
          وحدة التغذية والسعرات
          <span className="chip">قريباً</span>
        </li>
      </ul>

      <div className="actions-row">
        <button type="button" data-testid="edit-profile" onClick={onEdit}>
          تعديل بياناتي
        </button>
        {confirmingDelete ? (
          <button
            type="button"
            className="danger"
            data-testid="delete-confirm"
            onClick={onDelete}
          >
            متأكد — احذف كل بياناتي
          </button>
        ) : (
          <button
            type="button"
            className="ghost-danger"
            data-testid="delete-profile"
            onClick={() => setConfirmingDelete(true)}
          >
            حذف كل بياناتي
          </button>
        )}
      </div>
    </section>
  )
}
