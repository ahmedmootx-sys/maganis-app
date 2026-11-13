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
              backgroundColor: 'var(--color-surface-2)',
              border: '1px solid var(--color-divider)',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-text-2)',
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
              backgroundColor: 'var(--color-surface-2)',
              border: '1px solid var(--color-divider)',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-text-2)',
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
              backgroundColor: 'var(--color-surface-2)',
              border: '1px solid var(--color-divider)',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-text-2)',
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
              backgroundColor: 'var(--color-surface-2)',
              border: '1px solid var(--color-divider)',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-text-2)',
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
              backgroundColor: 'var(--color-danger-bg)',
              border: '1px solid var(--color-danger-border)',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                fontWeight: 'bold',
                color: 'var(--color-danger)',
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
                color: 'var(--color-text-2)',
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
                    backgroundColor: 'var(--color-surface-2)',
                    fontSize: '12px',
                    border: '1px solid var(--color-divider)',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 'bold',
                      color: 'var(--color-accent-text)',
                    }}
                  >
                    {err.key}
                  </div>
                  <div
                    style={{
                      color: 'var(--color-text-2)',
                      marginTop: '2px',
                    }}
                  >
                    {err.error}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: 'var(--color-text-2)',
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
          style={{
            minHeight: '44px',
            height: 'auto',
            width: '100%',
            marginTop: '8px',
          }}
          onClick={onClose}
        >
          إغلاق
        </button>
      </div>
    </Sheet>
  )
}
