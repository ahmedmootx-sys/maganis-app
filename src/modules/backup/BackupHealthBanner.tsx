import { useState, useEffect } from 'react'
import { backupEngine } from './backupEngine.ts'
import {
  IconAlertTriangle,
  IconDatabase,
  IconRefreshCw,
  IconClose,
  IconCheck,
} from '../../components/Icons.tsx'
import { Button } from '../../ui/Button.tsx'

export interface BackupHealthBannerProps {
  recentSessionsCount?: number
  onNavigateToBackup?: () => void
}

export function BackupHealthBanner({
  recentSessionsCount = 0,
  onNavigateToBackup,
}: BackupHealthBannerProps) {
  const [, setTick] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    const unsub = backupEngine.subscribe(() => {
      setTick((t) => t + 1)
    })
    return unsub
  }, [])

  const overall = backupEngine.getOverallState()
  const isSnoozed = backupEngine.isSnoozed()

  if (isSnoozed) {
    return null
  }

  // If ok and no error, do not show health banner
  if (overall.state === 'ok') {
    return null
  }

  async function handleBackupNow() {
    setIsRunning(true)
    setSuccessMsg(null)
    try {
      const res = await backupEngine.runBackup('banner_action')
      if (res.success) {
        setSuccessMsg('تم حفظ النسخة والتحقق منها بنجاح')
        setTimeout(() => setSuccessMsg(null), 4000)
      }
    } finally {
      setIsRunning(false)
    }
  }

  function handleSnooze() {
    backupEngine.snoozeBanner(24)
    setTick((t) => t + 1)
  }

  // First-run nudge card: appears after 1st workout completed if never backed up
  const isFirstRun = recentSessionsCount === 1 && overall.state === 'never'

  if (isFirstRun) {
    return (
      <div
        className="card"
        style={{
          border: '1px solid var(--color-accent)',
          background: 'var(--color-surface)',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div
            style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}
          >
            <IconDatabase
              size={22}
              style={{
                color: 'var(--color-accent)',
                flexShrink: 0,
                marginTop: '2px',
              }}
            />
            <div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                }}
              >
                مبروك أول تمرين! بياناتك متأمنة تلقائياً
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text-2)',
                  marginTop: '4px',
                  lineHeight: '1.45',
                }}
              >
                تطبيق بُنْيَان بيحفظ نسخ احتياطية تلقائياً في ذاكرة الهاتف ومجلد
                التنزيلات مع كل تمرين بتخلصه لضمان عدم ضياع بياناتك أبداً.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSnooze}
            aria-label="إغلاق التنبيه وتذكيري غداً"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-2)',
              minWidth: '44px',
              minHeight: '44px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0',
            }}
          >
            <IconClose size={18} />
          </button>
        </div>

        {successMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--color-accent)',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            <IconCheck size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Button
            variant="primary"
            size="sm"
            disabled={isRunning}
            onClick={handleBackupNow}
          >
            {isRunning ? 'جاري الحفظ والتحقق...' : 'احفظ أول نسخة دلوقتي'}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleSnooze}>
            فهمت
          </Button>
        </div>
      </div>
    )
  }

  // Health warning / stale / failing / folder_permission_lost banner
  const isDanger =
    overall.state === 'failing' || overall.state === 'folder_permission_lost'

  return (
    <div
      className="card"
      style={{
        border: `1px solid ${isDanger ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
        background: 'var(--color-surface)',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <IconAlertTriangle
            size={20}
            style={{
              color: isDanger ? '#ef4444' : '#f59e0b',
              flexShrink: 0,
              marginTop: '2px',
            }}
          />
          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--color-text)',
              }}
            >
              {overall.messageAr}
            </div>
            {overall.reasonAr && (
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--color-text-2)',
                  marginTop: '2px',
                  lineHeight: '1.4',
                }}
              >
                {overall.reasonAr}
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleSnooze}
          aria-label="تذكيري لاحقاً (إغلاق التنبيه لمدة 24 ساعة)"
          title="تذكيري لاحقاً"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-2)',
            minWidth: '44px',
            minHeight: '44px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0',
          }}
        >
          <IconClose size={18} />
        </button>
      </div>

      {successMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#10b981',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <IconCheck size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {overall.state === 'folder_permission_lost' && onNavigateToBackup ? (
          <Button variant="secondary" size="sm" onClick={onNavigateToBackup}>
            تعديل مجلد النسخ الاحتياطي
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            disabled={isRunning}
            onClick={handleBackupNow}
          >
            {isRunning ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <IconRefreshCw
                  size={14}
                  style={{ animation: 'spin 1s linear infinite' }}
                />
                <span>جاري الحفظ والتحقق...</span>
              </span>
            ) : (
              'احفظ نسخة دلوقتي'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
