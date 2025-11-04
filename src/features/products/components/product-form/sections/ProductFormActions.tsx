/**
 * Product Form Actions Component
 * Handles submit, draft, publish, delete, and cancel buttons
 * 
 * @param props - Component props
 * @param props.isSubmitting - Whether the form is currently submitting
 * @param props.isUpdateMode - Whether the form is in edit/update mode
 * @param props.productId - Product ID for delete operation (update mode only)
 * @param props.onCancel - Callback when cancel button is clicked
 * @param props.onDelete - Callback when delete button is clicked (update mode only)
 * @param props.onStatusChange - Callback to change product status before submit
 * @returns JSX element with action buttons
 */

'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Upload, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ProductFormActionsProps {
  isSubmitting: boolean;
  isUpdateMode: boolean;
  productId?: number;
  onCancel: () => void;
  onDelete?: () => void;
  onStatusChange: (status: 'draft' | 'pending' | 'publish') => void;
  onSubmitWithoutValidation?: (status: 'draft' | 'pending' | 'publish') => void;
}

export function ProductFormActions({ 
  isSubmitting, 
  isUpdateMode,
  productId,
  onCancel,
  onDelete,
  onStatusChange,
  onSubmitWithoutValidation
}: ProductFormActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  // Use ref to track deletion state synchronously (React state updates are async)
  const isDeletingRef = React.useRef(false);

  const handleDelete = async (e?: React.MouseEvent) => {
    if (!onDelete || isDeletingRef.current) return;
    
    // Prevent default dialog close behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Set deleting state IMMEDIATELY in both ref and state
    isDeletingRef.current = true;
    setIsDeleting(true);
    
    try {
      await onDelete();
      // Only close dialog after successful deletion
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Delete failed:', error);
      // Keep dialog open on error so user can see the error and try again
    } finally {
      isDeletingRef.current = false;
      setIsDeleting(false);
    }
  };

  const handleSaveAsDraft = () => {
    onStatusChange('draft');
    // Bypass validation for draft saves
    if (onSubmitWithoutValidation) {
      onSubmitWithoutValidation('draft');
    }
  };

  const handleSaveAsPending = () => {
    onStatusChange('pending');
    // Normal validation applies for pending
  };

  const handlePublish = () => {
    onStatusChange('publish');
    // Normal validation applies for publish
  };

  return (
    <>
      <div className='flex items-center justify-between pt-6 mt-8 border-t'>
        <div className='flex items-center gap-3'>
          <p className='text-sm text-muted-foreground italic'>
            * Required fields
          </p>
          {isUpdateMode && onDelete && (
            <Button
              type='button'
              variant='destructive'
              size='lg'
              onClick={() => setShowDeleteDialog(true)}
              disabled={isSubmitting}
              className='gap-2'
            >
              <Trash2 className='h-4 w-4' />
              Move to Trash
            </Button>
          )}
        </div>
        <div className='flex gap-3'>
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            disabled={isSubmitting}
            size='lg'
            className='min-w-[120px]'
          >
            Cancel
          </Button>
          {!isUpdateMode && (
            <Button 
              type='submit' 
              disabled={isSubmitting}
              onClick={handleSaveAsDraft}
              size='lg'
              variant='outline'
              className='min-w-[140px] gap-2'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Saving...
                </>
              ) : (
                <>
                  <Save className='h-4 w-4' />
                  Save as Draft
                </>
              )}
            </Button>
          )}
          <Button 
            type='submit' 
            disabled={isSubmitting}
            onClick={handleSaveAsPending}
            size='lg'
            variant='secondary'
            className='min-w-[140px] gap-2'
          >
            {isSubmitting ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                Saving...
              </>
            ) : (
              <>
                <Save className='h-4 w-4' />
                {isUpdateMode ? 'Save as Pending' : 'Create Product'}
              </>
            )}
          </Button>
          {/* Only show publish button in update/edit mode */}
          {isUpdateMode && (
            <Button 
              type='submit' 
              disabled={isSubmitting}
              onClick={handlePublish}
              size='lg'
              className='min-w-[140px] shadow-sm gap-2'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Publishing...
                </>
              ) : (
                <>
                  <Upload className='h-4 w-4' />
                  Update & Publish
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={showDeleteDialog} 
        onOpenChange={(open) => {
          // Use ref to check deletion state synchronously (React state updates are async)
          if (isDeletingRef.current || isDeleting) {
            // Prevent closing while deletion is in progress
            return;
          }
          setShowDeleteDialog(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Trash?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move this product and all its variations to trash. You can restore it later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            {/* Use regular Button instead of AlertDialogAction to prevent auto-close */}
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className='bg-destructive text-white hover:bg-destructive/90'
            >
              {isDeleting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Moving to Trash...
                </>
              ) : (
                'Move to Trash'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

