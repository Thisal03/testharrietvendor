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
        <Tooltip delayDuration={500}>
          <TooltipTrigger className='flex space-x-2'>
            {row.original.featured_image && (
              <img
                src={row.original.featured_image}
                className='h-10 w-10 rounded-md object-cover'
                alt={row.getValue('name')}
              />
            )}
            <span className='max-w-[300px] truncate font-medium'>
              {row.getValue('name')}
            </span>
          </TooltipTrigger>
          <TooltipContent className='max-w-xs'>
            {row.getValue('name')}
          </TooltipContent>
        </Tooltip>
      );
    }
  },
  // {
  //   accessorKey: 'sku',
  //   header: 'SKU',
  //   cell: ({ row }) => (
  //     <div className='w-[120px]'>{row.getValue('sku') || '-'}</div>
  //   )
  // },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'));
      const salePrice = parseFloat(row.original.sale_price);

      return (
        <div className='flex items-center'>
          {salePrice ? (
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
    }
  },
  {
    accessorKey: 'stock_status',
    header: 'Stock',
    cell: ({ row }) => {
      const status: string = row.getValue('stock_status');
      return <StatusBadge status={status} showIcon={false} />;
    },
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
    meta: {
      label: 'Sort by Status',
      variant: 'select',
      options: STATUS_OPTIONS
    }
  },
  {
    accessorKey: 'date_created.date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created' />
    ),
    cell: ({ cell }) => {
      const date = new Date(cell.getValue<string>());
      return (
        <div className='text-sm'>
          {isValid(date) ? (
            format(date, 'dd MMM yyyy')
          ) : (
            <>{date.toLocaleDateString()}</>
          )}
        </div>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
