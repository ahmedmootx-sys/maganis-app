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

import {
  getPreUpdateSnapshot,
  type PreUpdateSnapshotMeta,
} from './preUpdateSnapshot.ts'

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
  const [preSnapshot, setPreSnapshot] = useState<PreUpdateSnapshotMeta | null>(
    null,
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [liveSyncManager] = useState(() => createLiveFileSyncManager())
  const [syncState, setSyncState] = useState<LiveFileSyncState>(() =>
    liveSyncManager.getState(),
  )

  useEffect(() => {
    liveSyncManager.init().then((st) => setSyncState(st))
    getPreUpdateSnapshot().then((meta) => setPreSnapshot(meta))
  }, [liveSyncManager])

  async function handleRestorePreSnapshot() {
    if (!preSnapshot) return
    if (
      !window.confirm(
        'هل تريد بالتأكيد استعادة نسخة البيانات المحفوظة قبل التحديث؟ سيتم استبدال البيانات الحالية بهذه النسخة.',
      )
    ) {
      return
    }
    setError('')
    setStatus('جاري استعادة نسخة ما قبل التحديث...')
    try {
      if (onRestore) {
        onRestore(preSnapshot.data)
      } else {
        onImported?.()
      }
      setStatus('تمت استعادة نسخة ما قبل التحديث بنجاح')
    } catch (err) {
      setError('فشل في استعادة نسخة ما قبل التحديث: ' + String(err))
      setStatus('')
    }
  }

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
    ? new Date(lastExportTimestamp).toLocaleDateString('ar-EG-u-nu-latn', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  function formatMiddleEllipsis(str: string, maxLen = 34): string {
    if (!str || str.length <= maxLen) return str
    const half = Math.floor((maxLen - 3) / 2)
    return `${str.slice(0, half)}...${str.slice(-half)}`
  }

  const content = (
    <div
      className="backup-panel-content"
      style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
    >
      {/* Live sync row */}
      <div
        className="list-row"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          padding: '12px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <IconDatabase
            size={20}
            style={{ flexShrink: 0, color: 'var(--color-accent)' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--color-text)',
              }}
            >
              المزامنة الحية
            </div>
            <div
              dir={syncState.isEnabled && syncState.fileName ? 'ltr' : 'rtl'}
              style={{
                fontSize: '13px',
                color: 'var(--color-text-2)',
                marginTop: '2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden' /* clip-ok: text ellipsis truncation */,
                textOverflow: 'ellipsis',
              }}
            >
              {syncState.isEnabled && syncState.fileName
                ? formatMiddleEllipsis(syncState.fileName, 34)
                : 'حفظ أي تعديل أو تمرين تلقائياً في ملف خارجي'}
            </div>
          </div>
        </div>

        {/* Status chip and action button on their own line */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            paddingTop: '8px',
            borderTop: '1px solid var(--color-divider)',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              color: syncState.isEnabled ? '#10b981' : 'var(--color-text-2)',
              background: syncState.isEnabled
                ? 'rgba(16, 185, 129, 0.12)'
                : 'var(--color-surface-2)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-control)',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: syncState.isEnabled
                  ? '#10b981'
                  : 'var(--color-text-2)',
              }}
            />
            {syncState.isEnabled ? 'متزامن تلقائياً' : 'غير مفعّل'}
          </span>
          <button
            type="button"
            className={
              syncState.isEnabled
                ? 'btn btn--secondary btn--small'
                : 'btn btn--primary btn--small'
            }
            onClick={handleToggleLiveSync}
            style={{
              height: '36px',
              fontSize: '13px',
              padding: '0 16px',
              cursor: 'pointer',
            }}
          >
            {syncState.isEnabled ? 'إيقاف' : 'تفعيل'}
          </button>
        </div>
      </div>

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

      {/* Pre-update restore */}
      {preSnapshot && (
        <ListRow
          leading={<IconRefreshCw size={18} />}
          title="استعادة نسخة ما قبل التحديث"
          secondary={`نسخة احتياطية محفوظة تلقائياً (${new Date(preSnapshot.takenAt).toLocaleDateString('ar-EG-u-nu-latn')})`}
          onClick={handleRestorePreSnapshot}
        />
      )}

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
