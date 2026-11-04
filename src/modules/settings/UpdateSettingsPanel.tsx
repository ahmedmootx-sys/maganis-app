/**
 * src/modules/settings/UpdateSettingsPanel.tsx
 * Update Checker & Sideload Guidance Panel for Maganis Settings (Task N5.5).
 */

import React, { useState, useEffect } from 'react'
import {
  checkForUpdates,
  getAutoUpdateSetting,
  setAutoUpdateSetting,
  type UpdateCheckResult,
} from '../../platform/updateChecker.ts'
import { isNative } from '../../platform/runtime.ts'
import { MaganisNative } from '../../platform/native/maganisNative.ts'
import { backupEngine } from '../backup/backupEngine.ts'
import { Toggle } from '../../ui/Toggle.tsx'
import { Button } from '../../ui/Button.tsx'
import { Icon } from '../../ui/Icon.tsx'

export const UpdateSettingsPanel: React.FC = () => {
  const [currentVersion, setCurrentVersion] = useState('0.1.0')
  const [buildType, setBuildType] = useState<'debug' | 'release'>('release')
  const [autoCheck, setAutoCheck] = useState(() => getAutoUpdateSetting())
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<UpdateCheckResult | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [backupWarning, setBackupWarning] = useState<string | null>(null)

  useEffect(() => {
    async function loadVersionInfo() {
      if (isNative() && typeof MaganisNative.getInfo === 'function') {
        try {
          const info = await MaganisNative.getInfo()
          setCurrentVersion(info.versionName || '0.1.0')
          setBuildType(info.buildType === 'debug' ? 'debug' : 'release')
        } catch {
          // Fallback
        }
      }
    }
    void loadVersionInfo()
  }, [])

  const handleToggleAutoCheck = (enabled: boolean) => {
    setAutoCheck(enabled)
    setAutoUpdateSetting(enabled)
  }

  const handleCheck = async () => {
    setIsChecking(true)
    setBackupWarning(null)
    try {
      const res = await checkForUpdates(currentVersion, buildType)
      setResult(res)
    } finally {
      setIsChecking(false)
    }
  }

  const handleDownload = async () => {
    if (!result?.downloadUrl) return

    setIsDownloading(true)
    setBackupWarning(null)

    // Pre-download verified backup guarantee (Rule N5.5)
    try {
      const backupRes = await backupEngine.runBackup('pre-update')
      if (!backupRes.success) {
        setBackupWarning(
          `تنبيه: فشل إنشاء نسخة احتياطية مسبقة (${backupRes.errorAr || 'خطأ غير معروف'}). يُفضل التأكد من حفظ بياناتك أولاً.`,
        )
      }
    } catch (err) {
      setBackupWarning(
        `تنبيه: لم نتمكن من التحقق من النسخة الاحتياطية (${String(err)}).`,
      )
    } finally {
      setIsDownloading(false)
    }

    // Open verified download URL in system browser
    if (typeof window !== 'undefined') {
      window.open(result.downloadUrl, '_system')
    }
  }

  return (
    <div
      className="card update-settings-panel"
      dir="rtl"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: 'var(--color-bg-surface, #1e293b)',
        border: '1px solid var(--color-border-subtle, #334155)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h3
            style={{
              margin: '0',
              fontSize: '1rem',
              fontWeight: '700',
              color: 'var(--color-text-primary, #ffffff)',
            }}
          >
            التحديثات
          </h3>
          <p
            style={{
              margin: '2px 0 0 0',
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary, #94a3b8)',
            }}
          >
            الإصدار الحالي: <bdi dir="ltr">{currentVersion}</bdi> (
            {buildType === 'debug' ? 'تجريبي' : 'مستقر'})
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={handleCheck}
          disabled={isChecking}
          style={{ minHeight: '44px', padding: '0 14px' }}
        >
          <Icon name="refresh-cw" size={16} />
          <span>{isChecking ? 'جاري الفحص...' : 'دوّر على تحديث'}</span>
        </Button>
      </div>

      {/* Auto check toggle (Default OFF per R8) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 0',
          borderTop: '1px solid var(--color-border-subtle, #334155)',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: 'var(--color-text-primary, #ffffff)',
            }}
          >
            فحص تلقائي يومي
          </div>
          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--color-text-secondary, #94a3b8)',
            }}
          >
            تنبيهك لو فيه إصدار أحدث نزل على GitHub (معطل افتراضياً)
          </div>
        </div>
        <Toggle
          id="auto-check-toggle"
          checked={autoCheck}
          onChange={handleToggleAutoCheck}
        />
      </div>

      {/* Result Display */}
      {result && (
        <div
          data-testid="update-check-result"
          style={{
            padding: '12px 14px',
            borderRadius: '8px',
            fontSize: '0.88rem',
            lineHeight: '1.5',
            backgroundColor:
              result.status === 'update_available'
                ? 'rgba(16, 185, 129, 0.1)'
                : 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${
              result.status === 'update_available'
                ? 'rgba(16, 185, 129, 0.3)'
                : 'var(--color-border-subtle, #334155)'
            }`,
          }}
        >
          <div
            style={{
              fontWeight: '600',
              color:
                result.status === 'update_available' ? '#10b981' : 'inherit',
            }}
          >
            {result.messageAr}
          </div>

          {result.status === 'update_available' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginTop: '10px',
              }}
            >
              {result.releaseDate && (
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--color-text-secondary, #94a3b8)',
                  }}
                >
                  تاريخ الصدور: {result.releaseDate}{' '}
                  {result.apkSizeMb
                    ? `· الحجم: ${result.apkSizeMb} ميجابايت`
                    : ''}
                </div>
              )}

              {/* Plain text Arabic release notes */}
              {result.releaseNotesAr && result.releaseNotesAr.length > 0 && (
                <div style={{ marginTop: '4px' }}>
                  <div
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      marginBottom: '4px',
                    }}
                  >
                    الجديد في هذا الإصدار:
                  </div>
                  <ul
                    style={{
                      margin: '0',
                      paddingInlineStart: '20px',
                      fontSize: '0.82rem',
                      color: '#cbd5e1',
                    }}
                  >
                    {result.releaseNotesAr.map((bullet, idx) => (
                      <li key={idx} style={{ marginBottom: '2px' }}>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {backupWarning && (
                <div
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    color: '#f59e0b',
                    fontSize: '0.8rem',
                  }}
                >
                  {backupWarning}
                </div>
              )}

              <Button
                variant="primary"
                onClick={handleDownload}
                disabled={isDownloading}
                style={{ width: '100%', marginTop: '6px' }}
              >
                <Icon name="download" size={16} />
                <span>
                  {isDownloading
                    ? 'جاري التحقق من النسخ...'
                    : 'تنزيل التحديث (APK)'}
                </span>
              </Button>

              {/* Plain Arabic install guidance */}
              <div
                style={{
                  padding: '10px',
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  color: 'var(--color-text-secondary, #94a3b8)',
                  lineHeight: '1.6',
                }}
              >
                <div
                  style={{
                    fontWeight: '600',
                    color: '#ffffff',
                    marginBottom: '4px',
                  }}
                >
                  طريقة التثبيت:
                </div>
                1. اضغط على ملف <bdi dir="ltr">.apk</bdi> بعد ما يخلص تحميله من
                المتصفح.
                <br />
                2. لو الهاتف طلب السماح بالتثبيت من هذا المصدر، وافق عليه.
                <br />
                3. ثبّت التطبيق فوق النسخة الحالية؛ بياناتك وتمارينك هتفضل
                موجودة ومحفوظة لأن التوقيع متطابق.
                <br />
                <span style={{ color: '#ef4444', fontWeight: '600' }}>
                  قاعدة هامة: لو الموبايل قال إنه مش قادر يثبت التطبيق، اوعى
                  تمسح التطبيق القديم؛ خد نسخة احتياطية الأول وابعتلنا لقطة
                  شاشة.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
