import { auth } from '@/auth';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import ProductListingPage from '@/features/products/components/product-listing';
import { PRODUCTS_METADATA } from '@/lib/metadata/metadata.pages';
import { searchParamsCache } from '@/lib/searchparams';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';

export const metadata = PRODUCTS_METADATA;

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
        <div className='flex items-center justify-between'>
          <Heading
            title='Products'
            description='Manage products and their details.'
          />
          <Link href='/dashboard/product/new'>
            <Button size='sm' variant='outline'>
              <IconPlus className='h-4 w-4' /> Create Product
            </Button>
          </Link>
        </div>
        <Separator />
        <Suspense
          // key={key}
          fallback={
            <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
          }
        >
          <ProductListingPage />
        </Suspense>
      </div>
    </PageContainer>
  );
}
