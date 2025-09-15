import { auth } from '@/auth';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import OrderListingPage from '@/features/orders/components/order-listing';
import { ORDERS_METADATA } from '@/lib/metadata/metadata.pages';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';

export const metadata = ORDERS_METADATA;

export const dynamic = 'force-dynamic';

type pageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: pageProps) {
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session?.access_token) return null;
  // Allow nested RSCs to access the search params (in a type-safe way)
  searchParamsCache.parse(searchParams);

  // This key is used for invoke suspense if any of the search params changed (used for filters).
  // const key = serialize({ ...searchParams });

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Orders'
            description='Manage orders and track their status.'
          />
        </div>
        <Separator />
        <Suspense
          // key={key}
          fallback={
            <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
          }
        >
          <OrderListingPage />
        </Suspense>
      </div>
    </PageContainer>
  );
}
