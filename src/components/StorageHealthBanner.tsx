import { useState } from 'react'
import { useStorageHealth } from '../platform/storageHealth.ts'
import { StorageDiagnosticsSheet } from './StorageDiagnosticsSheet.tsx'

export function StorageHealthBanner() {
  const health = useStorageHealth()
  const [showDiagnostics, setShowDiagnostics] = useState(false)

  if (health.status === 'ok') {
    return null
  }

  let message = 'جاري مراقبة صحة التخزين المحلي...'
  if (health.status === 'degraded') {
    message =
      health.reason ||
      'تحذير: المساحة المتبقية منخفضة أو حدث تأخير في حفظ البيانات.'
  } else if (health.status === 'corrupt') {
    message =
      'تنبيه: تم رصد ملف غير مكتمل واستعادته تلقائياً من النسخة الاحتياطية.'
  }

  return (
    <>
      <div
        role="alert"
        aria-live="polite"
        style={{
          backgroundColor:
            health.status === 'corrupt'
              ? 'rgba(239, 68, 68, 0.95)'
              : 'rgba(245, 158, 11, 0.95)',
          color: '#ffffff',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '13px',
          fontWeight: 500,
          zIndex: 9999,
          position: 'sticky',
          top: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            aria-hidden="true"
            style={{ display: 'inline-flex', alignItems: 'center' }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {health.status === 'corrupt' ? (
                <>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </>
              ) : (
                <>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </>
              )}
            </svg>
          </span>
          <span>{message}</span>
        </div>

        <button
          type="button"
          onClick={() => setShowDiagnostics(true)}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: '#ffffff',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '12px',
            cursor: 'pointer',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          التفاصيل
        </button>
      </div>

      {showDiagnostics && (
        <StorageDiagnosticsSheet onClose={() => setShowDiagnostics(false)} />
      )}
    </>
  )
}
