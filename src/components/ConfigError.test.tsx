import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ConfigErrorView } from './ConfigError'

describe('ConfigErrorView', () => {
  it('shows the configuration problems with an alert role', () => {
    render(
      <ConfigErrorView
        message={
          'Invalid environment configuration\n- VITE_APP_ENV: missing. Fix: set it.'
        }
      />,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/VITE_APP_ENV: missing/)).toBeInTheDocument()
  })
})
