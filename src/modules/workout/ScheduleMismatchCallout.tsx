/**
 * src/modules/workout/ScheduleMismatchCallout.tsx
 * TASK G5-A1: Shared Schedule Mismatch Callout between Home and Training.
 *
 * Rules:
 * - Compares resistanceDays against profile.trainingDaysPerWeek only.
 * - Never mentions cardio as the cause.
 * - Primary action sets profile.trainingDaysPerWeek to resistanceDays, nothing else.
 * - After tapping, the callout disappears on both screens.
 */

import type { UserProfile } from '../onboarding/types.ts'
import type { WorkoutProgram } from '../shared/types.ts'
import { selectWeekLoad } from './weekLoadSelector.ts'
import { Callout, Button } from '../../ui'
import { plural } from '../../utils/plural.ts'

export interface ScheduleMismatchCalloutProps {
  profile: UserProfile | null | undefined
  program: WorkoutProgram | null | undefined
  onUpdateProfile: ((updated: UserProfile) => void) | undefined
  onOpenDaysAdjust?: () => void
  showToast?: (msg: string) => void
}

export function ScheduleMismatchCallout({
  profile,
  program,
  onUpdateProfile,
  onOpenDaysAdjust,
  showToast,
}: ScheduleMismatchCalloutProps) {
  if (!profile || !program || !program.days || program.days.length === 0) {
    return null
  }

  const load = selectWeekLoad(profile, program)
  const profileGoal = profile.trainingDaysPerWeek ?? 4

  // Only show if resistanceDays differs from the profile target
  if (load.resistanceDays === profileGoal) {
    return null
  }

  const handleAdoptResistanceDays = () => {
    if (!profile || !onUpdateProfile) return
    const updated: UserProfile = {
      ...profile,
      trainingDaysPerWeek: load.resistanceDays,
    }
    onUpdateProfile(updated)
    if (showToast) {
      showToast(`تم اعتماد ${plural(load.resistanceDays, 'يوم')} في الملف الشخصي`)
    }
  }

  return (
    <Callout
      variant="warning"
      title="اختلاف في أيام التدريب"
      action={
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button
            size="sm"
            variant="subtle"
            onClick={handleAdoptResistanceDays}
          >
            اعتمد {plural(load.resistanceDays, 'يوم')}
          </Button>
          {onOpenDaysAdjust && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onOpenDaysAdjust}
            >
              تعديل الجدول
            </Button>
          )}
        </div>
      }
    >
      برنامجك يحتوي على {plural(load.resistanceDays, 'يوم')} مقاومة، بينما اخترت {plural(profileGoal, 'يوم')} في هدفك الأسبوعي.
    </Callout>
  )
}
