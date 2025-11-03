import { auth } from '@/auth';
import OrderDetailsSkeleton from '@/components/order-details-skeleton';
import PageContainer from '@/components/layout/page-container';
import OrderViewPage from '@/features/orders/components/order-view-page';
import { Suspense } from 'react';

type PageProps = { params: Promise<{ orderId: string }> };

export const dynamic = 'force-dynamic';

export default async function Page(props: PageProps) {
  const params = await props.params;
  const session = await auth();
  if (!session?.access_token) return null;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4 pb-10'>
        <Suspense fallback={<OrderDetailsSkeleton />}>
          <OrderViewPage orderId={params.orderId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
