/**
 * src/components/SafeModeScreen.tsx
 * Self-Contained Safe Mode Screen (Task N5.3).
 *
 * Requirements:
 * - Small, self-contained RTL Arabic page.
 * - Explains what happened in one plain sentence.
 * - Actions:
 *   1. Export data snapshot (raw read of KV and media via plugin, zero app code).
 *   2. Share diagnostics report.
 *   3. Clear WebView caches only (never data).
 *   4. "جرّب التطبيق عادي تاني" (resets crash loop counter and reloads).
 * - Never deletes data on its own.
 */

import { useState } from 'react'
import {
  resetCrashLoopCounter,
  clearCachesSafe,
  exportRawDataSnapshot,
} from '../platform/safeMode.ts'
import { shareDiagnosticsReport } from '../platform/diagnosticsReport.ts'

interface SafeModeScreenProps {
  launchCount?: number
}

export function SafeModeScreen({ launchCount = 3 }: SafeModeScreenProps) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleExportData = async () => {
    setIsProcessing(true)
    setStatusMessage('جاري تجهيز وتصدير نسخة خام من بياناتك...')
    try {
      const res = await exportRawDataSnapshot()
      if (res.success) {
        setStatusMessage(`تم تصدير ملف البيانات بنجاح: ${res.fileName}`)
      } else {
        setStatusMessage(res.errorAr || 'فشل تصدير البيانات.')
      }
    } catch (err) {
      setStatusMessage(`حدث خطأ أثناء التصدير: ${String(err)}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleShareReport = async () => {
    setIsProcessing(true)
    setStatusMessage('جاري إعداد تقرير التشخيص...')
    try {
      const ok = await shareDiagnosticsReport()
      if (ok) {
        setStatusMessage('تم تجهيز تقرير التشخيص للمشاركة.')
      } else {
        setStatusMessage('لم يتم إرسال التقرير.')
      }
    } catch (err) {
      setStatusMessage(`فشل تجهيز التقرير: ${String(err)}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClearCacheOnly = async () => {
    setIsProcessing(true)
    setStatusMessage('جاري مسح الذاكرة المؤقتة (الكاش) دون لمس بياناتك...')
    try {
      await clearCachesSafe()
      setStatusMessage('تم مسح الذاكرة المؤقتة بنجاح. بياناتك وتمارينك كما هي.')
    } catch (err) {
      setStatusMessage(`فشل مسح الكاش: ${String(err)}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTryNormalApp = async () => {
    setIsProcessing(true)
    setStatusMessage('جاري إعادة تشغيل التطبيق في الوضع الطبيعي...')
    try {
      await resetCrashLoopCounter()
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.search = ''
          window.location.reload()
        }
      }, 500)
    } catch {
      window.location.reload()
    }
  }

  return (
    <div
      className="maganis-safe-mode-screen"
      dir="rtl"
      role="alert"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '24px',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        textAlign: 'center',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: '460px',
          width: '100%',
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          padding: '32px 24px',
          border: '1px solid #334155',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '24px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            margin: '0 auto',
            fontSize: '1.5rem',
            fontWeight: 'bold',
          }}
        >
          !
        </div>

        <h1
          style={{
            margin: '0',
            fontSize: '1.3rem',
            fontWeight: '700',
            color: '#ffffff',
          }}
        >
          الوضع الآمن (Safe Mode)
        </h1>

        {/* Single plain sentence explanation */}
        <p
          style={{
            margin: '0',
            fontSize: '0.95rem',
            lineHeight: '1.6',
            color: '#94a3b8',
          }}
        >
          التطبيق واجه صعوبة في الاستقرار وفتح في الوضع الآمن لحماية بياناتك بعد{' '}
          {launchCount} محاولات تشغيل سريعة.
        </p>

        {statusMessage && (
          <div
            data-testid="safe-mode-status"
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: '#93c5fd',
            }}
          >
            {statusMessage}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginTop: '8px',
          }}
        >
          {/* Action 1: Export raw snapshot */}
          <button
            type="button"
            onClick={handleExportData}
            disabled={isProcessing}
            style={{
              height: '46px',
              borderRadius: '8px',
              border: '1px solid #10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              fontWeight: '600',
              fontSize: '0.95rem',
              cursor: isProcessing ? 'wait' : 'pointer',
            }}
          >
            تصدير نسخة احتياطية خام من بياناتك
          </button>

          {/* Action 2: Share diagnostics report */}
          <button
            type="button"
            onClick={handleShareReport}
            disabled={isProcessing}
            style={{
              height: '46px',
              borderRadius: '8px',
              border: '1px solid #334155',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              color: '#cbd5e1',
              fontWeight: '600',
              fontSize: '0.95rem',
              cursor: isProcessing ? 'wait' : 'pointer',
            }}
          >
            ابعت تقرير تشخيص الأعطال
          </button>

          {/* Action 3: Clear webview cache only */}
          <button
            type="button"
            onClick={handleClearCacheOnly}
            disabled={isProcessing}
            style={{
              height: '46px',
              borderRadius: '8px',
              border: '1px solid #334155',
              backgroundColor: 'transparent',
              color: '#cbd5e1',
              fontWeight: '600',
              fontSize: '0.95rem',
              cursor: isProcessing ? 'wait' : 'pointer',
            }}
          >
            مسح الذاكرة المؤقتة فقط (دون مسح البيانات)
          </button>

          {/* Action 4: Try normal app again */}
          <button
            type="button"
            onClick={handleTryNormalApp}
            disabled={isProcessing}
            style={{
              height: '46px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              fontWeight: '600',
              fontSize: '0.95rem',
              cursor: isProcessing ? 'wait' : 'pointer',
              marginTop: '6px',
            }}
          >
            جرّب التطبيق عادي تاني
          </button>
        </div>
      </div>
    </div>
  )
}
