import { describe, it, expect, vi } from 'vitest'
import { DurableKvManager } from './native/durableKv.ts'

describe('DurableKvManager write queue, coalescing, and chunking', () => {
  it('coalesces rapid writes to the same key so only the latest value is persisted', async () => {
    const kvWriteMock = vi
      .fn()
      .mockResolvedValue({ success: true, key: 'test-key' })
    const mockPlugin = {
      kvWrite: kvWriteMock,
      kvWriteChunk: vi.fn(),
      kvRemove: vi.fn(),
      kvClear: vi.fn(),
    }

    const manager = new DurableKvManager({
      dispatchDelayMs: 20,
      nativePlugin: mockPlugin,
    })

    // Fire 5 rapid writes
    const p1 = manager.queueWrite('test-key', 'value-1')
    const p2 = manager.queueWrite('test-key', 'value-2')
    const p3 = manager.queueWrite('test-key', 'value-3')
    const p4 = manager.queueWrite('test-key', 'value-4')
    const p5 = manager.queueWrite('test-key', 'value-5')

    await manager.flush()
    await Promise.all([p1, p2, p3, p4, p5])

    // Should only have written value-5 once!
    expect(kvWriteMock).toHaveBeenCalledTimes(1)
    expect(kvWriteMock).toHaveBeenCalledWith({
      key: 'test-key',
      value: 'value-5',
    })
  })

  it('chunks large values exceeding chunkThresholdBytes', async () => {
    const kvWriteMock = vi
      .fn()
      .mockResolvedValue({ success: true, key: 'large-key' })
    const chunkMock = vi
      .fn()
      .mockResolvedValue({ success: true, key: 'large-key', chunkReceived: 1 })
    const mockPlugin = {
      kvWrite: kvWriteMock,
      kvWriteChunk: chunkMock,
      kvRemove: vi.fn(),
      kvClear: vi.fn(),
    }

    // Set threshold at 100 bytes and chunk size at 50 bytes for test
    const manager = new DurableKvManager({
      dispatchDelayMs: 10,
      chunkThresholdBytes: 100,
      chunkSizeBytes: 50,
      nativePlugin: mockPlugin,
    })

    const largeString = 'A'.repeat(120)
    await manager.queueWrite('large-key', largeString)
    await manager.flush()

    expect(kvWriteMock).not.toHaveBeenCalled()
    // 120 bytes / 50 bytes = 3 chunks (50, 50, 20)
    expect(chunkMock).toHaveBeenCalledTimes(3)
    expect(chunkMock).toHaveBeenNthCalledWith(1, {
      key: 'large-key',
      chunkIndex: 0,
      totalChunks: 3,
      chunkData: 'A'.repeat(50),
    })
    expect(chunkMock).toHaveBeenNthCalledWith(2, {
      key: 'large-key',
      chunkIndex: 1,
      totalChunks: 3,
      chunkData: 'A'.repeat(50),
    })
    expect(chunkMock).toHaveBeenNthCalledWith(3, {
      key: 'large-key',
      chunkIndex: 2,
      totalChunks: 3,
      chunkData: 'A'.repeat(20),
    })
  })

  it('flush() immediately dispatches pending writes without waiting for delay timer', async () => {
    const kvWriteMock = vi
      .fn()
      .mockResolvedValue({ success: true, key: 'immediate-key' })
    const mockPlugin = {
      kvWrite: kvWriteMock,
      kvWriteChunk: vi.fn(),
      kvRemove: vi.fn(),
      kvClear: vi.fn(),
    }

    const manager = new DurableKvManager({
      dispatchDelayMs: 10000, // Long delay
      nativePlugin: mockPlugin,
    })

    const promise = manager.queueWrite('immediate-key', 'flush-val')
    await manager.flush()
    await promise

    expect(kvWriteMock).toHaveBeenCalledTimes(1)
    expect(kvWriteMock).toHaveBeenCalledWith({
      key: 'immediate-key',
      value: 'flush-val',
    })
  })
})
