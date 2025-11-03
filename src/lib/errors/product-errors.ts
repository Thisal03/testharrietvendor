/**
 * Custom error classes for product management operations
 * Provides structured error handling with context and recovery capabilities
 */

export interface ErrorContext {
  /** The error that caused this error (for error chaining) */
  cause?: unknown;
  /** Additional context data */
  metadata?: Record<string, unknown>;
  /** Whether this error can be recovered from */
  recoverable?: boolean;
  /** Action to retry the operation that failed */
  retryAction?: () => Promise<unknown>;
}

/**
 * Base error class for all product-related errors
 */
export class ProductError extends Error {
  public readonly type: string;
  public readonly context: ErrorContext;
  public readonly timestamp: Date;

  constructor(
    type: string,
    message: string,
    context: ErrorContext = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.type = type;
    this.context = {
      recoverable: false,
      ...context
    };
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Check if this error can be recovered from
   */
  isRecoverable(): boolean {
    return this.context.recoverable === true;
  }

  /**
   * Get a user-friendly error message
   */
  getUserMessage(): string {
    return this.message;
  }

  /**
   * Attempt to retry the operation if recoverable
   */
  async retry(): Promise<unknown> {
    if (!this.isRecoverable() || !this.context.retryAction) {
      throw new Error('This error cannot be retried');
    }
    return this.context.retryAction();
  }
}

/**
 * Error thrown when product creation fails
 */
export class ProductCreationError extends ProductError {
  constructor(
    message: string,
    context?: ErrorContext & {
      productData?: unknown;
      partialProductId?: number;
    }
  ) {
    super('PRODUCT_CREATION_ERROR', message, context);
  }
}

/**
 * Error thrown when product update fails
 */
export class ProductUpdateError extends ProductError {
  constructor(
    message: string,
    public readonly productId: number,
    context?: ErrorContext & {
      updateData?: unknown;
    }
  ) {
    super('PRODUCT_UPDATE_ERROR', message, {
      ...context,
      metadata: {
        ...context?.metadata,
        productId
      }
    });
  }
}

/**
 * Error thrown when image upload fails
 */
export class ImageUploadError extends ProductError {
  constructor(
    message: string,
    context?: ErrorContext & {
      fileName?: string;
      uploadAttempts?: number;
    }
  ) {
    super('IMAGE_UPLOAD_ERROR', message, context);
  }
}

/**
 * Error thrown when variation creation/update fails
 */
export class VariationError extends ProductError {
  constructor(
    message: string,
    context?: ErrorContext & {
      productId?: number;
      variationIds?: number[];
      succeeded?: number;
      failed?: number;
    }
  ) {
    super('VARIATION_ERROR', message, context);
  }
}

/**
 * Error thrown when SKU validation fails
 */
export class SKUValidationError extends ProductError {
  constructor(
    message: string,
    context?: ErrorContext & {
      sku?: string;
      existingProductId?: number;
    }
  ) {
    super('SKU_VALIDATION_ERROR', message, context);
  }
}

/**
 * Error thrown when product deletion fails (rollback scenarios)
 */
export class ProductRollbackError extends ProductError {
  constructor(
    message: string,
    public readonly productId: number,
    context?: ErrorContext
  ) {
    super('PRODUCT_ROLLBACK_ERROR', message, {
      ...context,
      metadata: {
        ...context?.metadata,
        productId
      }
    });
  }
}

/**
 * Type guard to check if an error is a ProductError
 */
export function isProductError(error: unknown): error is ProductError {
  return error instanceof ProductError;
}

/**
 * Type guard to check if an error is recoverable
 */
export function isRecoverableError(error: unknown): error is ProductError {
  return isProductError(error) && error.isRecoverable();
}

