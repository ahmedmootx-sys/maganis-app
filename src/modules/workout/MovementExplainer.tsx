import React, { useState, useEffect } from 'react'
import { Button, IconButton, Icon } from '../../ui/index.ts'
import mediaFramesData from '../../data/media-frames.json'
import exerciseVisualData from '../../data/exercise-visual.json'
import { assetUrl } from '../../utils/assetUrl.ts'

export interface MovementExplainerProps {
  exerciseKey: string
  exerciseName: string
  images?: string[]
}

interface VisualPhase {
  frame: number
  caption_ar: string
  active_muscles?: string[]
}

interface ExerciseVisualEntry {
  reviewed: boolean
  phases?: VisualPhase[]
  cues_ar?: string[]
  mistake?: {
    caption_ar: string
    frame?: number
  }
}

export const MovementExplainer: React.FC<MovementExplainerProps> = ({
  exerciseKey,
  exerciseName,
  images = [],
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState<1 | 0.5>(1)
  const [activeFrameIdx, setActiveFrameIdx] = useState(0)
  const [showRomOverlay, setShowRomOverlay] = useState(false)

  // Load frames from media-frames.json or fallback to props.images
  const exerciseFramesInfo =
    (mediaFramesData as unknown as { exercises: Record<string, { frames: Array<{ index: number; url: string; label: string }> }> })
      .exercises?.[exerciseKey]

  const frames: Array<{ url: string; label: string }> =
    exerciseFramesInfo?.frames?.map((f) => ({
      url: f.url.startsWith('/') ? f.url.slice(1) : f.url,
      label: f.label,
    })) ||
    (images.length > 0
      ? images.map((img, idx) => ({
          url: img.startsWith('/') ? img.slice(1) : img,
          label: idx === 0 ? 'بداية' : idx === images.length - 1 ? 'نهاية' : `مرحلة ${idx + 1}`,
        }))
      : [
          { url: `exercises/${exerciseKey}_0.jpg`, label: 'بداية' },
          { url: `exercises/${exerciseKey}_1.jpg`, label: 'نهاية' },
        ])

  const totalFrames = frames.length

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReduced) {
        setIsPlaying(false)
      }
    }
  }, [])

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying || totalFrames <= 1) return

    const intervalMs = (1000 / (speed * 1.5))
    const timer = setInterval(() => {
      setActiveFrameIdx((prev) => (prev + 1) % totalFrames)
    }, intervalMs)

    return () => clearInterval(timer)
  }, [isPlaying, speed, totalFrames])

  // Authored visual details
  const authoredEntry =
    (exerciseVisualData as unknown as { entries: Record<string, ExerciseVisualEntry> })
      .entries?.[exerciseKey]

  const isReviewed = Boolean(authoredEntry?.reviewed)

  const currentFrame = frames[activeFrameIdx] || frames[0]
  const startFrame = frames[0]
  const endFrame = frames[totalFrames - 1]

  return (
    <div
      className="movement-explainer-section"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>
          الحركة وتفاصيل الأداء
        </span>
        <button
          type="button"
          role="checkbox"
          aria-checked={showRomOverlay}
          onClick={() => setShowRomOverlay((prev) => !prev)}
          className={`chip ${showRomOverlay ? 'chip--active' : ''}`}
          style={{ fontSize: '12px', minHeight: '32px', padding: '4px 12px' }}
        >
          <span>إظهار المدى</span>
        </button>
      </div>

      {/* Main Visual Display / Overlay Area */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '240px',
          background: 'var(--color-surface-2)',
          borderRadius: 'var(--radius-card)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--color-divider)',
        }}
      >
        {showRomOverlay ? (
          /* Range-of-motion overlay: Superimposes start and end frames with opacity blend */
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={assetUrl(startFrame.url)}
              alt="مدى البداية"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                opacity: 0.85,
              }}
            />
            <img
              src={assetUrl(endFrame.url)}
              alt="مدى النهاية"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                opacity: 0.55,
                mixBlendMode: 'multiply',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                background: 'rgba(0,0,0,0.65)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              المدى الحركي الكامل (دمج البداية والنهاية)
            </div>
          </div>
        ) : (
          /* Phase Player Display */
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={assetUrl(currentFrame.url)}
              alt={`${exerciseName} - ${currentFrame.label}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
              onError={(e) => {
                // If frame fails, show text fallback
                ;(e.currentTarget as HTMLElement).style.display = 'none'
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              مرحلة {activeFrameIdx + 1} من {totalFrames}: {currentFrame.label}
            </div>
          </div>
        )}
      </div>

      {/* Phase Player Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--color-surface)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-control)',
          border: '1px solid var(--color-divider)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconButton
            name={isPlaying ? 'pause' : 'play'}
            aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل الحركة'}
            size={18}
            onClick={() => setIsPlaying((p) => !p)}
          />
          <button
            type="button"
            onClick={() => setSpeed((s) => (s === 1 ? 0.5 : 1))}
            style={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-divider)',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--color-text)',
              cursor: 'pointer',
            }}
          >
            {speed}×
          </button>
        </div>

        {/* Previous / Next Frame Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Button
            variant="secondary"
            size="small"
            disabled={activeFrameIdx === 0}
            onClick={() => setActiveFrameIdx((idx) => Math.max(0, idx - 1))}
          >
            السابق
          </Button>
          <Button
            variant="secondary"
            size="small"
            disabled={activeFrameIdx === totalFrames - 1}
            onClick={() => setActiveFrameIdx((idx) => Math.min(totalFrames - 1, idx + 1))}
          >
            التالي
          </Button>
        </div>
      </div>

      {/* Keyframe Horizontal Strip (Scroll-snap carousel) */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollSnapType: 'x mandatory',
        }}
      >
        {frames.map((frame, idx) => {
          const isSel = idx === activeFrameIdx
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setActiveFrameIdx(idx)
                setIsPlaying(false)
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '4px',
                borderRadius: '8px',
                border: isSel ? '2px solid var(--color-accent)' : '1px solid var(--color-divider)',
                background: isSel ? 'var(--color-accent-tint)' : 'var(--color-surface)',
                cursor: 'pointer',
                flexShrink: 0,
                width: '64px',
                scrollSnapAlign: 'start',
              }}
            >
              <img
                src={assetUrl(frame.url)}
                alt={frame.label}
                style={{ width: '56px', height: '56px', objectFit: 'contain' }}
              />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: isSel ? 700 : 500,
                  color: isSel ? 'var(--color-text)' : 'var(--color-text-2)',
                }}
              >
                {frame.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Authored Content or Uncompleted Notice */}
      {isReviewed && authoredEntry ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
          {/* Phase Caption */}
          {authoredEntry.phases?.[activeFrameIdx]?.caption_ar && (
            <div
              style={{
                fontSize: '13px',
                lineHeight: '1.5',
                color: 'var(--color-text)',
                background: 'var(--color-surface-2)',
                padding: '8px 12px',
                borderRadius: '8px',
              }}
            >
              <strong>إرشاد المرحلة:</strong> {authoredEntry.phases[activeFrameIdx].caption_ar}
            </div>
          )}

          {/* Cues */}
          {authoredEntry.cues_ar && authoredEntry.cues_ar.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-2)' }}>
                ركّز على:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {authoredEntry.cues_ar.slice(0, 3).map((cue, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '12px',
                      background: 'var(--color-accent-tint)',
                      border: '1px solid var(--color-accent)',
                      color: 'var(--color-text)',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontWeight: 600,
                    }}
                  >
                    ✓ {cue}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Common Mistake Card */}
          {authoredEntry.mistake && (
            <div
              style={{
                background: 'var(--color-danger-bg)',
                border: '1px solid var(--color-danger-border)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '12.5px',
                color: 'var(--color-danger)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Icon name="alert-triangle" size={18} />
              <span>
                <strong>خطأ شائع:</strong> {authoredEntry.mistake.caption_ar}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            fontSize: '12px',
            color: 'var(--color-text-2)',
            padding: '4px 0',
            fontStyle: 'italic',
          }}
        >
          الشرح المرئي غير مكتمل لهذا التمرين
        </div>
      )}
    </div>
  )
}
