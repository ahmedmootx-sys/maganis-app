import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExerciseLibraryModal } from './ExerciseLibraryModal.tsx'

describe('ExerciseLibraryModal', () => {
  it('renders exercise library with search and filters', () => {
    const handleClose = vi.fn()
    render(<ExerciseLibraryModal onClose={handleClose} />)

    expect(screen.getByText('مكتبة التمارين')).toBeInTheDocument()

    // Test search field
    const searchInput = screen.getByPlaceholderText(
      /ابحث باسم التمرين أو العضلة/,
    )
    fireEvent.change(searchInput, { target: { value: 'ضغط' } })
    expect(searchInput).toHaveValue('ضغط')

    // Close button triggers onClose
    const backBtn = screen.getByRole('button', { name: 'رجوع' })
    fireEvent.click(backBtn)
    expect(handleClose).toHaveBeenCalled()
  })
})
