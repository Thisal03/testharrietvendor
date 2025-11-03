/**
 * Centralized error handling utilities
 */

import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ProductError,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ProductCreationError,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ProductUpdateError,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ImageUploadError,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  VariationError,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  SKUValidationError,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ProductRollbackError,
  isProductError
} from './product-errors';

/**
 * Log an error with context to console (and optionally to external service)
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  const isDev = process.env.NODE_ENV === 'development';

  if (isProductError(error)) {
    // Log structured error with context
    const logData = {
      name: error.name,
      type: error.type,
      message: error.message,
      context: error.context,
      stack: error.stack,
      ...context
    };

    console.error(`[${error.name}]`, logData);

    // In production, send to error tracking service (e.g., Sentry)
    if (!isDev) {
      // TODO: Integrate with error tracking service
      // sentry.captureException(error, { extra: logData });
    }
  } else if (error instanceof Error) {
    // Log standard error
    console.error('Error:', error.message, error.stack, context);

    if (!isDev) {
      // TODO: Send to error tracking service
    }
  } else {
    // Log unknown error
    console.error('Unknown error:', error, context);
  }
}

/**
 * Format an error message for display to users
 */
export function formatErrorMessage(error: unknown): string {
  if (isProductError(error)) {
    return error.getUserMessage();
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Check if an error should trigger a retry
 */
export function shouldRetry(error: unknown, attempt: number, maxAttempts: number): boolean {
  if (!isProductError(error)) {
    return false;
  }

  if (!error.isRecoverable()) {
    return false;
  }

  if (attempt >= maxAttempts) {
    return false;
  }

  return true;
}

/**
 * Create a retry function with exponential backoff
 */
export function createRetryWrapper<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelayMs: number = 1000
): () => Promise<T> {
  return async () => {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (!shouldRetry(error, attempt, maxAttempts)) {
          throw error;
        }

        // Exponential backoff
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  };
}

/**
 * Handle errors and return a safe result
 */
export function handleError<T>(
  error: unknown,
  fallback: T,
  context?: Record<string, unknown>
): T {
  logError(error, context);

  // For development, log the error more prominently
  if (process.env.NODE_ENV === 'development') {
    console.warn('Error handled, returning fallback:', fallback);
  }

  return fallback;
}

/**
 * Get error type for UI display
 */
export function getErrorType(error: unknown): string {
  if (isProductError(error)) {
    return error.type;
  }

  return 'UNKNOWN_ERROR';
}

/**
 * Check if error should show a retry button in UI
 */
export function showRetryButton(error: unknown): boolean {
  if (isProductError(error)) {
    return error.isRecoverable() && !!error.context.retryAction;
  }

  return false;
}

