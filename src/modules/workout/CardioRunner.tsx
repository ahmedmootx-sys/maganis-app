import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  calculateCardioEnergy,
  calculateLiveEnergy,
  getCardioActivity,
  type CardioActivityId,
  type CardioEffortLevel,
  type CardioEstimateResult,
} from './cardioEngine.ts'
import { TopBar, Button, Sheet, Icon } from '../../ui/index.ts'
import { Claim } from '../../content/Claim.tsx'
import { plural } from '../../utils/plural.ts'

export interface CardioSessionPersistence {
  id: string
  activityId: CardioActivityId
  level: CardioEffortLevel
  durationMinutes: number
  weightKg: number
  startTime: number
  pausedTotalMs: number
  isPaused: boolean
  pausedAt: number | null
  estimate: CardioEstimateResult
  minimized?: boolean
}

export interface CardioRunnerProps {
  activityId: CardioActivityId
  level: CardioEffortLevel
  durationMinutes: number
  weightKg: number
  onFinish: (sessionData: {
    activityId: CardioActivityId
    activityNameAr: string
    level: CardioEffortLevel
    durationMinutes: number
    grossKcal: number
    netKcal: number
    kind?: 'cardio' | 'finisher'
  }) => void
  onCancel: () => void
  onMinimize?: () => void
  initialSessionState?: Partial<CardioSessionPersistence> | null
}

const STORAGE_KEY = 'maganis:cardio_active_session'

