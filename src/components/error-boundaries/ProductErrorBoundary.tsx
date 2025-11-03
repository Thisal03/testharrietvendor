'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { IconAlertCircle, IconReload } from '@tabler/icons-react';
import { logError, showRetryButton } from '@/lib/errors/error-handler';
import { isProductError, ProductError } from '@/lib/errors/product-errors';

interface ProductErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ProductErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

interface ErrorFallbackProps {
  error: Error | ProductError;
  resetError: () => void;
  showRetry: boolean;
}

/**
 * Error boundary for product form operations
 * Catches JavaScript errors in child components tree
 */
export class ProductErrorBoundary extends React.Component<
  ProductErrorBoundaryProps,
  ProductErrorBoundaryState
> {
  constructor(props: ProductErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ProductErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console and error tracking service
    logError(error, {
      componentStack: errorInfo.componentStack,
      boundary: 'ProductErrorBoundary'
    });

    this.setState({
      errorInfo
    });
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;

      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          showRetry={showRetryButton(this.state.error)}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Default error fallback UI
 */
function DefaultErrorFallback({ error, resetError, showRetry }: ErrorFallbackProps) {
  const errorMessage = isProductError(error) 
    ? (error as ProductError).getUserMessage() 
    : error.message || 'An unexpected error occurred';

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <Alert variant="destructive" className="max-w-2xl">
        <IconAlertCircle className="h-5 w-5" />
        <AlertTitle className="text-lg font-semibold mb-2">
          Something went wrong
        </AlertTitle>
        <AlertDescription className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {errorMessage}
          </p>
          
          {process.env.NODE_ENV === 'development' && error.stack && (
            <details className="mt-4">
              <summary className="text-sm font-medium cursor-pointer mb-2">
                Technical Details (Dev Mode)
              </summary>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-[200px]">
                {error.stack}
              </pre>
            </details>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetError}
              className="min-w-[120px]"
            >
              <IconReload className="h-4 w-4 mr-2" />
              Try Again
            </Button>

            {showRetry && isProductError(error) && (
              <Button
                variant="default"
                size="sm"
                onClick={async () => {
                  try {
                    await (error as ProductError).retry();
                    resetError();
                  } catch (retryError) {
                    logError(retryError, { action: 'retry_failed' });
                  }
                }}
              >
                Retry Operation
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

export default ProductErrorBoundary;

