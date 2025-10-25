import { logger } from './logger';
import { hasStatusCode, hasMessage } from '../errors';

/**
 * Configuration options for retry behavior
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial delay in milliseconds before first retry (default: 1000) */
  initialDelayMs?: number;
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier?: number;
  /** Maximum delay in milliseconds (default: 10000) */
  maxDelayMs?: number;
  /** Whether to retry immediately on first failure (default: true) */
  retryImmediatelyOnce?: boolean;
  /** Function to determine if error should be retried (default: retry on non-2xx) */
  shouldRetry?: (error: unknown) => boolean;
}

/**
 * Default retry options
 */
const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 10000,
  retryImmediatelyOnce: true,
  shouldRetry: () => true,
};

/**
 * Delays execution for the specified number of milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Executes an async function with retry logic and exponential backoff.
 *
 * Retry strategy:
 * 1. First failure: Retry immediately once (if retryImmediatelyOnce is true)
 * 2. Subsequent failures: Retry with exponential backoff up to maxRetries
 *
 * Example with defaults:
 * - Attempt 1: Execute immediately
 * - Attempt 2: Retry immediately (no delay)
 * - Attempt 3: Wait 1000ms, then retry
 * - Attempt 4: Wait 2000ms, then retry
 * - Attempt 5: Wait 4000ms, then retry
 *
 * Total max time: ~7 seconds (well within typical 30-60s frontend timeouts)
 *
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @param context - Optional context string for logging
 * @returns The result of the successful function execution
 * @throws The last error if all retries are exhausted
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
  context?: string
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;
  let immediateRetryUsed = false;

  // Calculate total attempts: initial + immediate retry + exponential backoff retries
  const totalAttempts = 1 + (opts.retryImmediatelyOnce ? 1 : 0) + opts.maxRetries;

  for (let attempt = 1; attempt <= totalAttempts; attempt++) {
    try {
      const result = await fn();

      // Log success if we had to retry
      if (attempt > 1) {
        logger.info(`${context || 'Operation'} succeeded on attempt ${attempt}`);
      }

      return result;
    } catch (error) {
      lastError = error;

      // Check if we should retry this error
      if (!opts.shouldRetry(error)) {
        logger.warn(`${context || 'Operation'} failed with non-retryable error`, { error });
        throw error;
      }

      // Check if we've exhausted all attempts
      if (attempt >= totalAttempts) {
        logger.error(`${context || 'Operation'} failed after ${attempt} attempts`, { error });
        throw error;
      }

      // Determine delay before next retry
      let delayMs = 0;
      if (opts.retryImmediatelyOnce && !immediateRetryUsed) {
        // First retry is immediate
        delayMs = 0;
        immediateRetryUsed = true;
        const errorMessage = hasMessage(error) ? error.message : String(error);
        logger.warn(`${context || 'Operation'} failed on attempt ${attempt}, retrying immediately`, {
          error: errorMessage,
        });
      } else {
        // Calculate exponential backoff delay
        const exponentialAttempt = attempt - (opts.retryImmediatelyOnce ? 2 : 1);
        delayMs = Math.min(
          opts.initialDelayMs * Math.pow(opts.backoffMultiplier, exponentialAttempt),
          opts.maxDelayMs
        );
        const errorMessage = hasMessage(error) ? error.message : String(error);
        logger.warn(
          `${context || 'Operation'} failed on attempt ${attempt}, retrying in ${delayMs}ms`,
          { error: errorMessage }
        );
      }

      // Wait before next retry
      if (delayMs > 0) {
        await delay(delayMs);
      }
    }
  }

  // Should never reach here, but TypeScript needs this
  throw lastError;
}

/**
 * Checks if an HTTP response status code indicates a retryable error.
 * Retries on:
 * - 5xx server errors (temporary server issues)
 * - 429 rate limiting (too many requests)
 * - Network errors (ECONNRESET, ETIMEDOUT, etc.)
 *
 * Does NOT retry on:
 * - 4xx client errors (except 429) - these indicate invalid requests
 * - 2xx success codes
 *
 * @param error - The error to check
 * @returns true if the error should be retried
 */
export function isRetryableHttpError(error: unknown): boolean {
  // Check if it's a fetch error with status
  if (hasStatusCode(error)) {
    const status = error.status;
    // Retry on 5xx server errors or 429 rate limiting
    return status >= 500 || status === 429;
  }

  // Check error message for common network errors
  if (hasMessage(error)) {
    const networkErrors = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN', 'fetch failed'];
    return networkErrors.some((netErr) => error.message.includes(netErr));
  }

  return false;
}