export function CardioRunner({
  activityId,
  level,
  durationMinutes,
  weightKg,
  onFinish,
  onCancel,
  onMinimize,
  initialSessionState: _initialSessionState,
}: CardioRunnerProps) {
  const estimate = useMemo(() => {
    return calculateCardioEnergy(activityId, level, durationMinutes, weightKg)
  }, [activityId, level, durationMinutes, weightKg])

  // State phases: 'countdown' | 'running' | 'finished'
  const [phase, setPhase] = useState<'countdown' | 'running' | 'finished'>('countdown')
  const [countdown, setCountdown] = useState(3)
  const [isPaused, setIsPaused] = useState(false)
  const [startTime, setStartTime] = useState<number>(() => Date.now())
  const [pausedTotalMs, setPausedTotalMs] = useState(0)
  const [lastPauseTime, setLastPauseTime] = useState<number | null>(null)
  const [now, setNow] = useState<number>(() => Date.now())
  const [showLeaveSheet, setShowLeaveSheet] = useState(false)
  const [showSaveDiscardSheet, setShowSaveDiscardSheet] = useState(false)
  const [wakeLockActive, setWakeLockActive] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  // System back / router popstate interception
  useEffect(() => {
    if (phase !== 'running') return
    const onPop = (e: PopStateEvent) => {
      e.preventDefault()
      window.history.pushState(null, '', window.location.href)
      setShowLeaveSheet(true)
    }
    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', onPop)
    return () => {
      window.removeEventListener('popstate', onPop)
    }
  }, [phase])

  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  // Screen Wake Lock API
  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator && phase === 'running' && !isPaused) {
      try {
        const lock = await navigator.wakeLock.request('screen')
        wakeLockRef.current = lock
        setWakeLockActive(true)
        lock.addEventListener('release', () => {
          setWakeLockActive(false)
        })
      } catch {
        setWakeLockActive(false)
      }
    }
  }, [phase, isPaused])

  useEffect(() => {
    requestWakeLock()
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {})
      }
    }
  }, [requestWakeLock])

  // Restore existing session on mount if valid
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data: CardioSessionPersistence = JSON.parse(saved)
        if (data.activityId === activityId && data.durationMinutes === durationMinutes) {
          setStartTime(data.startTime)
          setPausedTotalMs(data.pausedTotalMs)
          setIsPaused(data.isPaused)
          setLastPauseTime(data.pausedAt)
          setPhase('running')
        }
      }
    } catch {
      // ignore
    }
  }, [activityId, durationMinutes])

  // Countdown timer (3, 2, 1)
  useEffect(() => {
    if (phase !== 'countdown') return

    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(50)
      } catch {
        // ignore
      }
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setStartTime(Date.now())
          setPhase('running')
          return 0
        }
        if ('vibrate' in navigator) {
          try {
            navigator.vibrate(50)
          } catch {
            // ignore
          }
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [phase])

  // Live timer tick using requestAnimationFrame / interval for smooth clock
  useEffect(() => {
    if (phase !== 'running' || isPaused) return

    const interval = setInterval(() => {
      setNow(Date.now())
    }, 250)

    return () => clearInterval(interval)
  }, [phase, isPaused])

  // Compute live elapsed time and calories from clock timestamps
  const totalTargetMs = durationMinutes * 60 * 1000
  const currentElapsedMs = useMemo(() => {
    if (phase !== 'running' && phase !== 'finished') return 0
    const rawElapsed = (isPaused && lastPauseTime ? lastPauseTime : now) - startTime - pausedTotalMs
    return Math.max(0, Math.min(rawElapsed, totalTargetMs))
  }, [phase, isPaused, lastPauseTime, now, startTime, pausedTotalMs, totalTargetMs])

  const remainingMs = Math.max(0, totalTargetMs - currentElapsedMs)
  const remainingSecondsTotal = Math.ceil(remainingMs / 1000)
  const remainingMinutes = Math.floor(remainingSecondsTotal / 60)
  const remainingSeconds = remainingSecondsTotal % 60

  const elapsedMinutes = currentElapsedMs / 60000
  const grossRate = estimate?.grossRateKcalPerMin || 0
  const netRate = estimate?.netRateKcalPerMin || 0

  const liveGrossKcal = Math.round(calculateLiveEnergy(grossRate, currentElapsedMs))
  const liveNetKcal = Math.round(calculateLiveEnergy(netRate, currentElapsedMs))

  // Auto-finish when duration is reached
  useEffect(() => {
    if (phase === 'running' && currentElapsedMs >= totalTargetMs) {
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([100, 50, 100, 50, 200])
        } catch {
          // ignore
        }
      }
      localStorage.removeItem(STORAGE_KEY)
      setPhase('finished')
    }
  }, [phase, currentElapsedMs, totalTargetMs])

  // Persist session to localStorage on running state changes
  useEffect(() => {
    if (phase === 'running' && estimate) {
      const sessionData: CardioSessionPersistence = {
        id: `cardio-${startTime}`,
        activityId,
        level,
        durationMinutes,
        weightKg,
        startTime,
        pausedTotalMs,
        isPaused,
        pausedAt: lastPauseTime,
        estimate,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData))
    }
  }, [phase, activityId, level, durationMinutes, weightKg, startTime, pausedTotalMs, isPaused, lastPauseTime, estimate])

  function handleTogglePause() {
    if (isPaused) {
      // Resume
      if (lastPauseTime) {
        const addedPaused = Date.now() - lastPauseTime
        setPausedTotalMs((prev) => prev + addedPaused)
      }
      setLastPauseTime(null)
      setIsPaused(false)
      requestWakeLock()
    } else {
      // Pause
      setLastPauseTime(Date.now())
      setIsPaused(true)
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {})
      }
    }
  }

  function handleSaveFinal() {
    if (isSaved || !estimate) return
    setIsSaved(true)
    localStorage.removeItem(STORAGE_KEY)

    const finalMinutes = Math.max(1, Math.round(elapsedMinutes))
    const finalGrossKcal = Math.round(grossRate * finalMinutes)
    const finalNetKcal = Math.round(netRate * finalMinutes)

    onFinish({
      activityId,
      activityNameAr: estimate.activityNameAr,
      level,
      durationMinutes: finalMinutes,
      grossKcal: finalGrossKcal,
      netKcal: finalNetKcal,
    })
  }

  const actDef = getCardioActivity(activityId)
  const actName = actDef?.name_ar || activityId
  const levelLabel = level === 'light' ? 'خفيف' : level === 'moderate' ? 'متوسط' : 'عالي'

  // --- 1. Countdown Overlay ---
  if (phase === 'countdown') {
    return (
      <div
        className="fullscreen-route cardio-countdown-overlay"
        dir="rtl"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 600,
          background: 'var(--bg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--muted)', marginBottom: '16px' }}>
          استعد للبدء: {actName}
        </div>
        <div
          className="countdown-number"
          style={{
            fontSize: '96px',
            fontWeight: 900,
            color: 'var(--color-accent)',
            lineHeight: 1,
            margin: '20px 0',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {countdown}
        </div>
        <Button
          variant="secondary"
          size="md"
          onClick={onCancel}
          style={{ marginTop: '32px', minWidth: '140px' }}
        >
          إلغاء
        </Button>
      </div>
    )
  }

  // --- 2. Finished State ---
  if (phase === 'finished') {
    const finalMinutes = Math.max(1, Math.round(elapsedMinutes))
    const finalGross = Math.round(grossRate * finalMinutes)
    const finalNet = Math.round(netRate * finalMinutes)

    return (
      <div
        className="fullscreen-route cardio-finished-screen"
        dir="rtl"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          background: 'var(--bg)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '24px 16px 100px',
          boxSizing: 'border-box',
        }}
      >
        <TopBar title="انتهت جلسة الكارديو!" onBack={onCancel} />

        <div
          style={{
            maxWidth: '560px',
            margin: '20px auto 0',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div
            className="card"
            style={{
              padding: '24px',
              borderRadius: '20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              border: '1px solid var(--color-divider)',
              background: 'var(--color-surface)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--color-accent-subtle, rgba(249, 87, 0, 0.12))',
                color: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="check" size={36} />
            </div>

            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>
              أحسنت! أتممت جلسة {actName}
            </h2>

            <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
              المستوى: {levelLabel} · المدة الفعلية: {plural(finalMinutes, 'دقيقة')}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                width: '100%',
                marginTop: '8px',
              }}
            >
              <div
                style={{
                  background: 'var(--color-surface-2)',
                  padding: '12px',
                  borderRadius: '12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>إجمالي الطاقة</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text)' }}>
                  {plural(finalGross, 'سعرة')}
                </div>
              </div>

              <div
                style={{
                  background: 'var(--color-surface-2)',
                  padding: '12px',
                  borderRadius: '12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>الزيادة بالتمرين</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-accent)' }}>
                  {plural(finalNet, 'سعرة')}
                </div>
              </div>
            </div>

            <Claim id="cardio_met_caveat" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            <Button
              variant="primary"
              size="large"
              fullWidth
              disabled={isSaved}
              onClick={handleSaveFinal}
            >
              {isSaved ? 'تم حفظ الجلسة' : 'احفظ الجلسة في سجلك'}
            </Button>
            <Button variant="secondary" size="large" fullWidth onClick={onCancel}>
              إغلاق
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // --- 3. Running State ---
  const progressRatio = Math.min(1, currentElapsedMs / totalTargetMs)
  const strokeDashoffset = 283 * (1 - progressRatio)

  return (
    <div
      className="fullscreen-route cardio-runner-screen"
      dir="rtl"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        padding: '16px 16px 100px',
        boxSizing: 'border-box',
      }}
    >
      <TopBar title={`جلسة ${actName.replace(/جرى/g, 'جري')}`} onBack={() => setShowLeaveSheet(true)} />

      <div
        style={{
          maxWidth: '520px',
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          flex: 1,
          justifyContent: 'center',
          boxSizing: 'border-box',
          padding: '0 8px',
        }}
      >
        {/* Activity & Level Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--color-surface-2)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '13.5px',
            fontWeight: 700,
            color: 'var(--color-text)',
          }}
        >
          <span>{actName.replace(/جرى/g, 'جري')}</span>
          <span style={{ color: 'var(--muted)' }}>·</span>
          <span style={{ color: 'var(--color-accent)' }}>{levelLabel}</span>
          {isPaused && (
            <span
              style={{
                background: 'var(--color-warning-surface, rgba(245, 158, 11, 0.15))',
                color: 'var(--color-warning, #f59e0b)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
              }}
            >
              موقوف مؤقتاً
            </span>
          )}
        </div>

        {/* Circular Progress & Remaining Time - fixed at font scale 1.3 */}
        <div
          style={{
            position: 'relative',
            width: '220px',
            height: '220px',
            minWidth: '220px',
            minHeight: '220px',
            flexShrink: 0,
          }}
        >
          <svg width="220" height="220" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--color-divider)"
              strokeWidth="7"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="7"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.3s ease' }}
            />
          </svg>

          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>الوقت المتبقي</span>
            <span
              style={{
                fontSize: '38px',
                fontWeight: 900,
                color: 'var(--color-text)',
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1.1,
              }}
            >
              {String(remainingMinutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}
            </span>
            <span style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '4px' }}>
              من {plural(durationMinutes, 'دقيقة')}
            </span>
          </div>
        </div>

        {/* Live Calories Burned Counter with Page Gutters */}
        <div
          className="card"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '16px 20px',
            borderRadius: '16px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-divider)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '12.5px', color: 'var(--muted)', fontWeight: 600 }}>
            سعرات حرقتها لحد دلوقتي
          </div>
          <div
            style={{
              fontSize: '32px',
              fontWeight: 900,
              color: 'var(--color-accent)',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
            }}
          >
            {liveGrossKcal}{' '}
            <span style={{ fontSize: '15px', color: 'var(--muted)', fontWeight: 600 }}>
              / {plural(Math.round(estimate?.grossSessionKcal || 0), 'سعرة')}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
            (صافي الزيادة بالتمرين: {plural(liveNetKcal, 'سعرة')})
          </div>
        </div>

        {/* Screen Wake Lock Info */}
        {!wakeLockActive && (
          <div
            style={{
              fontSize: '11.5px',
              color: 'var(--muted)',
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            خلّي الشاشة شغالة عشان العداد ما يقفش
          </div>
        )}

        {/* Action Controls - Two equal-width real buttons */}
        <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
          <Button
            variant={isPaused ? 'primary' : 'secondary'}
            size="lg"
            fullWidth
            onClick={handleTogglePause}
            style={{ flex: 1, minHeight: '48px', borderRadius: '12px', fontWeight: 700 }}
          >
            {isPaused ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Icon name="play" size={18} /> استئناف
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Icon name="pause" size={18} /> إيقاف مؤقت
              </span>
            )}
          </Button>

          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => setShowLeaveSheet(true)}
            style={{
              flex: 1,
              minHeight: '48px',
              borderRadius: '12px',
              border: '1px solid var(--color-danger, #ef4444)',
              background: 'var(--color-danger-subtle, rgba(239, 68, 68, 0.08))',
              color: 'var(--color-danger, #ef4444)',
              fontWeight: 700,
            }}
          >
            إنهاء الجلسة
          </Button>
        </div>
      </div>

      {/* Leave Running Session Action Sheet (B3.1) */}
      <Sheet
        isOpen={showLeaveSheet}
        onClose={() => setShowLeaveSheet(false)}
        title="جلسة الكارديو جارية"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Button
            variant="primary"
            size="large"
            fullWidth
            onClick={() => setShowLeaveSheet(false)}
            style={{ fontWeight: 700 }}
          >
            كمّل الجلسة
          </Button>

          <Button
            variant="secondary"
            size="large"
            fullWidth
            onClick={() => {
              setShowLeaveSheet(false)
              if (estimate) {
                const sessionData: CardioSessionPersistence = {
                  id: `cardio-${startTime}`,
                  activityId,
                  level,
                  durationMinutes,
                  weightKg,
                  startTime,
                  pausedTotalMs,
                  isPaused,
                  pausedAt: lastPauseTime,
                  estimate,
                  minimized: true,
                }
                localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData))
              }
              if (onMinimize) {
                onMinimize()
              } else {
                onCancel()
              }
            }}
            style={{ fontWeight: 700 }}
          >
            صغّر الجلسة (متابعة بالخلفية)
          </Button>

          <Button
            variant="ghost"
            size="large"
            fullWidth
            onClick={() => {
              setShowLeaveSheet(false)
              setShowSaveDiscardSheet(true)
            }}
            style={{ color: 'var(--color-danger, #ef4444)', fontWeight: 700 }}
          >
            إنهاء الجلسة
          </Button>
        </div>
      </Sheet>

      {/* End Session: Save or Discard Sheet */}
      <Sheet
        isOpen={showSaveDiscardSheet}
        onClose={() => setShowSaveDiscardSheet(false)}
        title="احفظ الجلسة؟"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontSize: '14px', color: 'var(--ink)' }}>
            أنجزت <strong>{Math.max(1, Math.round(elapsedMinutes))} دقيقة</strong> وحرقت <strong>{liveGrossKcal} سعرة</strong> حتى الآن.
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              variant="primary"
              size="large"
              style={{ flex: 1, fontWeight: 700 }}
              onClick={() => {
                setShowSaveDiscardSheet(false)
                handleSaveFinal()
              }}
            >
              حفظ الجلسة
            </Button>
            <Button
              variant="ghost"
              size="large"
              style={{ flex: 1, color: 'var(--color-danger, #ef4444)', fontWeight: 700 }}
              onClick={() => {
                setShowSaveDiscardSheet(false)
                localStorage.removeItem(STORAGE_KEY)
                onCancel()
              }}
            >
              تجاهل الجلسة
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  )
}

export default CardioRunner
