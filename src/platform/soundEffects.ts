/**
 * src/platform/soundEffects.ts
 *
 * Web Audio synthetic audio chimes for workout rest completion and timed sets.
 * Completely offline, zero asset overhead, no external audio file dependencies.
 */

class SoundEngine {
  private ctx: AudioContext | null = null

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume()
    }
    return this.ctx
  }

  /**
   * Gentle 3-note chime when rest timer completes (C5 -> E5 -> G5)
   */
  playRestCompleteChime(): void {
    const ctx = this.getContext()
    if (!ctx) return
    try {
      const now = ctx.currentTime
      const notes = [523.25, 659.25, 783.99]
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + idx * 0.12)
        gain.gain.setValueAtTime(0, now + idx * 0.12)
        gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.12 + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.35)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + idx * 0.12)
        osc.stop(now + idx * 0.12 + 0.36)
      })
    } catch {
      // Audio autoplay policy or device capability fallback
    }
  }

  /**
   * Subtle soft ping ("تنة خفيفة") for timed exercise completion
   */
  playTimedSetPing(): void {
    const ctx = this.getContext()
    if (!ctx) return
    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, now)
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.12)
      gain.gain.setValueAtTime(0.16, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.23)
    } catch {
      // Fallback
    }
  }
}

export const soundEffects = new SoundEngine()
