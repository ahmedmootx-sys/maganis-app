import { useEffect, useRef, useState } from 'react'
import type { BackupData } from '../shared/types.ts'
import { createBackupStore } from './backupStore.ts'
import {
  createLiveFileSyncManager,
  type LiveFileSyncState,
} from '../../lib/liveFileSync.ts'
import { ListRow } from '../../components/ListRow.tsx'
import { Callout } from '../../components/Callout.tsx'
import {
  IconRefreshCw,
  IconDownload,
  IconUpload,
  IconShare,
  IconDatabase,
} from '../../components/Icons.tsx'

export interface BackupPanelProps {
  backupData: () => BackupData
  onImported?: () => void
  onRestore?: (data: BackupData) => void
  hideCardWrapper?: boolean
}

export function BackupPanel({
  backupData,
  onImported,
  onRestore,
  hideCardWrapper = false,
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
          `تم تفعيل المزامنة التلقائية وحفظ أول نسخة في: ${res.fileName}`,
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
      setStatus('تم تحديث الملف على جهازك بنجاح')
    } else {
      setError('تعذر تحديث الملف — يرجى إعادة تحديد الملف')
      setStatus('')
    }
  }

  async function handleShare() {
    setError('')
    setStatus('جاري فتح خيارات المشاركة...')
    try {
      const ok = await store.shareData(backupData())
      if (ok) {
        setStatus('تمت المشاركة بنجاح')
      } else {
        setStatus('')
      }
    } catch (e) {
      setError(String(e))
      setStatus('')
    }
  }

  async function handleExport() {
    setError('')
    setStatus('جاري تصدير البيانات...')
    try {
      const ok = await store.exportData(backupData())
      if (ok) {
        setStatus('تم تصدير البيانات بنجاح')
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
        setStatus('تم استيراد البيانات بنجاح')
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
    e.target.value = ''
  }

  function triggerFileInput() {
    fileInputRef.current?.click()
  }

  const lastExportTimestamp = store.getLastExport()
  const lastExportFormatted = lastExportTimestamp
    ? new Date(lastExportTimestamp).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  const content = (
    <div
      className="backup-panel-content"
      style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
    >
      {/* Live sync row */}
      <ListRow
        leading={<IconDatabase size={20} />}
        title="المزامنة الحية مع ملف على جهازك"
        secondary={
          syncState.isEnabled && syncState.fileName
            ? syncState.fileName
            : 'حفظ أي تعديل أو تمرين تلقائياً في ملف خارجي'
        }
        secondaryIsLtr={syncState.isEnabled && !!syncState.fileName}
        trailing={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 600,
                color: syncState.isEnabled ? '#10b981' : 'var(--muted)',
                background: syncState.isEnabled
                  ? 'rgba(16, 185, 129, 0.12)'
                  : 'var(--card-subtle)',
                padding: '3px 8px',
                borderRadius: '6px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: syncState.isEnabled ? '#10b981' : 'var(--muted)',
                }}
              />
              {syncState.isEnabled ? 'متزامن تلقائياً' : 'غير مفعّل'}
            </span>
            <button
              type="button"
              className={syncState.isEnabled ? 'ghost' : 'btn-primary-action'}
              onClick={handleToggleLiveSync}
              style={{
                height: '36px',
                fontSize: '13px',
                padding: '0 12px',
                minWidth: 'auto',
              }}
            >
              {syncState.isEnabled ? 'إيقاف' : 'تفعيل'}
            </button>
          </div>
        }
      />

      {syncState.isEnabled && (
        <ListRow
          leading={<IconRefreshCw size={18} />}
          title="مزامنة وتحديث فوري الآن"
          secondary="حفظ أحدث التعديلات في الملف المحدد فوراً"
          onClick={handleManualSyncNow}
        />
      )}

      {/* Manual Export */}
      <ListRow
        leading={<IconDownload size={18} />}
        title="تنزيل نسخة احتياطية (ملف JSON)"
        secondary={
          lastExportFormatted
            ? `آخر تصدير: ${lastExportFormatted}`
            : 'حفظ نسخة من كامل بياناتك في مجلد التنزيلات'
        }
        onClick={handleExport}
      />

      {/* Import */}
      <ListRow
        leading={<IconUpload size={18} />}
        title="استيراد نسخة احتياطية من ملف"
        secondary="استعادة كل البيانات والتمارين من ملف تم تنزيله سابقاً"
        onClick={triggerFileInput}
      />

      {/* Share */}
      <ListRow
        leading={<IconShare size={18} />}
        title="مشاركة النسخة الاحتياطية"
        secondary="إرسال ملف البيانات مباشرة عبر واتساب أو تليجرام"
        onClick={handleShare}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleImport}
      />

      {/* Feedback Alerts */}
      {status && (
        <div style={{ marginTop: '8px' }}>
          <Callout variant="tip">{status}</Callout>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '8px' }}>
          <Callout variant="error">{error}</Callout>
        </div>
      )}

      {showReminder && !syncState.isEnabled && (
        <div style={{ marginTop: '8px' }}>
          <Callout variant="warning">
            لم تصدّر بياناتك منذ أكثر من أسبوع. ننصح بتفعيل المزامنة التلقائية
            أو أخذ نسخة احتياطية للحفاظ على بياناتك.
          </Callout>
        </div>
      )}
    </div>
  )

  if (hideCardWrapper) {
    return content
  }

  return (
    <div className="card backup-panel" style={{ padding: '8px' }}>
      {content}
    </div>
  )
}
