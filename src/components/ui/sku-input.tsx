'use client';

import * as React from 'react';
import { FloatingLabelInput } from './floating-input';
import { Button } from './button';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { checkSKUAvailability } from '@/framework/products/get-sku';
import { generateUniqueSKU } from '@/lib/sku-generator';
import { cn } from '@/lib/utils';

interface SKUInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  vendorId?: number;
  productName?: string;
  productId?: number; // Current product ID (for edit mode)
  variationId?: number; // Current variation ID (for variation SKU validation)
  currentVariationSKU?: string; // Current variation SKU (to exclude from disabled variation check)
  generateButtonDisabled?: boolean; // If true, only disable the generate button (not the input)
}

export function SKUInput({ 
  value, 
  onChange, 
  onValidationChange,
  vendorId,
  productName,
  productId,
  variationId,
  currentVariationSKU,
  generateButtonDisabled,
  className,
  ...props 
}: SKUInputProps) {
  const [isValidating, setIsValidating] = React.useState(false);
  const [isValid, setIsValid] = React.useState<boolean | null>(null);
  const [validationMessage, setValidationMessage] = React.useState<string>('');
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Generate unique SKU
  const generateSKU = () => {
    if (vendorId) {
      const newSKU = generateUniqueSKU(vendorId, productName);
      onChange(newSKU);
    }
  };

  // Debounce the SKU validation
  React.useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, 300); // 300ms debounce for better UX

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value]);

  // Validate SKU when debounced value changes
  React.useEffect(() => {
    const validateSKU = async () => {
      if (!debouncedValue || debouncedValue.trim() === '') {
        setIsValid(null);
        setValidationMessage('');
        onValidationChange?.(true);
        return;
      }

      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();
      const currentController = abortControllerRef.current;

      setIsValidating(true);
      setValidationMessage('Checking SKU availability...');

      try {
        // Check SKU availability including disabled variations in meta_data
        const result = await checkSKUAvailability(
          debouncedValue.trim(), 
          productId, 
          variationId,
          true, // checkDisabledVariations = true
          currentVariationSKU // excludeVariationSku - current variation's SKU to avoid self-conflict
        );
        
        // Check if request was cancelled
        if (currentController.signal.aborted) {
          return;
        }
        
        if (result.isAvailable) {
          setIsValid(true);
          setValidationMessage('SKU is available');
          onValidationChange?.(true);
        } else {
          setIsValid(false);
          const message = result.error || 'SKU is already taken. Please choose a different one.';
          setValidationMessage(message);
          onValidationChange?.(false);
        }
      } catch (error) {
        // Ignore AbortError (request was cancelled)
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        
        console.error('SKU validation error:', error);
        setIsValid(null);
        setValidationMessage('Unable to validate SKU');
        onValidationChange?.(true); // Allow submission if we can't validate
      } finally {
        // Only update state if this is still the current request
        if (!currentController.signal.aborted) {
          setIsValidating(false);
        }
      }
    };

    validateSKU();

    // Cleanup: Cancel request on unmount or when dependencies change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedValue, onValidationChange, productId, variationId, currentVariationSKU]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const getStatusIcon = () => {
    if (isValidating) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    
    if (isValid === true) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    if (isValid === false) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    
    return null;
  };

  const getInputClassName = () => {
    if (isValid === false) {
      return 'border-red-500 focus:border-red-500 focus:ring-red-500';
    }
    
    if (isValid === true) {
      return 'border-green-500 focus:border-green-500 focus:ring-green-500';
    }
    
    return '';
  };

  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <FloatingLabelInput
            {...props}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              'pr-10',
              getInputClassName(),
              className
            )}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {getStatusIcon()}
          </div>
        </div>
        
        {vendorId && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={generateSKU}
            disabled={generateButtonDisabled}
            title="Generate unique SKU"
          >
            <RefreshCw className="size-4" />
          </Button>
        )}
      </div>
      
      {validationMessage && (
        <p className={cn(
          'text-xs',
          isValid === false && !isValidating ? 'text-red-600' : 
          isValid === true && !isValidating ? 'text-green-600' : 
          'text-gray-500'
        )}>
          {validationMessage}
        </p>
      )}
    </div>
  );
}
