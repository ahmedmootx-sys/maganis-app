import { describe, it, expect, afterEach } from 'vitest'
import { isNative, platformName, isDebugBuild } from './runtime.ts'
import { platform, setPlatformForTesting, type Platform } from './index.ts'

describe('Platform Runtime and Skeleton (Task N1)', () => {
  afterEach(() => {
    setPlatformForTesting(null)
  })

  it('detects default web runtime environment in test runner', () => {
    expect(isNative()).toBe(false)
    expect(platformName()).toBe('web')
    expect(isDebugBuild()).toBe(true) // vitest runs in dev/test mode
  })

  it('platform.info.getInfo() returns default web info in test runner', async () => {
    const info = await platform.info.getInfo()
    expect(info.isNative).toBe(false)
    expect(info.platform).toBe('web')
    expect(info.applicationId).toBe('app.maganis.coach.web')
    expect(info.signingSha256).toBe('web-unsigned')
  })

  it('implements platform.kv and platform.media in Task N2', async () => {
    // KV storage (N2)
    await platform.kv.set('test_k', 'test_v')
    expect(await platform.kv.get('test_k')).toBe('test_v')
    await platform.kv.remove('test_k')
    expect(await platform.kv.get('test_k')).toBeNull()

    // Media storage (N2)
    const blob = new Blob(['media-bytes'], { type: 'text/plain' })
    const savedId = await platform.media.saveMedia('test_media', blob)
    expect(savedId).toBe('test_media')
    const media = await platform.media.getMedia('test_media')
    expect(media).not.toBeNull()
    await platform.media.deleteMedia('test_media')
  })

  it('unimplemented future platform modules return honest unsupported responses', async () => {
    // Files (N3)
    const fileResult = await platform.files.saveFile('test.json', '{}')
    expect(fileResult.success).toBe(false)
    expect(fileResult.error).toContain('unsupported: Task N3')

    const readResult = await platform.files.readFile('test.json')
    expect(readResult.error).toContain('unsupported: Task N3')

    // Notifications (N4)
    const notifResult = await platform.notifications.schedule({})
    expect(notifResult.supported).toBe(false)
    expect(notifResult.error).toContain('unsupported: Task N4')

    const cancelResult = await platform.notifications.cancel('id-1')
    expect(cancelResult.supported).toBe(false)
    expect(cancelResult.error).toContain('unsupported: Task N4')

    // Haptics & KeepAwake (N4)
    expect((await platform.haptics.vibrate()).supported).toBe(false)
    expect((await platform.keepAwake.keepAwake()).supported).toBe(false)
    expect((await platform.keepAwake.allowSleep()).supported).toBe(false)

    // App lifecycle & back handlers
    const unregPause = platform.app.onPause(() => {})
    expect(typeof unregPause).toBe('function')
    unregPause()

    const unregResume = platform.app.onResume(() => {})
    expect(typeof unregResume).toBe('function')
    unregResume()

    const unregBack = platform.app.registerBackHandler(() => true, 10)
    expect(typeof unregBack).toBe('function')
    unregBack()

    expect(() => platform.app.exit()).not.toThrow()
  })

  it('supports injecting a mock platform via setPlatformForTesting', async () => {
    const mockPlatform: Platform = {
      info: {
        getInfo: async () => ({
          applicationId: 'app.maganis.coach.debug',
          versionName: '0.1.0-debug',
          versionCode: 1042,
          buildType: 'debug',
          sdkInt: 34,
          deviceModel: 'Pixel 8',
          debuggable: true,
          signingSha256:
            '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF',
          isNative: true,
          platform: 'android',
        }),
      },
      app: {
        onPause: () => () => {},
        onResume: () => () => {},
        exit: () => {},
        registerBackHandler: () => () => {},
      },
      kv: {} as unknown as Platform['kv'],
      media: {} as unknown as Platform['media'],
      files: {} as unknown as Platform['files'],
      notifications: {} as unknown as Platform['notifications'],
      haptics: {} as unknown as Platform['haptics'],
      keepAwake: {} as unknown as Platform['keepAwake'],
    }

    setPlatformForTesting(mockPlatform)

    const info = await platform.info.getInfo()
    expect(info.isNative).toBe(true)
    expect(info.applicationId).toBe('app.maganis.coach.debug')
    expect(info.versionCode).toBe(1042)
    expect(info.deviceModel).toBe('Pixel 8')
  })
})
