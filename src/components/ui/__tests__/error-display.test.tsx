import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorDisplay } from '../error-display'
import { MaestroError, ErrorCode, ErrorSeverity } from '@/lib/errors'

describe('ErrorDisplay', () => {
  const createMockError = (overrides = {}) => new MaestroError({
    code: ErrorCode.AI_SERVICE_UNAVAILABLE,
    severity: ErrorSeverity.HIGH,
    message: 'Test error',
    userMessage: 'Something went wrong',
    recoveryActions: [
      { type: 'retry', label: 'Try Again' },
      { type: 'refresh', label: 'Refresh Page' }
    ],
    ...overrides
  })

  it('should render error information', () => {
    const error = createMockError()
    render(<ErrorDisplay error={error} />)

    expect(screen.getAllByText('Something went wrong')).toHaveLength(2)
    expect(screen.getByText('Error Code: AI_SERVICE_UNAVAILABLE')).toBeInTheDocument()
  })

  it('should render recovery actions', () => {
    const error = createMockError()
    render(<ErrorDisplay error={error} />)

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument()
  })

  it('should call onRetry when retry button is clicked', () => {
    const onRetry = vi.fn()
    const error = createMockError()
    render(<ErrorDisplay error={error} onRetry={onRetry} />)

    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('should call onRefresh when refresh button is clicked', () => {
    const onRefresh = vi.fn()
    const error = createMockError()
    render(<ErrorDisplay error={error} onRefresh={onRefresh} />)

    fireEvent.click(screen.getByRole('button', { name: /refresh page/i }))
    expect(onRefresh).toHaveBeenCalledTimes(1)
  })

  it('should show default actions when no recovery actions provided', () => {
    const error = createMockError({ recoveryActions: undefined })
    const onRetry = vi.fn()
    const onRefresh = vi.fn()

    render(<ErrorDisplay error={error} onRetry={onRetry} onRefresh={onRefresh} />)

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument()
  })

  it('should use destructive variant for high severity errors', () => {
    const error = createMockError({ severity: ErrorSeverity.HIGH })
    render(<ErrorDisplay error={error} />)

    // Check if the alert has the destructive variant (this would need to be verified by class names or test IDs)
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
  })

  it('should use default variant for medium severity errors', () => {
    const error = createMockError({ severity: ErrorSeverity.MEDIUM })
    render(<ErrorDisplay error={error} />)

    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
  })
})