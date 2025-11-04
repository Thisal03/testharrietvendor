'use client';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import StatusBadge from '@/components/ui/status-badge';
import { Product } from '@/framework/products/types';
import { STATUS_OPTIONS } from './options';
import { format, isValid } from 'date-fns';
import { formatPrice } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { getProductFeaturedImage } from '@/framework/products/get-product-images';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ImageWithZoom } from '@/components/ui/image-with-zoom';
import { useRouter } from 'next/navigation';

// Component to handle product name cell with navigation
function ProductNameCell({ productId, productName, fallbackImage }: {
  productId: number;
  productName: string;
  fallbackImage?: string | any;
}) {
  const router = useRouter();

  const handleNavigate = () => {
    router.push(`/dashboard/product/${productId}`);
  };

  return (
    <Tooltip delayDuration={500}>
      <div className='flex space-x-2 items-center'>
        <ProductImageCell 
          productId={productId}
          productName={productName}
          fallbackImage={fallbackImage}
          onClick={handleNavigate}
        />
        <TooltipTrigger asChild>
          <span 
            className='max-w-[300px] truncate font-medium cursor-pointer'
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate();
            }}
          >
            {productName}
          </span>
        </TooltipTrigger>
      </div>
      <TooltipContent className='max-w-xs'>
        {productName}
      </TooltipContent>
    </Tooltip>
  );
}

// Component to handle product image display
function ProductImageCell({ productId, productName, fallbackImage, onClick }: { 
  productId: number; 
  productName: string; 
  fallbackImage?: string | any;
  onClick?: () => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setIsLoading(true);
        const url = await getProductFeaturedImage(productId);
        if (url) {
          setImageUrl(url);
        }
      } catch (error) {
        console.error('Failed to fetch product image for product', productId, ':', error);
        // Don't set imageUrl to null here, let it fall through to fallback logic
      } finally {
        setIsLoading(false);
      }
    };

    if (productId && productId > 0) {
      fetchImage();
    } else {
      setIsLoading(false);
    }
  }, [productId]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    if (onClick) {
      onClick();
    }
  };

  if (isLoading) {
    return (
      <div 
        className='h-10 w-10 rounded-md bg-muted animate-pulse flex items-center justify-center cursor-pointer'
        onClick={handleClick}
      >
        <div className='h-4 w-4 bg-muted-foreground/20 rounded'></div>
      </div>
    );
  }

  if (imageUrl) {
    return (
      <div onClick={handleClick} className="cursor-pointer">
        <ImageWithZoom
          src={imageUrl}
          alt={productName}
          width={40}
          height={40}
          zoomScale={5}
        >
          <img
            src={imageUrl}
            alt={productName}
            width={40}
            height={40}
            className='h-10 w-10 rounded-md object-cover'
            onError={() => {
              console.error('Failed to load image:', imageUrl);
              setImageUrl(null);
            }}
          />
        </ImageWithZoom>
      </div>
    );
  }

  // Fallback to featured_image if available - with proper type checking
  if (fallbackImage && typeof fallbackImage === 'string' && fallbackImage.trim() !== '') {
    return (
      <div onClick={handleClick} className="cursor-pointer">
        <ImageWithZoom
          src={fallbackImage}
          alt={productName}
          width={40}
          height={40}
          zoomScale={5}
        >
          <Image
            src={fallbackImage}
            alt={productName}
            width={40}
            height={40}
            className='h-10 w-10 rounded-md object-cover'
            onError={() => {
              console.error('Failed to load fallback image:', fallbackImage);
            }}
          />
        </ImageWithZoom>
      </div>
    );
  }

  // Final fallback - no image
  return (
    <div 
      className='h-10 w-10 rounded-md bg-muted flex items-center justify-center cursor-pointer'
      onClick={handleClick}
    >
      <div className='h-4 w-4 bg-muted-foreground/40 rounded'></div>
    </div>
  );
}

export const columns: ColumnDef<Product>[] = [
  // {
  //   accessorKey: 'id',
  //   header: 'Product ID',
  //   cell: ({ row }) => <div className='w-[80px]'>#{row.getValue('id')}</div>,
  //   enableSorting: false
  // },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Product' />
    ),
    cell: ({ row }) => {
      return (
        <ProductNameCell
          productId={row.original.id}
          productName={row.getValue('name') as string}
          fallbackImage={row.original.featured_image}
        />
      );
    },
    size: 350,
    minSize: 300
  },
  // {
  //   accessorKey: 'sku',
  //   header: 'SKU',
  //   cell: ({ row }) => (
  //     <div className='w-[120px]'>{row.getValue('sku') || '-'}</div>
  //   )
  // },
  {
    accessorKey: 'regular_price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Price' />
    ),
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('regular_price') ? row.getValue('regular_price') : row.original.price ? row.original.price : '0');
      const salePrice = parseFloat(row.original.sale_price ? row.original.sale_price : '0');

      return (
        <div className='flex items-center justify-center'>
          {salePrice && salePrice > 0 ? (
            <>
              <span className='text-muted-foreground mr-2 line-through'>
                {formatPrice(price)}
              </span>
              <span>{formatPrice(salePrice)}</span>
            </>
          ) : (
            <span>{formatPrice(price)}</span>
          )}
        </div>
      );
    },
    size: 120,
    minSize: 100
  },
  {
    accessorKey: 'stock_status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Stock' />
    ),
    cell: ({ row }) => {
      const status: string = row.getValue('stock_status');
      return <StatusBadge status={status} showIcon={false} />;
    },
    size: 100,
    minSize: 80,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<Product['status']>();
      return <StatusBadge status={status} />;
    },
    enableColumnFilter: true,
    size: 120,
    minSize: 100,
    meta: {
      label: 'Sort by Status',
      variant: 'select',
      options: STATUS_OPTIONS
    }
  },
  {
    accessorKey: 'date_created',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created' />
    ),
    cell: ({ row }) => {
      const dateCreated = row.original.date_created;
      const dateString = typeof dateCreated === 'object' && 'date' in dateCreated ? dateCreated.date : String(dateCreated);
      const date = new Date(dateString);
      return (
        <div className='text-sm'>
          {isValid(date) ? (
            format(date, 'dd MMM yyyy')
          ) : (
            <>{date.toLocaleDateString()}</>
          )}
        </div>
      );
    },
    size: 120,
    minSize: 100
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Actions' />
    ),
    cell: ({ row }) => <CellAction data={row.original} />,
    size: 80,
    minSize: 60,
    enableSorting: false,
    enableColumnFilter: false,
    enableHiding: false
  }
];
