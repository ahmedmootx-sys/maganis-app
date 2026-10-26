import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Styleguide } from './Styleguide.tsx'

describe('Styleguide', () => {
  it('renders design system tokens and components', () => {
    render(<Styleguide />)
    expect(screen.getByText('دليل التصميم والمكونات')).toBeInTheDocument()

    // Test theme toggle button
    const themeBtn = screen.getByRole('button', { name: 'تبديل المظهر' })
    expect(themeBtn).toBeInTheDocument()
    fireEvent.click(themeBtn)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    // Test opening sheet
    const openSheetBtn = screen.getByRole('button', {
      name: 'فتح لوحة سفلية (Sheet)',
    })
    fireEvent.click(openSheetBtn)
    expect(screen.getByText('نافذة سفلية تجريبية')).toBeInTheDocument()

    // Test opening confirm sheet
    const openConfirmBtn = screen.getByRole('button', {
      name: 'فتح تأكيد الحذف',
    })
    fireEvent.click(openConfirmBtn)
    expect(
      screen.getByText('هل أنت متأكد من مسح البيانات؟'),
    ).toBeInTheDocument()
  })
})
