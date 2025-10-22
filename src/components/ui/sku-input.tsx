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
}

export function SKUInput({ 
  value, 
  onChange, 
  onValidationChange,
  vendorId,
  productName,
  className,
  ...props 
}: SKUInputProps) {
  const [isValidating, setIsValidating] = React.useState(false);
  const [isValid, setIsValid] = React.useState<boolean | null>(null);
  const [validationMessage, setValidationMessage] = React.useState<string>('');
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

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
    }, 500); // 500ms delay

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

      setIsValidating(true);
      setValidationMessage('Checking SKU availability...');

      try {
        const isAvailable = await checkSKUAvailability(debouncedValue.trim());
        
        if (isAvailable) {
          setIsValid(true);
          setValidationMessage('SKU is available');
          onValidationChange?.(true);
        } else {
          setIsValid(false);
          setValidationMessage('SKU is already taken. Please choose a different one.');
          onValidationChange?.(false);
        }
      } catch (error) {
        console.error('SKU validation error:', error);
        setIsValid(null);
        setValidationMessage('Unable to validate SKU');
        onValidationChange?.(true); // Allow submission if we can't validate
      } finally {
        setIsValidating(false);
      }
    };

    validateSKU();
  }, [debouncedValue, onValidationChange]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
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
