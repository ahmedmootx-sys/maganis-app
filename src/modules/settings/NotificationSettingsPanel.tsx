import { useState, useEffect, useCallback } from 'react'
import { Card, Button, Toggle, Callout } from '../../ui/index.ts'
import {
  getNotificationSettings,
  saveNotificationSettings,
} from '../../platform/notifications/notificationStore.ts'
import type { NotificationSettings } from '../../platform/notifications/schedule.ts'
import {
  getLiveDiagnostics,
  openSettingsScreen,
  openExactAlarmSettings,
  requestNotificationPermission,
  runTestNotification,
  syncSchedule,
  type NotificationDiagnostics,
} from '../../platform/notifications/notificationEngine.ts'
import { isNative } from '../../platform/runtime.ts'

export function NotificationSettingsPanel() {
  const [settings, setSettings] = useState<NotificationSettings>(() =>
    getNotificationSettings(),
  )
  const [diagnostics, setDiagnostics] =
    useState<NotificationDiagnostics | null>(null)
  const [testState, setTestState] = useState<
    'idle' | 'running' | 'success' | 'failed'
  >('idle')
  const [testFailureReason, setTestFailureReason] = useState<string | null>(
    null,
  )

  const refreshDiagnostics = useCallback(async () => {
    const diag = await getLiveDiagnostics()
    setDiagnostics(diag)
  }, [])

  useEffect(() => {
    void refreshDiagnostics()
  }, [refreshDiagnostics])

  const updateSetting = async <K extends keyof NotificationSettings>(
    key: K,
    val: NotificationSettings[K],
  ) => {
    // If enabling a reminder and permission is prompt/denied on native, request permission first
    if (
      val === true &&
      (key === 'masterEnabled' ||
        key === 'workoutReminderEnabled' ||
        key === 'nutritionReminderEnabled' ||
        key === 'restEndEnabled' ||
        key === 'cardioEndEnabled')
    ) {
      if (diagnostics && !diagnostics.permissionGranted) {
        const granted = await requestNotificationPermission()
        if (granted !== 'granted') {
          await refreshDiagnostics()
          return
        }
      }
    }

    const updated = saveNotificationSettings({ [key]: val })
    setSettings(updated)
    void syncSchedule()
    void refreshDiagnostics()
  }

  const handleRunTest = async () => {
    setTestState('running')
    setTestFailureReason(null)
    const res = await runTestNotification(5)
    if (res.delivered) {
      setTestState('success')
    } else {
      setTestState('failed')
      let reasonAr = 'لم يصل التنبيه في الوقت المحدد.'
      if (res.firstFailingCheck === 'permission') {
        reasonAr = 'إذن التنبيهات غير مفعّل في النظام.'
      } else if (res.firstFailingCheck === 'exact_alarm') {
        reasonAr = 'إذن المنبهات الدقيقة غير مسموح به للتطبيق.'
      } else if (res.firstFailingCheck === 'channel_disabled') {
        reasonAr = 'قناة التنبيهات معطلة من إعدادات الهاتف.'
      }
      setTestFailureReason(reasonAr)
    }
    await refreshDiagnostics()
  }

  return (
    <Card padding="md" data-testid="notification-settings-panel">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Header & Master Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--ink, #1f2937)',
              }}
            >
              تفعيل التنبيهات
            </span>
            <span
              style={{ fontSize: '12.5px', color: 'var(--muted, #6b7280)' }}
            >
              التحكم في وصول تذكيرات التمرين والعدادات
            </span>
          </div>
          <Toggle
            checked={settings.masterEnabled}
            onChange={(checked) => updateSetting('masterEnabled', checked)}
            aria-label="تفعيل التنبيهات الرئيسية"
          />
        </div>

        {/* Individual Notification Toggles */}
        {settings.masterEnabled && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              borderTop: '1px solid var(--border-subtle, #e5e7eb)',
              paddingTop: '14px',
            }}
          >
            {/* 1. Workout Day Reminder */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
              >
                <span style={{ fontSize: '14px', fontWeight: 600 }}>
                  تذكير أيام التمرين
                </span>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  تنبيه بأيام التمرين المحددة في جدولك
                </span>
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {settings.workoutReminderEnabled && (
                  <input
                    type="time"
                    value={settings.workoutReminderTime}
                    onChange={(e) =>
                      updateSetting('workoutReminderTime', e.target.value)
                    }
                    style={{
                      padding: '4px 6px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      fontSize: '13px',
                      background: 'var(--bg)',
                      color: 'var(--ink)',
                    }}
                    aria-label="وقت تذكير التمرين"
                  />
                )}
                <Toggle
                  checked={settings.workoutReminderEnabled}
                  onChange={(checked) =>
                    updateSetting('workoutReminderEnabled', checked)
                  }
                  aria-label="تفعيل تذكير أيام التمرين"
                />
              </div>
            </div>

            {/* 2. Rest Timer End */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
              >
                <span style={{ fontSize: '14px', fontWeight: 600 }}>
                  انتهاء وقت الراحة
                </span>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  تنبيه عند انتهاء الراحة بين المجموعات أثناء قفل الشاشة
                </span>
              </div>
              <Toggle
                checked={settings.restEndEnabled}
                onChange={(checked) => updateSetting('restEndEnabled', checked)}
                aria-label="تفعيل تنبيه انتهاء وقت الراحة"
              />
            </div>

            {/* 3. Cardio Target End */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
              >
                <span style={{ fontSize: '14px', fontWeight: 600 }}>
                  منبه هدف الكارديو
                </span>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  تنبيه عند اكتمال مدة الكارديو المحددة للجلسة
                </span>
              </div>
              <Toggle
                checked={settings.cardioEndEnabled}
                onChange={(checked) =>
                  updateSetting('cardioEndEnabled', checked)
                }
                aria-label="تفعيل منبه هدف الكارديو"
              />
            </div>

            {/* 4. Daily Nutrition Log Reminder */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
              >
                <span style={{ fontSize: '14px', fontWeight: 600 }}>
                  تذكير تسجيل الوجبات
                </span>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  تنبيه يومي لتسجيل طعامك وسعراتك (يُلغى تلقائياً لو سجلت)
                </span>
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {settings.nutritionReminderEnabled && (
                  <input
                    type="time"
                    value={settings.nutritionReminderTime}
                    onChange={(e) =>
                      updateSetting('nutritionReminderTime', e.target.value)
                    }
                    style={{
                      padding: '4px 6px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      fontSize: '13px',
                      background: 'var(--bg)',
                      color: 'var(--ink)',
                    }}
                    aria-label="وقت تذكير الوجبات"
                  />
                )}
                <Toggle
                  checked={settings.nutritionReminderEnabled}
                  onChange={(checked) =>
                    updateSetting('nutritionReminderEnabled', checked)
                  }
                  aria-label="تفعيل تذكير تسجيل الوجبات"
                />
              </div>
            </div>

            {/* 5. Backup Alert */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
              >
                <span style={{ fontSize: '14px', fontWeight: 600 }}>
                  تنبيهات النسخ الاحتياطي
                </span>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  تنبيه عند تعذر حفظ النسخة الاحتياطية أو تأخرها (مرة كل 3 أيام)
                </span>
              </div>
              <Toggle
                checked={settings.backupAlertEnabled}
                onChange={(checked) =>
                  updateSetting('backupAlertEnabled', checked)
                }
                aria-label="تفعيل تنبيهات النسخ الاحتياطي"
              />
            </div>
          </div>
        )}

        {/* Device Settings: Keep Awake & Haptics */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            borderTop: '1px solid var(--border-subtle, #e5e7eb)',
            paddingTop: '14px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
            >
              <span style={{ fontSize: '14px', fontWeight: 600 }}>
                ابقِ الشاشة شغالة أثناء التمرين
              </span>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                يمنع قفل الشاشة تلقائياً أثناء تشغيل جلسة التمرين أو الكارديو
              </span>
            </div>
            <Toggle
              checked={settings.keepScreenOnEnabled}
              onChange={(checked) =>
                updateSetting('keepScreenOnEnabled', checked)
              }
              aria-label="ابقِ الشاشة شغالة أثناء التمرين"
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
            >
              <span style={{ fontSize: '14px', fontWeight: 600 }}>
                الاهتزاز والتغذية الراجعة
              </span>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                اهتزاز الجهاز عند إتمام مجموعة أو انتهاء العداد
              </span>
            </div>
            <Toggle
              checked={settings.hapticsEnabled}
              onChange={(checked) => updateSetting('hapticsEnabled', checked)}
              aria-label="تفعيل الاهتزاز"
            />
          </div>
        </div>

        {/* Why Is It Not Arriving - Live Diagnostics Panel (N4.4) */}
        {diagnostics && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              borderTop: '1px solid var(--border-subtle, #e5e7eb)',
              paddingTop: '14px',
            }}
          >
            <span
              style={{
                fontSize: '13.5px',
                fontWeight: 700,
                color: 'var(--ink)',
              }}
            >
              تشخيص وصول التنبيهات
            </span>

            {/* Notification Permission Check */}
            {!diagnostics.permissionGranted ? (
              <Callout
                variant="danger"
                title="إذن التنبيهات مقفول"
                action={
                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={() => openSettingsScreen('appNotifications')}
                  >
                    فتح الإعدادات
                  </Button>
                }
              >
                التطبيق غير مصرح له بعرض التنبيهات على هاتفك.
              </Callout>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12.5px',
                  color: 'var(--color-success, #10b981)',
                }}
              >
                <span>✓ إذن التنبيهات مفعّل</span>
              </div>
            )}

            {/* Exact Alarms Check */}
            {!diagnostics.exactAlarmGranted && (
              <Callout
                variant="warning"
                title="المنبهات الدقيقة غير مسموحة"
                action={
                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={() => openExactAlarmSettings()}
                  >
                    تفعيل المنبهات الدقيقة
                  </Button>
                }
              >
                التنبيه ممكن يتأخر لحد كام دقيقة لأن الهاتف يقيّد المنبهات في
                الخلفية.
              </Callout>
            )}

            {/* Battery Optimization Check */}
            {!diagnostics.batteryOptimizationIgnored && isNative() && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: 'var(--card-subtle)',
                  fontSize: '12px',
                }}
              >
                <span>تحسين البطارية مفعّل (قد يؤخر تنبيهات الخلفية)</span>
                <Button
                  size="sm"
                  variant="subtle"
                  onClick={() => openSettingsScreen('batteryOptimization')}
                >
                  تعديل
                </Button>
              </div>
            )}

            {/* Last Sync Info */}
            {diagnostics.lastSync && (
              <div
                style={{
                  fontSize: '11.5px',
                  color: 'var(--muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <span>
                  آخر مزامنة للتنبيهات:{' '}
                  {new Date(diagnostics.lastSync.at).toLocaleTimeString(
                    'ar-EG',
                  )}
                </span>
                <span>
                  التنبيهات المجدولة حالياً: {diagnostics.lastSync.desiredCount}{' '}
                  تنبيه
                </span>
              </div>
            )}

            {/* Generic Maker Disclaimer (Rule R2: No maker specific paths) */}
            <span
              style={{
                fontSize: '11px',
                color: 'var(--muted)',
                lineHeight: 1.4,
              }}
            >
              ملاحظة: بعض الشركات المصنعة للهواتف تفرض قيوداً إضافية على
              التطبيقات في الخلفية.
            </span>
          </div>
        )}

        {/* Test Notification Button & Honest Feedback (N4.4) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            borderTop: '1px solid var(--border-subtle, #e5e7eb)',
            paddingTop: '14px',
          }}
        >
          <Button
            variant="secondary"
            size="large"
            onClick={handleRunTest}
            disabled={testState === 'running'}
            style={{ width: '100%', height: '44px' }}
          >
            {testState === 'running'
              ? 'جاري إرسال تنبيه تجريبي خلال 5 ثوانٍ...'
              : 'جرّب تنبيه دلوقتي'}
          </Button>

          {testState === 'success' && (
            <Callout variant="success" title="وصل التنبيه بنجاح!">
              تم إرسال التنبيه والتحقق من وصوله لنظام الهاتف.
            </Callout>
          )}

          {testState === 'failed' && (
            <Callout
              variant="danger"
              title="لسه ما وصلش"
              action={
                <Button
                  size="sm"
                  variant="subtle"
                  onClick={() => openSettingsScreen('appNotifications')}
                >
                  فحص الإعدادات
                </Button>
              }
            >
              {testFailureReason ||
                'فشل وصول التنبيه في الوقت المحدد. راجع لوحة التشخيص أعلاه.'}
            </Callout>
          )}
        </div>
      </div>
    </Card>
  )
}
