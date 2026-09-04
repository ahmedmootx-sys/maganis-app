export type AppEnv = 'development' | 'production' | 'test'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface AppConfig {
  appEnv: AppEnv
  appName: string
  storagePrefix: string
  logLevel: LogLevel
  devPort: number
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigError'
  }
}

const APP_ENV_VALUES: AppEnv[] = ['development', 'production', 'test']
const LOG_LEVEL_VALUES: LogLevel[] = ['debug', 'info', 'warn', 'error']
const STORAGE_PREFIX_PATTERN = /^[a-z0-9][a-z0-9-]{1,31}$/

function readValue(
  env: Record<string, string | undefined>,
  key: string,
): string | undefined {
  const raw = env[key]
  if (raw === undefined) return undefined
  const trimmed = raw.trim()
  return trimmed === '' ? undefined : trimmed
}

/**
 * Validates raw environment variables and builds the app configuration.
 * Collects every problem before throwing so the operator sees all fixes at
 * once. Rules must stay in sync with scripts/check-env.mjs (file-based twin).
 */
export function loadConfig(env: Record<string, string | undefined>): AppConfig {
  const problems: string[] = []

  const appEnvRaw = readValue(env, 'VITE_APP_ENV')
  let appEnv: AppEnv | undefined
  if (appEnvRaw === undefined) {
    problems.push(
      '- VITE_APP_ENV: missing. Fix: set it to one of development | production | test (file: .env.development or .env.production).',
    )
  } else if (!APP_ENV_VALUES.includes(appEnvRaw as AppEnv)) {
    problems.push(
      '- VITE_APP_ENV: invalid value "' +
        appEnvRaw +
        '". Fix: use one of development | production | test (file: .env.development or .env.production).',
    )
  } else {
    appEnv = appEnvRaw as AppEnv
  }

  const appName = readValue(env, 'VITE_APP_NAME')
  if (appName === undefined) {
    problems.push(
      '- VITE_APP_NAME: missing or empty. Fix: set a non-empty name, e.g. VITE_APP_NAME=Maganis (file: .env.development or .env.production).',
    )
  }

  const storagePrefix = readValue(env, 'VITE_STORAGE_PREFIX')
  if (storagePrefix === undefined) {
    problems.push(
      '- VITE_STORAGE_PREFIX: missing or empty. Fix: use 2-32 chars of lowercase letters, digits or dashes, e.g. VITE_STORAGE_PREFIX=maganis (file: .env.development or .env.production).',
    )
  } else if (!STORAGE_PREFIX_PATTERN.test(storagePrefix)) {
    problems.push(
      '- VITE_STORAGE_PREFIX: invalid value "' +
        storagePrefix +
        '". Fix: use 2-32 chars of lowercase letters, digits or dashes, starting with a letter or digit (file: .env.development or .env.production).',
    )
  }

  const logLevelRaw = readValue(env, 'VITE_LOG_LEVEL')
  let logLevel: LogLevel = 'info'
  if (
    logLevelRaw !== undefined &&
    !LOG_LEVEL_VALUES.includes(logLevelRaw as LogLevel)
  ) {
    problems.push(
      '- VITE_LOG_LEVEL: invalid value "' +
        logLevelRaw +
        '". Fix: use one of debug | info | warn | error, or remove the line to get the default "info" (file: .env.development or .env.production).',
    )
  } else if (logLevelRaw !== undefined) {
    logLevel = logLevelRaw as LogLevel
  }

  const devPortRaw = readValue(env, 'VITE_DEV_PORT')
  let devPort = 5173
  if (devPortRaw !== undefined) {
    const parsed = Number(devPortRaw)
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
      problems.push(
        '- VITE_DEV_PORT: invalid value "' +
          devPortRaw +
          '". Fix: use an integer between 1 and 65535, e.g. 5173 (file: .env.development).',
      )
    } else {
      devPort = parsed
    }
  }

  if (problems.length > 0) {
    throw new ConfigError(
      ['Invalid environment configuration - the app cannot start safely.', '']
        .concat(problems)
        .join('\n'),
    )
  }

  return {
    appEnv: appEnv as AppEnv,
    appName: appName as string,
    storagePrefix: storagePrefix as string,
    logLevel,
    devPort,
  }
}
