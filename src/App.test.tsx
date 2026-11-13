import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from './App.tsx'
import type { AppConfig } from './config/appConfig.ts'

const mockConfig: AppConfig = {
  appEnv: 'development',
  appName: 'بُنْيَان',
  storagePrefix: 'test-app',
  logLevel: 'info',
  devPort: 5173,
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the app title', () => {
    render(<App config={mockConfig} />)
    const titles = screen.getAllByTestId('app-title')
    expect(titles[0]).toHaveTextContent('بُنْيَان')
  })

  it('starts fresh visitors on the onboarding wizard', () => {
    render(<App config={mockConfig} />)
    const wizards = screen.getAllByTestId('wizard')
    expect(wizards.length).toBeGreaterThanOrEqual(1)
  })
})
