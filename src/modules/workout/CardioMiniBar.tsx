import { useEffect, useState, useMemo } from 'react'
import {
  calculateCardioEnergy,
  calculateLiveEnergy,
  getCardioActivity,
  type CardioActivityId,
  type CardioEffortLevel,
} from './cardioEngine.ts'
import { Icon } from '../../ui/index.ts'

export interface CardioMiniBarProps {
  activityId: CardioActivityId
  level: CardioEffortLevel
  startTime: number
  durationMinutes: number
  weightKg: number
  pausedTotalMs: number
  isPaused: boolean
  pausedAt: number | null
  onOpenRunner: () => void
  onTogglePause: () => void
}

export function CardioMiniBar({
  activityId,
  level,
  startTime,
  durationMinutes,
  weightKg,
  pausedTotalMs,
  isPaused,
  pausedAt,
  onOpenRunner,
  onTogglePause,
}: CardioMiniBarProps) {
  const [now, setNow] = useState(() => Date.now())
  const [expiryToastShown, setExpiryToastShown] = useState(false)

  const estimate = useMemo(() => {
    return calculateCardioEnergy(activityId, level, durationMinutes, weightKg)
  }, [activityId, level, durationMinutes, weightKg])

  const totalTargetMs = durationMinutes * 60 * 1000

  // Tick clock every 250ms while active
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setNow(Date.now())
    }, 250)
    return () => clearInterval(timer)
  }, [isPaused])

  const currentElapsedMs = useMemo(() => {
    const effectiveNow = isPaused && pausedAt ? pausedAt : now
    const raw = effectiveNow - startTime - pausedTotalMs
    return Math.max(0, Math.min(raw, totalTargetMs))
  }, [isPaused, pausedAt, now, startTime, pausedTotalMs, totalTargetMs])

  const remainingMs = Math.max(0, totalTargetMs - currentElapsedMs)
  const remainingSecondsTotal = Math.ceil(remainingMs / 1000)
  const remainingMinutes = Math.floor(remainingSecondsTotal / 60)
  const remainingSeconds = remainingSecondsTotal % 60
  const isExpired = currentElapsedMs >= totalTargetMs

  const grossRate = estimate?.grossRateKcalPerMin || 0
  const liveGrossKcal = Math.round(calculateLiveEnergy(grossRate, currentElapsedMs))

  const actDef = getCardioActivity(activityId)
  const actName = actDef?.name_ar || activityId

  // Notify when expired while away
  useEffect(() => {
    if (isExpired && !expiryToastShown) {
      setExpiryToastShown(true)
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([100, 50, 100, 50, 200])
        } catch {
          // ignore
        }
      }
    }
  }, [isExpired, expiryToastShown])

  const formattedTime = `${String(remainingMinutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`

  return (
    <aside
      aria-label="جلسة كارديو جارية"
      data-testid="cardio-mini-bar"
      data-overlay="true"
      onClick={onOpenRunner}
      style={{
        position: 'fixed',
        bottom: 'calc(var(--bottom-nav-height, 64px) + env(safe-area-inset-bottom, 0px))',
        insetInline: 0,
        height: '56px',
        zIndex: 'var(--z-cardio-bar, 150)',
        background: 'var(--card-bg, #ffffff)',
        borderTop: '1px solid var(--line, #e2e8f0)',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        boxSizing: 'border-box',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* Right Info: Icon + Name + Time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '18px',
            background: 'var(--color-accent-subtle, rgba(235, 94, 40, 0.12))',
            color: 'var(--color-accent, #eb5e28)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name="activity" size={18} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
            {actName.replace(/جرى/g, 'جري')}
          </span>
          <span
            style={{
              fontSize: '12px',
              fontVariantNumeric: 'tabular-nums',
              fontWeight: 700,
              color: isExpired ? 'var(--color-accent)' : 'var(--muted)',
            }}
          >
            {isExpired ? 'الجلسة خلصت — احفظها' : formattedTime}
          </span>
        </div>
      </div>

      {/* Center: Calories Burned */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '13px',
          fontWeight: 700,
          color: 'var(--ink)',
        }}
      >
        <span style={{ color: 'var(--color-accent)' }}>{liveGrossKcal}</span>
        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>سعرة</span>
      </div>

      {/* Left Action: Pause / Resume Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          data-testid="cardio-mini-pause-btn"
          aria-label={isPaused ? 'استئناف الكارديو' : 'إيقاف مؤقت للكارديو'}
          onClick={(e) => {
            e.stopPropagation()
            onTogglePause()
          }}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'var(--card-subtle, #f1f5f9)',
            border: '1px solid var(--line, #e2e8f0)',
            color: 'var(--ink, #0f172a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Icon name={isPaused ? 'play' : 'pause'} size={16} />
        </button>
      </div>
    </aside>
  )
}
