import { describe, expect, it } from 'vitest'
import { ConfigError, loadConfig } from './appConfig'

const validEnv = {
  VITE_APP_ENV: 'development',
  VITE_APP_NAME: 'Maganis',
  VITE_STORAGE_PREFIX: 'maganis-dev',
  VITE_LOG_LEVEL: 'debug',
  VITE_DEV_PORT: '5173',
}

function catchFromLoad(env: Record<string, string | undefined>): unknown {
  try {
    loadConfig(env)
  } catch (error) {
    return error
  }
  return undefined
}

describe('loadConfig', () => {
  it('builds a full config from a valid environment', () => {
    expect(loadConfig(validEnv)).toEqual({
      appEnv: 'development',
      appName: 'Maganis',
      storagePrefix: 'maganis-dev',
      logLevel: 'debug',
      devPort: 5173,
    })
  })

  it('defaults logLevel to info and devPort to 5173 when optional vars are absent', () => {
    const config = loadConfig({
      VITE_APP_ENV: 'production',
      VITE_APP_NAME: 'Maganis',
      VITE_STORAGE_PREFIX: 'maganis',
    })
    expect(config.logLevel).toBe('info')
    expect(config.devPort).toBe(5173)
  })

  it('rejects a missing VITE_APP_ENV with an actionable message', () => {
    const error = catchFromLoad({
      VITE_APP_NAME: 'Maganis',
      VITE_STORAGE_PREFIX: 'maganis-dev',
    })
    expect(error).toBeInstanceOf(ConfigError)
    expect((error as ConfigError).message).toContain('VITE_APP_ENV')
    expect((error as ConfigError).message).toContain('Fix:')
  })

  it('rejects an invalid app env value', () => {
    const error = catchFromLoad({ ...validEnv, VITE_APP_ENV: 'staging' })
    expect(error).toBeInstanceOf(ConfigError)
    expect((error as ConfigError).message).toContain('VITE_APP_ENV')
  })

  it('rejects an invalid storage prefix and explains the allowed format', () => {
    const error = catchFromLoad({
      ...validEnv,
      VITE_STORAGE_PREFIX: 'Bad Prefix!',
    })
    expect(error).toBeInstanceOf(ConfigError)
    expect((error as ConfigError).message).toContain('VITE_STORAGE_PREFIX')
    expect((error as ConfigError).message).toContain('lowercase')
  })

  it('rejects an invalid log level', () => {
    const error = catchFromLoad({ ...validEnv, VITE_LOG_LEVEL: 'loud' })
    expect(error).toBeInstanceOf(ConfigError)
    expect((error as ConfigError).message).toContain('VITE_LOG_LEVEL')
  })

  it('rejects an invalid dev port', () => {
    const error = catchFromLoad({ ...validEnv, VITE_DEV_PORT: '99999' })
    expect(error).toBeInstanceOf(ConfigError)
    expect((error as ConfigError).message).toContain('VITE_DEV_PORT')
  })

  it('lists every problem in a single error message', () => {
    const error = catchFromLoad({})
    expect(error).toBeInstanceOf(ConfigError)
    const message = (error as ConfigError).message
    expect(message).toContain('VITE_APP_ENV')
    expect(message).toContain('VITE_APP_NAME')
    expect(message).toContain('VITE_STORAGE_PREFIX')
  })
})
