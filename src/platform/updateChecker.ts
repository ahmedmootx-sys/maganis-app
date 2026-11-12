/**
 * src/platform/updateChecker.ts
 * Update Checker & Sideload Install Coordinator for Maganis (Task N5.5).
 *
 * Requirements:
 * 1. Queries GitHub Releases API for latest official release.
 * 2. Strict Zod schema validation (does not trust remote responses).
 * 3. Compares semantic versions against app versionName (debug builds blocked with Arabic note).
 * 4. Extracts plain-text Arabic release notes from "### ar" section (HTML tags strictly stripped).
 * 5. Validates APK download URL prefix against official release assets repository.
 * 6. Distinct Arabic messages for offline, rate-limiting (403/429), and malformed responses.
 */

import { z } from 'zod'
import { logger } from './logger.ts'
import { appStorage } from './storage.ts'

const GITHUB_REPO_OWNER = 'ahmedmootx-sys'
const GITHUB_REPO_NAME = 'maganis-app'

export const GITHUB_RELEASES_URL = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases/latest`

export const GITHUB_DOWNLOAD_PREFIX = `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases/download/`

const STORAGE_KEY_AUTO_UPDATE = 'maganis:setting.auto_update_check'

const GitHubAssetSchema = z.object({
  name: z.string(),
  browser_download_url: z
    .string()
    .url()
    .refine((url) => url.startsWith(GITHUB_DOWNLOAD_PREFIX), {
      message: 'Download URL does not match trusted GitHub Releases origin',
    }),
  size: z.number().optional(),
})

export const GitHubReleaseSchema = z.object({
  tag_name: z
    .string()
    .regex(
      /^v\d+\.\d+\.\d+$/,
      'Tag must match semantic version pattern vX.Y.Z',
    ),
  name: z.string().optional().nullable(),
  body: z.string().optional().nullable(),
  published_at: z.string().optional().nullable(),
  assets: z.array(GitHubAssetSchema),
})

export type GitHubRelease = z.infer<typeof GitHubReleaseSchema>

export type UpdateCheckStatus =
  | 'up_to_date'
  | 'update_available'
  | 'debug_build'
  | 'offline'
  | 'rate_limited'
  | 'invalid_response'
  | 'error'

export interface UpdateCheckResult {
  status: UpdateCheckStatus
  messageAr: string
  currentVersion: string
  latestVersion?: string
  releaseNotesAr?: string[]
  downloadUrl?: string
  apkSizeMb?: number
  releaseDate?: string
}

/**
 * Compares two semantic version strings (e.g., "0.1.0" and "0.2.0").
 * Returns:
 *   1 if v1 > v2
 *  -1 if v1 < v2
 *   0 if v1 === v2
 */
export function compareSemver(v1: string, v2: string): number {
  const clean1 = v1
    .replace(/^v/, '')
    .replace(/-debug$/i, '')
    .trim()
  const clean2 = v2
    .replace(/^v/, '')
    .replace(/-debug$/i, '')
    .trim()

  const parts1 = clean1.split('.').map((p) => parseInt(p, 10) || 0)
  const parts2 = clean2.split('.').map((p) => parseInt(p, 10) || 0)

  for (let i = 0; i < 3; i++) {
    const a = parts1[i] ?? 0
    const b = parts2[i] ?? 0
    if (a > b) return 1
    if (a < b) return -1
  }
  return 0
}

/**
 * Extracts plain-text Egyptian Arabic release notes from the markdown body.
 * Guaranteed zero HTML tags, limited to at most 3 bullets.
 */
export function extractArabicReleaseNotes(body?: string | null): string[] {
  if (!body || typeof body !== 'string') return []

  // Look for section between "### ar" and next "###" or end of string
  const arMatch = body.match(/###\s*ar\s*\n([\s\S]*?)(?=(?:\n###|$))/i)
  const targetText = arMatch ? arMatch[1] : body

  const lines = targetText.split('\n')
  const bullets: string[] = []

  for (const rawLine of lines) {
    let line = rawLine.trim()
    if (!line) continue

    // Match markdown bullet markers -, *, or numbers
    if (/^[-*•]\s+/.test(line)) {
      line = line.replace(/^[-*•]\s+/, '')
    } else if (/^\d+\.\s+/.test(line)) {
      line = line.replace(/^\d+\.\s+/, '')
    } else if (line.startsWith('#')) {
      continue
    }

    // Strip any embedded HTML tags (security defense against remote HTML injection)
    line = line.replace(/<[^>]*>/g, '').trim()

    if (line.length > 0) {
      bullets.push(line)
      if (bullets.length >= 3) break // At most 3 short Egyptian-Arabic bullets
    }
  }

  return bullets
}

/**
 * Checks GitHub Releases API for updates.
 */
export async function checkForUpdates(
  currentVersionName: string,
  buildType: 'debug' | 'release' = 'release',
  fetchFn: typeof fetch = fetch,
): Promise<UpdateCheckResult> {
  logger.info(
    'UPDATE',
    'CHECK_START',
    `Checking updates for current=${currentVersionName} channel=${buildType}`,
  )

  // 1. Debug builds notice
  if (
    buildType === 'debug' ||
    currentVersionName.toLowerCase().includes('debug')
  ) {
    return {
      status: 'debug_build',
      currentVersion: currentVersionName,
      messageAr: 'نسخة تجريبية، مفيش تحديثات عبر هذا المسار.',
    }
  }

  // 2. Fetch latest release from GitHub API
  let response: Response
  try {
    response = await fetchFn(GITHUB_RELEASES_URL, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    })
  } catch (netErr) {
    logger.warn(
      'UPDATE',
      'NET_OFFLINE',
      `Network error during update check: ${String(netErr)}`,
    )
    return {
      status: 'offline',
      currentVersion: currentVersionName,
      messageAr: 'مفيش اتصال بالإنترنت حالياً؛ اتأكد من الشبكة وجرب تاني.',
    }
  }

  // 3. Rate limiting check
  if (response.status === 403 || response.status === 429) {
    logger.warn(
      'UPDATE',
      'RATE_LIMITED',
      `GitHub API rate limited: status=${response.status}`,
    )
    return {
      status: 'rate_limited',
      currentVersion: currentVersionName,
      messageAr: 'تم الوصول للحد الأقصى لطلبات التحديث مؤقتاً؛ حاول بعد شوية.',
    }
  }

  if (!response.ok) {
    logger.error(
      'UPDATE',
      'HTTP_ERROR',
      `GitHub API HTTP error: status=${response.status}`,
    )
    return {
      status: 'error',
      currentVersion: currentVersionName,
      messageAr: `فشل الاتصال بخادم التحديثات (رمز الاستجابة: ${response.status}).`,
    }
  }

  // 4. Strict response validation
  let data: unknown
  try {
    data = await response.json()
  } catch {
    return {
      status: 'invalid_response',
      currentVersion: currentVersionName,
      messageAr: 'بيانات التحديث غير صالحة أو غير موثوقة.',
    }
  }

  const parsed = GitHubReleaseSchema.safeParse(data)
  if (!parsed.success) {
    logger.error(
      'UPDATE',
      'SCHEMA_MISMATCH',
      'GitHub release schema validation failed',
    )
    return {
      status: 'invalid_response',
      currentVersion: currentVersionName,
      messageAr: 'بيانات التحديث المستلمة غير مطابقة لمعايير الأمان.',
    }
  }

  const release = parsed.data
  const latestTag = release.tag_name
  const latestVersion = latestTag.replace(/^v/, '')

  // 5. Semantic version comparison
  const cmp = compareSemver(latestVersion, currentVersionName)
  if (cmp <= 0) {
    logger.info(
      'UPDATE',
      'UP_TO_DATE',
      `App is up to date: current=${currentVersionName} latest=${latestVersion}`,
    )
    return {
      status: 'up_to_date',
      currentVersion: currentVersionName,
      latestVersion,
      messageAr: 'أنت بتستخدم أحدث إصدار بالفعل («بُنْيَان» مستقر).',
    }
  }

  // 6. Find valid signed release APK asset
  const apkAsset = release.assets.find(
    (a) =>
      a.name.endsWith('.apk') &&
      a.browser_download_url.startsWith(GITHUB_DOWNLOAD_PREFIX),
  )

  if (!apkAsset) {
    logger.warn(
      'UPDATE',
      'NO_APK_ASSET',
      `Release ${latestTag} found but lacks valid APK asset`,
    )
    return {
      status: 'error',
      currentVersion: currentVersionName,
      latestVersion,
      messageAr: 'تم العثور على إصدار جديد ولكن ملف التثبيت غير متوفر حالياً.',
    }
  }

  const releaseNotes = extractArabicReleaseNotes(release.body)
  const sizeMb = apkAsset.size
    ? Math.round((apkAsset.size / (1024 * 1024)) * 10) / 10
    : undefined

  logger.info(
    'UPDATE',
    'AVAILABLE',
    `New version available: ${latestVersion} url=${apkAsset.browser_download_url}`,
  )

  return {
    status: 'update_available',
    currentVersion: currentVersionName,
    latestVersion,
    downloadUrl: apkAsset.browser_download_url,
    apkSizeMb: sizeMb,
    releaseDate: release.published_at
      ? release.published_at.slice(0, 10)
      : undefined,
    releaseNotesAr: releaseNotes,
    messageAr: `يتوفر تحديث جديد (${latestTag}).`,
  }
}

/**
 * Auto update check preference (Default: OFF per Rule R8 local-first).
 */
export function getAutoUpdateSetting(): boolean {
  try {
    const val = appStorage.getItem(STORAGE_KEY_AUTO_UPDATE)
    return val === 'true' // Default false (opt-in only)
  } catch {
    return false
  }
}

export function setAutoUpdateSetting(enabled: boolean): void {
  try {
    appStorage.setItem(STORAGE_KEY_AUTO_UPDATE, enabled ? 'true' : 'false')
  } catch {
    // ignore
  }
}
