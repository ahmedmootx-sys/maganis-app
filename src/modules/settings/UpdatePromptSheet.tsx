/**
 * src/modules/settings/UpdatePromptSheet.tsx
 *
 * Update Notification Prompt Sheet for Bunyan.
 * Displays update details, Arabic release notes, safety guarantee, and triggers download & install.
 */

import React from 'react'
import { Sheet } from '../../ui/Sheet.tsx'
import { Button } from '../../ui/Button.tsx'
import { Icon } from '../../ui/Icon.tsx'
import type { UpdateCheckResult } from '../../platform/updateChecker.ts'
import { openExternalUrl } from '../../utils/urlHelper.ts'

export interface UpdatePromptSheetProps {
  isOpen: boolean
  onClose: () => void
  result: UpdateCheckResult | null
  isDownloading?: boolean
  backupWarning?: string | null
  onDownloadAndInstall?: () => void | Promise<unknown>
}

export const UpdatePromptSheet: React.FC<UpdatePromptSheetProps> = ({
  isOpen,
  onClose,
  result,
  isDownloading = false,
  backupWarning = null,
  onDownloadAndInstall,
}) => {
  if (!result || result.status !== 'update_available') {
    return null
  }

  const handleOpenInBrowser = () => {
    if (result.downloadUrl) {
      void openExternalUrl(result.downloadUrl)
    }
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="يتوفر تحديث جديد"
      subtitle={`الإصدار ${result.latestVersion ?? ''}`}
      footer={
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '100%',
          }}
        >
          <Button
            variant="primary"
            onClick={() => onDownloadAndInstall?.()}
            disabled={isDownloading}
            style={{ width: '100%', minHeight: '44px' }}
          >
            <Icon name="download" size={18} />
            <span>
              {isDownloading
                ? 'جاري التجهيز والتحميل...'
                : 'تنزيل وتثبيت التحديث'}
            </span>
          </Button>

          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <Button
              variant="secondary"
              onClick={handleOpenInBrowser}
              disabled={isDownloading}
              style={{ flex: 1, minHeight: '40px' }}
            >
              <Icon name="external-link" size={16} />
              <span>فتح بالمتصفح</span>
            </Button>
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isDownloading}
              style={{ flex: 1, minHeight: '40px' }}
            >
              <span>لاحقاً</span>
            </Button>
          </div>
        </div>
      }
    >
      <div
        dir="rtl"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          padding: '4px 0 16px 0',
          color: 'var(--color-text)',
        }}
      >
        {/* Version Details Card */}
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--color-surface-2)',
            borderRadius: '10px',
            border: '1px solid var(--color-divider)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <div>
              الإصدار الجديد:{' '}
              <span
                style={{
                  color: 'var(--color-primary)',
                  fontWeight: 700,
                }}
              >
                <bdi dir="ltr">{result.latestVersion}</bdi>
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-2)' }}>
              الحالي: <bdi dir="ltr">{result.currentVersion}</bdi>
            </div>
          </div>

          {(result.releaseDate || result.apkSizeMb) && (
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--color-text-2)',
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              {result.releaseDate && <span>التاريخ: {result.releaseDate}</span>}
              {result.apkSizeMb && (
                <span>الحجم: {result.apkSizeMb} ميجابايت</span>
              )}
            </div>
          )}
        </div>

        {/* Release Notes */}
        {result.releaseNotesAr && result.releaseNotesAr.length > 0 && (
          <div>
            <div
              style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Icon name="sparkles" size={16} />
              <span>الجديد في هذا الإصدار:</span>
            </div>
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-divider)',
                borderRadius: '8px',
                padding: '10px 14px',
              }}
            >
              <ul
                style={{
                  margin: '0',
                  paddingInlineStart: '18px',
                  fontSize: '0.85rem',
                  lineHeight: '1.6',
                  color: 'var(--color-text)',
                }}
              >
                {result.releaseNotesAr.map((note, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Safety & Backup Guarantee */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'var(--color-surface-2)',
            borderRadius: '8px',
            border: '1px solid var(--color-divider)',
            fontSize: '0.82rem',
            lineHeight: '1.5',
            color: 'var(--color-text-2)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}
        >
          <Icon
            name="shield"
            size={18}
            style={{
              color: 'var(--color-primary)',
              flexShrink: 0,
              marginTop: '2px',
            }}
          />
          <div>
            <strong style={{ color: 'var(--color-text)' }}>
              بياناتك في أمان تام:{' '}
            </strong>
            التحديث يُثبَّت فوق التطبيق الحالي دون مسح تماريناتك أو سجلاتك. يتم
            أخذ نسخة احتياطية محلية تلقائياً قبل بدء التحميل.
          </div>
        </div>

        {/* Backup Warning if occurred */}
        {backupWarning && (
          <div
            style={{
              padding: '8px 10px',
              borderRadius: '6px',
              backgroundColor: 'var(--color-warning-bg, #fffbeb)',
              border: '1px solid var(--color-warning-border, #fef3c7)',
              color: 'var(--color-warning, #b45309)',
              fontSize: '0.8rem',
            }}
          >
            {backupWarning}
          </div>
        )}
      </div>
    </Sheet>
  )
}
