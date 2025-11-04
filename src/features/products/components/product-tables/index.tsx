'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';

import { useDataTable } from '@/hooks/use-data-table';

import { ColumnDef } from '@tanstack/react-table';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useRouter } from 'next/navigation';
import { Product } from '@/framework/products/types';

interface ProductTableParams<TData, TValue> {
  data: TData[];
  totalItems: number;
  columns: ColumnDef<TData, TValue>[];
}
export function ProductTable<TData, TValue>({
  data,
  totalItems,
  columns
}: ProductTableParams<TData, TValue>) {
  const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const router = useRouter();

  const pageCount = Math.ceil(totalItems / pageSize);

  const { table } = useDataTable({
    data, // product data
    columns, // product columns
    pageCount: pageCount,
    shallow: false, //Setting to false triggers a network request with the updated querystring.
    debounceMs: 500
  });

  const handleRowClick = (row: TData) => {
    // Navigate to product update page when row is clicked
    const product = row as Product;
    if (product?.id) {
      router.push(`/dashboard/product/${product.id}`);
    }
  };

  return (
    <DataTable table={table} onRowClick={handleRowClick}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
