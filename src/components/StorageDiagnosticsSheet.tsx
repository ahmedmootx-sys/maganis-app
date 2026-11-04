import { Sheet } from '../ui/Sheet.tsx'
import { useStorageHealth } from '../platform/storageHealth.ts'

interface StorageDiagnosticsSheetProps {
  onClose: () => void
}

export function StorageDiagnosticsSheet({
  onClose,
}: StorageDiagnosticsSheetProps) {
  const diagnostics = useStorageHealth()

  const formatBytes = (bytes: number | null): string => {
    if (bytes === null) return 'غير متاح'
    if (bytes < 1024) return `${bytes} بايت`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} كيلوبايت`
    return `${(bytes / (1024 * 1024)).toFixed(1)} ميجابايت`
  }

  const formatTimestamp = (ts: number | null): string => {
    if (!ts) return 'لم يتم بعد'
    return new Date(ts).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <Sheet isOpen={true} onClose={onClose} title="تشخيص سلامة التخزين المحلي">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '8px 0',
        }}
        dir="rtl"
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
          }}
        >
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-bg-base, #12171f)',
              border: '1px solid var(--color-border-subtle, #2b3545)',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-text-secondary, #9ba3af)',
              }}
            >
              حالة التخزين
            </div>
            <div
              style={{ fontSize: '15px', fontWeight: 'bold', marginTop: '4px' }}
            >
              {diagnostics.status === 'ok' && 'سليم (مستقر)'}
              {diagnostics.status === 'degraded' && 'قيد المراقبة'}
              {diagnostics.status === 'corrupt' && 'تنبيه تلف'}
              {diagnostics.status === 'readonly' && 'وضع القراءة فقط'}
            </div>
          </div>

          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-bg-base, #12171f)',
              border: '1px solid var(--color-border-subtle, #2b3545)',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-text-secondary, #9ba3af)',
              }}
            >
              المساحة المتبقية
            </div>
            <div
              style={{ fontSize: '15px', fontWeight: 'bold', marginTop: '4px' }}
            >
              {formatBytes(diagnostics.freeSpaceBytes)}
            </div>
          </div>

          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-bg-base, #12171f)',
              border: '1px solid var(--color-border-subtle, #2b3545)',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-text-secondary, #9ba3af)',
              }}
            >
              عدد المفاتيح المحفوظة
            </div>
            <div
              style={{ fontSize: '15px', fontWeight: 'bold', marginTop: '4px' }}
            >
              {diagnostics.keyCount ?? '—'}
            </div>
          </div>

          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-bg-base, #12171f)',
              border: '1px solid var(--color-border-subtle, #2b3545)',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-text-secondary, #9ba3af)',
              }}
            >
              آخر حفظ ناجح
            </div>
            <div
              style={{ fontSize: '15px', fontWeight: 'bold', marginTop: '4px' }}
            >
              {formatTimestamp(diagnostics.lastSuccessfulWriteAt)}
            </div>
          </div>
        </div>

        {diagnostics.corruptKeys.length > 0 && (
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#ef4444',
                marginBottom: '6px',
              }}
            >
              الملفات التي تم استردادها تلقائياً:
            </div>
            <ul
              style={{
                margin: 0,
                paddingRight: '18px',
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
              }}
            >
              {diagnostics.corruptKeys.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ul>
          </div>
        )}

        {diagnostics.recentErrors.length > 0 && (
          <div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 'bold',
                marginBottom: '8px',
              }}
            >
              سجل التنبيهات الأخيرة:
            </div>
            <div
              style={{
                maxHeight: '160px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {diagnostics.recentErrors.map((err, i) => (
                <div
                  key={i}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--color-bg-base, #12171f)',
                    fontSize: '12px',
                    border: '1px solid var(--color-border-subtle, #2b3545)',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 'bold',
                      color: 'var(--color-brand-primary, #F95700)',
                    }}
                  >
                    {err.key}
                  </div>
                  <div
                    style={{
                      color: 'var(--color-text-secondary, #9ba3af)',
                      marginTop: '2px',
                    }}
                  >
                    {err.error}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: 'var(--color-text-muted, #64748b)',
                      marginTop: '4px',
                    }}
                  >
                    {formatTimestamp(err.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          className="btn btn--primary"
          style={{ minHeight: '44px', width: '100%', marginTop: '8px' }}
          onClick={onClose}
        >
          إغلاق
        </button>
      </div>
    </Sheet>
  )
}
