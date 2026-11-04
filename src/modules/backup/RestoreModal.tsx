import { useState, useEffect, useCallback } from 'react'
import { Sheet } from '../../ui/Sheet.tsx'
import { Button } from '../../ui/Button.tsx'
import { Callout } from '../../components/Callout.tsx'
import {
  IconAlertTriangle,
  IconCheck,
  IconClipboard,
} from '../../components/Icons.tsx'
import {
  validateSnapshot,
  applySnapshot,
  computeManifestCounts,
  type MaganisSnapshotV2,
  type SnapshotManifestCounts,
} from './snapshot.ts'
import { appStorage } from '../../platform/storage.ts'
import { getAllMediaItems } from '../../lib/indexedStorage.ts'
import {
  MaganisNative,
  type BackupFileItem,
} from '../../platform/native/maganisNative.ts'
import { plural } from '../../utils/plural.ts'

export interface RestoreModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialFile?: BackupFileItem | null
}

export function RestoreModal({
  isOpen,
  onClose,
  onSuccess,
  initialFile,
}: RestoreModalProps) {
  const [loading, setLoading] = useState(false)
  const [errorAr, setErrorAr] = useState<string | null>(null)
  const [warningAr, setWarningAr] = useState<string | null>(null)
  const [validatedSnapshot, setValidatedSnapshot] =
    useState<MaganisSnapshotV2 | null>(null)
  const [currentCounts, setCurrentCounts] =
    useState<SnapshotManifestCounts | null>(null)
  const [snapshotCounts, setSnapshotCounts] =
    useState<SnapshotManifestCounts | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [showUndoBanner, setShowUndoBanner] = useState(false)
  const [undoSnapshot, setUndoSnapshot] = useState<MaganisSnapshotV2 | null>(
    null,
  )

  const processPayload = useCallback(async (payload: unknown) => {
    setLoading(true)
    setErrorAr(null)
    setWarningAr(null)
    try {
      const valResult = await validateSnapshot(payload)
      if (!valResult.ok || !valResult.snapshot) {
        setErrorAr(
          valResult.errorAr || 'ملف النسخة الاحتياطية غير صالح أو تالف.',
        )
        setValidatedSnapshot(null)
        return
      }

      setValidatedSnapshot(valResult.snapshot)
      setSnapshotCounts(valResult.counts)
      if (valResult.warningAr) {
        setWarningAr(valResult.warningAr)
      }
    } catch (err: unknown) {
      setErrorAr('فشل في فحص ملف النسخة: ' + String(err))
      setValidatedSnapshot(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadCurrentCounts = useCallback(async () => {
    try {
      const allKv = appStorage.getAll()
      let allMedia = {}
      try {
        allMedia = await getAllMediaItems()
      } catch {
        // ignore
      }
      const counts = computeManifestCounts(
        allKv,
        allMedia as Record<string, { mime: string; dataUrl: string }>,
      )
      setCurrentCounts(counts)
    } catch {
      // ignore
    }
  }, [])

  const loadFileFromNative = useCallback(
    async (fileItem: BackupFileItem) => {
      setLoading(true)
      setErrorAr(null)
      try {
        const openRes = await MaganisNative.openRead({
          target: fileItem.target || 'internal',
          name: fileItem.name,
          uri: fileItem.uri,
        })

        const byteArrays: Uint8Array[] = []
        let totalBytes = 0
        let eof = false
        while (!eof) {
          const chunk = await MaganisNative.readChunk({
            handle: openRes.handle,
          })
          if (chunk.chunkBase64) {
            const bin = atob(chunk.chunkBase64)
            const arr = new Uint8Array(bin.length)
            for (let i = 0; i < bin.length; i++) {
              arr[i] = bin.charCodeAt(i)
            }
            byteArrays.push(arr)
            totalBytes += arr.length
          }
          eof = chunk.eof
        }
        await MaganisNative.closeRead({ handle: openRes.handle })

        const combined = new Uint8Array(totalBytes)
        let offset = 0
        for (const arr of byteArrays) {
          combined.set(arr, offset)
          offset += arr.length
        }
        const fullText = new TextDecoder().decode(combined)

        const parsed = JSON.parse(fullText)
        await processPayload(parsed)
      } catch (err: unknown) {
        setErrorAr('تعذر قراءة ملف النسخة الاحتياطية: ' + String(err))
      } finally {
        setLoading(false)
      }
    },
    [processPayload],
  )

  useEffect(() => {
    if (isOpen) {
      setErrorAr(null)
      setWarningAr(null)
      setValidatedSnapshot(null)
      setShowUndoBanner(false)
      loadCurrentCounts()
      if (initialFile) {
        loadFileFromNative(initialFile)
      }
    }
  }, [isOpen, initialFile, loadCurrentCounts, loadFileFromNative])

  function handleFilePicker(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const text = String(reader.result)
        const parsed = JSON.parse(text)
        await processPayload(parsed)
      } catch {
        setErrorAr('ملف النسخة ليس بتنسيق JSON صالح.')
      }
    }
    reader.onerror = () => {
      setErrorAr('تعذر قراءة الملف من الجهاز.')
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  async function handleConfirmApply() {
    if (!validatedSnapshot) return
    setIsApplying(true)
    setErrorAr(null)

    try {
      // Capture state before apply as undo safety snapshot
      const currentKv = appStorage.getAll()
      let currentMedia = {}
      try {
        currentMedia = await getAllMediaItems()
      } catch {
        // ignore
      }
      const safetyCounts = computeManifestCounts(
        currentKv,
        currentMedia as Record<string, { mime: string; dataUrl: string }>,
      )
      const safetySnap: MaganisSnapshotV2 = {
        format: 'maganis-snapshot',
        exportVersion: 2,
        appVersion: '0.1.0',
        schemaVersion: validatedSnapshot.schemaVersion,
        createdAt: Date.now(),
        source: 'native',
        manifest: {
          kv: {},
          media: {},
          counts: safetyCounts,
          excludedKeys: [],
        },
        data: {
          kv: currentKv,
          media: currentMedia as Record<
            string,
            { mime: string; dataUrl: string }
          >,
        },
      }
      setUndoSnapshot(safetySnap)

      // Apply snapshot transactionally
      const applyRes = await applySnapshot(validatedSnapshot)
      if (!applyRes.success) {
        setErrorAr(
          applyRes.errorAr || 'فشلت استعادة النسخة وتراجع التطبيق بأمان.',
        )
        return
      }

      setShowUndoBanner(true)
      onSuccess()
    } catch (err: unknown) {
      setErrorAr('حدث خطأ أثناء تطبيق النسخة: ' + String(err))
    } finally {
      setIsApplying(false)
    }
  }

  async function handleUndo() {
    if (!undoSnapshot) return
    setIsApplying(true)
    try {
      const undoRes = await applySnapshot(undoSnapshot)
      if (undoRes.success) {
        setShowUndoBanner(false)
        setUndoSnapshot(null)
        onSuccess()
        onClose()
      } else {
        setErrorAr('تعذر التراجع: ' + (undoRes.errorAr || 'خطأ غير معروف'))
      }
    } catch (err) {
      setErrorAr('تعذر التراجع: ' + String(err))
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="استرجاع البيانات من نسخة احتياطية"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {showUndoBanner && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-card)',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid #10b981',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconCheck size={18} style={{ color: '#10b981' }} />
              <span
                style={{
                  fontWeight: 600,
                  fontSize: '14px',
                  color: 'var(--color-text)',
                }}
              >
                تم استرجاع النسخة بنجاح وتحديث كافة البيانات!
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
              }}
            >
              <Button
                variant="secondary"
                size="sm"
                onClick={handleUndo}
                disabled={isApplying}
              >
                تراجع عن الاسترجاع
              </Button>
              <Button variant="primary" size="sm" onClick={onClose}>
                تم، شكرًا
              </Button>
            </div>
          </div>
        )}

        {!showUndoBanner && (
          <>
            {!validatedSnapshot && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    color: 'var(--color-text-2)',
                  }}
                >
                  اختر ملف نسخة احتياطية بصيغة JSON من جهازك لاستعادتها بأمان
                  تام.
                </p>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '16px',
                    borderRadius: 'var(--radius-card)',
                    border: '2px dashed var(--color-border)',
                    cursor: 'pointer',
                    background: 'var(--color-surface)',
                  }}
                >
                  <IconClipboard
                    size={20}
                    style={{ color: 'var(--color-accent)' }}
                  />
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: '14px',
                      color: 'var(--color-text)',
                    }}
                  >
                    {loading
                      ? 'جاري فحص الملف...'
                      : 'اضغط لاختيار ملف نسخة احتياطية'}
                  </span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFilePicker}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            )}

            {errorAr && <Callout variant="error">{errorAr}</Callout>}

            {warningAr && <Callout variant="warning">{warningAr}</Callout>}

            {validatedSnapshot && snapshotCounts && currentCounts && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-card)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  <IconAlertTriangle
                    size={20}
                    style={{
                      color: '#ef4444',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  />
                  <div
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-text)',
                      lineHeight: 1.5,
                    }}
                  >
                    <strong>تنبيه هام:</strong> استعادة النسخة الاحتياطية
                    ستستبدل البيانات الحالية على هذا الهاتف بالبيانات المحفوظة
                    في ملف النسخة.
                  </div>
                </div>

                <div
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-card)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 90px 90px',
                      background: 'var(--color-surface-2)',
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--color-text-2)',
                    }}
                  >
                    <span>نوع البيانات</span>
                    <span style={{ textAlign: 'center' }}>الآن على جهازك</span>
                    <span style={{ textAlign: 'center' }}>في ملف النسخة</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      fontSize: '13px',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 90px 90px',
                        padding: '10px 12px',
                        borderTop: '1px solid var(--color-divider)',
                      }}
                    >
                      <span>جلسات التمرين المسجلة</span>
                      <span style={{ textAlign: 'center' }}>
                        {plural(currentCounts.sessions, 'جلسة')}
                      </span>
                      <span style={{ textAlign: 'center', fontWeight: 600 }}>
                        {plural(snapshotCounts.sessions, 'جلسة')}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 90px 90px',
                        padding: '10px 12px',
                        borderTop: '1px solid var(--color-divider)',
                      }}
                    >
                      <span>أيام جدول التمرين</span>
                      <span style={{ textAlign: 'center' }}>
                        {plural(currentCounts.programDays, 'يوم')}
                      </span>
                      <span style={{ textAlign: 'center', fontWeight: 600 }}>
                        {plural(snapshotCounts.programDays, 'يوم')}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 90px 90px',
                        padding: '10px 12px',
                        borderTop: '1px solid var(--color-divider)',
                      }}
                    >
                      <span>سجلات التغذية اليومية</span>
                      <span style={{ textAlign: 'center' }}>
                        {plural(currentCounts.nutritionDays, 'يوم')}
                      </span>
                      <span style={{ textAlign: 'center', fontWeight: 600 }}>
                        {plural(snapshotCounts.nutritionDays, 'يوم')}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 90px 90px',
                        padding: '10px 12px',
                        borderTop: '1px solid var(--color-divider)',
                      }}
                    >
                      <span>الوجبات والأطعمة المخصصة</span>
                      <span style={{ textAlign: 'center' }}>
                        {currentCounts.customMeals + currentCounts.customFoods}
                      </span>
                      <span style={{ textAlign: 'center', fontWeight: 600 }}>
                        {snapshotCounts.customMeals +
                          snapshotCounts.customFoods}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 90px 90px',
                        padding: '10px 12px',
                        borderTop: '1px solid var(--color-divider)',
                      }}
                    >
                      <span>تعديلات وسائط وتمارين</span>
                      <span style={{ textAlign: 'center' }}>
                        {currentCounts.customExercises +
                          currentCounts.overrides}
                      </span>
                      <span style={{ textAlign: 'center', fontWeight: 600 }}>
                        {snapshotCounts.customExercises +
                          snapshotCounts.overrides}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <Button
                    variant="danger"
                    size="md"
                    onClick={handleConfirmApply}
                    loading={isApplying}
                    style={{ flex: 1 }}
                  >
                    تأكيد الاستبدال والاستعادة
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setValidatedSnapshot(null)}
                    disabled={isApplying}
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Sheet>
  )
}
