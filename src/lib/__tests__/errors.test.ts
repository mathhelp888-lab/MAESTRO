import { describe, it, expect } from 'vitest'
import { MaestroError, ErrorCode, ErrorSeverity } from '../errors'

describe('MaestroError', () => {
  it('should create a MaestroError with required fields', () => {
    const error = new MaestroError({
      code: ErrorCode.AI_SERVICE_UNAVAILABLE,
      severity: ErrorSeverity.HIGH,
      message: 'Test error',
      userMessage: 'Something went wrong'
    })

    expect(error.name).toBe('MaestroError')
    expect(error.message).toBe('Test error')
    expect(error.data.code).toBe(ErrorCode.AI_SERVICE_UNAVAILABLE)
    expect(error.data.severity).toBe(ErrorSeverity.HIGH)
    expect(error.data.userMessage).toBe('Something went wrong')
    expect(error.data.timestamp).toBeInstanceOf(Date)
  })

  it('should create MaestroError from unknown error', () => {
    const originalError = new Error('Network error')
    const maestroError = MaestroError.fromUnknown(originalError)

    expect(maestroError).toBeInstanceOf(MaestroError)
    expect(maestroError.data.code).toBe(ErrorCode.UNKNOWN_ERROR)
    expect(maestroError.data.severity).toBe(ErrorSeverity.MEDIUM)
    expect(maestroError.data.technicalDetails).toContain('Network error')
  })

  it('should create MaestroError from string', () => {
    const maestroError = MaestroError.fromUnknown('String error')

    expect(maestroError).toBeInstanceOf(MaestroError)
    expect(maestroError.data.code).toBe(ErrorCode.UNKNOWN_ERROR)
    expect(maestroError.data.technicalDetails).toBe('String error')
  })

  it('should preserve MaestroError when creating from MaestroError', () => {
    const originalError = new MaestroError({
      code: ErrorCode.AI_TIMEOUT,
      severity: ErrorSeverity.HIGH,
      message: 'Original error',
      userMessage: 'Timeout occurred'
    })

    const result = MaestroError.fromUnknown(originalError)
    expect(result).toBe(originalError)
  })
})