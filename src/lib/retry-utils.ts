/**
 * Retry mechanisms with exponential backoff for MAESTRO
 */

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  shouldRetry: (error: unknown) => boolean = () => true
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry on the last attempt
      if (attempt === config.maxAttempts) {
        break;
      }

      // Check if we should retry this error
      if (!shouldRetry(error)) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
        config.maxDelay
      );

      // Add some jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000;

      console.log(`Retrying operation in ${Math.round(jitteredDelay)}ms (attempt ${attempt}/${config.maxAttempts})`);

      await new Promise(resolve => setTimeout(resolve, jitteredDelay));
    }
  }

  // If we get here, all retries failed
  throw lastError;
}

export function createRetryableOperation<T>(
  operation: () => Promise<T>,
  config?: Partial<RetryConfig>,
  shouldRetryFn?: (error: unknown) => boolean
) {
  const fullConfig = { ...DEFAULT_RETRY_CONFIG, ...config };

  return () => withRetry(operation, fullConfig, shouldRetryFn);
}