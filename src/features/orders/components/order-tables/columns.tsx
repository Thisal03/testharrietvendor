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
    header: ({ column }: { column: Column<Order, unknown> }) => (
      <DataTableColumnHeader column={column} title='Order Number' />
    ),
    cell: ({ row }) => {
      return (
        <Link
          href={`/dashboard/order/${row.getValue('number')}`}
          className='hover:underline'
        >
          <div className='font-medium'>#{row.getValue('number')}</div>
        </Link>
      );
    },
    size: 150,
    minSize: 120
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
    },
    size: 120,
    minSize: 100
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
    size: 140,
    minSize: 120,
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
    ),
    size: 180,
    minSize: 150
  },
  {
    accessorKey: 'total',
    header: ({ column }: { column: Column<Order, unknown> }) => (
      <DataTableColumnHeader column={column} title='Total' />
    ),
    cell: ({ row }) => {
      return <div>{formatPrice(row.getValue('total'))}</div>;
    },
    size: 120,
    minSize: 100
  },
  {
    id: 'actions',
    header: ({ column }: { column: Column<Order, unknown> }) => (
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
