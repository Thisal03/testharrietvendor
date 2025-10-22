'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Progress } from './progress';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

interface ProgressModalProps {
  isOpen: boolean;
  progress: number;
  status: 'idle' | 'uploading' | 'creating' | 'success' | 'error';
  message?: string;
  onClose?: () => void;
}

export function ProgressModal({
  isOpen,
  progress,
  status,
  message,
  onClose
}: ProgressModalProps) {
  if (!isOpen) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
      case 'creating':
        return <Loader2 className='h-12 w-12 text-primary animate-spin' />;
      case 'success':
        return <CheckCircle2 className='h-12 w-12 text-green-500' />;
      case 'error':
        return <XCircle className='h-12 w-12 text-red-500' />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    if (message) return message;
    
    switch (status) {
      case 'uploading':
        return 'Uploading images...';
      case 'creating':
        return 'Creating product...';
      case 'success':
        return 'Product created successfully!';
      case 'error':
        return 'Failed to create product';
      default:
        return 'Processing...';
    }
  };

  const canClose = status === 'success' || status === 'error';

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-background/80 backdrop-blur-sm',
        'transition-opacity duration-300',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      onClick={canClose ? onClose : undefined}
    >
      <div
        className={cn(
          'relative w-full max-w-md mx-4',
          'bg-card rounded-lg border shadow-lg',
          'p-8 space-y-6',
          'transform transition-all duration-300',
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Status Icon */}
        <div className='flex justify-center'>
          {getStatusIcon()}
        </div>

        {/* Status Message */}
        <div className='space-y-2'>
          <h3 className='text-lg font-semibold text-center'>
            {getStatusMessage()}
          </h3>
          
          {/* Progress Bar - only show during upload/create */}
          {(status === 'uploading' || status === 'creating') && (
            <div className='space-y-2'>
              <Progress value={progress} className='h-2' />
              <p className='text-sm text-center text-muted-foreground'>
                {Math.round(progress)}% Complete
              </p>
            </div>
          )}
        </div>

        {/* Additional Information */}
        {status === 'success' && (
          <p className='text-sm text-center text-muted-foreground'>
            Redirecting to product list...
          </p>
        )}

        {status === 'error' && onClose && (
          <button
            onClick={onClose}
            className='w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors'
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}

