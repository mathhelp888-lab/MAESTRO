import { describe, it, expect, vi } from 'vitest'
import { withRetry, createRetryableOperation, DEFAULT_RETRY_CONFIG } from '../retry-utils'

describe('withRetry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return result on first success', async () => {
    const operation = vi.fn().mockResolvedValue('success')

    const result = await withRetry(operation)

    expect(result).toBe('success')
    expect(operation).toHaveBeenCalledTimes(1)
  })

  it('should throw last error after max attempts', async () => {
    const finalError = new Error('final failure')
    const operation = vi.fn().mockRejectedValue(finalError)

    await expect(withRetry(operation, { maxAttempts: 1, baseDelay: 0, maxDelay: 0, backoffMultiplier: 1 })).rejects.toThrow('final failure')
    expect(operation).toHaveBeenCalledTimes(1)
  })

  it('should respect shouldRetry function returning false', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('non-retryable'))
    const shouldRetry = vi.fn().mockReturnValue(false)

    await expect(withRetry(operation, DEFAULT_RETRY_CONFIG, shouldRetry)).rejects.toThrow('non-retryable')
    expect(operation).toHaveBeenCalledTimes(1)
    expect(shouldRetry).toHaveBeenCalledTimes(1)
  })
})

describe('createRetryableOperation', () => {
  it('should create a retryable operation with custom config', async () => {
    const operation = vi.fn().mockResolvedValue('success')
    const retryableOp = createRetryableOperation(operation, { maxAttempts: 5 })

    const result = await retryableOp()

    expect(result).toBe('success')
    expect(operation).toHaveBeenCalledTimes(1)
  })
})