'use client';

import { IconX, IconUpload, IconGripVertical } from '@tabler/icons-react';
import Image from 'next/image';
import * as React from 'react';
import Dropzone, {
  type DropzoneProps,
  type FileRejection
} from 'react-dropzone';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useControllableState } from '@/hooks/use-controllable-state';
import { cn, formatBytes } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ProgressiveImageUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: File[];
  onValueChange?: React.Dispatch<React.SetStateAction<File[]>>;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
}

export function ProgressiveImageUploader({
  value: valueProp,
  onValueChange,
  maxFiles = 4,
  maxSize = 4 * 1024 * 1024,
  disabled = false,
  className,
  ...props
}: ProgressiveImageUploaderProps) {
  const [files, setFiles] = useControllableState({
    prop: valueProp,
    onChange: onValueChange
  });

  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  // Ensure all files have preview URLs (only for real File/Blob instances)
  const filesWithPreview = React.useMemo((): (File & { preview: string })[] => {
    if (!files || files.length === 0) return [];
    return files.map((file) => {
      // Check if file already has a valid preview URL
      if (isFileWithPreview(file) && isValidImageUrl(file.preview)) {
        return file;
      }
      
      // If file has 'src' property (existing image from backend), use that
      if (!isFileInstance(file) && 'src' in file && typeof (file as any).src === 'string') {
        const src = (file as any).src;
        if (isValidImageUrl(src)) {
          return Object.assign(file, { preview: src });
        }
      }
      
      // For actual File/Blob instances, create object URL
      if (file instanceof Blob) {
        return Object.assign(file, { preview: URL.createObjectURL(file) });
      }
      
      // Fallback: return file as-is with empty preview
      return Object.assign(file, { preview: '' });
    });
  }, [files]);

  const onDrop = React.useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if ((files?.length ?? 0) + acceptedFiles.length > maxFiles) {
        toast.error(`Cannot upload more than ${maxFiles} images`);
        return;
      }

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          // acceptedFiles are File objects from react-dropzone; safe to createObjectURL
          preview: file instanceof Blob ? URL.createObjectURL(file) : ''
        })
      );

      const updatedFiles = files ? [...files, ...newFiles] : newFiles;
      setFiles(updatedFiles);

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file }) => {
          toast.error(`File ${file.name} was rejected`);
        });
      }
    },
    [files, maxFiles, setFiles]
  );

  const onRemove = (index: number) => {
    if (!files) return;
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onValueChange?.(newFiles);
  };

  const onReorder = (fromIndex: number, toIndex: number) => {
    if (!files) return;
    
    const newFiles = [...files];
    const [removed] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, removed);
    
    setFiles(newFiles);
    onValueChange?.(newFiles);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    onReorder(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Cleanup preview URLs when component unmounts
  React.useEffect(() => {
    return () => {
      if (!filesWithPreview) return;
      filesWithPreview.forEach((file) => {
        if (isFileWithPreview(file)) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, []); // Only run on unmount

  const isDisabled = disabled || (files?.length ?? 0) >= maxFiles;

  return (
    <div className={cn('flex gap-3', className)} {...props}>
      {/* Upload Dropzone - Left Side */}
      {!isDisabled && (
        <Dropzone
          onDrop={onDrop}
          accept={{ 'image/*': [] }}
          maxSize={maxSize}
          maxFiles={maxFiles}
          multiple={maxFiles > 1}
          disabled={isDisabled}
        >
          {({ getRootProps, getInputProps, isDragActive }) => (
            <div
              {...getRootProps()}
              className={cn(
                'flex-shrink-0 w-24 h-24 cursor-pointer flex items-center justify-center rounded-lg border-2 border-dashed transition-all',
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50',
                isDisabled && 'pointer-events-none opacity-60'
              )}
            >
              <input {...getInputProps()} />
              <div className='flex flex-col items-center gap-1 text-center'>
                <IconUpload className='h-5 w-5 text-muted-foreground' />
                <p className='text-[10px] text-muted-foreground'>Add</p>
              </div>
            </div>
          )}
        </Dropzone>
      )}

      {/* Images Grid - Right Side */}
      {filesWithPreview && filesWithPreview.length > 0 ? (
        <div className='flex-1 grid grid-cols-3 gap-2 sm:grid-cols-4'>
          {filesWithPreview.map((file, index) => (
            <div
              key={`${file.name}-${index}-${file.size || 0}`}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                handleDragStart(index);
              }}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => e.preventDefault()}
              className={cn(
                'relative group rounded-lg border-2 bg-white overflow-hidden cursor-move transition-all hover:shadow-md select-none',
                // draggedIndex === index ? 'opacity-50 scale-95 rotate-2' : '',
                dragOverIndex === index ? 'border-primary bg-primary/5' : '',
                draggedIndex !== null && draggedIndex !== index ? 'hover:border-primary' : '',
                index === 0 ? 'border-primary col-span-2 row-span-2' : 'border-gray-200'
              )}
            >
              <div className='relative w-full aspect-square'>
                {isFileWithPreview(file) && file.preview ? (
                  <Image
                    src={file.preview}
                    alt={file.name || 'Product image'}
                    fill
                    loading='lazy'
                    className='object-cover'
                    onError={(e) => {
                      console.error('Failed to load image:', file.preview);
                      // Hide the broken image
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className='flex items-center justify-center h-full bg-gray-100 text-gray-500 text-xs p-2'>
                    {(file as any).name || 'Image'}
                  </div>
                )}
                {/* Drag Handle */}
                <div className='absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                  <div className='bg-black/70 rounded p-1 shadow-sm cursor-grab active:cursor-grabbing'>
                    <IconGripVertical className='h-3 w-3 text-white' />
                  </div>
                </div>
                {/* Drag Indicator */}
                <div className='absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none' />
                {/* Remove Button */}
                <Button
                  type='button'
                  variant='destructive'
                  size='icon'
                  onClick={() => onRemove(index)}
                  className='absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity'
                >
                  <IconX className='h-3 w-3' />
                </Button>
                {/* Featured Badge */}
                {index === 0 && (
                  <Badge className='absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 bg-primary text-white'>
                    Featured
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : !isDisabled && (
        <div className='flex-1 flex items-center justify-center h-24 rounded-lg border-2 border-dashed border-gray-200'>
          <p className='text-xs text-muted-foreground'>Upload images to see them here</p>
        </div>
      )}
    </div>
  );
}

function isFileWithPreview(file: File): file is File & { preview: string } {
  return 'preview' in file && typeof file.preview === 'string';
}

function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  // Check if it's a valid URL (starts with http://, https://, or /)
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') || url.startsWith('blob:');
}

function isFileInstance(file: any): file is File {
  return file instanceof File || file instanceof Blob;
}

