/**
 * src/modules/workout/videoUtils.ts
 *
 * Implements Task G5-B3:
 * Strict video URL parsing, validation, and embed URL normalization.
 */

export type VideoSourceType =
  'youtube' | 'vimeo' | 'direct_file' | 'unsupported'

export interface ParsedVideoInfo {
  isValid: boolean
  sourceType?: VideoSourceType
  embedUrl?: string
  rawUrl: string
  videoId?: string
  error?: string
}

const YOUTUBE_ID_REGEX = /^[A-Za-z0-9_-]{11}$/
const VIMEO_ID_REGEX = /^\d{6,12}$/
const DIRECT_MEDIA_EXT_REGEX = /\.(mp4|webm|m4v)$/i

export function parseVideoUrl(input: string): ParsedVideoInfo {
  const trimmed = (input || '').trim()
  if (!trimmed) {
    return { isValid: false, rawUrl: trimmed, error: 'الرابط فارغ' }
  }

  // Reject javascript:, data:, or any non-https protocols
  if (!trimmed.toLowerCase().startsWith('https://')) {
    return {
      isValid: false,
      rawUrl: trimmed,
      error: 'لازم الرابط يبدأ بـ https://',
    }
  }

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return { isValid: false, rawUrl: trimmed, error: 'رابط غير صالح' }
  }

  // Reject credentials in URL (e.g. https://user:pass@host)
  if (url.username || url.password) {
    return {
      isValid: false,
      rawUrl: trimmed,
      error: 'الرابط يحتوي على بيانات دخول غير مسموح بها',
    }
  }

  const hostname = url.hostname.toLowerCase()

  // 1. YouTube Allowlist: exact host matches
  const isYouTubeHost =
    hostname === 'youtube.com' ||
    hostname === 'www.youtube.com' ||
    hostname === 'm.youtube.com' ||
    hostname === 'youtu.be'

  if (isYouTubeHost) {
    let id: string | null = null

    if (hostname === 'youtu.be') {
      // youtu.be/ID
      id = url.pathname.slice(1).split('/')[0] || null
    } else if (url.pathname.startsWith('/shorts/')) {
      // youtube.com/shorts/ID
      id = url.pathname.replace('/shorts/', '').split('/')[0] || null
    } else if (url.pathname.startsWith('/embed/')) {
      // youtube.com/embed/ID
      id = url.pathname.replace('/embed/', '').split('/')[0] || null
    } else if (url.pathname === '/watch') {
      // youtube.com/watch?v=ID
      id = url.searchParams.get('v')
    }

    if (id && YOUTUBE_ID_REGEX.test(id)) {
      return {
        isValid: true,
        sourceType: 'youtube',
        videoId: id,
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1`,
        rawUrl: trimmed,
      }
    }

    return {
      isValid: false,
      rawUrl: trimmed,
      error: 'كود فيديو يوتيوب مش مظبوط (لازم يكون 11 حرف)',
    }
  }

  // 2. Vimeo Allowlist
  const isVimeoHost =
    hostname === 'vimeo.com' ||
    hostname === 'www.vimeo.com' ||
    hostname === 'player.vimeo.com'

  if (isVimeoHost) {
    let id: string | null = null
    if (hostname === 'player.vimeo.com') {
      // player.vimeo.com/video/ID
      const parts = url.pathname.split('/').filter(Boolean)
      if (parts[0] === 'video' && parts[1]) {
        id = parts[1]
      }
    } else {
      // vimeo.com/ID
      id = url.pathname.slice(1).split('/')[0] || null
    }

    if (id && VIMEO_ID_REGEX.test(id)) {
      return {
        isValid: true,
        sourceType: 'vimeo',
        videoId: id,
        embedUrl: `https://player.vimeo.com/video/${id}`,
        rawUrl: trimmed,
      }
    }

    return {
      isValid: false,
      rawUrl: trimmed,
      error: 'كود فيديو فيميو مش مظبوط (لازم يكون من 6 لـ 12 رقم)',
    }
  }

  // 3. Direct File Check
  if (DIRECT_MEDIA_EXT_REGEX.test(url.pathname)) {
    return {
      isValid: true,
      sourceType: 'direct_file',
      embedUrl: trimmed,
      rawUrl: trimmed,
    }
  }

  // 4. Any other HTTPS host (Instagram, TikTok, Facebook, etc.)
  return {
    isValid: true,
    sourceType: 'unsupported',
    rawUrl: trimmed,
    error: 'الموقع ده مش بيتشغل جوه التطبيق',
  }
}
