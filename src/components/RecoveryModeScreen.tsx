import { useState, useRef } from 'react'
import { appStorage } from '../platform/storage.ts'
import { storageHealth } from '../platform/storageHealth.ts'
import { validateSnapshot, applySnapshot } from '../modules/backup/snapshot.ts'
import { saveBlobAsFile } from '../utils/saveFile.ts'

export function RecoveryModeScreen() {
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleRetry = () => {
    window.location.reload()
  }

  const handleExportRawFiles = () => {
    try {
      const allData = appStorage.getAll()
      const rawPayload = {
        exportedAt: Date.now(),
        reason: 'read-only-recovery-raw-dump',
        kv: allData,
      }
      const blob = new Blob([JSON.stringify(rawPayload, null, 2)], {
        type: 'application/json',
      })
      saveBlobAsFile(blob, `maganis-raw-recovery-${Date.now()}.json`)
      setStatusMessage('تم تجهيز وتنزيل الملفات الخام بنجاح.')
    } catch (err) {
      setStatusMessage(`فشل تنزيل الملفات الخام: ${String(err)}`)
    }
  }

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setStatusMessage('جاري فحص ملف النسخة الاحتياطية...')

    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      const validation = await validateSnapshot(parsed)

      if (!validation.ok || !validation.snapshot) {
        setStatusMessage(validation.errorAr || 'ملف النسخة غير صالح.')
        setIsProcessing(false)
        return
      }

      setStatusMessage('جاري استعادة البيانات بأمان...')
      const applyResult = await applySnapshot(validation.snapshot)

      if (applyResult.success) {
        setStatusMessage(
          'تمت استعادة البيانات بنجاح! جاري إعادة تشغيل التطبيق...',
        )
        storageHealth.setOk()
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        setStatusMessage(applyResult.errorAr || 'فشلت عملية الاستعادة.')
      }
    } catch (err) {
      setStatusMessage(`حدث خطأ أثناء قراءة الملف: ${String(err)}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div
      className="recovery-screen"
      dir="rtl"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '24px',
        boxSizing: 'border-box',
        backgroundColor: 'var(--color-bg, #121110)',
        color: 'var(--color-text, #f6f2ea)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          backgroundColor: 'var(--color-surface, #1b1917)',
          borderRadius: '16px',
          padding: '32px 24px',
          border: '1px solid var(--color-divider, #35302a)',
          boxShadow: 'var(--shadow-card, 0 8px 32px rgba(0, 0, 0, 0.4))',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor:
              'var(--color-accent-tint, rgba(234, 106, 21, 0.14))',
            color: 'var(--color-accent, #ea6a15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
          aria-hidden="true"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        <h1
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '12px',
            color: 'var(--color-text, #f6f2ea)',
          }}
        >
          مش قادر أقرأ بياناتك. بياناتك لسه موجودة ومتمسحتش
        </h1>

        <p
          style={{
            fontSize: '14px',
            lineHeight: '1.6',
            color: 'var(--color-text-2, #b4aca0)',
            marginBottom: '24px',
          }}
        >
          دخل التطبيق وضع القراءة فقط لحماية ملفاتك من أي تعديل أو ضياع. تقدر
          تحاول تقرأها تاني، أو تسترجع نسخة احتياطية، أو تصدر الملفات الخام
          للمطور.
        </p>

        {statusMessage && (
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor:
                'var(--color-accent-tint, rgba(234, 106, 21, 0.14))',
              border: '1px solid var(--color-accent, #ea6a15)',
              color: 'var(--color-text, #f6f2ea)',
              fontSize: '13px',
              marginBottom: '20px',
              textAlign: 'right',
            }}
          >
            {statusMessage}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            type="button"
            className="btn btn--primary"
            style={{
              minHeight: '44px',
              height: 'auto',
              padding: '10px 14px',
              width: '100%',
            }}
            onClick={handleRetry}
            disabled={isProcessing}
          >
            إعادة المحاولة
          </button>

          <button
            type="button"
            className="btn btn--secondary"
            style={{
              minHeight: '44px',
              height: 'auto',
              padding: '10px 14px',
              width: '100%',
            }}
            onClick={handleOpenFilePicker}
            disabled={isProcessing}
          >
            استعادة من ملف نسخة احتياطية
          </button>

          <button
            type="button"
            className="btn btn--tertiary"
            style={{
              minHeight: '44px',
              height: 'auto',
              padding: '10px 14px',
              width: '100%',
            }}
            onClick={handleExportRawFiles}
            disabled={isProcessing}
          >
            تصدير الملفات الخام
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelected}
            accept=".json,application/json"
            style={{ display: 'none' }}
          />
        </div>
      </div>
    </div>
  )
}
