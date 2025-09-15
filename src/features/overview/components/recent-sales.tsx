import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import StatusBadge from '@/components/ui/status-badge';
import { getOrders } from '@/framework/orders/get-orders';
import Link from 'next/link';

export async function RecentSales() {
  const orders = await getOrders({
    page: 1,
    per_page: 5
  });
  if (!orders) return null;

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>These are your recent orders</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {orders.data.map((sale, index) => (
            <div key={index} className='flex items-center'>
              <div className='space-y-1'>
                <Link
                  href={`/dashboard/order/${sale.id}`}
                  className='text-sm leading-none font-medium hover:underline'
                >
                  #{sale.id} - {sale.billing.first_name}{' '}
                  {sale.billing.last_name}
                </Link>
                <p className='text-muted-foreground text-sm'>
                  {sale.billing.email}
                </p>
              </div>
              <div className='ml-auto flex items-center gap-1 font-medium'>
                <StatusBadge
                  status={sale.status}
                  className='mr-3 hidden sm:block'
                  showIcon={false}
                />
                <p className='text-sm'>
                  {sale.currency} {sale.total}
                </p>
              </div>
            </div>
          ))}
          {orders.data.length === 0 && (
            <p className='text-muted-foreground'>No recent orders found.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
