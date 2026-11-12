import { useEffect, useRef, useState, useCallback } from 'react'
import type { BackupData } from '../shared/types.ts'
import { backupEngine, formatBackupFileName } from './backupEngine.ts'
import {
  MaganisNative,
  type BackupFileItem,
} from '../../platform/native/maganisNative.ts'
import { buildSnapshot, applySnapshot } from './snapshot.ts'
import { createBackupStore } from './backupStore.ts'
import {
  getPreUpdateSnapshot,
  takePreUpdateSnapshot,
  type PreUpdateSnapshotMeta,
} from './preUpdateSnapshot.ts'
import { ConfirmSheet } from '../../ui/ConfirmSheet.tsx'
import { plural } from '../../utils/plural.ts'
import { saveFile } from '../../utils/saveFile.ts'
import { RestoreModal } from './RestoreModal.tsx'
import {
  IconCheck,
  IconAlertTriangle,
  IconRefreshCw,
  IconDownload,
  IconShare,
  IconDatabase,
  IconUpload,
} from '../../components/Icons.tsx'
import { Button } from '../../ui/Button.tsx'
import { Callout } from '../../components/Callout.tsx'

export interface BackupPanelProps {
  backupData?: () => BackupData
  onImported?: () => void
  onRestore?: (data: BackupData) => void
  hideCardWrapper?: boolean
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 ك.ب'
  if (bytes < 1024) return `${bytes} بايت`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} ك.ب`
  return `${(bytes / (1024 * 1024)).toFixed(1)} م.ب`
}

function formatDateAr(ts: number): string {
  return new Date(ts).toLocaleString('ar-EG-u-nu-latn', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function buildImportSummary(data: BackupData): string {
  const parts: string[] = []
  if (data.workoutProgram && typeof data.workoutProgram === 'object') {
    const prog = data.workoutProgram as { name?: string; title?: string }
    parts.push(`برنامج (${prog.name || prog.title || 'تدريبي'})`)
  }
  if (data.trackingSessions && data.trackingSessions.length > 0) {
    parts.push(plural(data.trackingSessions.length, 'جلسة'))
  }
  if (data.customExercises && data.customExercises.length > 0) {
    parts.push(plural(data.customExercises.length, 'تمرين'))
  }
  if (
    data.exerciseOverrides &&
    Object.keys(data.exerciseOverrides).length > 0
  ) {
    parts.push(
      `${plural(Object.keys(data.exerciseOverrides).length, 'تمرين')} بتعديلات`,
    )
  }
  if (data.bodyLog && data.bodyLog.length > 0) {
    parts.push(plural(data.bodyLog.length, 'يوم') + ' قياس')
  }
  if (parts.length === 0) return 'بيانات عامة'
  return parts.join('، ')
}

export function BackupPanel({
  backupData,
  onImported,
  onRestore,
  hideCardWrapper = false,
}: BackupPanelProps) {
  const [, setTick] = useState(0)
  const [isRunningBackup, setIsRunningBackup] = useState(false)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Legacy/V1 store for file input schema validation
  const [store] = useState(() => createBackupStore())
  const [pendingImport, setPendingImport] = useState<{
    data: BackupData
    summary: string
  } | null>(null)
  const [preSnapshot, setPreSnapshot] = useState<PreUpdateSnapshotMeta | null>(
    null,
  )

  // File list state
  const [deviceFiles, setDeviceFiles] = useState<BackupFileItem[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)

  // Restore Modal state
  const [restoreModalOpen, setRestoreModalOpen] = useState(false)
  const [restoreTargetFile, setRestoreTargetFile] =
    useState<BackupFileItem | null>(null)

  const hiddenFileInputRef = useRef<HTMLInputElement>(null)

  const reloadFiles = useCallback(async () => {
    setIsLoadingFiles(true)
    try {
      const allFiles: BackupFileItem[] = []

      // 1. Internal
      try {
        const intRes = await MaganisNative.list({ target: 'internal' })
        if (intRes?.files) {
          allFiles.push(
            ...intRes.files.map((f) => ({ ...f, target: 'internal' as const })),
          )
        }
      } catch {
        // ignore
      }

      // 2. Downloads
      try {
        const dlRes = await MaganisNative.list({ target: 'downloads' })
        if (dlRes?.files) {
          allFiles.push(
            ...dlRes.files.map((f) => ({ ...f, target: 'downloads' as const })),
          )
        }
      } catch {
        // ignore
      }

      // Sort newest first
      allFiles.sort((a, b) => (b.modified || 0) - (a.modified || 0))
      setDeviceFiles(allFiles)
    } finally {
      setIsLoadingFiles(false)
    }
  }, [])

  useEffect(() => {
    const unsub = backupEngine.subscribe(() => {
      setTick((t) => t + 1)
    })
    reloadFiles().catch(() => {})
    getPreUpdateSnapshot()
      .then((meta) => setPreSnapshot(meta))
      .catch(() => {})
    return unsub
  }, [reloadFiles])

  const status = backupEngine.getStatus()
  const settings = backupEngine.getSettings()
  const overall = backupEngine.getOverallState()

  // Manual Backup trigger
  async function handleRunBackupNow() {
    setIsRunningBackup(true)
    setStatusMsg(null)
    setErrorMsg(null)
    try {
      const res = await backupEngine.runBackup('manual_button')
      if (res.success) {
        setStatusMsg('تم إنشاء النسخة الاحتياطية والتحقق منها بنجاح!')
        await reloadFiles()
      } else {
        setErrorMsg(res.errorAr || 'تعذر إتمام النسخ الاحتياطي.')
      }
    } catch (err) {
      setErrorMsg(String(err))
    } finally {
      setIsRunningBackup(false)
    }
  }

  // Real Save As (L3 ACTION_CREATE_DOCUMENT via saveFile)
  async function handleSaveAs() {
    setStatusMsg('جاري تجهيز النسخة الكاملة...')
    setErrorMsg(null)
    try {
      const snap = await buildSnapshot()
      const json = JSON.stringify(snap)
      const fileName = formatBackupFileName(new Date(snap.createdAt))
      const blob = new Blob([json], { type: 'application/json' })
      const res = await saveFile(blob, fileName, 'application/json')
      if (!res.error) {
        setStatusMsg('تم حفظ النسخة بنجاح في المكان المحدد.')
      } else {
        setErrorMsg(res.error || 'تعذر حفظ النسخة.')
      }
    } catch (err) {
      setErrorMsg('فشل الحفظ: ' + String(err))
    }
  }

  // Share File (L3 ACTION_SEND)
  async function handleShare() {
    setStatusMsg('جاري تجهيز النسخة للمشاركة...')
    setErrorMsg(null)
    try {
      // Find latest verified internal or downloads file
      const latestFile = deviceFiles.find(
        (f) =>
          f.name.startsWith('maganis-backup-') ||
          f.name.startsWith('bunyan-backup-'),
      )
      if (latestFile) {
        const target =
          latestFile.target === 'downloads' ? 'downloads' : 'internal'
        await MaganisNative.shareFile({
          target,
          name: latestFile.name,
          uri: latestFile.uri,
        })
        setStatusMsg('تم فتح نافذة المشاركة.')
      } else {
        // Fallback: save temporary file or create snapshot
        const snap = await buildSnapshot()
        const json = JSON.stringify(snap)
        const fileName = formatBackupFileName(new Date(snap.createdAt))
        const blob = new Blob([json], { type: 'application/json' })
        await saveFile(blob, fileName, 'application/json')
        setStatusMsg('تم تجهيز الملف للمشاركة.')
      }
    } catch (err) {
      setErrorMsg('تعذر المشاركة: ' + String(err))
    }
  }

  // Pick Custom Folder (L5 SAF)
  async function handlePickFolder() {
    setErrorMsg(null)
    try {
      const res = await MaganisNative.pickFolder()
      if (res.uri) {
        backupEngine.updateSettings({
          destinations: {
            ...settings.destinations,
            folder: true,
          },
          folderUri: res.uri,
          folderDisplayName: res.displayName || 'مجلد مخصص',
        })
        setStatusMsg(
          `تم تفعيل النسخ التلقائي في المجلد: ${res.displayName || 'المحدد'}`,
        )
      }
    } catch (err) {
      setErrorMsg('تعذر اختيار المجلد: ' + String(err))
    }
  }

  // Release Custom Folder (L5)
  async function handleReleaseFolder() {
    if (!settings.folderUri) return
    try {
      await MaganisNative.releaseFolder({ uri: settings.folderUri })
      backupEngine.updateSettings({
        destinations: {
          ...settings.destinations,
          folder: false,
        },
        folderUri: undefined,
        folderDisplayName: undefined,
      })
      setStatusMsg('تم إلغاء المجلد المخصص.')
    } catch (err) {
      setErrorMsg('تعذر إلغاء الإذن: ' + String(err))
    }
  }

  function openRestoreForFile(file: BackupFileItem) {
    setRestoreTargetFile(file)
    setRestoreModalOpen(true)
  }

  function openRestoreGeneric() {
    setRestoreTargetFile(null)
    setRestoreModalOpen(true)
  }

  // File picker handler for importing V1 or external JSON backups
  async function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setErrorMsg(null)
    setStatusMsg('جاري فحص ملف النسخة الاحتياطية...')
    try {
      const result = await store.importData(file)
      if (result.ok && result.data) {
        setStatusMsg(null)
        const summary = buildImportSummary(result.data)
        setPendingImport({ data: result.data, summary })
      } else {
        setErrorMsg(result.error ?? 'فشل في الاستيراد')
        setStatusMsg(null)
      }
    } catch (err) {
      setErrorMsg(String(err))
      setStatusMsg(null)
    }
    e.target.value = ''
  }

  async function handleConfirmImport() {
    if (!pendingImport) return
    setErrorMsg(null)
    setStatusMsg('جاري حفظ نسخة احتياطية وتطبيق الاستيراد...')
    try {
      if (backupData) {
        await takePreUpdateSnapshot(backupData, true)
      }
      if (onRestore) {
        onRestore(pendingImport.data)
      } else {
        onImported?.()
      }
      const snap = await getPreUpdateSnapshot()
      setPreSnapshot(snap)
      setStatusMsg('تم استيراد البيانات بنجاح')
      setPendingImport(null)
    } catch (err) {
      setErrorMsg('فشل في استيراد البيانات: ' + String(err))
      setStatusMsg(null)
    }
  }

  async function handleRestorePreSnapshot() {
    if (!preSnapshot) return
    if (
      !window.confirm(
        'هل تريد بالتأكيد استعادة نسخة البيانات المحفوظة قبل التحديث؟ سيتم استبدال البيانات الحالية بهذه النسخة.',
      )
    ) {
      return
    }
    setErrorMsg(null)
    setStatusMsg('جاري استعادة نسخة ما قبل التحديث...')
    try {
      if (preSnapshot.snapshot) {
        await applySnapshot(preSnapshot.snapshot)
        onImported?.()
      } else if (preSnapshot.data && onRestore) {
        onRestore(preSnapshot.data)
      } else {
        onImported?.()
      }
      setStatusMsg('تمت استعادة نسخة ما قبل التحديث بنجاح')
    } catch (err) {
      setErrorMsg('فشل في استعادة نسخة ما قبل التحديث: ' + String(err))
      setStatusMsg(null)
    }
  }

  const isVerified = Boolean(status.lastVerifiedTime && overall.state === 'ok')
  const isDanger =
    overall.state === 'failing' || overall.state === 'folder_permission_lost'

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Status Card (Strictly D4 Compliant) */}
      <div
        className="backup-status-card"
        style={{
          borderRadius: 'var(--radius-card)',
          border: `1px solid ${
            isDanger
              ? 'rgba(239, 68, 68, 0.4)'
              : overall.state === 'stale'
                ? 'rgba(245, 158, 11, 0.4)'
                : isVerified
                  ? 'rgba(16, 185, 129, 0.3)'
                  : 'var(--color-border)'
          }`,
          background: 'var(--color-surface)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
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
          <div
            style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}
          >
            {isVerified ? (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <IconCheck size={18} />
              </div>
            ) : overall.state === 'never' ? (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--color-surface-2)',
                  color: 'var(--color-text-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <IconDatabase size={18} />
              </div>
            ) : (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isDanger
                    ? 'rgba(239, 68, 68, 0.15)'
                    : 'rgba(245, 158, 11, 0.15)',
                  color: isDanger ? '#ef4444' : '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <IconAlertTriangle size={18} />
              </div>
            )}

            <div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                }}
              >
                {status.lastVerifiedTime
                  ? `آخر نسخة متأكد منها: ${formatDateAr(status.lastVerifiedTime)}`
                  : 'لم يتم أخذ أي نسخة احتياطية متأكد منها بعد'}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text-2)',
                  marginTop: '2px',
                  lineHeight: '1.4',
                }}
              >
                {overall.messageAr}
                {overall.reasonAr && ` — ${overall.reasonAr}`}
              </div>
            </div>
          </div>

          {isVerified && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.12)',
                padding: '4px 8px',
                borderRadius: 'var(--radius-control)',
                whiteSpace: 'nowrap',
              }}
            >
              تم التحقق بالكامل
            </span>
          )}
        </div>

        {/* Destination Breakdown */}
        <div
          style={{
            background: 'var(--color-surface-2)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '12px',
          }}
        >
          {/* Internal */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '6px',
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
              ذاكرة الهاتف الداخلية
            </span>
            <span style={{ color: 'var(--color-text-2)' }}>
              {status.destinations.internal.lastVerifiedAt
                ? `متأكد منها (${formatBytes(status.destinations.internal.bytes || 0)})`
                : 'في الانتظار'}
            </span>
          </div>

          {/* Downloads */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '6px',
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
              مجلد التنزيلات (<bdi dir="ltr">Download/Bunyan</bdi>)
            </span>
            <span style={{ color: 'var(--color-text-2)' }}>
              {status.destinations.downloads.lastVerifiedAt
                ? `متأكد منها (${formatBytes(status.destinations.downloads.bytes || 0)})`
                : status.destinations.downloads.errorAr
                  ? 'غير مدعوم'
                  : 'في الانتظار'}
            </span>
          </div>

          {/* Custom Folder L5 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '6px',
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
              مجلد مخصص إضافي
            </span>
            <span>
              {settings.folderDisplayName ? (
                <span style={{ color: 'var(--color-success)' }}>
                  {settings.folderDisplayName}
                </span>
              ) : (
                <span style={{ color: 'var(--color-text-2)' }}>غير محدد</span>
              )}
            </span>
          </div>
        </div>

        {/* L4 Google Auto Backup Honest Disclaimer Line */}
        <div
          style={{
            fontSize: '11px',
            color: 'var(--color-text-2)',
            borderTop: '1px solid var(--color-divider)',
            paddingTop: '8px',
            lineHeight: '1.45',
          }}
        >
          النسخ الاحتياطي التلقائي من Google ممكن يساعدك على جهاز جديد لو مفعله
          من إعدادات الموبايل، لكن التطبيق مقدرش يتحقق منه.
        </div>
      </div>

      {/* Status / Error Alerts */}
      {statusMsg && <Callout variant="tip">{statusMsg}</Callout>}
      {errorMsg && <Callout variant="error">{errorMsg}</Callout>}

      {/* 2. Action Buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
          gap: '8px',
        }}
      >
        <Button
          variant="primary"
          disabled={isRunningBackup}
          onClick={handleRunBackupNow}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          {isRunningBackup ? (
            <>
              <IconRefreshCw
                size={16}
                style={{ animation: 'spin 1s linear infinite' }}
              />
              <span>جاري النسخ...</span>
            </>
          ) : (
            <>
              <IconRefreshCw size={16} />
              <span>انسخ دلوقتي</span>
            </>
          )}
        </Button>

        <Button
          variant="secondary"
          onClick={handleSaveAs}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <IconDownload size={16} />
          <span>احفظ في مكان أختاره</span>
        </Button>

        <Button
          variant="secondary"
          onClick={handleShare}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <IconShare size={16} />
          <span>شارك نسخة</span>
        </Button>

        <Button
          variant="secondary"
          onClick={openRestoreGeneric}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <IconUpload size={16} />
          <span>استرجع من نسخة</span>
        </Button>
      </div>

      {/* L5 Folder Picker / Settings */}
      <div
        className="backup-folder-card"
        style={{
          borderRadius: 'var(--radius-card)',
          padding: '12px 14px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-divider)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ minWidth: 0, flex: '1 1 180px' }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--color-text)',
              }}
            >
              مجلد نسخ احتياطي إضافي (اختياري)
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-text-2)',
                marginTop: '2px',
              }}
            >
              {settings.folderDisplayName
                ? `المجلد الحالي: ${settings.folderDisplayName}`
                : 'يمكنك اختيار مجلد في الذاكرة الخارجية أو بطاقة SD لحفظ نسخة إضافية تلقائياً.'}
            </div>
          </div>
          <div style={{ flexShrink: 0 }}>
            {settings.folderDisplayName ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleReleaseFolder}
                style={{
                  minHeight: '44px',
                  height: 'auto',
                  padding: '8px 14px',
                }}
              >
                إلغاء المجلد
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePickFolder}
                style={{
                  minHeight: '44px',
                  height: 'auto',
                  padding: '8px 14px',
                }}
              >
                اختار مجلد
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Pre-update restore */}
      {preSnapshot && (
        <div
          onClick={handleRestorePreSnapshot}
          style={{
            cursor: 'pointer',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-divider)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--color-text)',
              }}
            >
              استعادة نسخة ما قبل التحديث
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-text-2)',
                marginTop: '2px',
              }}
            >
              نسخة احتياطية محفوظة تلقائياً (
              {new Date(preSnapshot.takenAt).toLocaleDateString(
                'ar-EG-u-nu-latn',
              )}
              )
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRestorePreSnapshot}
          >
            استعادة
          </Button>
        </div>
      )}

      {/* 3. Existing Backups List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--color-text)',
            }}
          >
            النسخ الاحتياطية المتوفرة على الجهاز
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => hiddenFileInputRef.current?.click()}
              style={{ minHeight: '44px', height: 'auto', padding: '8px 12px' }}
            >
              استيراد من ملف
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={reloadFiles}
              disabled={isLoadingFiles}
              style={{ minHeight: '44px', height: 'auto', padding: '8px 12px' }}
            >
              تحديث القائمة
            </Button>
          </div>
        </div>

        {isLoadingFiles ? (
          <div
            style={{
              textAlign: 'center',
              padding: '16px',
              color: 'var(--color-text-2)',
              fontSize: '13px',
            }}
          >
            جاري قراءة النسخ المتوفرة...
          </div>
        ) : deviceFiles.length === 0 ? (
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-2)',
              textAlign: 'center',
              color: 'var(--color-text-2)',
              fontSize: '13px',
            }}
          >
            لا توجد ملفات نسخ احتياطية مسجلة بعد.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {deviceFiles.map((file, idx) => (
              <div
                key={file.name + '-' + idx}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-divider)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    minWidth: 0,
                    flex: '1 1 160px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background:
                          file.target === 'downloads'
                            ? 'rgba(59, 130, 246, 0.1)'
                            : 'rgba(16, 185, 129, 0.1)',
                        color:
                          file.target === 'downloads' ? '#3b82f6' : '#10b981',
                      }}
                    >
                      {file.target === 'downloads' ? 'التنزيلات' : 'داخلي'}
                    </span>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--color-text)',
                        direction: 'ltr',
                        textAlign: 'right',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {file.name}
                    </span>
                  </div>
                  <div
                    style={{ fontSize: '11px', color: 'var(--color-text-2)' }}
                  >
                    {formatDateAr(file.modified || Date.now())} •{' '}
                    {formatBytes(file.size)}
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openRestoreForFile(file)}
                  style={{
                    flexShrink: 0,
                    minHeight: '44px',
                    height: 'auto',
                    padding: '8px 14px',
                  }}
                >
                  استعادة
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden file input for importing arbitrary/V1 JSON */}
      <input
        ref={hiddenFileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      {/* Confirm Import Sheet for V1 or external file picker */}
      <ConfirmSheet
        isOpen={Boolean(pendingImport)}
        onClose={() => setPendingImport(null)}
        onConfirm={handleConfirmImport}
        title="تأكيد استيراد البيانات"
        confirmLabel="تأكيد واستيراد"
        cancelLabel="إلغاء"
        consequences={[
          'سيتم استبدال البيانات الحالية بالبيانات الموجودة في الملف.',
          'سيتم حفظ نسخة احتياطية تلقائياً من بياناتك الحالية قبل الاستيراد.',
        ]}
      >
        {pendingImport && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--color-surface-2)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '14px',
              color: 'var(--color-text)',
              marginBottom: '4px',
            }}
          >
            هتستورد: {pendingImport.summary}
          </div>
        )}
      </ConfirmSheet>

      {/* 4. Restore Modal */}
      <RestoreModal
        isOpen={restoreModalOpen}
        onClose={() => {
          setRestoreModalOpen(false)
          setRestoreTargetFile(null)
        }}
        onSuccess={() => {
          setRestoreModalOpen(false)
          setRestoreTargetFile(null)
          onImported?.()
          reloadFiles().catch(() => {})
        }}
        initialFile={restoreTargetFile}
      />
    </div>
  )

  if (hideCardWrapper) {
    return content
  }

  return (
    <div className="card backup-panel" style={{ padding: '12px' }}>
      {content}
    </div>
  )
}
