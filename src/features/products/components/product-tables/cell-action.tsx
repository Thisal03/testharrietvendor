'use client';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { updateProductStatus, ProductStatus } from '@/framework/products/update-product-status';
import { Product } from '@/framework/products/types';
import { IconEdit, IconDotsVertical, IconTrash, IconCheck, IconClock, IconLoader2 } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface CellActionProps {
  data: Product;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const onConfirm = async () => {
    try {
      setDeleteLoading(true);
      // Move product to trash instead of deleting permanently
      const result = await updateProductStatus(data.id, 'trash');
      toast.success(result.message + ' It will be permanently deleted after 24 hours.');
    } catch (error) {
      console.error('Failed to move product to trash:', error);
      toast.error('Failed to move product to trash');
    } finally {
      setDeleteLoading(false);
      setOpen(false);
    }
  };

  const onStatusChange = async (newStatus: ProductStatus) => {
    try {
      setStatusLoading(true);
      const result = await updateProductStatus(data.id, newStatus);
      
      toast.success(result.message);
    } catch (error) {
      console.error('Failed to update product status:', error);
      toast.error('Failed to update product status');
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={deleteLoading}
        title='Move to Trash?'
        description='This product will be moved to trash and permanently deleted after 24 hours. This action cannot be undone after permanent deletion.'
        confirmText='Move to Trash'
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0' disabled={statusLoading || deleteLoading}>
            <span className='sr-only'>Open menu</span>
            {statusLoading || deleteLoading ? (
              <IconLoader2 className='h-4 w-4 animate-spin' />
            ) : (
              <IconDotsVertical className='h-4 w-4' />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/product/${data.id}`)}
            disabled={statusLoading || deleteLoading}
          >
            <IconEdit className='mr-2 h-4 w-4' /> Edit
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Status Actions */}
          {data.status === 'pending' && (
            <DropdownMenuItem
              onClick={() => onStatusChange('publish')}
              disabled={statusLoading || deleteLoading}
            >
              <IconCheck className='mr-2 h-4 w-4' /> Publish
            </DropdownMenuItem>
          )}
          
          {data.status === 'publish' && (
            <DropdownMenuItem
              onClick={() => onStatusChange('pending')}
              disabled={statusLoading || deleteLoading}
            >
              <IconClock className='mr-2 h-4 w-4' /> Set to Pending
            </DropdownMenuItem>
          )}
          
          {data.status === 'draft' && (
            <>
              <DropdownMenuItem
                onClick={() => onStatusChange('publish')}
                disabled={statusLoading || deleteLoading}
              >
                <IconCheck className='mr-2 h-4 w-4' /> Publish
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusChange('pending')}
                disabled={statusLoading || deleteLoading}
              >
                <IconClock className='mr-2 h-4 w-4' /> Set to Pending
              </DropdownMenuItem>
            </>
          )}
          
          <DropdownMenuSeparator />
          
          {/* Move to Trash */}
          <DropdownMenuItem
            onClick={() => setOpen(true)}
            disabled={statusLoading || deleteLoading}
            className='text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950'
          >
            <IconTrash className='mr-2 h-4 w-4' /> Move to Trash
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
