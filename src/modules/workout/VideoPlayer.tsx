/**
 * src/modules/workout/VideoPlayer.tsx
 *
 * Implements Task G5-B3:
 * In-app exercise video player with facade pattern, strict sandbox/referrerpolicy,
 * offline awareness, 10s load timeout with external fallback, and direct file support.
 */

import React, { useState, useEffect, useRef } from 'react'
import { parseVideoUrl, type ParsedVideoInfo } from './videoUtils'

export interface VideoPlayerProps {
  videoUrl?: string | null
  exerciseName: string
  onAddVideo?: () => void
  /** For testing or forced state preview */
  forcedOnline?: boolean
}

interface VideoErrorBoundaryProps {
  fallbackUrl: string
  onClose: () => void
  children: React.ReactNode
}

interface VideoErrorBoundaryState {
  hasError: boolean
}

export class VideoErrorBoundary extends React.Component<
  VideoErrorBoundaryProps,
  VideoErrorBoundaryState
> {
  constructor(props: VideoErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): VideoErrorBoundaryState {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn(
      '[VideoErrorBoundary] caught error in video embed:',
      error,
      errorInfo,
    )
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div
          data-testid="video-error-fallback"
          style={{
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--color-divider)',
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-surface-2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-3)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text)',
            }}
          >
            الفيديو مش بيشتغل جوه التطبيق دلوقتي
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <a
              href={this.props.fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-control)',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--on-accent, #ffffff)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-bold)',
                textDecoration: 'none',
              }}
            >
              افتح في يوتيوب
            </a>
            <button
              type="button"
              onClick={this.props.onClose}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-control)',
                border: '1px solid var(--color-divider)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              إغلاق
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  exerciseName,
  onAddVideo,
  forcedOnline,
}) => {
  const [isMounted, setIsMounted] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadTimedOut, setLoadTimedOut] = useState(false)
  const timerRef = useRef<number | null>(null)

  const isOnline =
    forcedOnline !== undefined
      ? forcedOnline
      : typeof navigator !== 'undefined'
        ? navigator.onLine
        : true

  // Reset state when videoUrl changes
  useEffect(() => {
    setIsMounted(false)
    setIsLoaded(false)
    setLoadTimedOut(false)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [videoUrl])

  useEffect(() => {
    if (isMounted && !isLoaded) {
      timerRef.current = window.setTimeout(() => {
        setLoadTimedOut(true)
      }, 10000)
    } else if (isLoaded && timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [isMounted, isLoaded])

  // 1. No video URL provided
  if (!videoUrl || !videoUrl.trim()) {
    return (
      <div
        data-testid="video-no-url"
        style={{
          border: '1px dashed var(--color-divider)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--space-4)',
          textAlign: 'center',
          backgroundColor: 'var(--color-surface)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}
      >
        <span
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-2)',
          }}
        >
          لا يوجد فيديو شرح لهذا التمرين
        </span>
        {onAddVideo && (
          <button
            type="button"
            data-testid="add-video-btn"
            onClick={onAddVideo}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              minHeight: 'var(--touch-target-min)',
              borderRadius: 'var(--radius-control)',
              border: '1px solid var(--color-accent)',
              backgroundColor: 'var(--color-accent-tint)',
              color: 'var(--color-accent-text)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              cursor: 'pointer',
            }}
          >
            ضيف رابط فيديو شرح
          </button>
        )}
      </div>
    )
  }

  const parsed: ParsedVideoInfo = parseVideoUrl(videoUrl)

  // 2. Unsupported host (e.g. Instagram, TikTok, Facebook)
  if (
    parsed.sourceType === 'unsupported' ||
    (!parsed.isValid && parsed.rawUrl)
  ) {
    return (
      <div
        data-testid="video-unsupported"
        style={{
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--color-divider)',
          padding: 'var(--space-4)',
          backgroundColor: 'var(--color-surface)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-3)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-2)',
          }}
        >
          {parsed.error || 'الموقع ده مش بيتشغل جوه التطبيق'}
        </div>
        <a
          href={parsed.rawUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="external-browser-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'var(--touch-target-min)',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-control)',
            border: '1px solid var(--color-divider)',
            backgroundColor: 'var(--color-surface-2)',
            color: 'var(--color-text)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            textDecoration: 'none',
          }}
        >
          افتح في المتصفح
        </a>
      </div>
    )
  }

  // 3. Facade View (Before User Taps Play: No iframe, No network request)
  if (!isMounted) {
    return (
      <div
        data-testid="video-facade"
        style={{
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--color-divider)',
          backgroundColor: 'var(--color-surface-2)',
          padding: 'var(--space-6) var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-3)',
          textAlign: 'center',
        }}
      >
        <button
          type="button"
          data-testid="play-facade-btn"
          onClick={() => {
            setIsMounted(true)
            setLoadTimedOut(false)
            setIsLoaded(false)
          }}
          aria-label={`تشغيل فيديو شرح تمرين ${exerciseName}`}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-accent)',
            color: 'var(--on-accent)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-dropdown)',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <div>
          <div
            style={{
              fontSize: 'var(--font-size-md)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text)',
            }}
          >
            فيديو شرح: {exerciseName}
          </div>
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-2)',
              marginTop: 'var(--space-1)',
            }}
          >
            اضغط لتشغيل الفيديو داخل التطبيق
          </div>
        </div>
      </div>
    )
  }

  // 4. Mounted State: Handle Offline
  if (!isOnline) {
    return (
      <div
        data-testid="video-offline"
        style={{
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--color-warning-border)',
          backgroundColor: 'var(--color-warning-bg)',
          padding: 'var(--space-4)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}
      >
        <div
          style={{
            color: 'var(--color-warning)',
            fontWeight: 'var(--font-weight-semibold)',
          }}
        >
          الفيديو محتاج إنترنت
        </div>
        <button
          type="button"
          data-testid="close-video-btn"
          onClick={() => setIsMounted(false)}
          style={{
            minHeight: 'var(--touch-target-min)',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-control)',
            border: '1px solid var(--color-divider)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          إغلاق
        </button>
      </div>
    )
  }

  // 5. Direct File Video Player
  if (parsed.sourceType === 'direct_file') {
    return (
      <div
        data-testid="video-direct-player"
        style={{
          borderRadius: 'var(--radius-card)',
          overflow: 'hidden' /* clip-ok: rounded video container */,
          flexShrink: 0,
          border: '1px solid var(--color-divider)',
          backgroundColor: 'var(--color-surface)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <video
          data-testid="native-video-el"
          src={parsed.embedUrl}
          controls
          playsInline
          preload="none"
          style={{
            width: '100%',
            maxHeight: '360px',
            backgroundColor: '#000000',
          }}
        />
        <div
          style={{
            padding: 'var(--space-2) var(--space-4)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--color-surface-2)',
          }}
        >
          <span
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text)',
            }}
          >
            {exerciseName}
          </span>
          <button
            type="button"
            data-testid="close-video-btn"
            onClick={() => setIsMounted(false)}
            style={{
              minHeight: 'var(--touch-target-min)',
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-control)',
              border: '1px solid var(--color-divider)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            إغلاق
          </button>
        </div>
      </div>
    )
  }

  // 6. Embedded IFrame (YouTube or Vimeo)
  const fallbackLabel =
    parsed.sourceType === 'youtube' ? 'افتح في يوتيوب' : 'افتح في فيميو'

  if (loadTimedOut && !isLoaded) {
    return (
      <div
        data-testid="video-timeout-hint"
        style={{
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--color-divider)',
          backgroundColor: 'var(--color-surface)',
          padding: 'var(--space-4)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}
      >
        <span
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text)',
            fontWeight: 600,
          }}
        >
          الفيديو مش بيشتغل جوه التطبيق دلوقتي
        </span>
        <span
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-2)',
          }}
        >
          لو الفيديو مش بيشتغل، صاحب الفيديو ممكن يكون قافل التضمين
        </span>
        <a
          href={parsed.rawUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="timeout-fallback-link"
          style={{
            color: 'var(--color-accent-text)',
            fontWeight: 'var(--font-weight-semibold)',
            textDecoration: 'underline',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          {fallbackLabel}
        </a>
        <button
          type="button"
          data-testid="close-video-btn"
          onClick={() => {
            setIsMounted(false)
            setLoadTimedOut(false)
          }}
          style={{
            minHeight: 'var(--touch-target-min)',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-control)',
            border: '1px solid var(--color-divider)',
            backgroundColor: 'var(--color-surface-2)',
            color: 'var(--color-text)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          إغلاق
        </button>
      </div>
    )
  }

  return (
    <VideoErrorBoundary
      fallbackUrl={parsed.rawUrl}
      onClose={() => setIsMounted(false)}
    >
      <div
        data-testid="video-iframe-player"
        style={{
          borderRadius: 'var(--radius-card)',
          overflow: 'hidden' /* clip-ok: rounded iframe container */,
          flexShrink: 0,
          border: '1px solid var(--color-divider)',
          backgroundColor: 'var(--color-surface)',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            minHeight: '200px',
            backgroundColor: '#000000',
          }}
        >
          {!isLoaded && (
            <div
              data-testid="video-loading-spinner"
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                color: '#ffffff',
                gap: '8px',
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: 'var(--color-accent, #eb5e28)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>
                جاري تشغيل الفيديو...
              </span>
            </div>
          )}

          <iframe
            data-testid="video-iframe-el"
            src={parsed.embedUrl}
            sandbox="allow-scripts allow-same-origin allow-presentation"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            title={`فيديو شرح تمرين ${exerciseName}`}
            onLoad={() => setIsLoaded(true)}
            onError={() => setLoadTimedOut(true)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.2s ease',
            }}
          />
        </div>

        <div
          style={{
            padding: 'var(--space-2) var(--space-4)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--color-surface-2)',
          }}
        >
          <span
            style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text)',
            }}
          >
            {exerciseName}
          </span>
          <button
            type="button"
            data-testid="close-video-btn"
            onClick={() => setIsMounted(false)}
            style={{
              minHeight: 'var(--touch-target-min)',
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-control)',
              border: '1px solid var(--color-divider)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            إغلاق
          </button>
        </div>
      </div>
    </VideoErrorBoundary>
  )
}
