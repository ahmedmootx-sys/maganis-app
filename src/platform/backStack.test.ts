import { describe, it, expect, vi, beforeEach } from 'vitest'
import { backButtonManager } from './backStack.ts'

describe('backButtonManager', () => {
  beforeEach(() => {
    backButtonManager.resetForTesting()
  })

  it('calls registered handlers in LIFO order when priorities are equal', async () => {
    const callOrder: string[] = []

    backButtonManager.register(() => {
      callOrder.push('handler-1')
      return false
    })

    backButtonManager.register(() => {
      callOrder.push('handler-2')
      return false
    })

    await backButtonManager.handleBackPress()

    expect(callOrder).toEqual(['handler-2', 'handler-1'])
  })

  it('respects priority over registration order', async () => {
    const callOrder: string[] = []

    backButtonManager.register(() => {
      callOrder.push('low-priority')
      return false
    }, 10)

    backButtonManager.register(() => {
      callOrder.push('high-priority')
      return false
    }, 100)

    await backButtonManager.handleBackPress()

    expect(callOrder).toEqual(['high-priority', 'low-priority'])
  })

  it('stops processing when a handler consumes the back press', async () => {
    const callOrder: string[] = []

    backButtonManager.register(() => {
      callOrder.push('first')
      return true // consumes event
    }, 100)

    backButtonManager.register(() => {
      callOrder.push('second')
      return false
    }, 50)

    const handled = await backButtonManager.handleBackPress()

    expect(handled).toBe(true)
    expect(callOrder).toEqual(['first'])
  })

  it('allows unregistering a handler', async () => {
    const handler = vi.fn().mockReturnValue(true)
    const unregister = backButtonManager.register(handler)

    unregister()
    await backButtonManager.handleBackPress()

    expect(handler).not.toHaveBeenCalled()
  })

  it('shows toast on first back press at root route and exits on second press within 2s', async () => {
    const toastMock = vi.fn()
    const exitMock = vi.fn()
    backButtonManager.setOnShowToast(toastMock)

    // First press at root route
    const firstHandled = await backButtonManager.handleBackPress(exitMock)
    expect(firstHandled).toBe(false)
    expect(toastMock).toHaveBeenCalledWith('اضغط تاني للخروج')
    expect(exitMock).not.toHaveBeenCalled()

    // Second press immediately (within 2000ms)
    const secondHandled = await backButtonManager.handleBackPress(exitMock)
    expect(secondHandled).toBe(true)
    expect(exitMock).toHaveBeenCalledTimes(1)
  })

  it('resets double-press timer after 2 seconds', async () => {
    vi.useFakeTimers()
    try {
      const toastMock = vi.fn()
      const exitMock = vi.fn()
      backButtonManager.setOnShowToast(toastMock)

      // First press
      await backButtonManager.handleBackPress(exitMock)
      expect(toastMock).toHaveBeenCalledTimes(1)
      expect(exitMock).not.toHaveBeenCalled()

      // Advance time beyond 2000ms threshold
      vi.advanceTimersByTime(2500)

      // Next press should trigger toast again, not exit
      await backButtonManager.handleBackPress(exitMock)
      expect(toastMock).toHaveBeenCalledTimes(2)
      expect(exitMock).not.toHaveBeenCalled()
    } finally {
      vi.useRealTimers()
    }
  })
})
