import { describe, it, expect } from 'vitest'
import { AIErrorHandler } from '../ai-error-handler'
import { ErrorCode, ErrorSeverity } from '../errors'

describe('AIErrorHandler', () => {
  describe('classifyGenkitError', () => {
    it('should classify rate limit errors', () => {
      const error = new Error('Rate limit exceeded')
      const code = AIErrorHandler.classifyGenkitError(error)
      expect(code).toBe(ErrorCode.AI_RATE_LIMIT_EXCEEDED)
    })

    it('should classify service unavailable errors', () => {
      const error = new Error('Service unavailable (503)')
      const code = AIErrorHandler.classifyGenkitError(error)
      expect(code).toBe(ErrorCode.AI_SERVICE_UNAVAILABLE)
    })

    it('should classify timeout errors', () => {
      const error = new Error('Request timed out')
      const code = AIErrorHandler.classifyGenkitError(error)
      expect(code).toBe(ErrorCode.AI_TIMEOUT)
    })

    it('should classify authentication errors', () => {
      const error = new Error('Invalid API key')
      const code = AIErrorHandler.classifyGenkitError(error)
      expect(code).toBe(ErrorCode.AI_SERVICE_UNAVAILABLE)
    })

    it('should classify parsing errors', () => {
      const error = new Error('Failed to parse JSON response')
      const code = AIErrorHandler.classifyGenkitError(error)
      expect(code).toBe(ErrorCode.AI_INVALID_RESPONSE)
    })

    it('should classify network errors', () => {
      const error = new Error('Network connection failed')
      const code = AIErrorHandler.classifyGenkitError(error)
      expect(code).toBe(ErrorCode.NETWORK_ERROR)
    })

    it('should default to unknown error', () => {
      const error = new Error('Some unexpected error')
      const code = AIErrorHandler.classifyGenkitError(error)
      expect(code).toBe(ErrorCode.UNKNOWN_ERROR)
    })
  })

  describe('handleAIFlowError', () => {
    it('should handle standard Error objects', () => {
      const error = new Error('AI service timeout')
      const result = AIErrorHandler.handleAIFlowError(error, 'testFlow', { testContext: true })

      expect(result.data.code).toBe(ErrorCode.AI_TIMEOUT)
      expect(result.data.context).toEqual({ flowType: 'testFlow', testContext: true })
      expect(result.data.technicalDetails).toContain('AI service timeout')
    })

    it('should handle unknown errors', () => {
      const result = AIErrorHandler.handleAIFlowError('string error', 'testFlow')

      expect(result.data.code).toBe(ErrorCode.UNKNOWN_ERROR)
      expect(result.data.context).toEqual({ flowType: 'testFlow' })
      expect(result.data.technicalDetails).toBe('string error')
    })
  })

  describe('shouldRetry', () => {
    it('should retry on retryable errors', () => {
      const retryableErrors = [
        ErrorCode.AI_TIMEOUT,
        ErrorCode.NETWORK_ERROR,
        ErrorCode.AI_SERVICE_UNAVAILABLE
      ]

      retryableErrors.forEach(code => {
        const error = AIErrorHandler.handleAIFlowError(new Error('test'), 'flow')
        error.data.code = code
        expect(AIErrorHandler.shouldRetry(error)).toBe(true)
      })
    })

    it('should not retry on non-retryable errors', () => {
      const nonRetryableErrors = [
        ErrorCode.AI_RATE_LIMIT_EXCEEDED,
        ErrorCode.AI_INVALID_RESPONSE,
        ErrorCode.UNKNOWN_ERROR
      ]

      nonRetryableErrors.forEach(code => {
        const error = AIErrorHandler.handleAIFlowError(new Error('test'), 'flow')
        error.data.code = code
        expect(AIErrorHandler.shouldRetry(error)).toBe(false)
      })
    })
  })
})