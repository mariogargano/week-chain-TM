// Retry utility with exponential backoff for critical API calls
// Implements resilience pattern for external service calls (Conekta, Mifiel)

export interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  onRetry?: (attempt: number, error: Error) => void
}

export class RetryError extends Error {
  constructor(
    message: string,
    public readonly attempts: number,
    public readonly lastError: Error,
  ) {
    super(message)
    this.name = "RetryError"
  }
}

/**
 * Retry a function with exponential backoff
 * @param fn Function to retry
 * @param options Retry configuration
 * @returns Promise with the result of the function
 * @throws RetryError if all retries fail
 */
export async function retryWithBackoff<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000, onRetry } = options

  let lastError: Error

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        break
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)

      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.3 * delay
      const finalDelay = delay + jitter

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, lastError)
      }

      console.log(`[v0] Retry attempt ${attempt + 1}/${maxRetries} after ${Math.round(finalDelay)}ms`)

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, finalDelay))
    }
  }

  throw new RetryError(`Failed after ${maxRetries} attempts: ${lastError!.message}`, maxRetries, lastError!)
}

/**
 * Check if an error is retryable
 * Network errors, timeouts, and 5xx errors are retryable
 * 4xx client errors are not retryable
 */
export function isRetryableError(error: any): boolean {
  // Network errors
  if (error.code === "ECONNRESET" || error.code === "ETIMEDOUT" || error.code === "ENOTFOUND") {
    return true
  }

  // HTTP errors
  if (error.response?.status) {
    const status = error.response.status
    // Retry on 5xx server errors and 429 rate limit
    return status >= 500 || status === 429
  }

  // Conekta specific errors
  if (error.type === "ConektaConnectionError" || error.type === "ConektaAPIError") {
    return true
  }

  return false
}

/**
 * Retry only if error is retryable
 */
export async function retryIfRetryable<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  return retryWithBackoff(async () => {
    try {
      return await fn()
    } catch (error) {
      if (!isRetryableError(error)) {
        throw error
      }
      throw error
    }
  }, options)
}
