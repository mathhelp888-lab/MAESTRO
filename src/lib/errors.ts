/**
 * Comprehensive error handling system for MAESTRO Threat Analyzer
 * Provides typed errors with recovery strategies and user-friendly messages
 */

export enum ErrorCode {
  // AI Service Errors
  AI_SERVICE_UNAVAILABLE = 'AI_SERVICE_UNAVAILABLE',
  AI_RATE_LIMIT_EXCEEDED = 'AI_RATE_LIMIT_EXCEEDED',
  AI_INVALID_RESPONSE = 'AI_INVALID_RESPONSE',
  AI_TIMEOUT = 'AI_TIMEOUT',

  // Analysis Errors
  ANALYSIS_INVALID_INPUT = 'ANALYSIS_INVALID_INPUT',
  ANALYSIS_INTERRUPTED = 'ANALYSIS_INTERRUPTED',
  LAYER_PROCESSING_FAILED = 'LAYER_PROCESSING_FAILED',

  // PDF Generation Errors
  PDF_GENERATION_FAILED = 'PDF_GENERATION_FAILED',
  PDF_MEMORY_EXCEEDED = 'PDF_MEMORY_EXCEEDED',

  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // Unknown Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export enum ErrorSeverity {
  LOW = 'low',       // User can continue, feature degraded
  MEDIUM = 'medium', // Feature unavailable, user can retry
  HIGH = 'high',     // Major functionality broken
  CRITICAL = 'critical' // Application unusable
}

export interface ErrorRecoveryAction {
  type: 'retry' | 'refresh' | 'fallback' | 'redirect' | 'manual';
  label: string;
  action?: () => void | Promise<void>;
}

export interface MaestroErrorData {
  code: ErrorCode;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  technicalDetails?: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  recoveryActions?: ErrorRecoveryAction[];
  shouldLog?: boolean;
  shouldReport?: boolean;
}

export class MaestroError extends Error {
  public readonly data: MaestroErrorData;

  constructor(data: Omit<MaestroErrorData, 'timestamp'>) {
    super(data.message);
    this.name = 'MaestroError';
    this.data = {
      ...data,
      timestamp: new Date(),
      shouldLog: data.shouldLog ?? true,
      shouldReport: data.shouldReport ?? (data.severity === ErrorSeverity.HIGH || data.severity === ErrorSeverity.CRITICAL)
    };
  }

  static fromUnknown(error: unknown, context?: Record<string, unknown>): MaestroError {
    if (error instanceof MaestroError) {
      return error;
    }

    if (error instanceof Error) {
      return new MaestroError({
        code: ErrorCode.UNKNOWN_ERROR,
        severity: ErrorSeverity.MEDIUM,
        message: error.message,
        userMessage: 'An unexpected error occurred. Please try again.',
        technicalDetails: error.stack,
        context,
      });
    }

    return new MaestroError({
      code: ErrorCode.UNKNOWN_ERROR,
      severity: ErrorSeverity.MEDIUM,
      message: 'Unknown error occurred',
      userMessage: 'Something went wrong. Please try again.',
      technicalDetails: String(error),
      context,
    });
  }
}

// Pre-defined common errors
export const ErrorDefinitions = {
  AI_SERVICE_UNAVAILABLE: (provider: string): MaestroError => new MaestroError({
    code: ErrorCode.AI_SERVICE_UNAVAILABLE,
    severity: ErrorSeverity.HIGH,
    message: `AI service ${provider} is currently unavailable`,
    userMessage: 'AI analysis is temporarily unavailable. Please try again in a few minutes.',
    recoveryActions: [
      { type: 'retry', label: 'Try Again' },
      { type: 'refresh', label: 'Refresh Page' }
    ]
  }),

  AI_RATE_LIMIT: (retryAfter?: number): MaestroError => new MaestroError({
    code: ErrorCode.AI_RATE_LIMIT_EXCEEDED,
    severity: ErrorSeverity.MEDIUM,
    message: 'AI service rate limit exceeded',
    userMessage: `Too many requests. Please wait ${retryAfter ? `${retryAfter} seconds` : 'a moment'} before trying again.`,
    recoveryActions: [
      { type: 'retry', label: `Retry ${retryAfter ? `in ${retryAfter}s` : 'Later'}` }
    ]
  }),

  ANALYSIS_INVALID_INPUT: (field: string): MaestroError => new MaestroError({
    code: ErrorCode.ANALYSIS_INVALID_INPUT,
    severity: ErrorSeverity.LOW,
    message: `Invalid input for ${field}`,
    userMessage: `Please check your ${field} and try again.`,
    recoveryActions: [
      { type: 'manual', label: 'Review Input' }
    ]
  }),

  PDF_GENERATION_FAILED: (reason?: string): MaestroError => new MaestroError({
    code: ErrorCode.PDF_GENERATION_FAILED,
    severity: ErrorSeverity.MEDIUM,
    message: `PDF generation failed: ${reason || 'unknown error'}`,
    userMessage: 'Unable to generate PDF report. The analysis data is still available.',
    technicalDetails: reason,
    recoveryActions: [
      { type: 'retry', label: 'Try PDF Again' },
      { type: 'manual', label: 'Copy Results Manually' }
    ]
  }),

  NETWORK_ERROR: (): MaestroError => new MaestroError({
    code: ErrorCode.NETWORK_ERROR,
    severity: ErrorSeverity.MEDIUM,
    message: 'Network connection error',
    userMessage: 'Connection issue detected. Please check your internet connection.',
    recoveryActions: [
      { type: 'retry', label: 'Retry' },
      { type: 'refresh', label: 'Refresh Page' }
    ]
  })
};