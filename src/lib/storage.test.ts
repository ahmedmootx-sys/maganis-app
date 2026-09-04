import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createStorage, StorageError } from './storage'

describe('createStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('round-trips a value through set and get', () => {
    const storage = createStorage('test')
    storage.set('plan.week', { days: 3, focus: 'push' })
    expect(storage.get('plan.week', { days: 0, focus: '' })).toEqual({
      days: 3,
      focus: 'push',
    })
  })

  it('returns the fallback for a missing key', () => {
    const storage = createStorage('test')
    expect(storage.get('missing', 42)).toBe(42)
  })

  it('returns the fallback and warns when stored JSON is corrupt, keeping the raw value', () => {
    const storage = createStorage('test')
    localStorage.setItem('test:broken', '{not-json')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(storage.get('broken', 'fallback')).toBe('fallback')
    expect(warnSpy).toHaveBeenCalledOnce()
    expect(localStorage.getItem('test:broken')).toBe('{not-json')
  })

  it('wraps read failures in a readable StorageError', () => {
    const storage = createStorage('test')
    // jsdom 26 exposes localStorage in a way vi.spyOn cannot intercept here,
    // so the whole global is stubbed instead.
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    })
    try {
      expect(() => storage.get('anything', 1)).toThrow(StorageError)
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('keeps different prefixes isolated from each other', () => {
    const dev = createStorage('app-dev')
    const prod = createStorage('app')
    dev.set('counter', 1)
    prod.set('counter', 99)
    expect(dev.get('counter', 0)).toBe(1)
    expect(prod.get('counter', 0)).toBe(99)
    expect(dev.keys()).toEqual(['counter'])
    expect(prod.keys()).toEqual(['counter'])
  })

  it('removes keys and strips the prefix in keys()', () => {
    const storage = createStorage('test')
    storage.set('a', 1)
    storage.set('b', 2)
    expect(storage.keys()).toEqual(['a', 'b'])
    storage.remove('a')
    expect(storage.keys()).toEqual(['b'])
    expect(storage.get('a', 0)).toBe(0)
  })
})
