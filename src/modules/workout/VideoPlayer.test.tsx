/**
 * src/modules/workout/VideoPlayer.test.tsx
 *
 * Tests for Task G5-B3:
 * In-app exercise video player facade, mount, offline, unsupported host, and timeout states.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react'
import { VideoPlayer } from './VideoPlayer'

describe('VideoPlayer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('renders "no video" state when URL is not provided', () => {
    const onAdd = vi.fn()
    render(<VideoPlayer exerciseName="بنش برس" onAddVideo={onAdd} />)

    expect(screen.getByTestId('video-no-url')).toBeDefined()
    expect(screen.getByText('لا يوجد فيديو شرح لهذا التمرين')).toBeDefined()

    const addBtn = screen.getByTestId('add-video-btn')
    fireEvent.click(addBtn)
    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('renders unsupported host view for non-allowlisted domains', () => {
    render(
      <VideoPlayer
        videoUrl="https://instagram.com/reel/12345"
        exerciseName="سكوات"
      />,
    )

    expect(screen.getByTestId('video-unsupported')).toBeDefined()
    expect(screen.getByText('الموقع ده مش بيتشغل جوه التطبيق')).toBeDefined()

    const link = screen.getByTestId('external-browser-btn') as HTMLAnchorElement
    expect(link.href).toBe('https://instagram.com/reel/12345')
    expect(link.target).toBe('_blank')
    expect(link.rel).toBe('noopener noreferrer')
  })

  it('renders facade card initially with NO iframe in DOM', () => {
    render(
      <VideoPlayer
        videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        exerciseName="ديدليفت"
      />,
    )

    expect(screen.getByTestId('video-facade')).toBeDefined()
    expect(screen.queryByTestId('video-iframe-el')).toBeNull()
  })

  it('mounts iframe on play click with strict sandbox and referrer policy', () => {
    render(
      <VideoPlayer
        videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        exerciseName="ديدليفت"
      />,
    )

    const playBtn = screen.getByTestId('play-facade-btn')
    fireEvent.click(playBtn)

    const iframe = screen.getByTestId('video-iframe-el') as HTMLIFrameElement
    expect(iframe).toBeDefined()
    expect(iframe.src).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&playsinline=1',
    )
    expect(iframe.getAttribute('sandbox')).toBe(
      'allow-scripts allow-same-origin allow-presentation',
    )
    expect(iframe.getAttribute('referrerpolicy')).toBe(
      'strict-origin-when-cross-origin',
    )

    // Unmount via close button
    const closeBtn = screen.getByTestId('close-video-btn')
    fireEvent.click(closeBtn)
    expect(screen.queryByTestId('video-iframe-el')).toBeNull()
    expect(screen.getByTestId('video-facade')).toBeDefined()
  })

  it('shows offline message when user is offline', () => {
    render(
      <VideoPlayer
        videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        exerciseName="عقلة"
        forcedOnline={false}
      />,
    )

    // Tap play
    const playBtn = screen.getByTestId('play-facade-btn')
    fireEvent.click(playBtn)

    expect(screen.getByTestId('video-offline')).toBeDefined()
    expect(screen.getByText('الفيديو محتاج إنترنت')).toBeDefined()
    expect(screen.queryByTestId('video-iframe-el')).toBeNull()
  })

  it('mounts native video player for direct media files', () => {
    render(
      <VideoPlayer
        videoUrl="https://example.com/videos/bench.mp4"
        exerciseName="بنش دامبل"
      />,
    )

    const playBtn = screen.getByTestId('play-facade-btn')
    fireEvent.click(playBtn)

    const videoEl = screen.getByTestId('native-video-el') as HTMLVideoElement
    expect(videoEl).toBeDefined()
    expect(videoEl.src).toBe('https://example.com/videos/bench.mp4')
  })

  it('shows timeout hint after 10 seconds of uncompleted loading', () => {
    render(
      <VideoPlayer
        videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        exerciseName="بنش برس"
      />,
    )

    fireEvent.click(screen.getByTestId('play-facade-btn'))
    expect(screen.queryByTestId('video-timeout-hint')).toBeNull()

    act(() => {
      vi.advanceTimersByTime(10001)
    })

    expect(screen.getByTestId('video-timeout-hint')).toBeDefined()
    expect(
      screen.getByText(
        'لو الفيديو مش بيشتغل، صاحب الفيديو ممكن يكون قافل التضمين',
      ),
    ).toBeDefined()
    const link = screen.getByTestId(
      'timeout-fallback-link',
    ) as HTMLAnchorElement
    expect(link.href).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  })
})
