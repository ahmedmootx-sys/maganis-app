import { useEffect, useRef, useState } from 'react'
import type { BackupData } from '../shared/types.ts'
import { createBackupStore } from './backupStore.ts'
import {
  createLiveFileSyncManager,
  type LiveFileSyncState,
} from '../../lib/liveFileSync.ts'

interface BackupPanelProps {
  backupData: () => BackupData
  onImported?: () => void
  onRestore?: (data: BackupData) => void
}

export function BackupPanel({
  backupData,
  onImported,
  onRestore,
}: BackupPanelProps) {
  const store = createBackupStore()
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [liveSyncManager] = useState(() => createLiveFileSyncManager())
  const [syncState, setSyncState] = useState<LiveFileSyncState>(() =>
    liveSyncManager.getState(),
  )

  useEffect(() => {
    liveSyncManager.init().then((st) => setSyncState(st))
  }, [liveSyncManager])

  const showReminder = store.shouldShowReminder()

  async function handleToggleLiveSync() {
    setError('')
    setStatus('')
    if (syncState.isEnabled) {
      await liveSyncManager.disable()
      setSyncState(liveSyncManager.getState())
      setStatus('تم إيقاف المزامنة التلقائية')
    } else {
      setStatus('جاري اختيار مكان الملف على جهازك...')
      const res = await liveSyncManager.enable(backupData())
      if (res.ok) {
        setSyncState(liveSyncManager.getState())
        setStatus(
          `تم تفعيل المزامنة التلقائية وحفظ أول نسخة في: ${res.fileName} ✓`,
        )
      } else {
        setError(res.error ?? 'تعذر تفعيل المزامنة')
        setStatus('')
      }
    }
  }

  async function handleManualSyncNow() {
    if (!syncState.isEnabled) return
    setStatus('جاري المزامنة مع الملف...')
    const ok = await liveSyncManager.sync(backupData())
    if (ok) {
      setSyncState(liveSyncManager.getState())
      setStatus('تم تحديث الملف على جهازك بنجاح ✓')
    } else {
      setError('تعذر تحديث الملف — يرجى إعادة تحديد الملف')
      setStatus('')
    }
  }

  async function handleExport() {
    setError('')
    setStatus('جاري تصدير البيانات...')
    try {
      const ok = await store.exportData(backupData())
      if (ok) {
        setStatus('تم تصدير البيانات بنجاح ✓')
      } else {
        setError('فشل في تصدير البيانات')
        setStatus('')
      }
    } catch (e) {
      setError(String(e))
      setStatus('')
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setStatus('جاري استيراد البيانات...')
    try {
      const result = await store.importData(file)
      if (result.ok && result.data) {
        setStatus('تم استيراد البيانات بنجاح ✓')
        if (onRestore) {
          onRestore(result.data)
        } else {
          onImported?.()
        }
      } else {
        setError(result.error ?? 'فشل في الاستيراد')
        setStatus('')
      }
    } catch (err) {
      setError(String(err))
      setStatus('')
    }
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  function triggerFileInput() {
    fileInputRef.current?.click()
  }

  return (
    <div className="card backup-panel">
      <h2>📁 النسخ الاحتياطي والمزامنة التلقائية</h2>

      {/* Live Device File Sync Card */}
      <div className={`live-sync-card ${syncState.isEnabled ? 'active' : ''}`}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <strong>المزامنة الحية مع ملف على هاتفك/جهازك</strong>
          <span
            className={`sync-status-badge ${syncState.isEnabled ? 'active' : 'inactive'}`}
          >
            {syncState.isEnabled ? '🟢 متزامن تلقائياً' : '⚪ غير مفعل'}
          </span>
        </div>

        <p className="muted" style={{ fontSize: '13px', margin: '6px 0 12px' }}>
          {syncState.isEnabled && syncState.fileName
            ? `التطبيق متصل بملف (${syncState.fileName}) على جهازك ويحفظ أي تعديل فورياً وتلقائياً.`
            : 'اختر مكاناً على جهازك لإنشاء ملف بيانات؛ وسيتم حفظ كل خطوة وتمرين تلقائياً في الملف دون الحاجة لتصدير يدوي متكرر!'}
        </p>

        <div className="actions-row">
          <button
            type="button"
            className={syncState.isEnabled ? 'ghost' : 'button-primary'}
            onClick={handleToggleLiveSync}
          >
            {syncState.isEnabled
              ? 'إيقاف المزامنة التلقائية'
              : '📁 اختيار ملف على جهازي وبدء الحفظ التلقائي'}
          </button>
          {syncState.isEnabled && (
            <button type="button" onClick={handleManualSyncNow}>
              🔄 مزامنة وتحديث فوري الآن
            </button>
          )}
        </div>
      </div>

      {showReminder && !syncState.isEnabled && (
        <div className="disclaimer" style={{ marginTop: '12px' }}>
          ⚠️ لم تصدّر بياناتك منذ أكثر من أسبوع. ننصح بتفعيل المزامنة التلقائية
          أو أخذ نسخة احتياطية.
        </div>
      )}

      <h3 style={{ marginTop: '16px', marginBottom: '8px' }}>
        تصدير واستيراد يدوي:
      </h3>
      <div className="actions-row">
        <button type="button" onClick={handleExport}>
          📤 تصدير ملف النسخة
        </button>
        <button type="button" onClick={triggerFileInput}>
          📥 استيراد ملف النسخة
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleImport}
      />

      {status && (
        <p style={{ color: 'var(--accent)', marginTop: '12px' }}>{status}</p>
      )}
      {error && (
        <div className="error-list" style={{ marginTop: '12px' }}>
          <ul>
            <li>{error}</li>
          </ul>
        </div>
      )}

      {store.getLastExport() && (
        <p className="muted" style={{ fontSize: '12px', marginTop: '12px' }}>
          آخر تصدير يدوي:{' '}
          {new Date(store.getLastExport()!).toLocaleDateString('ar-EG')}
        </p>
      )}
    </div>
  )
}
