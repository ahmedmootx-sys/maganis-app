/**
 * src/platform/ErrorBoundary.tsx
 * Top-Level & Per-Route Error Boundary with Honest Recovery Screen (Task N5.1).
 *
 * Requirements:
 * 1. Simple Egyptian Arabic recovery UI with:
 *    - Retry this screen («جرّب تاني»)
 *    - Go home («الصفحة الرئيسية»)
 *    - Send report («ابعت تقرير»)
 *    - Make backup now («خد نسخة احتياطية دلوقتي»)
 * 2. «بياناتك سليمة» appears ONLY when storage health is 'ok' AND the newest backup is verified.
 * 3. Anti-loop protection: After 2 consecutive boundary hits within 10 seconds, ceases re-rendering.
 * 4. All hits logged to privacy-safe ring-buffer logger.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { logger } from './logger.ts'
import { storageHealth, type HealthStatus } from './storageHealth.ts'
import { backupEngine } from '../modules/backup/backupEngine.ts'
import { shareDiagnosticsReport } from './diagnosticsReport.ts'

interface ErrorBoundaryProps {
  children: ReactNode
  route?: string
  fallbackTitle?: string
  onGoHome?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  lastErrorTimestamp: number
  consecutiveHits: number
  isLoopBlocked: boolean
  storageStatus: HealthStatus
  isBackupVerified: boolean
  isBackingUp: boolean
  backupNotice: string | null
}

const LOOP_WINDOW_MS = 10000 // 10 seconds

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      lastErrorTimestamp: 0,
      consecutiveHits: 0,
      isLoopBlocked: false,
      storageStatus: 'ok',
      isBackupVerified: false,
      isBackingUp: false,
      backupNotice: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, _errorInfo: ErrorInfo): void {
    const now = Date.now()
    const { lastErrorTimestamp, consecutiveHits } = this.state
    const isConsecutive = now - lastErrorTimestamp < LOOP_WINDOW_MS
    const newHits = isConsecutive ? consecutiveHits + 1 : 1
    const isLoopBlocked = newHits >= 2

    // Log error securely
    const routeName = this.props.route || 'root'
    logger.error(
      'UI',
      'BOUNDARY_HIT',
      `Crash in route [${routeName}]: ${error.message}`,
    )

    // Query storage and backup verification status
    const currentStorageStatus = storageHealth.getStatus()
    const backupState = backupEngine.getOverallState()
    const backupStatus = backupEngine.getStatus()
    const backupVerified =
      backupState.state === 'ok' && !!backupStatus.lastVerifiedTime

    this.setState({
      lastErrorTimestamp: now,
      consecutiveHits: newHits,
      isLoopBlocked,
      storageStatus: currentStorageStatus,
      isBackupVerified: backupVerified,
    })
  }

  handleRetry = (): void => {
    if (this.state.isLoopBlocked) return
    this.setState({
      hasError: false,
      error: null,
    })
  }

  handleGoHome = (): void => {
    if (this.props.onGoHome) {
      this.setState({ hasError: false, error: null })
      this.props.onGoHome()
      return
    }
    // Default fallback: reload to root
    if (typeof window !== 'undefined') {
      window.location.hash = ''
      window.location.reload()
    }
  }

  handleSendReport = async (): Promise<void> => {
    try {
      await shareDiagnosticsReport()
    } catch (err) {
      this.setState({ backupNotice: `فشل إرسال التقرير: ${String(err)}` })
    }
  }

  handleMakeBackupNow = async (): Promise<void> => {
    this.setState({
      isBackingUp: true,
      backupNotice: 'جاري إنشاء نسخة احتياطية فورية...',
    })
    try {
      const res = await backupEngine.runBackup('manual')
      if (res.success) {
        this.setState({
          isBackingUp: false,
          backupNotice: 'تم حفظ نسخة احتياطية جديدة بنجاح.',
          isBackupVerified: true,
        })
      } else {
        this.setState({
          isBackingUp: false,
          backupNotice: res.errorAr || 'فشل حفظ النسخة الاحتياطية.',
        })
      }
    } catch (err) {
      this.setState({
        isBackingUp: false,
        backupNotice: `فشل حفظ النسخة: ${String(err)}`,
      })
    }
  }

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children
    }

    const {
      isLoopBlocked,
      storageStatus,
      isBackupVerified,
      isBackingUp,
      backupNotice,
    } = this.state
    const isDataFullySafe = storageStatus === 'ok' && isBackupVerified

    return (
      <div
        className="maganis-error-boundary-screen"
        dir="rtl"
        role="alert"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '24px',
          backgroundColor: 'var(--color-bg, #121110)',
          color: 'var(--color-text, #f6f2ea)',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            maxWidth: '460px',
            width: '100%',
            backgroundColor: 'var(--color-surface, #1b1917)',
            borderRadius: '16px',
            padding: '28px 20px',
            border: '1px solid var(--color-divider, #35302a)',
            boxShadow: 'var(--shadow-card, 0 8px 24px rgba(0, 0, 0, 0.4))',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Header Title */}
          <h2
            style={{
              margin: '0',
              fontSize: '1.25rem',
              fontWeight: '700',
              color: 'var(--color-text, #f6f2ea)',
            }}
          >
            {this.props.fallbackTitle || 'حصلت مشكلة في الشاشة دي'}
          </h2>

          <p
            style={{
              margin: '0',
              fontSize: '0.95rem',
              color: 'var(--color-text-2, #b4aca0)',
              lineHeight: '1.5',
            }}
          >
            التطبيق واجه خطأ غير متوقع أثناء عرض المحتوى، لكن التطبيق شغال وتقدر
            تكمل.
          </p>

          {/* Honest Data Safety Indicator (Rule N5.1: Only 'بياناتك سليمة' when ok & verified) */}
          <div
            data-testid="data-safety-indicator"
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              backgroundColor: isDataFullySafe
                ? 'var(--color-success-bg, rgba(16, 185, 129, 0.12))'
                : 'var(--color-warning-bg, rgba(245, 158, 11, 0.12))',
              color: isDataFullySafe
                ? 'var(--color-success, #22c55e)'
                : 'var(--color-warning, #f59e0b)',
              border: `1px solid ${
                isDataFullySafe
                  ? 'var(--color-success-border, #14532d)'
                  : 'var(--color-warning-border, #78350f)'
              }`,
            }}
          >
            {isDataFullySafe
              ? 'بياناتك سليمة ومحفوظة بالكامل.'
              : storageStatus !== 'ok'
                ? `حالة التخزين: ${storageStatus === 'readonly' ? 'للقراءة فقط' : 'غير مستقر'} — افحص جهازك.`
                : 'حالة النسخ: لم يتم التحقق من أحدث نسخة احتياطية بعد.'}
          </div>

          {backupNotice && (
            <div
              style={{
                fontSize: '0.85rem',
                color: 'var(--color-text-2, #b4aca0)',
                padding: '8px',
                backgroundColor:
                  'var(--color-surface-2, rgba(255, 255, 255, 0.05))',
                borderRadius: '6px',
              }}
            >
              {backupNotice}
            </div>
          )}

          {/* Loop Block Warning */}
          {isLoopBlocked && (
            <div
              data-testid="loop-blocked-warning"
              style={{
                fontSize: '0.85rem',
                color: 'var(--color-danger, #f87171)',
                padding: '8px 12px',
                backgroundColor:
                  'var(--color-danger-bg, rgba(239, 68, 68, 0.1))',
                border:
                  '1px solid var(--color-danger-border, rgba(239, 68, 68, 0.3))',
                borderRadius: '6px',
              }}
            >
              تكرر العطل مرتين ورا بعض؛ متوقفين عن إعادة المحاولة عشان نضمن
              استقرار باقي التطبيق.
            </div>
          )}

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginTop: '8px',
            }}
          >
            {/* 1. Retry Button */}
            <button
              type="button"
              onClick={this.handleRetry}
              disabled={isLoopBlocked}
              style={{
                minHeight: '44px',
                height: 'auto',
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isLoopBlocked
                  ? 'var(--btn-primary-disabled-bg, #35302a)'
                  : 'var(--btn-primary-bg, #ea6a15)',
                color: isLoopBlocked
                  ? 'var(--btn-primary-disabled-fg, #b4aca0)'
                  : 'var(--btn-primary-fg, #14110e)',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: isLoopBlocked ? 'not-allowed' : 'pointer',
              }}
            >
              جرّب تاني
            </button>

            {/* 2. Go Home Button */}
            <button
              type="button"
              onClick={this.handleGoHome}
              style={{
                minHeight: '44px',
                height: 'auto',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--color-divider, #35302a)',
                backgroundColor: 'transparent',
                color: 'var(--color-text, #f6f2ea)',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              الصفحة الرئيسية
            </button>

            {/* 3. Send Diagnostics Report Button */}
            <button
              type="button"
              onClick={this.handleSendReport}
              style={{
                minHeight: '44px',
                height: 'auto',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--color-divider, #35302a)',
                backgroundColor:
                  'var(--color-surface-2, rgba(255, 255, 255, 0.04))',
                color: 'var(--color-text-2, #b4aca0)',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              ابعت تقرير
            </button>

            {/* 4. Make Backup Now Button */}
            <button
              type="button"
              onClick={this.handleMakeBackupNow}
              disabled={isBackingUp}
              style={{
                minHeight: '44px',
                height: 'auto',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--color-success-border, #14532d)',
                backgroundColor:
                  'var(--color-success-bg, rgba(16, 185, 129, 0.08))',
                color: 'var(--color-success, #22c55e)',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: isBackingUp ? 'wait' : 'pointer',
              }}
            >
              {isBackingUp ? 'جاري الحفظ...' : 'خد نسخة احتياطية دلوقتي'}
            </button>
          </div>
        </div>
      </div>
    )
  }
}
