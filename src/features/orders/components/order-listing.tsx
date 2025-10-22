import { searchParamsCache } from '@/lib/searchparams';
import { OrderTable } from './order-tables';
import { columns } from './order-tables/columns';
import { getOrders } from '@/framework/orders/get-orders';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';

type OrderListingPage = {};

export default async function OrderListingPage({}: OrderListingPage) {
  // Showcasing the use of search params cache in nested RSCs
  const page = searchParamsCache.get('page');
  const pageLimit = searchParamsCache.get('perPage');
  const statuses = searchParamsCache.get('status');

  const filters = {
    page,
    per_page: pageLimit,
    ...(statuses && { status: statuses })
  };

  const orders = await getOrders(filters);
  if (!orders)
    return <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />;

  const totalOrders = orders.pagination.total;

  return (
    <OrderTable data={orders.data} totalItems={totalOrders} columns={columns} />
  );
}
