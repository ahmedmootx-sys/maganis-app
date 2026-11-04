import { useState, useRef } from 'react'
import { isNative } from '../../platform/runtime.ts'
import {
  buildSnapshot,
  validateSnapshot,
  applySnapshot,
  type SnapshotManifestCounts,
  type MaganisSnapshotV2,
} from './snapshot.ts'
import { saveBlobAsFile } from '../../utils/saveFile.ts'
import { Card, Section, Button, Callout } from '../../ui/index.ts'

interface PwaTransferSectionProps {
  onImportComplete?: () => void
}

export function PwaTransferSection({
  onImportComplete,
}: PwaTransferSectionProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccessCounts, setExportSuccessCounts] =
    useState<SnapshotManifestCounts | null>(null)

  const [previewSnapshot, setPreviewSnapshot] =
    useState<MaganisSnapshotV2 | null>(null)
  const [previewWarning, setPreviewWarning] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [importSuccessResult, setImportSuccessResult] = useState<{
    fileCounts: SnapshotManifestCounts
    importedCounts: SnapshotManifestCounts
  } | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // --- Web export handler ---
  const handleExportSnapshotV2 = async () => {
    setIsExporting(true)
    setErrorMessage(null)
    try {
      const snapshot = await buildSnapshot()
      const json = JSON.stringify(snapshot, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const filename = `maganis-complete-snapshot-${new Date().toISOString().slice(0, 10)}.json`
      saveBlobAsFile(blob, filename)
      setExportSuccessCounts(snapshot.manifest.counts)
    } catch (err) {
      setErrorMessage(`حدث خطأ أثناء تجهيز ملف النسخة: ${String(err)}`)
    } finally {
      setIsExporting(false)
    }
  }

  // --- Native import handlers ---
  const handlePickFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setErrorMessage(null)
    setPreviewSnapshot(null)
    setPreviewWarning(null)
    setImportSuccessResult(null)

    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      const validation = await validateSnapshot(parsed)

      if (!validation.ok || !validation.snapshot) {
        setErrorMessage(
          validation.errorAr || 'ملف النسخة غير صالح أو يحتوي على أخطاء.',
        )
        return
      }

      setPreviewSnapshot(validation.snapshot)
      if (validation.warningAr) {
        setPreviewWarning(validation.warningAr)
      }
    } catch (err) {
      setErrorMessage(`فشل قراءة الملف: ${String(err)}`)
    }
  }

  const handleConfirmApply = async () => {
    if (!previewSnapshot) return
    setIsImporting(true)
    setErrorMessage(null)

    try {
      const result = await applySnapshot(previewSnapshot)
      if (result.success) {
        setImportSuccessResult({
          fileCounts: previewSnapshot.manifest.counts,
          importedCounts: result.appliedCounts,
        })
        setPreviewSnapshot(null)
        onImportComplete?.()
      } else {
        setErrorMessage(result.errorAr || 'فشلت عملية تطبيق النسخة الاحتياطية.')
      }
    } catch (err) {
      setErrorMessage(`حدث خطأ أثناء الاستيراد: ${String(err)}`)
    } finally {
      setIsImporting(false)
    }
  }

  // --- WEB VIEW: Transition to App ---
  if (!isNative()) {
    return (
      <Section title="الانتقال إلى تطبيق الموبايل">
        <Card>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            dir="rtl"
          >
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
              جاهز تنقل كل بياناتك لتطبيق مجانص المثبت على جهازك الأندرويد؟ اضغط
              على الزر لتحميل ملف شامل (Snapshot v2) يضم تمارينك وسجلاتك وتغذيتك
              وصورك.
            </p>

            <Callout variant="warning">
              <strong>تنبيه هام جداً:</strong> لا تقم بمسح بيانات المتصفح ولا
              تلغِ تثبيت تطبيق الويب حتى تقوم بتثبيت التطبيق الأصلي واستيراد
              بياناتك والتأكد من ظهورها كاملة.
            </Callout>

            {exportSuccessCounts && (
              <div
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  fontSize: '13px',
                }}
              >
                <div
                  style={{
                    fontWeight: 'bold',
                    color: '#22c55e',
                    marginBottom: '8px',
                  }}
                >
                  ✓ تم تنزيل الملف بنجاح! محتويات النسخة:
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '6px',
                    fontSize: '12px',
                  }}
                >
                  <div>جلسات التدريب: {exportSuccessCounts.sessions}</div>
                  <div>أيام التغذية: {exportSuccessCounts.nutritionDays}</div>
                  <div>الوجبات المخصصة: {exportSuccessCounts.customMeals}</div>
                  <div>الأطعمة المخصصة: {exportSuccessCounts.customFoods}</div>
                  <div>
                    التمارين المخصصة: {exportSuccessCounts.customExercises}
                  </div>
                  <div>وسائط التمارين: {exportSuccessCounts.mediaItems}</div>
                </div>
              </div>
            )}

            {errorMessage && (
              <div style={{ color: '#ef4444', fontSize: '13px' }}>
                {errorMessage}
              </div>
            )}

            <Button
              variant="primary"
              onClick={handleExportSnapshotV2}
              disabled={isExporting}
              style={{ minHeight: '44px' }}
            >
              {isExporting
                ? 'جاري تجهيز النسخة...'
                : 'تجهيز وتنزيل ملف الانتقال (Snapshot v2)'}
            </Button>
          </div>
        </Card>
      </Section>
    )
  }

  // --- NATIVE VIEW: Import from Old PWA ---
  return (
    <Section title="استيراد البيانات من النسخة القديمة (PWA)">
      <Card>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          dir="rtl"
        >
          <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
            لو كنت بتستخدم موقع أو تطبيق مجانص على المتصفح سابقاً، تقدر تستورد
            كل بياناتك وتمارينك وسجلاتك وتغذيتك هنا بضغطة واحدة.
          </p>

          {errorMessage && (
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                color: '#ef4444',
                fontSize: '13px',
                whiteSpace: 'pre-line',
              }}
            >
              {errorMessage}
            </div>
          )}

          {previewWarning && (
            <Callout variant="warning">{previewWarning}</Callout>
          )}

          {previewSnapshot && (
            <div
              style={{
                padding: '14px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-bg-base, #12171f)',
                border: '1px solid var(--color-border-subtle, #2b3545)',
              }}
            >
              <div
                style={{
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  fontSize: '14px',
                }}
              >
                معاينة محتويات النسخة قبل التأكيد:
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  fontSize: '13px',
                }}
              >
                <div>
                  الملف الشخصي:{' '}
                  {previewSnapshot.manifest.counts.profilePresent
                    ? 'نعم'
                    : 'لا'}
                </div>
                <div>
                  جلسات التمرين: {previewSnapshot.manifest.counts.sessions}
                </div>
                <div>
                  أيام التغذية: {previewSnapshot.manifest.counts.nutritionDays}
                </div>
                <div>
                  الوجبات المخصصة: {previewSnapshot.manifest.counts.customMeals}
                </div>
                <div>
                  الأطعمة المخصصة: {previewSnapshot.manifest.counts.customFoods}
                </div>
                <div>
                  التمارين المخصصة:{' '}
                  {previewSnapshot.manifest.counts.customExercises}
                </div>
                <div>
                  الوسائط والصور: {previewSnapshot.manifest.counts.mediaItems}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <Button
                  variant="primary"
                  onClick={handleConfirmApply}
                  disabled={isImporting}
                  style={{ flex: 1, minHeight: '44px' }}
                >
                  {isImporting
                    ? 'جاري الاستيراد الآمن...'
                    : 'تأكيد واستيراد الآن'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setPreviewSnapshot(null)}
                  disabled={isImporting}
                  style={{ minHeight: '44px' }}
                >
                  إلغاء
                </Button>
              </div>
            </div>
          )}

          {importSuccessResult && (
            <div
              style={{
                padding: '14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid #22c55e',
                fontSize: '13px',
              }}
            >
              <div
                style={{
                  fontWeight: 'bold',
                  color: '#22c55e',
                  marginBottom: '8px',
                  fontSize: '14px',
                }}
              >
                ✓ تمت الاستيراد والتحقق بنجاح تام!
              </div>
              <table
                style={{
                  width: '100%',
                  textAlign: 'right',
                  borderCollapse: 'collapse',
                  fontSize: '12px',
                }}
              >
                <thead>
                  <tr
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <th style={{ padding: '4px' }}>البيان</th>
                    <th style={{ padding: '4px' }}>في الملف</th>
                    <th style={{ padding: '4px' }}>تم استيراده</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '4px' }}>جلسات التمرين</td>
                    <td style={{ padding: '4px' }}>
                      {importSuccessResult.fileCounts.sessions}
                    </td>
                    <td style={{ padding: '4px' }}>
                      {importSuccessResult.importedCounts.sessions}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px' }}>أيام التغذية</td>
                    <td style={{ padding: '4px' }}>
                      {importSuccessResult.fileCounts.nutritionDays}
                    </td>
                    <td style={{ padding: '4px' }}>
                      {importSuccessResult.importedCounts.nutritionDays}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px' }}>الوجبات المخصصة</td>
                    <td style={{ padding: '4px' }}>
                      {importSuccessResult.fileCounts.customMeals}
                    </td>
                    <td style={{ padding: '4px' }}>
                      {importSuccessResult.importedCounts.customMeals}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px' }}>التمارين المخصصة</td>
                    <td style={{ padding: '4px' }}>
                      {importSuccessResult.fileCounts.customExercises}
                    </td>
                    <td style={{ padding: '4px' }}>
                      {importSuccessResult.importedCounts.customExercises}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px' }}>الوسائط</td>
                    <td style={{ padding: '4px' }}>
                      {importSuccessResult.fileCounts.mediaItems}
                    </td>
                    <td style={{ padding: '4px' }}>
                      {importSuccessResult.importedCounts.mediaItems}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {!previewSnapshot && !importSuccessResult && (
            <Button
              variant="secondary"
              onClick={handlePickFile}
              style={{ minHeight: '44px' }}
            >
              اختيار ملف النسخة الاحتياطية (.json)
            </Button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            style={{ display: 'none' }}
          />
        </div>
      </Card>
    </Section>
  )
}
