import { notFound } from 'next/navigation';
import { getOrderById } from '@/framework/orders/get-order-by-id';
import OrderDetailsPage from './order-details-page';

type TOrderViewPageProps = {
  orderId: string;
};

export default async function OrderViewPage({ orderId }: TOrderViewPageProps) {
  const order = await getOrderById(Number(orderId));
  if (!order) {
    notFound();
  }
  return <OrderDetailsPage order={order} />;
}
