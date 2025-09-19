/**
 * AI-specific error handling utilities for MAESTRO
 */

import { MaestroError, ErrorCode, ErrorSeverity } from './errors';

export class AIErrorHandler {
  static handleAIFlowError(error: unknown, flowType: string, context?: Record<string, unknown>): MaestroError {
    const flowContext = { flowType, ...context };

    // Handle MaestroError (already processed)
    if (error instanceof MaestroError) {
      return new MaestroError({
        ...error.data,
        context: { ...error.data.context, ...flowContext }
      });
    }

    // Handle standard Error objects
    if (error instanceof Error) {
      const errorCode = this.classifyGenkitError(error);
      return this.createAIError(errorCode, error.message, error.stack, flowContext);
    }

    // Handle unknown errors
    return this.createAIError(
      ErrorCode.UNKNOWN_ERROR,
      'Unknown AI service error',
      String(error),
      flowContext
    );
  }

  static classifyGenkitError(error: Error): ErrorCode {
    const message = error.message.toLowerCase();

    // Rate limiting
    if (message.includes('rate limit') || message.includes('quota')) {
      return ErrorCode.AI_RATE_LIMIT_EXCEEDED;
    }

    // Service unavailable
    if (message.includes('unavailable') || message.includes('503') || message.includes('502')) {
      return ErrorCode.AI_SERVICE_UNAVAILABLE;
    }

    // Timeout errors
    if (message.includes('timeout') || message.includes('timed out')) {
      return ErrorCode.AI_TIMEOUT;
    }

    // Invalid API key / authentication
    if (message.includes('unauthorized') || message.includes('401') || message.includes('api key')) {
      return ErrorCode.AI_SERVICE_UNAVAILABLE;
    }

    // Invalid response format
    if (message.includes('parse') || message.includes('json') || message.includes('format')) {
      return ErrorCode.AI_INVALID_RESPONSE;
    }

    // Network errors
    if (message.includes('network') || message.includes('connection') || message.includes('fetch')) {
      return ErrorCode.NETWORK_ERROR;
    }

    // Default to unknown
    return ErrorCode.UNKNOWN_ERROR;
  }

  static shouldRetry(error: MaestroError): boolean {
    const retryableErrors = [
      ErrorCode.AI_TIMEOUT,
      ErrorCode.NETWORK_ERROR,
      ErrorCode.AI_SERVICE_UNAVAILABLE
    ];

    return retryableErrors.includes(error.data.code);
  }

  private static createAIError(
    code: ErrorCode,
    message: string,
    technicalDetails?: string,
    context?: Record<string, unknown>
  ): MaestroError {
    const errorConfig = this.getErrorConfig(code);

    return new MaestroError({
      code,
      severity: errorConfig.severity,
      message,
      userMessage: errorConfig.userMessage,
      technicalDetails,
      context,
      recoveryActions: errorConfig.recoveryActions
    });
  }

  private static getErrorConfig(code: ErrorCode) {
    switch (code) {
      case ErrorCode.AI_RATE_LIMIT_EXCEEDED:
        return {
          severity: ErrorSeverity.MEDIUM,
          userMessage: 'AI service is temporarily rate limited. Please wait a moment and try again.',
          recoveryActions: [
            { type: 'retry' as const, label: 'Retry Analysis' }
          ]
        };

      case ErrorCode.AI_SERVICE_UNAVAILABLE:
        return {
          severity: ErrorSeverity.HIGH,
          userMessage: 'AI analysis service is currently unavailable. Please try again in a few minutes.',
          recoveryActions: [
            { type: 'retry' as const, label: 'Try Again' },
            { type: 'refresh' as const, label: 'Refresh Page' }
          ]
        };

      case ErrorCode.AI_TIMEOUT:
        return {
          severity: ErrorSeverity.MEDIUM,
          userMessage: 'AI analysis timed out. This may be due to a complex architecture description.',
          recoveryActions: [
            { type: 'retry' as const, label: 'Retry Analysis' },
            { type: 'manual' as const, label: 'Simplify Input' }
          ]
        };

      case ErrorCode.AI_INVALID_RESPONSE:
        return {
          severity: ErrorSeverity.MEDIUM,
          userMessage: 'AI service returned an invalid response. Please try again.',
          recoveryActions: [
            { type: 'retry' as const, label: 'Retry Analysis' }
          ]
        };

      case ErrorCode.NETWORK_ERROR:
        return {
          severity: ErrorSeverity.MEDIUM,
          userMessage: 'Network connection issue detected. Please check your internet connection.',
          recoveryActions: [
            { type: 'retry' as const, label: 'Retry' },
            { type: 'refresh' as const, label: 'Refresh Page' }
          ]
        };

      default:
        return {
          severity: ErrorSeverity.MEDIUM,
          userMessage: 'An unexpected error occurred during AI analysis. Please try again.',
          recoveryActions: [
            { type: 'retry' as const, label: 'Try Again' }
          ]
        };
    }
  }
}