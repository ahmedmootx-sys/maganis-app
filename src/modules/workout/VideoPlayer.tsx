/**
 * src/modules/workout/VideoPlayer.tsx
 *
 * Implements Task G5-B3:
 * In-app exercise video player with facade pattern, strict sandbox/referrerpolicy,
 * offline awareness, 10s load timeout with external fallback, and direct file support.
 */

import React, { useState, useEffect, useRef } from 'react'
import {
  parseVideoUrl,
  resolvePinterestUrl,
  type ParsedVideoInfo,
} from './videoUtils'
import { openExternalUrl } from '../../utils/urlHelper.ts'
import { getMediaItem } from '../../lib/indexedStorage.ts'

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
              {this.props.fallbackUrl.includes('pin.it') ||
                this.props.fallbackUrl.includes('pinterest.com')
                ? 'افتح في بينترست'
                : this.props.fallbackUrl.includes('vimeo.com')
                  ? 'افتح في فيميو'
                  : 'افتح في يوتيوب'}
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
  const [effectiveUrl, setEffectiveUrl] = useState<string>(videoUrl || '')
  const timerRef = useRef<number | null>(null)

  const isOnline =
    forcedOnline !== undefined
      ? forcedOnline
      : typeof navigator !== 'undefined'
        ? navigator.onLine
        : true

  // Reset state when videoUrl changes and resolve Pinterest shortlinks
  useEffect(() => {
    setIsMounted(false)
    setIsLoaded(false)
    setLoadTimedOut(false)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    let active = true
    if (
      videoUrl &&
      (videoUrl.includes('pin.it') || videoUrl.includes('.pin.it'))
    ) {
      resolvePinterestUrl(videoUrl).then((resolved) => {
        if (active && resolved) {
          setEffectiveUrl(resolved)
        }
      })
    } else if (videoUrl && videoUrl.startsWith('media:')) {
      const key = videoUrl.replace(/^media:/, '')
      getMediaItem<{ dataUrl?: string; mime?: string }>(key).then((item) => {
        if (active && item && item.dataUrl) {
          setEffectiveUrl(item.dataUrl)
        }
      })
    } else {
      setEffectiveUrl(videoUrl || '')
    }

    return () => {
      active = false
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

  const parsed: ParsedVideoInfo = parseVideoUrl(effectiveUrl)

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
          preload="metadata"
          style={{
            width: '100%',
            maxHeight: '380px',
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

  // 6. Embedded IFrame (YouTube, Pinterest, or Vimeo)
  const isPinterest = parsed.sourceType === 'pinterest'
  const fallbackLabel =
    parsed.sourceType === 'youtube'
      ? 'افتح في يوتيوب'
      : isPinterest
        ? 'افتح في بينترست'
        : 'افتح في فيميو'

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
        {isPinterest && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--color-surface-2)',
              borderBottom: '1px solid var(--color-divider)',
              fontSize: '12.5px',
              color: 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>اضغط على أيقونة الصوت داخل مشغل بينترست لتشغيل الصوت</span>
            </div>
            <button
              type="button"
              onClick={() => {
                void openExternalUrl(parsed.rawUrl)
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-accent, #eb5e28)',
                color: 'var(--on-accent, #ffffff)',
                border: 'none',
                fontWeight: 700,
                fontSize: '12.5px',
                cursor: 'pointer',
              }}
            >
              <span>فتح في تطبيق Pinterest</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </button>
          </div>
        )}

        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: isPinterest ? '9 / 16' : '16 / 9',
            maxHeight: isPinterest ? '480px' : undefined,
            minHeight: '200px',
            backgroundColor: isPinterest ? 'var(--color-surface-2, #18181b)' : '#000000',
            margin: isPinterest ? '0 auto' : undefined,
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
            sandbox={
              isPinterest
                ? undefined
                : 'allow-scripts allow-same-origin allow-presentation'
            }
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            referrerPolicy={isPinterest ? 'no-referrer' : 'strict-origin-when-cross-origin'}
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

          {isPinterest && (
            <button
              type="button"
              onClick={() => void openExternalUrl(parsed.rawUrl)}
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                backgroundColor: 'rgba(24, 24, 27, 0.85)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(6px)',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              }}
            >
              <span>مشاهدة الفيديو في تطبيق Pinterest</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </button>
          )}
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
