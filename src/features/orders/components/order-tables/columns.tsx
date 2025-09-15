'use client';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Order } from '@/framework/orders/types';
import StatusBadge from '@/components/ui/status-badge';
import { STATUS_OPTIONS } from './options';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: 'number',
    header: 'Order Number',
    cell: ({ row }) => {
      return (
        <Link
          href={`/dashboard/order/${row.getValue('number')}`}
          className='hover:underline'
        >
          <div className='font-medium'>#{row.getValue('number')}</div>
        </Link>
      );
    }
  },
  {
    id: 'date_created',
    accessorKey: 'date_created.date',
    header: ({ column }: { column: Column<Order, unknown> }) => (
      <DataTableColumnHeader column={column} title='Date' />
    ),
    cell: ({ cell }) => {
      const date = new Date(cell.getValue<string>());
      return <div>{date.toLocaleDateString()}</div>;
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }: { column: Column<Order, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<Order['status']>();
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
    id: 'customer',
    accessorFn: (row) => `${row.billing.first_name} ${row.billing.last_name}`,
    header: ({ column }: { column: Column<Order, unknown> }) => (
      <DataTableColumnHeader column={column} title='Customer' />
    )
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => {
      return <div>{formatPrice(row.getValue('total'))}</div>;
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
