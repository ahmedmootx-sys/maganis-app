/**
 * src/modules/workout/videoUtils.test.ts
 *
 * Unit tests for Task G5-B3:
 * Strict video URL parsing, validation, and embed URL normalization.
 * Enforces >= 30 test cases across hostile, valid, and unsupported inputs.
 */

import { describe, it, expect } from 'vitest'
import { parseVideoUrl } from './videoUtils'

describe('parseVideoUrl', () => {
  const testCases = [
    // 1-9: Hostile / Invalid schemes / Credentials / Formats
    { input: '', valid: false, error: 'الرابط فارغ', desc: 'empty string' },
    {
      input: '   ',
      valid: false,
      error: 'الرابط فارغ',
      desc: 'whitespace string',
    },
    {
      input: 'javascript:alert(1)',
      valid: false,
      desc: 'javascript: protocol injection',
    },
    {
      input: 'data:text/html,<script>alert(1)</script>',
      valid: false,
      desc: 'data: protocol injection',
    },
    { input: 'file:///C:/video.mp4', valid: false, desc: 'file: protocol' },
    {
      input: 'ftp://server.com/video.mp4',
      valid: false,
      desc: 'ftp: protocol',
    },
    {
      input: 'http://youtube.com/watch?v=dQw4w9WgXcQ',
      valid: false,
      desc: 'plain http rejected',
    },
    {
      input: 'https://user:pass@youtube.com/watch?v=dQw4w9WgXcQ',
      valid: false,
      desc: 'credentials in YouTube URL',
    },
    {
      input: 'https://user@vimeo.com/12345678',
      valid: false,
      desc: 'username in Vimeo URL',
    },
    { input: 'https://', valid: false, desc: 'malformed https URL' },

    // 11-17: YouTube Valid Variations
    {
      input: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      valid: true,
      sourceType: 'youtube',
      embed:
        'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&playsinline=1',
      desc: 'standard www.youtube.com watch URL',
    },
    {
      input: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      valid: true,
      sourceType: 'youtube',
      embed:
        'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&playsinline=1',
      desc: 'apex youtube.com watch URL',
    },
    {
      input: 'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
      valid: true,
      sourceType: 'youtube',
      embed:
        'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&playsinline=1',
      desc: 'mobile m.youtube.com URL',
    },
    {
      input: 'https://youtu.be/dQw4w9WgXcQ',
      valid: true,
      sourceType: 'youtube',
      embed:
        'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&playsinline=1',
      desc: 'short youtu.be URL',
    },
    {
      input: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
      valid: true,
      sourceType: 'youtube',
      embed:
        'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&playsinline=1',
      desc: 'youtube shorts URL',
    },
    {
      input: 'https://youtube.com/embed/dQw4w9WgXcQ',
      valid: true,
      sourceType: 'youtube',
      embed:
        'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&playsinline=1',
      desc: 'existing embed URL normalized to youtube-nocookie',
    },

    // 18-21: YouTube Invalid IDs
    {
      input: 'https://youtube.com/watch?v=short',
      valid: false,
      desc: 'youtube ID too short (5 chars)',
    },
    {
      input: 'https://youtube.com/watch?v=toolongidhere123',
      valid: false,
      desc: 'youtube ID too long (16 chars)',
    },
    {
      input: 'https://youtube.com/watch?v=dQw4w9WgXc$',
      valid: false,
      desc: 'youtube ID with illegal symbol $',
    },
    {
      input: 'https://youtu.be/invalid_id!',
      valid: false,
      desc: 'youtu.be ID with exclamation mark',
    },

    // 22-25: Vimeo Valid Variations
    {
      input: 'https://vimeo.com/123456',
      valid: true,
      sourceType: 'vimeo',
      embed: 'https://player.vimeo.com/video/123456',
      desc: 'standard vimeo 6-digit ID',
    },
    {
      input: 'https://www.vimeo.com/123456789012',
      valid: true,
      sourceType: 'vimeo',
      embed: 'https://player.vimeo.com/video/123456789012',
      desc: 'vimeo maximum 12-digit ID',
    },
    {
      input: 'https://player.vimeo.com/video/987654321',
      valid: true,
      sourceType: 'vimeo',
      embed: 'https://player.vimeo.com/video/987654321',
      desc: 'vimeo player URL',
    },

    // 26-29: Vimeo Invalid IDs
    {
      input: 'https://vimeo.com/12345',
      valid: false,
      desc: 'vimeo ID too short (5 digits)',
    },
    {
      input: 'https://vimeo.com/1234567890123',
      valid: false,
      desc: 'vimeo ID too long (13 digits)',
    },
    {
      input: 'https://vimeo.com/abcdef',
      valid: false,
      desc: 'vimeo non-numeric ID',
    },

    // 30-33: Direct Media Files
    {
      input: 'https://cdn.example.com/exercise/squat.mp4',
      valid: true,
      sourceType: 'direct_file',
      embed: 'https://cdn.example.com/exercise/squat.mp4',
      desc: 'direct mp4 media file',
    },
    {
      input: 'https://storage.provider.org/bench.webm',
      valid: true,
      sourceType: 'direct_file',
      embed: 'https://storage.provider.org/bench.webm',
      desc: 'direct webm media file',
    },
    {
      input: 'https://videos.gym.com/pullup.m4v',
      valid: true,
      sourceType: 'direct_file',
      embed: 'https://videos.gym.com/pullup.m4v',
      desc: 'direct m4v media file',
    },
    {
      input: 'https://cdn.example.com/exercise/UPPERCASE.MP4',
      valid: true,
      sourceType: 'direct_file',
      embed: 'https://cdn.example.com/exercise/UPPERCASE.MP4',
      desc: 'case-insensitive extension (.MP4)',
    },

    // 34-39: Lookalike and Unsupported Hosts
    {
      input: 'https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ',
      valid: true,
      sourceType: 'unsupported',
      desc: 'lookalike domain youtube.com.evil.com (never embedded)',
    },
    {
      input: 'https://evilyoutube.com/watch?v=dQw4w9WgXcQ',
      valid: true,
      sourceType: 'unsupported',
      desc: 'lookalike domain evilyoutube.com (never embedded)',
    },
    {
      input: 'https://vimeo.com.attacker.org/123456',
      valid: true,
      sourceType: 'unsupported',
      desc: 'lookalike domain vimeo.com.attacker.org (never embedded)',
    },
    {
      input: 'https://instagram.com/reel/Cxyz123',
      valid: true,
      sourceType: 'unsupported',
      desc: 'Instagram reel URL (unsupported for in-app embedding)',
    },
    {
      input: 'https://www.tiktok.com/@athlete/video/7123456789012345678',
      valid: true,
      sourceType: 'unsupported',
      desc: 'TikTok URL (unsupported for in-app embedding)',
    },
    {
      input: 'https://facebook.com/watch/?v=1015829182',
      valid: true,
      sourceType: 'unsupported',
      desc: 'Facebook video URL (unsupported for in-app embedding)',
    },
  ]

  it('contains at least 30 distinct test cases', () => {
    expect(testCases.length).toBeGreaterThanOrEqual(30)
  })

  testCases.forEach((tc, idx) => {
    it(`Case ${idx + 1}: ${tc.desc}`, () => {
      const res = parseVideoUrl(tc.input)
      expect(res.isValid).toBe(tc.valid)
      if (tc.sourceType) {
        expect(res.sourceType).toBe(tc.sourceType)
      }
      if (tc.embed) {
        expect(res.embedUrl).toBe(tc.embed)
      }
      if (tc.error) {
        expect(res.error).toBe(tc.error)
      }
      if (tc.sourceType === 'unsupported') {
        expect(res.error).toBe('الموقع ده مش بيتشغل جوه التطبيق')
      }
    })
  })
})
