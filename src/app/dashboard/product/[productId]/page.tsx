import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import ProductViewPage from '@/features/products/components/product-view-page';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ productId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  const session = await auth();
  if (!session?.access_token) return null;

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <ProductViewPage productId={params.productId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
